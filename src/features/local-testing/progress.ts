import type { LearningProgress } from "@/contracts/workspace";
import { applyTestAction } from "@/features/superuser/actions";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
export type LocalProgressAction = "reset-all" | "reset-demo" | "advance-demo" | "complete-demo" | "jump-demo" | "reset-study" | "advance-study" | "complete-study";
/** Local simulations use the actual curriculum in a separate sandbox. */
export function changeTestProgress(learning: LearningProgress, action: LocalProgressAction, _profile?: string, part = 1): LearningProgress {
  const written = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning.lessonSnapshot ?? null)?.progress);
  const input = action === "jump-demo" ? { action: "jump-part" as const, part: Math.max(1, Math.min(6, Math.floor(part))) }
    : action === "advance-demo" ? { action: "next-part" as const }
    : action === "advance-study" ? { action: "study-complete" as const, step: Math.min(10, Math.max(0, written.completedUnits - 38)) }
    : { action };
  const next = applyTestAction(learning, input);
  const progress = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(next.lessonSnapshot ?? null)?.progress);
  return { ...next, demoPercent: progress.percent, studyCompleted: progress.completedUnits, studyTotal: progress.totalUnits, updatedAt: new Date().toISOString() };
}
