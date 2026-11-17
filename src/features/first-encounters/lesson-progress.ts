import { LESSON_SCENES } from "./lesson-one";

export const LESSON_PROGRESS_STORAGE = "basedspeak.lesson-one.v2";
export type SavedProgress = { version: 2; scene: number; round: number; completed: string[]; supported: string[] };
export const createLessonProgress = (): SavedProgress => ({ version: 2, scene: 0, round: 0, completed: [], supported: [] });

export function restoreLessonProgress(raw: string | null): SavedProgress {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 2 || !Number.isInteger(value.scene) || !Number.isInteger(value.round)) return createLessonProgress();
    const ids = LESSON_SCENES.flatMap(s => s.rounds.map(r => r.id));
    const saved = new Set(Array.isArray(value.completed) ? value.completed.filter((id: unknown) => typeof id === "string") : []);
    const completed: string[] = [];
    for (const id of ids) { if (!saved.has(id)) break; completed.push(id); }
    const pendingScene = LESSON_SCENES.findIndex(s => s.rounds.some(r => !completed.includes(r.id)));
    const ceiling = pendingScene < 0 ? LESSON_SCENES.length : pendingScene;
    const scene = Math.max(0, Math.min(value.scene, ceiling));
    const target = LESSON_SCENES[scene];
    const firstPending = target?.rounds.findIndex(r => !completed.includes(r.id)) ?? 0;
    const round = target ? Math.max(0, Math.min(value.round, firstPending < 0 ? target.rounds.length - 1 : firstPending)) : 0;
    const supported = Array.isArray(value.supported) ? value.supported.filter((id: unknown): id is string => typeof id === "string" && ids.includes(id)) : [];
    return { version: 2, scene, round, completed, supported };
  } catch { return createLessonProgress(); }
}
