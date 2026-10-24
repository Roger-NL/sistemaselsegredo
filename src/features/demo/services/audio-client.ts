import type { AudioId } from "../model/types";

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
  wait: (ms: number, signal: AbortSignal) => Promise<void> = waitForRetry) {
  const ready = new Map<AudioId, string>();
  return async (id: AudioId, signal: AbortSignal) => {
    signal.throwIfAborted();
    const cached = ready.get(id);
    if (cached) return cached;
    const url = await requestCatalogAudio(id, signal, request, wait);
    signal.throwIfAborted();
    ready.set(id, url);
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
    if (!payload || typeof payload !== "object" || !("key" in payload) || !("audioUrl" in payload)
      || typeof payload.key !== "string" || !/^[a-f0-9]{64}$/.test(payload.key) || typeof payload.audioUrl !== "string") throw new Error("INVALID_AUDIO_RESPONSE");
    const url = new URL(payload.audioUrl);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com") || url.username || url.password
      || url.search || url.pathname !== `/speech-cache/v3/${payload.key}.mp3`) throw new Error("INVALID_AUDIO_RESPONSE");
    return url.href;
  }
  throw new Error("AUDIO_STILL_PREPARING");
}
