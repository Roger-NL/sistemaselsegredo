import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";

/** Practice, theory and the six checked test answers all belong to Aula 1. */
export function completedLesson(raw: string | null): boolean {
  const snapshot = decodeLessonAccountSnapshot(raw);
  if (!snapshot) return false;
  const progress = getLessonDashboardSnapshot(snapshot.progress);
  return progress.completedUnits === 49 && progress.percent === 100;
}
