import { LESSON_INTRODUCTION_SCENES } from "./lesson-introduction-content";

export const INTRODUCTION_POSITION_STORAGE = "basedspeak.lesson-one.introduction.position.v1";
export const TUTORIAL_POSITION_STORAGE = "basedspeak.lesson-one.tutorial.position.v1";

/** Restore only a screen cursor. Playback and completed actions are never saved. */
export function restorePosition(raw: string | null, total: number): number {
  if (!Number.isInteger(total) || total <= 0) return 0;
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return 0;
    const { version, index } = saved as Record<string, unknown>;
    if (version !== 1 || typeof index !== "number" || !Number.isInteger(index)) return 0;
    return Math.max(0, Math.min(total - 1, index));
  } catch { return 0; }
}


/** Old cursors point to the first utterance of the saved scene. */
export function restoreIntroductionPosition(raw: string | null) {
  const index = restorePosition(raw, LESSON_INTRODUCTION_SCENES.length);
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.version === 1 && saved.index === index && Number.isInteger(saved.block) && saved.block > 0) {
      return { version: 1, index, block: Math.min(saved.block, LESSON_INTRODUCTION_SCENES[index].blocks.length - 1) };
    }
  } catch { /* Use the existing screen cursor when a block is unavailable. */ }
  return { version: 1, index };
}
