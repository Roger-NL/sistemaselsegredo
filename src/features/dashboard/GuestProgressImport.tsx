"use client";
import { BrowserText } from "@/components/i18n/BrowserText";

import { useState } from "react";
import { canImportGuestLearning, hasGuestLearning } from "./guest-learning";
import { studentWorkspace, type WorkspaceState } from "./workspace-store";
import "./guest-progress.css";

/** Associating a public browser journey with an account is a deliberate, visible choice. */
export function GuestProgressImport({ state }: { state: WorkspaceState }) {
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const [confirmingUid, setConfirmingUid] = useState<string | null>(null);
  const workspace = state.workspace;
  if (dismissed || state.status !== "ready" || !workspace || !["active", "pending"].includes(workspace.account.status) || !hasGuestLearning(state.guestLearning)) return null;
  const empty = canImportGuestLearning(workspace.learning, workspace.liveClass);
  const confirming = confirmingUid === workspace.account.id;
  async function save() {
    if (!confirming) return;
    setError("");
    try { await studentWorkspace.importGuestProgress(state.generation); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o percurso. Tente novamente."); }
  }
  return <aside className="guest-progress-import" aria-label="Continuar o percurso deste navegador">
    <div><strong>{empty ? <BrowserText>{"Seu percurso pode continuar nesta conta."}</BrowserText> : <BrowserText>{"Seu percurso desta conta está preservado."}</BrowserText>}</strong><p>{empty ? <BrowserText>{`Há um avanço salvo neste navegador. Você pode associá-lo à conta ${workspace.account.email || workspace.account.name} e continuar do mesmo ponto.`}</BrowserText> : <BrowserText>{"Esta conta já tem um avanço próprio. O percurso feito sem entrar continua separado neste navegador e não substituirá seu estudo."}</BrowserText>}</p>{confirming && <p role="status">Confirme que este percurso é seu e que esta é a conta correta. Nenhum percurso existente será substituído.</p>}{error && <p role="alert"><BrowserText>{error}</BrowserText></p>}</div>
    <div>{empty && <button type="button" disabled={state.saving} onClick={() => confirming ? void save() : setConfirmingUid(workspace.account.id)}>{state.saving ? <BrowserText>{"Salvando percurso…"}</BrowserText> : confirming ? <BrowserText>{"Confirmar e salvar"}</BrowserText> : <BrowserText>{"Salvar este percurso na minha conta"}</BrowserText>}</button>}<button type="button" disabled={state.saving} onClick={() => confirming ? setConfirmingUid(null) : setDismissed(true)}>{confirming ? <BrowserText>{"Voltar"}</BrowserText> : empty ? <BrowserText>{"Agora não"}</BrowserText> : <BrowserText>{"Entendi"}</BrowserText>}</button></div>
  </aside>;
}
