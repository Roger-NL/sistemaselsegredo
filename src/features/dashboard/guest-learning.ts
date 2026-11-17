import type { LearningProgress } from "@/contracts/workspace";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, LESSON_DASHBOARD_STORAGE, getLessonDashboardSnapshot, type LessonDashboardInput } from "@/features/first-encounters/lesson-dashboard";
import { LESSON_MECHANICS_STORAGE } from "@/features/first-encounters/lesson-mechanics";

export const GUEST_LEARNING_KEY = "basedspeak.learning.guest.v2";
export type GuestStorage = Pick<Storage, "setItem" | "removeItem"> & Partial<Pick<Storage, "getItem">>;
export const emptyGuestLearning = (): LearningProgress => ({ revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: null, lessonSnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49, updatedAt: null });

/** Only this curriculum's public browser work is eligible for continuation. */
export function readGuestLearning(storage?: GuestStorage): LearningProgress {
  try {
    const raw = storage?.getItem?.(GUEST_LEARNING_KEY);
    let lessonSnapshot: string | null = null;
    let updatedAt: string | null = null;
    if (raw) {
      if (raw.length > 150_000) throw new Error("Guest cache too large");
      const value = JSON.parse(raw);
      if (value?.version !== 2) throw new Error("Invalid guest cache");
      if (value.lessonSnapshot != null && !decodeLessonAccountSnapshot(value.lessonSnapshot)) throw new Error("Invalid course");
      lessonSnapshot = value.lessonSnapshot ?? null;
      updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : null;
    } else {
      // Preserve the approved local demo when it becomes the public course.
      // No cafeteria key and no private account cache is read here.
      const progress: LessonDashboardInput = { ...EMPTY_LESSON_DASHBOARD_INPUT };
      for (const field of Object.keys(LESSON_DASHBOARD_STORAGE) as (keyof typeof LESSON_DASHBOARD_STORAGE)[]) progress[field] = storage?.getItem?.(LESSON_DASHBOARD_STORAGE[field]) ?? null;
      if (Object.values(progress).some(Boolean)) lessonSnapshot = encodeLessonAccountSnapshot(progress, storage?.getItem?.(LESSON_MECHANICS_STORAGE) ?? null);
    }
    const progress = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(lessonSnapshot)?.progress);
    return { ...emptyGuestLearning(), lessonSnapshot, demoPercent: progress.percent, studyCompleted: progress.completedUnits, updatedAt };
  } catch {
    try { storage?.removeItem(GUEST_LEARNING_KEY); } catch { /* The private account cache remains untouched. */ }
    return emptyGuestLearning();
  }
}
export function hasGuestLearning(learning?: LearningProgress | null) {
  return getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning?.lessonSnapshot ?? null)?.progress).completedUnits > 0;
}
export function canImportGuestLearning(learning: LearningProgress, liveClass: unknown) {
  // Match the server's atomic empty-account guard, including an already saved
  // zero-percent course. Its presence is different from an untouched account.
  return learning.revision === 0 && learning.lessonSnapshot == null && learning.demoSnapshot == null && learning.studySnapshot == null && !liveClass;
}
export function writeGuestLearning(storage: GuestStorage | undefined, learning: LearningProgress) {
  storage?.setItem(GUEST_LEARNING_KEY, JSON.stringify({ version: 2, lessonSnapshot: learning.lessonSnapshot ?? null, updatedAt: learning.updatedAt }));
}
