import { createLessonAudioController, getLessonAudioKey } from "./lesson-audio";
import { getRevisionAudioClip } from "./lesson-revision-audio";
import { LESSON_MECHANICS, type LessonMechanicId } from "./lesson-mechanics";
import type { PersonId } from "./lesson-one";

const approved = Object.values(LESSON_MECHANICS);

/** A single channel owns the recorded directions and all existing English turns. */
export function getGuidedLessonAudioClip(person: PersonId, text: string): string | undefined {
  const recording = getRevisionAudioClip(person, text);
  if (recording) return recording;
  if (person !== "nina") return undefined;
  return approved.find(clip => clip.key === getLessonAudioKey(person, text))?.url;
}

export function createGuidedLessonAudioController() {
  return createLessonAudioController({ resolveClip: getGuidedLessonAudioClip });
}

export function restoreSeenMechanics(raw: string | null): Set<LessonMechanicId> {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1 || !Array.isArray(value.seen)) return new Set();
    return new Set(value.seen.filter((id: unknown): id is LessonMechanicId => typeof id === "string" && Object.hasOwn(LESSON_MECHANICS, id)));
  } catch { return new Set(); }
}
