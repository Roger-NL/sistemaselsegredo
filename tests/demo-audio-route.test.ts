import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ parameters: vi.fn(), resolve: vi.fn(), limit: vi.fn() }));
vi.mock("@/server/speech/runtime", () => ({ speechParameters: mocks.parameters, resolveCachedSpeech: mocks.resolve }));
vi.mock("@/server/http/rate-limit", async original => ({ ...await original<typeof import("@/server/http/rate-limit")>(), consumeRateLimit: mocks.limit }));
import { POST } from "@/app/api/demo/audio/route";
import { SpeechUnavailableError } from "@/server/speech/cache";
const request = (body: unknown, origin = "http://localhost") => new Request("http://localhost/api/demo/audio", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.parameters.mockReturnValue({ voiceId: "server-only" }); mocks.limit.mockResolvedValue({}); });
describe("public catalog audio API", () => {
  it("accepts an ID and resolves the approved text only on the server", async () => {
    mocks.resolve.mockResolvedValue({ status: "ready", key: "opaque", url: "https://test.public.blob.vercel-storage.com/file.mp3" });
    const response = await POST(request({ audioId: "C01" }));
    expect(response.status).toBe(200); expect(mocks.resolve).toHaveBeenCalledWith("Is this yours?", { voiceId: "server-only" });
    expect(await response.json()).toEqual({ status: "ready", key: "opaque", audioUrl: "https://test.public.blob.vercel-storage.com/file.mp3" });
  });
  it("rejects text, parameter overrides and unknown IDs before touching services", async () => {
    for (const body of [{ text: "anything" }, { audioId: "C01", speed: 1 }, { audioId: "C99" }, { audioId: "__proto__" }]) expect((await POST(request(body))).status).toBe(400);
    expect(mocks.parameters).not.toHaveBeenCalled(); expect(mocks.resolve).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests and does not require a login cookie", async () => {
    expect((await POST(request({ audioId: "C01" }, "https://other.example"))).status).toBe(403);
    expect(mocks.parameters).not.toHaveBeenCalled();
  });
  it("returns pending with a retry delay and sanitized failure without secrets", async () => {
    mocks.resolve.mockResolvedValueOnce({ status: "pending", key: "opaque", retryAfter: 2 });
    const pending = await POST(request({ audioId: "C01" })); expect(pending.status).toBe(202); expect(pending.headers.get("retry-after")).toBe("2");
    mocks.resolve.mockRejectedValueOnce(new Error("private upstream credential"));
    expect(await (await POST(request({ audioId: "C01" }))).json()).toEqual({ error: "SPEECH_UNAVAILABLE" });
    mocks.parameters.mockImplementationOnce(() => { throw new SpeechUnavailableError("SPEECH_NOT_CONFIGURED"); });
    expect((await POST(request({ audioId: "C01" }))).status).toBe(503);
  });
});
