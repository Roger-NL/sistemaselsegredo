import catalogJSON from "./tutorial-audio.json";
import { createLessonAudioController, getLessonAudioClip, getLessonAudioKey } from "./lesson-audio";
import type { PersonId } from "./lesson-one";
import { TUTORIAL_NARRATIONS } from "./tutorial-script";

const APPROVED_NARRATIONS = Object.values(TUTORIAL_NARRATIONS);

export const getTutorialAudioKey = getLessonAudioKey;

/** The tutorial narrator and Ana share one channel, but separate approved files. */
export function getTutorialAudioClip(person: PersonId, text: string, catalog: unknown = catalogJSON): string | undefined {
  if (person === "ana" && text === "I am Ana.") return getLessonAudioClip(person, text);
  if (person !== "nina" || !catalog || typeof catalog !== "object" || Array.isArray(catalog)) return undefined;
  const narration = APPROVED_NARRATIONS.find(clip => clip.text === text);
  if (!narration) return undefined;
  const value = (catalog as Record<string, unknown>)[getTutorialAudioKey(person, text)];
  return value === narration.url ? value : undefined;
}

export function validateTutorialAudioCatalog(catalog: unknown): { valid: boolean; errors: string[]; entries: number } {
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) return { valid: false, errors: ["O catálogo do tutorial precisa ser um objeto de caminhos locais."], entries: 0 };
  const errors: string[] = [];
  for (const [key, value] of Object.entries(catalog)) {
    const narration = APPROVED_NARRATIONS.find(clip => clip.key === key);
    if (!narration) errors.push(`Chave de narração inválida: ${key}`);
    else if (value !== narration.url) errors.push(`Caminho de narração inválido: ${key}`);
  }
  return { valid: errors.length === 0, errors, entries: Object.keys(catalog).length };
}

export type TutorialAudioControllerOptions = Omit<NonNullable<Parameters<typeof createLessonAudioController>[0]>, "catalog" | "resolveClip"> & { catalog?: unknown };

export function createTutorialAudioController(options: TutorialAudioControllerOptions = {}) {
  const { catalog = catalogJSON, ...runtime } = options;
  return createLessonAudioController({ ...runtime, resolveClip: (person, text) => getTutorialAudioClip(person, text, catalog) });
}
