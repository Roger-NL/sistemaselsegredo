import type { AudioId } from "../features/demo/model/types";

export type PublishedAudioReference = { key: string; audioUrl: string };
export type PublishedAudioCatalog = Partial<Record<AudioId, PublishedAudioReference>>;

/** Public immutable media references only; never provider configuration or credentials. */
export function validateAudioReference(input: unknown): PublishedAudioReference {
  if (!input || typeof input !== "object" || !("key" in input) || !("audioUrl" in input)
    || typeof input.key !== "string" || !/^[a-f0-9]{64}$/.test(input.key) || typeof input.audioUrl !== "string") throw new Error("INVALID_AUDIO_RESPONSE");
  const url = new URL(input.audioUrl);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com") || url.username || url.password
    || url.search || url.hash || url.pathname !== `/speech-cache/v3/${input.key}.mp3`) throw new Error("INVALID_AUDIO_RESPONSE");
  return { key: input.key, audioUrl: url.href };
}
