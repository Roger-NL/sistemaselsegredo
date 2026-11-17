import type { AccountStatus, LearningProgress, TeacherConversation } from "@/contracts/workspace";
import { RequestPayloadError } from "@/server/http/request";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";

export const LESSON_ACCOUNT_TOTAL = 49;
export function savedLessonProgress(data: Record<string, unknown> = {}) {
  const snapshot = decodeLessonAccountSnapshot(typeof data.lessonSnapshot === "string" ? data.lessonSnapshot : null);
  return getLessonDashboardSnapshot(snapshot?.progress);
}

export function textField(value: unknown, label: string, max: number, min = 1) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
    throw new RequestPayloadError(`${label}: informe entre ${min} e ${max} caracteres.`);
  }
  return value.trim();
}
export function accountStatus(value: unknown): AccountStatus {
  return value === "pending" || value === "rejected" || value === "suspended" ? value : "active";
}
export function iso(value: unknown): string | null {
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return iso(value.toDate().toISOString());
  return null;
}
export function learningFromData(data: Record<string, unknown> = {}): LearningProgress {
  const lesson = decodeLessonAccountSnapshot(typeof data.lessonSnapshot === "string" ? data.lessonSnapshot : null);
  const progress = getLessonDashboardSnapshot(lesson?.progress);
  return {
    ...(typeof data.testMode === "boolean" ? { testMode: data.testMode } : {}),
    saveVersion: Number.isSafeInteger(data.saveVersion) && Number(data.saveVersion) >= 0 ? Number(data.saveVersion) : 0,
    revision: Number.isSafeInteger(data.revision) && Number(data.revision) >= 0 ? Number(data.revision) : 0,
    demoSnapshot: typeof data.demoSnapshot === "string" ? data.demoSnapshot : null,
    studySnapshot: typeof data.studySnapshot === "string" ? data.studySnapshot : null,
    lessonSnapshot: lesson ? JSON.stringify(lesson) : null,
    demoPercent: progress.percent,
    studyCompleted: progress.completedUnits,
    studyTotal: LESSON_ACCOUNT_TOTAL,
    updatedAt: iso(data.updatedAt),
  };
}
export function parseLessonSnapshot(value: unknown) {
  if (value === null) return { lessonSnapshot: null };
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > 100_000) throw new RequestPayloadError("Progresso da aula inválido ou muito grande.");
  const snapshot = decodeLessonAccountSnapshot(value);
  if (!snapshot) throw new RequestPayloadError("Não foi possível validar o progresso da Aula 1.");
  return { lessonSnapshot: JSON.stringify(snapshot) };
}
/** Retired write fields are accepted only when explicitly cleared. Historical
 * values remain stored/readable, but their engines never join this curriculum. */
export function parseDemoSnapshot(value: unknown) {
  if (value === null) return { demoSnapshot: null, demoPercent: 0 };
  throw new RequestPayloadError("A conversa antiga foi substituída. Salve o progresso da Aula 1.");
}
export function parseStudySnapshot(value: unknown) {
  if (value === null) return { studySnapshot: null, studyCompleted: 0 };
  throw new RequestPayloadError("O estudo antigo foi substituído. Salve o progresso da Aula 1.");
}
export function conversationFromData(id: string, data: Record<string, unknown>): TeacherConversation {
  return { id, userId: String(data.userId), userName: String(data.userName || ""), userEmail: String(data.userEmail || ""), subject: String(data.subject || ""), status: data.status === "closed" || data.status === "answered" ? data.status : "open", createdAt: iso(data.createdAt) || "", updatedAt: iso(data.updatedAt) || "", messages: Array.isArray(data.messages) ? data.messages : [] };
}

/** Same saved-practice check for both booking eligibility and management. */
export function savedStudyCompleted(data: Record<string, unknown> = {}): number {
  return savedLessonProgress(data).completedUnits;
}
