import "server-only";
import { audio } from "../../features/demo/content/media";
import { validateAudioReference, type PublishedAudioCatalog } from "../../contracts/demo-audio";
import { speechIdentity, SpeechUnavailableError, type SpeechParameters } from "./cache";
import { speechParameters } from "./parameters";
import published from "./published-catalog.json";

/** A checked-in index of already persisted files: no database, SDK, network or generation. */
export function validatePublishedCatalog(input: unknown, parameters: SpeechParameters): PublishedAudioCatalog {
  if (!input || typeof input !== "object" || !("schemaVersion" in input) || input.schemaVersion !== 1
    || !("entries" in input) || !input.entries || typeof input.entries !== "object" || Array.isArray(input.entries)) throw new SpeechUnavailableError("INVALID_PUBLISHED_CATALOG");
  const result: PublishedAudioCatalog = {};
  for (const [id, value] of Object.entries(input.entries)) {
    if (!Object.hasOwn(audio, id)) throw new SpeechUnavailableError("INVALID_PUBLISHED_CATALOG");
    const audioId = id as keyof typeof audio;
    let reference;
    try { reference = validateAudioReference(value); } catch { throw new SpeechUnavailableError("INVALID_PUBLISHED_CATALOG"); }
    // A configuration/text change never serves the previous voice's recording.
    if (reference.key === speechIdentity(audio[audioId].text, parameters).key) result[audioId] = reference;
  }
  return result;
}

export function getPublishedAudioCatalog(parameters: SpeechParameters = speechParameters()) {
  return validatePublishedCatalog(published, parameters);
}

/** Text-only operation is still supported when local server credentials are absent. */
export function pageAudioCatalog(): PublishedAudioCatalog {
  try { return getPublishedAudioCatalog(); }
  catch (error) {
    if (error instanceof SpeechUnavailableError && error.code === "SPEECH_NOT_CONFIGURED") return {};
    throw error;
  }
}
