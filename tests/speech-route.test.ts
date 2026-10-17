import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../src/app/api/speech/route";

describe("speech route", () => {
  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(path.join(os.tmpdir(), "speech-route-"));
    vi.stubEnv("SPEECH_CACHE_DIR", cacheDirectory);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    await rm(cacheDirectory, { recursive: true, force: true });
  });

  it("rejects text that does not belong to the welcome conversation", async () => {
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);

    const response = await GET(
      new Request("http://localhost/api/speech?text=arbitrary%20text"),
    );

    expect(response.status).toBe(400);
    expect(provider).not.toHaveBeenCalled();
  });

  it("reports that ElevenLabs still needs to be connected", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");

    const response = await GET(
      new Request(
        "http://localhost/api/speech?text=What%20do%20you%20think%3F",
      ),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "ELEVENLABS_NOT_CONFIGURED",
    });
  });

  it("generates an approved phrase once and serves later plays from cache", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "secret-test-key");
    vi.stubEnv("ELEVENLABS_VOICE_ID", "voice-test-id");
    const provider = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "audio/mpeg" },
      }),
    );
    vi.stubGlobal("fetch", provider);

    const response = await GET(
      new Request(
        "http://localhost/api/speech?text=What%20do%20you%20think%3F",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("x-speech-cache")).toBe("MISS");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
    expect(provider).toHaveBeenCalledOnce();
    const [url, options] = provider.mock.calls[0];
    expect(url).toContain("/voice-test-id/stream");
    expect(options.headers["xi-api-key"]).toBe("secret-test-key");
    expect(JSON.parse(options.body)).toMatchObject({
      text: "What do you think?",
      model_id: "eleven_flash_v2_5",
      language_code: "en",
      voice_settings: { speed: 0.78 },
    });

    const cachedResponse = await GET(
      new Request(
        "http://localhost/api/speech?text=What%20do%20you%20think%3F",
      ),
    );
    expect(cachedResponse.status).toBe(200);
    expect(cachedResponse.headers.get("x-speech-cache")).toBe("HIT");
    expect(new Uint8Array(await cachedResponse.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
    expect(provider).toHaveBeenCalledOnce();
  });
});
