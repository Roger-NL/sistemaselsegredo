import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BlobNotFoundError,
  head,
  put,
  type HeadBlobResult,
  type PutBlobResult,
} from "@vercel/blob";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { welcomeSpeechPhrases } from "@/app/inicio-orbita-7k3/conversation";
import { adminDb } from "@/lib/firebase-admin-firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = "eleven_flash_v2_5";
const SPEECH_SPEED = 0.78;
const CACHE_VERSION = "v2";
const CACHE_COLLECTION = "speech_audio_cache";
const LOCK_LEASE_MS = 120_000;
const LOCK_WAIT_MS = 20_000;
const allowedPhrases = new Set(welcomeSpeechPhrases);
const generationLocks = new Map<string, Promise<CachedAudio>>();

type SharedCacheEntry = {
  status?: "generating" | "ready";
  token?: string;
  expiresAtMs?: number;
  audioUrl?: string;
};

type CachedAudio =
  { kind: "blob"; url: string } | { kind: "local"; bytes: Buffer };

function cacheIdentity(text: string, voiceId: string) {
  return createHash("sha256")
    .update(
      `${CACHE_VERSION}\u0000${voiceId}\u0000${MODEL_ID}\u0000${SPEECH_SPEED}\u0000${text}`,
    )
    .digest("hex");
}

function blobPath(identity: string) {
  return `speech-cache/${CACHE_VERSION}/${identity}.mp3`;
}

function localPath(identity: string) {
  const root =
    process.env.SPEECH_CACHE_DIR?.trim() ||
    path.join(process.cwd(), ".cache", "speech");
  return path.join(root, `${identity}.mp3`);
}

async function findCachedAudio(
  identity: string,
  pathname: string,
): Promise<CachedAudio | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    try {
      const blob: HeadBlobResult = await head(pathname);
      return { kind: "blob", url: blob.url };
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
      return null;
    }
  }

  try {
    return { kind: "local", bytes: await readFile(localPath(identity)) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function generateAudio(text: string, voiceId: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error("ELEVENLABS_NOT_CONFIGURED");

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        language_code: "en",
        voice_settings: {
          speed: SPEECH_SPEED,
          stability: 0.62,
          similarity_boost: 0.75,
        },
      }),
      cache: "no-store",
    },
  );

  if (!upstream.ok) {
    console.error("[speech] ElevenLabs request failed", upstream.status);
    throw new Error("SPEECH_PROVIDER_ERROR");
  }

  return Buffer.from(await upstream.arrayBuffer());
}

async function saveAudio(
  identity: string,
  pathname: string,
  bytes: Buffer,
): Promise<CachedAudio> {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    try {
      const blob: PutBlobResult = await put(pathname, bytes, {
        access: "public",
        addRandomSuffix: false,
        contentType: "audio/mpeg",
        cacheControlMaxAge: 31_536_000,
      });
      return { kind: "blob", url: blob.url };
    } catch (error) {
      // Another Function may have finished the same first generation first.
      try {
        const blob = await head(pathname);
        return { kind: "blob", url: blob.url };
      } catch {
        throw error;
      }
    }
  }

  const destination = localPath(identity);
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await writeFile(destination, bytes, { flag: "wx" });
    return { kind: "local", bytes };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return { kind: "local", bytes: await readFile(destination) };
  }
}

async function generateAndCache(
  text: string,
  voiceId: string,
  identity: string,
  pathname: string,
) {
  const bytes = await generateAudio(text, voiceId);
  return saveAudio(identity, pathname, bytes);
}

function audioResponse(audio: CachedAudio, cacheStatus: "HIT" | "MISS") {
  if (audio.kind === "blob") {
    const response = NextResponse.redirect(audio.url, 307);
    response.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    );
    response.headers.set("X-Speech-Cache", cacheStatus);
    return response;
  }

  const responseBuffer = new Uint8Array(audio.bytes.byteLength);
  responseBuffer.set(audio.bytes);

  return new Response(
    new Blob([responseBuffer.buffer], { type: "audio/mpeg" }),
    {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-Speech-Cache": cacheStatus,
      },
    },
  );
}

async function readSharedAudio(identity: string): Promise<CachedAudio | null> {
  const snapshot = await adminDb
    .collection(CACHE_COLLECTION)
    .doc(identity)
    .get();
  const current = snapshot.data() as SharedCacheEntry | undefined;
  if (current?.status !== "ready" || !current.audioUrl) return null;
  return { kind: "blob", url: current.audioUrl };
}

