import { restoreConclusionState } from "./lesson-conclusion";
import { restoreLessonProgress } from "./lesson-progress";
import { restorePosition } from "./lesson-position";
import { LESSON_MECHANICS } from "./lesson-mechanics";
import type { LessonDashboardInput } from "./lesson-dashboard";

export type LessonAccountSnapshot = {
  version: 1;
  courseId: "first-encounters-v1";
  progress: LessonDashboardInput;
  mechanics: string | null;
};

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function canonicalProgress(value: Record<string, unknown>): LessonDashboardInput | null {
  for (const key of ["introduction", "guide", "lesson", "conclusion", "introPosition", "guidePosition"]) {
    if (value[key] != null && typeof value[key] !== "string") return null;
  }
  const lesson = value.lesson == null ? null : restoreLessonProgress(value.lesson as string);
  if (lesson) lesson.supported = [...new Set(lesson.supported)].sort();
  const position = (raw: unknown, total: number) => raw == null ? null : JSON.stringify({ version: 1, index: restorePosition(raw as string, total) });
  return {
    introduction: value.introduction === "done" ? "done" : null,
    guide: value.guide === "done" ? "done" : null,
    lesson: lesson ? JSON.stringify(lesson) : null,
    conclusion: value.conclusion == null ? null : JSON.stringify(restoreConclusionState(value.conclusion as string)),
    introPosition: position(value.introPosition, 3), guidePosition: position(value.guidePosition, 6),
  };
}
function canonicalMechanics(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !Array.isArray(value.seen)) return null;
    const seen = new Set(value.seen.filter((id): id is string => typeof id === "string"));
    return JSON.stringify({ version: 1, seen: Object.keys(LESSON_MECHANICS).filter(id => seen.has(id)) });
  } catch { return null; }
}

/** A different curriculum or an old unwrapped snapshot never becomes this course. */
export function decodeLessonAccountSnapshot(raw: string | null): LessonAccountSnapshot | null {
  if (!raw || raw.length > 100_000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || value.courseId !== "first-encounters-v1" || !record(value.progress)) return null;
    const progress = canonicalProgress(value.progress);
    if (!progress || value.mechanics != null && typeof value.mechanics !== "string") return null;
    return { version: 1, courseId: "first-encounters-v1", progress, mechanics: canonicalMechanics(value.mechanics) };
  } catch { return null; }
}

export function encodeLessonAccountSnapshot(progress: LessonDashboardInput, mechanics: string | null = null): string {
  const canonical = canonicalProgress(progress as unknown as Record<string, unknown>);
  if (!canonical) throw new TypeError("Progresso da aula inválido.");
  return JSON.stringify({ version: 1, courseId: "first-encounters-v1", progress: canonical, mechanics: canonicalMechanics(mechanics) } satisfies LessonAccountSnapshot);
}
