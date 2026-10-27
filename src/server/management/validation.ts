import { RequestPayloadError, assertOnlyKeys, isRecord } from "@/server/http/request";
import { textField } from "@/server/workspace/validation";
import type { AdminAction, UserDraft } from "@/contracts/management";

export function normalizeDraft(value: unknown): UserDraft {
  if (!isRecord(value)) throw new RequestPayloadError("Informe os dados da conta.");
  assertOnlyKeys(value, ["name", "email", "role", "notes"]);
  const name = textField(value.name, "Nome", 120, 2);
  const email = textField(value.email, "E-mail", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestPayloadError("Informe um e-mail válido.");
  if (value.role !== "student" && value.role !== "manager") throw new RequestPayloadError("Selecione um perfil válido.");
  const notes = textField(value.notes ?? "", "Observações", 1000, 0);
  return { name, email, role: value.role, notes };
}
export function parseAdminAction(body: Record<string, unknown>): AdminAction {
  if (body.type === "create" || body.type === "edit") {
    assertOnlyKeys(body, body.type === "create" ? ["type", "draft"] : ["type", "draft", "userId"]);
    const draft = normalizeDraft(body.draft);
    if (body.type === "create") return { type: "create", draft };
    return { type: "edit", draft, userId: userId(body.userId) };
  }
  assertOnlyKeys(body, ["type", "userId", "reason"]);
  if (!["approve", "reject", "suspend", "activate", "reset-login", "reset-progress"].includes(String(body.type))) throw new RequestPayloadError("Operação inválida.");
  return { type: body.type as "approve" | "reject" | "suspend" | "activate" | "reset-login" | "reset-progress", userId: userId(body.userId), reason: body.reason === undefined ? undefined : textField(body.reason, "Motivo", 1000, 0) };
}
export function userId(value: unknown) {
  if (typeof value !== "string" || !/^[^/\s]{1,128}$/.test(value)) throw new RequestPayloadError("Usuário inválido.");
  return value;
}