async function claimSharedGeneration(identity: string, token: string) {
  const reference = adminDb.collection(CACHE_COLLECTION).doc(identity);
  const now = Date.now();

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const current = snapshot.data() as SharedCacheEntry | undefined;
    if (current?.status === "generating" && Number(current.expiresAtMs) > now) {
      return false;
    }

    const expiresAtMs = now + LOCK_LEASE_MS;
    transaction.set(reference, {
      status: "generating",
      token,
      expiresAtMs,
      expiresAt: Timestamp.fromMillis(expiresAtMs),
      updatedAt: Timestamp.fromMillis(now),
    });
    return true;
  });
}

async function publishSharedAudio(
  identity: string,
  token: string,
  audio: CachedAudio,
) {
  if (audio.kind !== "blob") {
    throw new Error("SHARED_AUDIO_CACHE_REQUIRES_BLOB");
  }

  const now = Timestamp.now();
  await adminDb.collection(CACHE_COLLECTION).doc(identity).set({
    status: "ready",
    audioUrl: audio.url,
    token,
    generatedAt: now,
    updatedAt: now,
  });
}

async function releaseSharedGeneration(identity: string, token: string) {
  const reference = adminDb.collection(CACHE_COLLECTION).doc(identity);
  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const current = snapshot.data() as SharedCacheEntry | undefined;
    if (current?.status === "generating" && current.token === token) {
      transaction.delete(reference);
    }
  });
}

async function waitForSharedAudio(identity: string) {
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const audio = await readSharedAudio(identity);
    if (audio) return audio;
  }
  return null;
}

async function getOrGenerateSharedAudio(
  identity: string,
  pathname: string,
  text: string,
  voiceId: string,
) {
  const cached = await readSharedAudio(identity);
  if (cached) return { audio: cached, cacheStatus: "HIT" as const };

  const token = randomUUID();
  if (!(await claimSharedGeneration(identity, token))) {
    const audio = await waitForSharedAudio(identity);
    if (audio) return { audio, cacheStatus: "HIT" as const };
    throw new Error("SPEECH_GENERATION_IN_PROGRESS");
  }

  try {
    const stored = await findCachedAudio(identity, pathname);
    const audio =
      stored || (await generateAndCache(text, voiceId, identity, pathname));
    await publishSharedAudio(identity, token, audio);
    return {
      audio,
      cacheStatus: stored ? ("HIT" as const) : ("MISS" as const),
    };
  } catch (error) {
    await releaseSharedGeneration(identity, token).catch((releaseError) => {
      console.error("[speech] Could not release cache lock", releaseError);
    });
    throw error;
  }
}

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim();

  if (!text || !allowedPhrases.has(text)) {
    return NextResponse.json(
      { error: "UNKNOWN_SPEECH_PHRASE" },
      { status: 400 },
    );
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const identity = cacheIdentity(text, voiceId);
  const pathname = blobPath(identity);

  if (
    process.env.VERCEL === "1" &&
    !process.env.BLOB_READ_WRITE_TOKEN?.trim()
  ) {
    return NextResponse.json(
      { error: "PERSISTENT_SPEECH_CACHE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      const result = await getOrGenerateSharedAudio(
        identity,
        pathname,
        text,
        voiceId,
      );
      return audioResponse(result.audio, result.cacheStatus);
    }

    const cached = await findCachedAudio(identity, pathname);
    if (cached) return audioResponse(cached, "HIT");

    let pending = generationLocks.get(identity);
    if (!pending) {
      pending = generateAndCache(text, voiceId, identity, pathname).finally(
        () => generationLocks.delete(identity),
      );
      generationLocks.set(identity, pending);
    }

    return audioResponse(await pending, "MISS");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ELEVENLABS_NOT_CONFIGURED"
    ) {
      return NextResponse.json(
        { error: "ELEVENLABS_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    if (error instanceof Error && error.message === "SPEECH_PROVIDER_ERROR") {
      return NextResponse.json(
        { error: "SPEECH_PROVIDER_ERROR" },
        { status: 502 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "SPEECH_GENERATION_IN_PROGRESS"
    ) {
      return NextResponse.json(
        { error: "SPEECH_GENERATION_IN_PROGRESS" },
        { status: 503, headers: { "Retry-After": "2" } },
      );
    }

    console.error("[speech] Audio cache failed", error);
    return NextResponse.json(
      { error: "SPEECH_PROVIDER_UNAVAILABLE" },
      { status: 502 },
    );
  }
}
