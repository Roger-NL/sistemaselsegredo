import "server-only";
import type { SpeechParameters } from "../speech/cache";

/** Low-level provider adapter. Production callers must go through server/speech/runtime.ts. */
export async function generatePreparedSpeech(text: string, p: SpeechParameters) {
  if (!text.trim() || text.length > 2_000 || !p.voiceId.trim()) throw new Error("INVALID_SPEECH_TEXT");
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error("ELEVENLABS_NOT_CONFIGURED");
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(p.voiceId)}/stream?output_format=${encodeURIComponent(p.format)}`, {
    method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
    body: JSON.stringify({ text, model_id: p.model, language_code: p.language,
      voice_settings: { speed: p.speed, stability: p.stability, similarity_boost: p.similarityBoost } }),
    signal: AbortSignal.timeout(30_000), cache: "no-store",
  });
  if (!response.ok || !response.body) throw new Error("SPEECH_PROVIDER_ERROR");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) { await reader.cancel(); throw new Error("SPEECH_PROVIDER_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
