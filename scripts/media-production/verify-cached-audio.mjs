// Manual, read-only verification for Node 24+ on macOS (afconvert).
// No provider integration or API key is used.
// node --experimental-transform-types --conditions=react-server scripts/media-production/verify-cached-audio.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, resolve } from "node:path";
import { registerHooks } from "node:module";
import { execFileSync } from "node:child_process";
import nextEnv from "@next/env";
import { cert, initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { audio } from "../../src/features/demo/content/media.ts";
import { speechIdentity, readPublishedSpeech } from "../../src/server/speech/cache.ts";

// Next resolves extensionless TypeScript imports; give this manual Node runner
// the same resolution only for relative imports inside the repository's src tree.
const sourceRoot = new URL("../../src/", import.meta.url).href;
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !extname(specifier) && context.parentURL?.startsWith(sourceRoot)) return next(`${specifier}.ts`, context);
  return next(specifier, context);
} });
const { createCatalogAudioClient } = await import("../../src/features/demo/services/audio-client.ts");

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const directory = resolve("tmp/audio-startup-verification");
await mkdir(directory, { recursive: true });
const startedAt = new Date().toISOString();
let app, parameters;
try {
  const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  account.private_key = account.private_key.replace(/\\n/g, "\n");
  app = initializeApp({ credential: cert(account) }, "cached-audio-verification");
  parameters = { voiceId: process.env.ELEVENLABS_VOICE_ID.trim(), model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 };
} catch { throw new Error("CACHED_AUDIO_VERIFICATION_CONFIG_INVALID"); }
const entries = Object.values(audio).map(asset => ({ id: asset.id, text: asset.text, ...speechIdentity(asset.text, parameters) }));
const references = [...new Set(entries.map(entry => entry.key))].map(key => getFirestore(app).collection("speech_audio_cache_v3").doc(key));
const summary = rows => ({ min: Math.min(...rows), median: [...rows].sort((a, b) => a - b)[Math.floor(rows.length / 2)], p95: [...rows].sort((a, b) => a - b)[Math.ceil(rows.length * .95) - 1], max: Math.max(...rows) });
const round = n => Math.round(n * 1000) / 1000;
async function snapshot() {
  const docs = await getFirestore(app).getAll(...references);
  return Object.fromEntries(docs.map(doc => {
    const record = doc.data();
    if (!record || record.status !== "ready" || record.providerAttemptCount !== 1) throw new Error("CACHE_NOT_ALREADY_READY");
    return [doc.id, { status: record.status, providerAttemptCount: record.providerAttemptCount, providerStartedAt: record.providerStartedAt,
      completedAt: record.completedAt, updatedAt: record.updatedAt, bytes: record.audio?.bytes, checksum: record.audio?.checksum }];
  }));
}
let reads = 0;
const store = { async read(key) { reads++; return (await getFirestore(app).collection("speech_audio_cache_v3").doc(key).get()).data() ?? null; } };
// The real client validates the response. This transport calls only the production
// read-only cache lookup: no HTTP playback, rate-limit mutation or generation path.
const request = async (_url, options) => {
  const id = JSON.parse(options.body).audioId;
  const result = await readPublishedSpeech(store, audio[id].text, parameters);
  if (result?.status !== "ready") throw new Error("CACHE_NOT_ALREADY_READY");
  return Response.json({ key: result.key, audioUrl: result.url });
};
try {
  const before = await snapshot();
  await writeFile(resolve(directory, "ledger-before.json"), JSON.stringify(before, null, 2));
  const signal = AbortSignal.timeout(180_000);
  const client = createCatalogAudioClient(request);
  const rows = [];
  const files = new Map();
  for (const entry of entries) {
    const start = performance.now();
    const url = await client(entry.id, signal);
    const lookupMs = round(performance.now() - start);
    let file = files.get(entry.key);
    if (!file) {
      const downloadStart = performance.now();
      const response = await fetch(url, { signal });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/mpeg")) throw new Error("INVALID_DOWNLOAD");
      const reader = response.body.getReader();
      const first = await reader.read();
      const firstByteMs = round(performance.now() - downloadStart);
      const chunks = first.done ? [] : [Buffer.from(first.value)];
      for (;;) { const chunk = await reader.read(); if (chunk.done) break; chunks.push(Buffer.from(chunk.value)); }
      const bytes = Buffer.concat(chunks);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (bytes.length !== before[entry.key].bytes || (before[entry.key].checksum && sha256 !== before[entry.key].checksum)) throw new Error("STORED_FILE_CHANGED");
      const path = resolve(directory, `${entry.id}.mp3`);
      await writeFile(path, bytes);
      // Decode the entire existing MP3 locally; this does not play sound or synthesize.
      execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16", path, resolve(directory, `${entry.id}.wav`)], { stdio: "pipe" });
      file = { firstByteMs, bytes: bytes.length, sha256, decoded: true };
      files.set(entry.key, file);
    }
    const beforeReplay = reads;
    const replayStart = performance.now();
    if (await client(entry.id, signal) !== url || reads !== beforeReplay) throw new Error("REPLAY_DID_NOT_REUSE_URL");
    rows.push({ id: entry.id, key: entry.key, lookupMs, replayLookupMs: round(performance.now() - replayStart), ...file });
    if (rows.length % 10 === 0) console.log(JSON.stringify({ verifiedIds: rows.length, uniqueDecodedFiles: files.size }));
  }
  const newSession = createCatalogAudioClient(request);
  for (const entry of [...entries].reverse()) {
    const start = performance.now();
    const url = await newSession(entry.id, signal);
    const row = rows.find(row => row.id === entry.id);
    row.freshSessionLookupMs = round(performance.now() - start);
    if (new URL(url).pathname !== `/speech-cache/v3/${entry.key}.mp3`) throw new Error("NEW_SESSION_CHANGED_FILE");
  }
  const after = await snapshot();
  await writeFile(resolve(directory, "ledger-after.json"), JSON.stringify(after, null, 2));
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("LEDGER_CHANGED");
  const result = { startedAt, completedAt: new Date().toISOString(), scope: "Read-only production cache service + CDN download/decode; not browser click-to-sound or mobile visual verification",
    connectionWarmup: "The initial ledger inventory warms the database connection before the timed lookups.",
    ids: rows.length, uniqueFiles: files.size, metadataReads: reads, ledgerUnchanged: true, additionalProviderAttempts: 0,
    lookupMs: summary(rows.map(row => row.lookupMs)), replayLookupMs: summary(rows.map(row => row.replayLookupMs)), freshSessionLookupMs: summary(rows.map(row => row.freshSessionLookupMs)),
    cdnFirstByteMs: summary([...files.values()].map(file => file.firstByteMs)), rows };
  await writeFile(resolve(directory, "report.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ ...result, rows: undefined }, null, 2));
} catch {
  console.error("CACHED_AUDIO_VERIFICATION_FAILED: no generation path was invoked; inspect sanitized partial evidence locally.");
  process.exitCode = 1;
} finally { await deleteApp(app); }
