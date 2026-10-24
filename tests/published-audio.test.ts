import { afterEach, describe, expect, it, vi } from "vitest";
import { audio } from "@/features/demo/content/media";
import { validateAudioReference } from "@/contracts/demo-audio";
import { speechIdentity, type SpeechParameters } from "@/server/speech/cache";
import { pageAudioCatalog, validatePublishedCatalog } from "@/server/speech/published";
import published from "@/server/speech/published-catalog.json";

const parameters: SpeechParameters = { voiceId: "test-voice", model: "eleven_flash_v2_5", format: "mp3_44100_128", speed: .78, language: "en", stability: .62, similarityBoost: .75 };
function fixture() {
  return { schemaVersion: 1, entries: Object.fromEntries(Object.entries(audio).map(([id, asset]) => {
    const { key } = speechIdentity(asset.text, parameters);
    return [id, { key, audioUrl: `https://test.public.blob.vercel-storage.com/speech-cache/v3/${key}.mp3` }];
  })) };
}
afterEach(() => vi.unstubAllEnvs());
describe("published global audio index", () => {
  it("validates every text/configuration key and shares identical phrases without secrets or I/O", () => {
    const result = validatePublishedCatalog(fixture(), parameters);
    expect(Object.keys(result)).toHaveLength(50);
    expect(new Set(Object.values(result).map(entry => entry!.key)).size).toBe(46);
    expect(result.C21).toEqual(result.U09);
    for (const entry of Object.values(result)) expect(Object.keys(entry!).sort()).toEqual(["audioUrl", "key"]);
    expect(JSON.stringify(result)).not.toContain(parameters.voiceId);
  });
  it("does not serve the previous recordings if any synthesis setting changes", () => {
    for (const [field, value] of Object.entries({ voiceId: "other-voice", model: "other-model", format: "other-format", speed: .9, language: "es", stability: .5, similarityBoost: .5 })) {
      expect(validatePublishedCatalog(fixture(), { ...parameters, [field]: value }), field).toEqual({});
    }
  });
  it("rejects malformed indexes, unknown IDs and unsafe media URLs", () => {
    for (const input of [null, {}, { schemaVersion: 2, entries: {} }, { schemaVersion: 1, entries: [] }, { schemaVersion: 1, entries: { C99: fixture().entries.C01 } }]) {
      expect(() => validatePublishedCatalog(input, parameters)).toThrow("INVALID_PUBLISHED_CATALOG");
    }
    for (const audioUrl of ["https://foreign.example/file.mp3", `${fixture().entries.C01.audioUrl}?token=secret`, `${fixture().entries.C01.audioUrl}#secret`]) {
      expect(() => validatePublishedCatalog({ schemaVersion: 1, entries: { C01: { ...fixture().entries.C01, audioUrl } } }, parameters)).toThrow("INVALID_PUBLISHED_CATALOG");
    }
  });
  it("keeps the text-only entry working without configured server credentials", () => {
    vi.stubEnv("ELEVENLABS_VOICE_ID", "");
    expect(pageAudioCatalog()).toEqual({});
  });
  it("ships the complete existing public-file inventory without provider configuration", () => {
    expect(Object.keys(published.entries).sort()).toEqual(Object.keys(audio).sort());
    expect(new Set(Object.values(published.entries).map(entry => validateAudioReference(entry).key)).size).toBe(46);
    for (const entry of Object.values(published.entries)) expect(Object.keys(entry).sort()).toEqual(["audioUrl", "key"]);
  });
});
