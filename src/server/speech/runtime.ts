import "server-only";
import { createHash } from "node:crypto";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { getAdminDb } from "../firebase";
import { generatePreparedSpeech } from "../integrations/elevenlabs";
import { createSpeechCache, readPublishedSpeech, SpeechUnavailableError, type SpeechParameters, type SpeechRecord, type SpeechStore } from "./cache";

export function speechParameters(): SpeechParameters {
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!voiceId || !process.env.ELEVENLABS_API_KEY?.trim() || !process.env.BLOB_READ_WRITE_TOKEN?.trim()) throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED");
  return { voiceId, model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 };
}

const store: SpeechStore = {
  async read(key) {
    const snapshot = await getAdminDb().collection("speech_audio_cache_v3").doc(key).get();
    return snapshot.exists ? snapshot.data() as SpeechRecord : null;
  },
  async update(key, decide) {
    const reference = getAdminDb().collection("speech_audio_cache_v3").doc(key);
    return getAdminDb().runTransaction(async transaction => {
      const snapshot = await transaction.get(reference);
      const decision = decide(snapshot.exists ? snapshot.data() as SpeechRecord : null);
      if (decision.record) transaction.set(reference, decision.record);
      return decision.result;
    });
  },
};
export const readCachedSpeech = (text: string, parameters: SpeechParameters) => readPublishedSpeech(store, text, parameters);
export const resolveCachedSpeech = createSpeechCache({
  store,
  async find(pathname) {
    try {
      const blob = await head(pathname);
      if (blob.contentType !== "audio/mpeg") throw new SpeechUnavailableError("INVALID_STORED_AUDIO");
      return { url: blob.url, pathname: blob.pathname, bytes: blob.size };
    } catch (error) {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    }
  },
  generate: generatePreparedSpeech,
  async save(pathname, bytes) {
    const blob = await put(pathname, bytes, { access: "public", addRandomSuffix: false, allowOverwrite: false,
      contentType: "audio/mpeg", cacheControlMaxAge: 31_536_000 });
    return { url: blob.url, pathname: blob.pathname, bytes: bytes.length, checksum: createHash("sha256").update(bytes).digest("hex") };
  },
});
