import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/speech/route";
import { generatePreparedSpeech } from "@/server/integrations/elevenlabs";

const parameters = { voiceId: "test-voice", model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("retired speech endpoint and preserved production adapter", () => {
  it("returns stable JSON 410 without generating audio or redirecting", async () => {
    const provider = vi.fn(); vi.stubGlobal("fetch", provider);
    const response = GET();
    expect(response.status).toBe(410);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("location")).toBeNull();
    expect(await response.json()).toMatchObject({ error: "API_RETIRED" });
    expect(provider).not.toHaveBeenCalled();
  });
  it("fails before calling a provider without production credentials", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const provider = vi.fn(); vi.stubGlobal("fetch", provider);
    await expect(generatePreparedSpeech("Approved text", parameters)).rejects.toThrow("ELEVENLABS_NOT_CONFIGURED");
    expect(provider).not.toHaveBeenCalled();
  });
  it("preserves the production voice settings without relying on orbit content", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const provider = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
    vi.stubGlobal("fetch", provider);
    expect(await generatePreparedSpeech("Approved text", parameters)).toEqual(Buffer.from([1, 2, 3]));
    const [url, options] = provider.mock.calls[0];
    expect(url).toContain("test-voice");
    expect(JSON.parse(options.body)).toMatchObject({ text: "Approved text", voice_settings: { speed: 0.78 } });
  });
});
