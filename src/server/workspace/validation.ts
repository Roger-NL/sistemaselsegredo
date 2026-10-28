import type { AccountStatus, LearningProgress, TeacherConversation } from "@/contracts/workspace";
import { RequestPayloadError } from "@/server/http/request";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { catalog } from "@/features/demo/content/catalog";
import { decodeProgress, studySteps } from "@/features/theory/progress";

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
  return {
    revision: Number.isSafeInteger(data.revision) && Number(data.revision) >= 0 ? Number(data.revision) : 0,
    demoSnapshot: typeof data.demoSnapshot === "string" ? data.demoSnapshot : null,
    studySnapshot: typeof data.studySnapshot === "string" ? data.studySnapshot : null,
    demoPercent: typeof data.demoPercent === "number" && Number.isFinite(data.demoPercent) ? Math.max(0, Math.min(100, data.demoPercent)) : 0,
    studyCompleted: typeof data.studyCompleted === "number" ? Math.max(0, Math.min(studySteps.length, data.studyCompleted)) : 0,
    studyTotal: studySteps.length,
    updatedAt: iso(data.updatedAt),
  };
}
export function parseDemoSnapshot(value: unknown) {
  if (value === null) return { demoSnapshot: null, demoPercent: 0 };
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > 750_000) throw new RequestPayloadError("Progresso da conversa inválido ou muito grande.");
  const state = decodeSnapshot(value);
  if (!state) throw new RequestPayloadError("Não foi possível validar o progresso da conversa.");
  // Progress records activities actually reached through a replayable journal.
  // Test-forward navigation never counts as completed learning.
  const responses = Object.values(catalog).filter(node => node.kind === "response" || node.kind === "comprehension");
  const evidenced = new Set([...state.evidence.map(item => item.nodeId), ...state.checked]);
  const count = responses.filter(node => evidenced.has(node.id)).length;
  return { demoSnapshot: value, demoPercent: responses.length ? Math.round(count / responses.length * 100) : 0 };
}
export function parseStudySnapshot(value: unknown) {
  if (value === null) return { studySnapshot: null, studyCompleted: 0 };
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > 50_000) throw new RequestPayloadError("Progresso de estudo inválido.");
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(value); } catch { throw new RequestPayloadError("Progresso de estudo inválido."); }
  if (!raw || raw.version !== 1 || !Number.isInteger(raw.position) || !Array.isArray(raw.completed) || !Array.isArray(raw.supported)) throw new RequestPayloadError("Progresso de estudo inválido.");
  const progress = decodeProgress(value);
  if (progress.completed.length !== raw.completed.length || progress.supported.length !== raw.supported.length) throw new RequestPayloadError("O estudo contém atividades desconhecidas ou repetidas.");
  return { studySnapshot: JSON.stringify(progress), studyCompleted: progress.completed.length };
}
export function conversationFromData(id: string, data: Record<string, unknown>): TeacherConversation {
  return { id, userId: String(data.userId), userName: String(data.userName || ""), userEmail: String(data.userEmail || ""), subject: String(data.subject || ""), status: data.status === "closed" || data.status === "answered" ? data.status : "open", createdAt: iso(data.createdAt) || "", updatedAt: iso(data.updatedAt) || "", messages: Array.isArray(data.messages) ? data.messages : [] };
}

/** Same saved-practice check for both booking eligibility and management. */
export function savedStudyCompleted(data: Record<string, unknown> = {}): number {
  try { return parseStudySnapshot(data.studySnapshot ?? null).studyCompleted; } catch { return 0; }
}
