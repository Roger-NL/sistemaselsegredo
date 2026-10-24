import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSpeechCache, speechIdentity, type SpeechParameters, type SpeechRecord, type SpeechStore, type StoredAudio } from "@/server/speech/cache";

const parameters: SpeechParameters = { voiceId: "test-voice", model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 };
const bytes = Buffer.from("ID3test-recording");
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }

/** Transactional fake shared by independent cache instances, with a durable-record analogue. */
function infrastructure() {
  const records = new Map<string, SpeechRecord>(); const blobs = new Map<string, StoredAudio>();
  let queue = Promise.resolve(); let clock = 1_000;
  const read = vi.fn(async (key: string) => records.has(key) ? structuredClone(records.get(key)!) : null);
  const store: SpeechStore = { read, update(key, decide) {
    const task = queue.then(() => {
      const decision = decide(records.has(key) ? structuredClone(records.get(key)!) : null);
      if (decision.record) records.set(key, structuredClone(decision.record));
      return decision.result;
    }); queue = task.then(() => undefined, () => undefined); return task;
  } };
  const generate = vi.fn<(text: string, parameters: SpeechParameters) => Promise<Buffer>>(async () => bytes);
  const find = vi.fn(async (pathname: string) => blobs.get(pathname) ?? null);
  const save = vi.fn(async (pathname: string, buffer: Buffer) => {
    const audio = { url: `https://test.public.blob.vercel-storage.com/${pathname}`, pathname, bytes: buffer.length };
    blobs.set(pathname, audio); return audio;
  });
  const ports = { store, generate, find, save, now: () => clock };
  return { records, blobs, ports, read, generate, find, save, advance: (ms: number) => { clock += ms; } };
}
let infra: ReturnType<typeof infrastructure>;
beforeEach(() => { infra = infrastructure(); });

