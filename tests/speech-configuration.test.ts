import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ db: vi.fn(), head: vi.fn(), put: vi.fn(), generate: vi.fn() }));
vi.mock("@/server/firebase", () => ({ getAdminDb: mocks.db }));
vi.mock("@vercel/blob", () => ({ head: mocks.head, put: mocks.put, BlobNotFoundError: class extends Error {} }));
vi.mock("@/server/integrations/elevenlabs", () => ({ generatePreparedSpeech: mocks.generate }));
import { speechParameters } from "@/server/speech/runtime";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("server speech configuration", () => {
  it("requires every server secret and has no fallback voice or service calls", () => {
    const keys = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "BLOB_READ_WRITE_TOKEN"];
    for (const missing of keys) {
      for (const key of keys) vi.stubEnv(key, key === missing ? " " : "test-only");
      expect(() => speechParameters()).toThrow("SPEECH_NOT_CONFIGURED");
    }
    expect(mocks.db).not.toHaveBeenCalled(); expect(mocks.head).not.toHaveBeenCalled();
    expect(mocks.put).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("uses the configured voice and approved synthesis settings without exposing the API key", () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-only-key"); vi.stubEnv("ELEVENLABS_VOICE_ID", " test-only-voice "); vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-only-blob");
    expect(speechParameters()).toEqual({ voiceId: "test-only-voice", model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: 0.78, language: "en", stability: 0.62, similarityBoost: 0.75 });
  });
});
