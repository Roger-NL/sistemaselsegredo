import { createContext, useContext } from "react";
import { LESSON_DASHBOARD_STORAGE, EMPTY_LESSON_DASHBOARD_INPUT, type LessonDashboardInput } from "./lesson-dashboard";
import { LESSON_MECHANICS_STORAGE } from "./lesson-mechanics";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "./lesson-account-snapshot";
import type { studentWorkspace } from "@/features/dashboard/workspace-store";

export type LessonStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const browserStorage: LessonStorage = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: key => window.localStorage.removeItem(key),
};
export const LessonStorageContext = createContext<LessonStorage>(browserStorage);
export const useLessonStorage = () => useContext(LessonStorageContext);
type Store = Pick<typeof studentWorkspace, "getSnapshot" | "stage">;
const fields = Object.entries(LESSON_DASHBOARD_STORAGE) as [keyof LessonDashboardInput, string][];

/** Every write keeps the account and revision that mounted the current lesson. */
export function createLessonStorage(store: Store, generation: number): LessonStorage {
  function read() {
    const current = store.getSnapshot();
    if (current.generation !== generation || current.conflict || !["ready", "unauthenticated"].includes(current.status)) throw new Error("Atualize seu percurso antes de continuar.");
    const raw = (current.workspace?.learning ?? current.guestLearning)?.lessonSnapshot ?? null;
    return decodeLessonAccountSnapshot(raw) ?? { version: 1 as const, courseId: "first-encounters-v1" as const, progress: { ...EMPTY_LESSON_DASHBOARD_INPUT }, mechanics: null };
  }
  function update(key: string, value: string | null) {
    const snapshot = read();
    if (key === LESSON_MECHANICS_STORAGE) snapshot.mechanics = value;
    else {
      const field = fields.find(([, name]) => name === key)?.[0];
      if (!field) throw new Error("Campo de progresso desconhecido.");
      snapshot.progress[field] = value;
    }
    if (!store.stage("lessonSnapshot", encodeLessonAccountSnapshot(snapshot.progress, snapshot.mechanics), generation)) throw new Error("Seu acesso mudou. Atualize o percurso.");
  }
  return {
    getItem(key) { const snapshot = read(); return key === LESSON_MECHANICS_STORAGE ? snapshot.mechanics : snapshot.progress[fields.find(([, name]) => name === key)?.[0] ?? "lesson"] ?? null; },
    setItem: update,
    removeItem: key => update(key, null),
  };
}