describe("global persistent speech cache", () => {
  it("normalizes whitespace/NFC but retains meaningful differences and all synthesis settings", () => {
    expect(speechIdentity("  Cafe\u0301\n  please. ", parameters).key).toBe(speechIdentity("Café please.", parameters).key);
    const key = speechIdentity("Really?", parameters).key;
    expect(speechIdentity("Really!", parameters).key).not.toBe(key);
    for (const [field, value] of Object.entries({ voiceId: "another", speed: 0.9, model: "other", format: "other", language: "es", stability: 0.5, similarityBoost: 0.5 })) {
      expect(speechIdentity("Really?", { ...parameters, [field]: value }).key).not.toBe(key);
    }
  });

  it("allows one provider attempt across simultaneous users and independent instances", async () => {
    const started = deferred<void>(); const finish = deferred<Buffer>();
    infra.generate.mockImplementation(async () => { started.resolve(); return finish.promise; });
    const first = createSpeechCache(infra.ports)("Really?", parameters);
    await started.promise;
    const otherInstance = createSpeechCache(infra.ports);
    const others = await Promise.all(Array.from({ length: 30 }, () => otherInstance("Really?", parameters)));
    expect(others.every(r => r.status === "pending")).toBe(true); expect(infra.generate).toHaveBeenCalledTimes(1);
    finish.resolve(bytes); expect(await first).toMatchObject({ status: "ready" });
    expect(await createSpeechCache(infra.ports)("Really?", parameters)).toMatchObject({ status: "ready" });
    expect(infra.generate).toHaveBeenCalledTimes(1); expect(infra.save).toHaveBeenCalledTimes(1);
  });

  it("recovers an abandoned reservation before the provider starts, and fences the old owner", async () => {
    const paused = deferred<void>(); const resume = deferred<void>(); let lookups = 0;
    const oldFind = async (pathname: string) => {
      if (++lookups === 2) { paused.resolve(); await resume.promise; return null; }
      return infra.blobs.get(pathname) ?? null;
    };
    const stale = createSpeechCache({ ...infra.ports, find: oldFind })("Hello.", parameters);
    await paused.promise; infra.advance(31_000);
    expect(await createSpeechCache(infra.ports)("Hello.", parameters)).toMatchObject({ status: "ready" });
    resume.resolve(); await stale;
    expect(infra.generate).toHaveBeenCalledTimes(1);
  });

  it("never regenerates after ambiguous failure, including restart and lease expiration", async () => {
    infra.generate.mockRejectedValue(new Error("upstream timed out after receiving request"));
    await expect(createSpeechCache(infra.ports)("Hello.", parameters)).rejects.toThrow("SPEECH_GENERATION_BLOCKED");
    infra.advance(500_000);
    await expect(createSpeechCache(infra.ports)("Hello.", parameters)).rejects.toThrow("SPEECH_GENERATION_BLOCKED");
    expect(infra.generate).toHaveBeenCalledTimes(1);
    expect([...infra.records.values()][0]).toMatchObject({ providerAttemptCount: 1, status: "blocked" });
  });

  it("does not reclaim a provider attempt abandoned by a terminated process", async () => {
    const { key } = speechIdentity("Hello.", parameters);
    infra.records.set(key, { key, schemaVersion: 3, paramsHash: key, status: "request_started", ownerToken: "terminated-process", providerAttemptCount: 1, createdAt: 1_000, updatedAt: 1_000, providerStartedAt: 1_000, leaseExpiresAt: 121_000 });
    expect(await createSpeechCache(infra.ports)("Hello.", parameters)).toMatchObject({ status: "pending" });
    infra.advance(121_000);
    await expect(createSpeechCache(infra.ports)("Hello.", parameters)).rejects.toThrow("SPEECH_GENERATION_BLOCKED");
    expect(infra.generate).not.toHaveBeenCalled();
  });

  it("recovers a saved blob when upload acknowledgement is lost without repeating generation", async () => {
    const save = infra.save.getMockImplementation()!;
    infra.save.mockImplementation(async (path, buffer) => { await save(path, buffer); throw new Error("lost acknowledgement"); });
    expect(await createSpeechCache(infra.ports)("Hello.", parameters)).toMatchObject({ status: "ready" });
    expect(infra.generate).toHaveBeenCalledTimes(1);
  });

  it("fails closed if the durable cache cannot be read", async () => {
    infra.find.mockRejectedValue(new Error("storage offline"));
    await expect(createSpeechCache(infra.ports)("Hello.", parameters)).rejects.toThrow("SPEECH_UNAVAILABLE");
    expect(infra.generate).not.toHaveBeenCalled();
  });

  it("serves ready metadata across instances without Blob HEAD or another write", async () => {
    const service = createSpeechCache(infra.ports);
    const ready = await service("Hello.", parameters);
    const records = structuredClone(infra.records);
    infra.find.mockClear(); infra.read.mockClear();
    infra.advance(500_000);
    expect(await createSpeechCache(infra.ports)("Hello.", parameters)).toEqual(ready);
    expect(infra.read).toHaveBeenCalledTimes(1);
    expect(infra.find).not.toHaveBeenCalled();
    expect(infra.records).toEqual(records);
    expect(infra.generate).toHaveBeenCalledTimes(1);
  });

  it("does not generate again if a published file disappears; playback can report its download error", async () => {
    const service = createSpeechCache(infra.ports); await service("Hello.", parameters);
    infra.blobs.clear(); infra.advance(500_000);
    expect(await createSpeechCache(infra.ports)("Hello.", parameters)).toMatchObject({ status: "ready" });
    expect(infra.generate).toHaveBeenCalledTimes(1);
    expect([...infra.records.values()][0].providerAttemptCount).toBe(1);
  });

  it("fails closed on unreadable or corrupt published metadata instead of trusting it or generating again", async () => {
    const service = createSpeechCache(infra.ports); await service("Hello.", parameters);
    const record = [...infra.records.values()][0];
    record.audio!.url = "https://foreign.example/audio.mp3";
    await expect(service("Hello.", parameters)).rejects.toThrow("INVALID_STORED_AUDIO");
    infra.read.mockRejectedValue(new Error("metadata unavailable"));
    await expect(service("Hello.", parameters)).rejects.toThrow("SPEECH_UNAVAILABLE");
    expect(infra.generate).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid provider content without storing or retrying it", async () => {
    infra.generate.mockResolvedValue(Buffer.from("{not audio}"));
    await expect(createSpeechCache(infra.ports)("Hello.", parameters)).rejects.toThrow("SPEECH_GENERATION_BLOCKED");
    expect(infra.save).not.toHaveBeenCalled();
  });
});
