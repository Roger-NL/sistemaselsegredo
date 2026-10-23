import "server-only";

import { put } from "@vercel/blob";

/** Offline production capability. Never imported by the public demo or a synthesis API. */
export async function generatePreparedSpeech(text: string, voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb") {
  if (!text.trim() || text.length > 2_000) throw new Error("INVALID_SPEECH_TEXT");
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error("ELEVENLABS_NOT_CONFIGURED");
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
    body: JSON.stringify({
      text, model_id: "eleven_flash_v2_5", language_code: "en",
      voice_settings: { speed: 0.78, stability: 0.62, similarity_boost: 0.75 },
    }),
    signal: AbortSignal.timeout(30_000), cache: "no-store",
  });
  if (!response.ok) throw new Error("SPEECH_PROVIDER_ERROR");
  return Buffer.from(await response.arrayBuffer());
}

/** Explicit publishing step for future production workflows; not executed by visitors. */
export async function publishPreparedSpeech(pathname: string, bytes: Buffer) {
  if (!/^demo\/cafe\/v\d+\/audio\/[CU]\d{2}\.mp3$/.test(pathname)) throw new Error("INVALID_SPEECH_PATH");
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_NOT_CONFIGURED");
  return put(pathname, bytes, { access: "public", addRandomSuffix: false, contentType: "audio/mpeg" });
}
