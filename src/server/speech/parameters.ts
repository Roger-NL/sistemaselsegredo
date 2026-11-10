import "server-only";
import { SpeechUnavailableError, type SpeechParameters } from "./cache";

/** Playback needs only the identity of the immutable, already published recordings. */
export function speechPlaybackParameters(role: "character" | "you" = "character"): SpeechParameters {
  const voiceId = (role === "you" ? process.env.ELEVENLABS_LEARNER_VOICE_ID : process.env.ELEVENLABS_VOICE_ID)?.trim();
  if (!voiceId) throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED");
  return { voiceId, model: "eleven_multilingual_v2", format: "mp3_44100_128", speed: 1, language: "en", stability: 0.5, similarityBoost: 0.75, processing: { tempo: 0.78, version: "atempo-v1" } };
}

/** Credentials are required only by the one-time production job. */
export function speechParameters(): SpeechParameters {
  if (!process.env.ELEVENLABS_API_KEY?.trim() || !process.env.BLOB_READ_WRITE_TOKEN?.trim()) throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED");
  return { ...speechPlaybackParameters(), processing: undefined };
}
