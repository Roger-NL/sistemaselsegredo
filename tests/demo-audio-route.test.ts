import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ parameters: vi.fn(), published: vi.fn(), read: vi.fn(), resolve: vi.fn(), limit: vi.fn() }));
vi.mock("@/server/speech/parameters", () => ({ speechPlaybackParameters: mocks.parameters }));
vi.mock("@/server/speech/runtime", () => ({ readCachedSpeech: mocks.read, resolveCachedSpeech: mocks.resolve }));
vi.mock("@/server/speech/published", () => ({ getPublishedAudioCatalog: mocks.published }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: mocks.limit }));
import { POST } from "@/app/api/demo/audio/route";
import { SpeechUnavailableError } from "@/server/speech/cache";
const request = (body: unknown, origin = "http://localhost") => new Request("http://localhost/api/demo/audio", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.parameters.mockReturnValue({ voiceId: "server-only" }); mocks.published.mockReturnValue({}); });
describe("public playback never synthesizes audio", () => {
  it("serves the same stored recording repeatedly without database or provider operations", async () => {
    const reference = { key: "a".repeat(64), audioUrl: `https://test.public.blob.vercel-storage.com/speech-cache/v3/${"a".repeat(64)}.mp3` };
    mocks.published.mockReturnValue({ C01: reference });
    for (let index = 0; index < 5; index++) {
      const response = await POST(request({ audioId: "C01" }));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ready", ...reference });
    }
    expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.limit).not.toHaveBeenCalled(); expect(mocks.resolve).not.toHaveBeenCalled();
  });
  it("fails closed for every missing entry, without trying to regenerate or serve the previous voice", async () => {
    const { audio } = await import("@/features/demo/content/media");
    for (const audioId of Object.keys(audio)) {
      const response = await POST(request({ audioId }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "AUDIO_NOT_PUBLISHED" });
    }
    expect(mocks.resolve).not.toHaveBeenCalled(); expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.limit).not.toHaveBeenCalled();
  });
  it("rejects text, voice/setting overrides and unknown IDs before consulting configuration", async () => {
    for (const body of [{ text: "anything" }, { audioId: "C01", voiceId: "other" }, { audioId: "C01", speed: 1 }, { audioId: "C99" }, { audioId: "__proto__" }]) expect((await POST(request(body))).status).toBe(400);
    expect(mocks.parameters).not.toHaveBeenCalled(); expect(mocks.resolve).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests without requiring a login cookie", async () => {
    expect((await POST(request({ audioId: "C01" }, "https://other.example"))).status).toBe(403);
    expect(mocks.parameters).not.toHaveBeenCalled();
  });
  it("sanitizes configuration failures without exposing credentials", async () => {
    mocks.parameters.mockImplementationOnce(() => { throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED"); });
    expect((await POST(request({ audioId: "C01" }))).status).toBe(503);
    mocks.published.mockImplementationOnce(() => { throw new Error("private upstream credential"); });
    expect(await (await POST(request({ audioId: "C01" }))).json()).toEqual({ error: "SPEECH_UNAVAILABLE" });
    expect(mocks.resolve).not.toHaveBeenCalled();
  });
});
