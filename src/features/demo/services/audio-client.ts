import type { AudioId } from "../model/types";
import { audio } from "../content/media";
import { validateAudioReference, type PublishedAudioCatalog } from "../../../contracts/demo-audio";

function waitForRetry(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const aborted = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", aborted); resolve(); }, ms);
    signal.addEventListener("abort", aborted, { once: true });
    if (signal.aborted) aborted();
  });
}

/** A session shortcut for published URLs, in addition to (never instead of) the global server cache. */
export function createCatalogAudioClient(request: typeof fetch = fetch,
  wait: (ms: number, signal: AbortSignal) => Promise<void> = waitForRetry, published: PublishedAudioCatalog = {}) {
  const ready = new Map<string, string>();
  for (const [id, value] of Object.entries(published)) {
    if (!Object.hasOwn(audio, id)) throw new Error("INVALID_AUDIO_RESPONSE");
    const reference = validateAudioReference(value);
    const text = audio[id as AudioId].text;
    if (ready.has(text) && ready.get(text) !== reference.audioUrl) throw new Error("INVALID_AUDIO_RESPONSE");
    ready.set(text, reference.audioUrl);
  }
  return async (id: AudioId, signal: AbortSignal) => {
    signal.throwIfAborted();
    // Different narrative roles/IDs can use the exact same approved phrase.
    const text = audio[id].text;
    const cached = ready.get(text);
    if (cached) return cached;
    const url = await requestCatalogAudio(id, signal, request, wait);
    signal.throwIfAborted();
    ready.set(text, url);
    return url;
  };
}

/** IDs only. Voice/provider parameters and secrets never cross this boundary. */
export async function requestCatalogAudio(id: AudioId, signal: AbortSignal, request: typeof fetch = fetch,
  wait: (ms: number, signal: AbortSignal) => Promise<void> = waitForRetry): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    signal.throwIfAborted();
    const response = await request("/api/demo/audio", { method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioId: id }), signal });
    if (response.status === 202) {
      const seconds = Math.min(3, Math.max(1, Number(response.headers.get("retry-after")) || 2));
      await wait(seconds * 1000, signal); continue;
    }
    if (!response.ok) throw new Error("AUDIO_UNAVAILABLE");
    const payload: unknown = await response.json();
    return validateAudioReference(payload).audioUrl;
  }
  throw new Error("AUDIO_STILL_PREPARING");
}
