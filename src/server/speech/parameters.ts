import "server-only";
import { SpeechUnavailableError, type SpeechParameters } from "./cache";

export function speechParameters(): SpeechParameters {
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!voiceId || !process.env.ELEVENLABS_API_KEY?.trim() || !process.env.BLOB_READ_WRITE_TOKEN?.trim()) throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED");
  return { voiceId, model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 };
}
