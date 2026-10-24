import "server-only";
import { createHash, randomUUID } from "node:crypto";

export type SpeechParameters = {
  voiceId: string; model: string; format: string; speed: number;
  language: string; stability: number; similarityBoost: number;
};
export type StoredAudio = { url: string; pathname: string; bytes: number; checksum?: string };
export type SpeechRecord = {
  key: string; schemaVersion: 3; paramsHash: string;
  status: "reserved" | "request_started" | "ready" | "blocked";
  ownerToken: string; leaseExpiresAt: number; providerAttemptCount: number;
  createdAt: number; updatedAt: number; providerStartedAt?: number; completedAt?: number;
  audio?: StoredAudio; lastErrorCode?: string;
};
export interface SpeechStore {
  read(key: string): Promise<SpeechRecord | null>;
  update<T>(key: string, decide: (current: SpeechRecord | null) => { record?: SpeechRecord; result: T }): Promise<T>;
}
export type SpeechPorts = {
  store: SpeechStore;
  find: (pathname: string) => Promise<StoredAudio | null>;
  generate: (text: string, parameters: SpeechParameters) => Promise<Buffer>;
  save: (pathname: string, bytes: Buffer) => Promise<StoredAudio>;
  now?: () => number; token?: () => string;
};
export type SpeechResult = { status: "ready"; key: string; url: string } | { status: "pending"; key: string; retryAfter: number };
export class SpeechUnavailableError extends Error {
  constructor(public code = "SPEECH_UNAVAILABLE") { super(code); }
}

export function normalizeSpeechText(text: string) { return text.normalize("NFC").replace(/\s+/gu, " ").trim(); }
export function speechIdentity(text: string, p: SpeechParameters) {
  const normalized = normalizeSpeechText(text);
  if (!normalized || normalized.length > 2_000 || !p.voiceId.trim() || !Number.isFinite(p.speed) || p.speed <= 0) throw new SpeechUnavailableError("INVALID_SPEECH_INPUT");
  const key = createHash("sha256").update(JSON.stringify([
    "elevenlabs", 3, normalized, p.voiceId, p.speed, p.model, p.format, p.language, p.stability, p.similarityBoost,
  ])).digest("hex");
  return { key, text: normalized, pathname: `speech-cache/v3/${key}.mp3` };
}
function validAudio(audio: StoredAudio, pathname: string) {
  try {
    const url = new URL(audio.url);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com")
      && !url.username && !url.password && !url.search && audio.pathname === pathname
      && url.pathname === `/${pathname}` && audio.bytes > 0 && audio.bytes <= 8 * 1024 * 1024;
  } catch { return false; }
}

/** Published immutable files need a durable metadata read, not a new Blob HEAD/write cycle. */
export async function readPublishedSpeech(store: SpeechStore, text: string, parameters: SpeechParameters): Promise<SpeechResult | null> {
  const { key, pathname } = speechIdentity(text, parameters);
  const record = await store.read(key);
  if (!record || record.status !== "ready") return null;
  if (record.schemaVersion !== 3 || record.key !== key || record.paramsHash !== key || record.providerAttemptCount !== 1
    || !record.audio || !validAudio(record.audio, pathname)) throw new SpeechUnavailableError("INVALID_STORED_AUDIO");
  return { status: "ready", key, url: record.audio.url };
}

/** Global coordination is durable. No provider call is made inside a retryable transaction. */
export function createSpeechCache(ports: SpeechPorts) {
  const now = ports.now ?? Date.now;
  const token = ports.token ?? randomUUID;
  return async function resolve(text: string, parameters: SpeechParameters): Promise<SpeechResult> {
    const identity = speechIdentity(text, parameters);
    const { key, pathname } = identity;
    async function reconcile(found: StoredAudio): Promise<SpeechResult> {
      if (!validAudio(found, pathname)) throw new SpeechUnavailableError("INVALID_STORED_AUDIO");
      await ports.store.update(key, current => ({
        record: { ...current, key, paramsHash: key, schemaVersion: 3, status: "ready",
          ownerToken: current?.ownerToken ?? "recovered", providerAttemptCount: Math.max(1, current?.providerAttemptCount ?? 0),
          leaseExpiresAt: 0, audio: found, createdAt: current?.createdAt ?? now(), updatedAt: now(), completedAt: current?.completedAt ?? now(),
        }, result: null,
      }));
      return { status: "ready", key, url: found.url };
    }
    try {
      const published = await readPublishedSpeech(ports.store, text, parameters);
      if (published) return published;
      const existing = await ports.find(pathname);
      if (existing) return await reconcile(existing);
      const ownerToken = token();
      const claim = await ports.store.update<"owner" | "pending" | "blocked">(key, current => {
        if (current && (current.schemaVersion !== 3 || current.key !== key || current.paramsHash !== key
          || ![0, 1].includes(current.providerAttemptCount)
          || !["reserved", "request_started", "ready", "blocked"].includes(current.status))) return { result: "blocked" };
        if (current && (current.providerAttemptCount >= 1 || current.status === "request_started" || current.status === "ready" || current.status === "blocked")) {
          return { result: current.status === "request_started" && current.leaseExpiresAt > now() ? "pending" : "blocked" };
        }
        if (current?.status === "reserved" && current.leaseExpiresAt > now()) return { result: "pending" };
        return { record: { key, schemaVersion: 3, paramsHash: key, status: "reserved", ownerToken,
          leaseExpiresAt: now() + 30_000, providerAttemptCount: 0, createdAt: current?.createdAt ?? now(), updatedAt: now(),
        }, result: "owner" };
      });
      if (claim === "pending") return { status: "pending", key, retryAfter: 2 };
      if (claim === "blocked") throw new SpeechUnavailableError("SPEECH_GENERATION_BLOCKED");

      // Recover an upload whose previous metadata finalization was interrupted.
      const recovered = await ports.find(pathname);
      if (recovered) return await reconcile(recovered);
      const started = await ports.store.update(key, current => {
        if (!current || current.ownerToken !== ownerToken || current.status !== "reserved" || current.providerAttemptCount !== 0 || current.leaseExpiresAt <= now()) return { result: false };
        return { record: { ...current, status: "request_started", providerAttemptCount: 1,
          providerStartedAt: now(), updatedAt: now(), leaseExpiresAt: now() + 120_000,
        }, result: true };
      });
      if (!started) return { status: "pending", key, retryAfter: 2 };
      try {
        const bytes = await ports.generate(identity.text, parameters);
        const mp3 = bytes.subarray(0, 3).toString() === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
        if (!mp3 || bytes.length > 8 * 1024 * 1024) throw new SpeechUnavailableError("INVALID_PROVIDER_AUDIO");
        const stored = await ports.save(pathname, bytes);
        return await reconcile(stored);
      } catch {
        // Never reissue a provider request after an ambiguous outcome, including lease expiry.
        try { const stored = await ports.find(pathname); if (stored) return await reconcile(stored); } catch { /* Keep durable attempt marker. */ }
        await ports.store.update(key, current => current?.ownerToken === ownerToken && current.status !== "ready"
          ? { record: { ...current, status: "blocked", updatedAt: now(), lastErrorCode: "GENERATION_OR_PERSISTENCE_FAILED" }, result: null }
          : { result: null });
        throw new SpeechUnavailableError("SPEECH_GENERATION_BLOCKED");
      }
    } catch (error) {
      if (error instanceof SpeechUnavailableError) throw error;
      // Do not expose provider headers, credentials, SDK errors or internal URLs.
      throw new SpeechUnavailableError();
    }
  };
}
