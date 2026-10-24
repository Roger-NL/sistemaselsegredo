import { describe, expect, it, vi } from "vitest";
import { createCatalogAudioClient, requestCatalogAudio } from "@/features/demo/services/audio-client";
const key = "a".repeat(64);
const url = `https://test.public.blob.vercel-storage.com/speech-cache/v3/${key}.mp3`;
describe("catalog audio client", () => {
  it("replays a known recording without another API lookup, but a new session still consults the global cache", async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ key, audioUrl: url }));
    const resolve = createCatalogAudioClient(request);
    const signal = new AbortController().signal;
    expect(await resolve("C01", signal)).toBe(url);
    expect(await resolve("C01", signal)).toBe(url);
    expect(request).toHaveBeenCalledTimes(1);
    await createCatalogAudioClient(request)("C01", signal);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("does not retain failed lookups or let a cancelled operation reuse a URL", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockImplementation(async () => Response.json({ key, audioUrl: url }));
    const resolve = createCatalogAudioClient(request);
    await expect(resolve("C01", new AbortController().signal)).rejects.toThrow();
    expect(await resolve("C01", new AbortController().signal)).toBe(url);
    const controller = new AbortController(); controller.abort();
    await expect(resolve("C01", controller.signal)).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("polls a pending recording using only the approved ID", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("{}", { status: 202, headers: { "Retry-After": "2" } }))
      .mockResolvedValueOnce(Response.json({ key, audioUrl: url }));
    const wait = vi.fn(async () => {});
    expect(await requestCatalogAudio("C01", new AbortController().signal, request, wait)).toBe(url);
    expect(wait).toHaveBeenCalledWith(2000, expect.any(AbortSignal));
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0][1]?.body).toBe(JSON.stringify({ audioId: "C01" }));
  });
  it("rejects a foreign destination or API failure without hiding the narrative behind retries", async () => {
    for (const response of [Response.json({ key, audioUrl: "https://other.example/audio" }), new Response(null, { status: 503 })]) {
      const request = vi.fn<typeof fetch>().mockResolvedValue(response);
      await expect(requestCatalogAudio("C01", new AbortController().signal, request)).rejects.toThrow();
      expect(request).toHaveBeenCalledTimes(1);
    }
  });
  it("does not fetch on a cancelled operation", async () => {
    const controller = new AbortController(); controller.abort();
    const request = vi.fn<typeof fetch>();
    await expect(requestCatalogAudio("C01", controller.signal, request)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });
});
