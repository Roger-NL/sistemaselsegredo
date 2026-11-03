"use client";

import { useEffect, useRef, useState } from "react";
import { decodeProgress } from "@/features/theory/progress";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { studentWorkspace } from "./workspace-store";
import { useStudentWorkspace } from "./use-student-workspace";
import "./learning-conflict.css";

export function LearningConflict() {
  const { conflict, error } = useStudentWorkspace();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  useEffect(() => {
    if (conflict && !dialog.current?.open) { dialog.current?.showModal(); heading.current?.focus({ preventScroll: true }); }
    else if (!conflict) dialog.current?.close();
  }, [conflict]);
  if (!conflict) return null;
  const localDemo = decodeSnapshot(conflict.local.demoSnapshot ?? "");
  async function choose(choice: "server" | "local") {
    setBusy(true); setFailure("");
    try { await studentWorkspace.resolveConflict(choice); }
    catch { setFailure("Não foi possível conferir sua conta. Seu percurso desta aba continua preservado. Tente novamente."); }
    finally { setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ demoSnapshot: conflict!.local.demoSnapshot, studySnapshot: conflict!.local.studySnapshot }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "meu-percurso-preservado.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <dialog className="learning-conflict" ref={dialog} aria-labelledby="learning-conflict-title" onCancel={event => event.preventDefault()}>
    <h2 id="learning-conflict-title" ref={heading} tabIndex={-1}>Seu percurso mudou em outra aba.</h2>
    <p>O que você fez aqui foi preservado. Confira antes de continuar. Nenhuma versão será substituída automaticamente.</p>
    {"demoSnapshot" in conflict.local && <p>Conversa desta aba: {localDemo ? `tentativa preservada${localDemo.draft ? ", com resposta em escrita" : ""}` : "recomeço solicitado"}.</p>}
    {localDemo?.draft && <label>Resposta desta aba<textarea readOnly value={localDemo.draft} /></label>}
    {"studySnapshot" in conflict.local && <p>Estudo desta aba: {decodeProgress(conflict.local.studySnapshot ?? null).completed.length} práticas concluídas.</p>}
    {conflict.remote && <p>Salvo na conta: {conflict.remote.studyCompleted} práticas concluídas. A conversa e o estudo salvos estão disponíveis para retomada.</p>}
    <p>Usar o percurso desta aba substitui na conta os trechos que você editou aqui. Retomar a conta encerra a edição desta aba; você pode baixar uma cópia antes de escolher.</p>
    {(error || failure) && <p role="alert">{failure || error}</p>}
    <div className="learning-conflict-actions">
      <button type="button" onClick={download}>Baixar cópia desta aba</button>
      <button type="button" disabled={busy} onClick={() => void choose("server")}>Retomar o percurso da conta</button>
      <button type="button" disabled={busy || !conflict.remote} onClick={() => void choose("local")}>Usar o percurso desta aba</button>
    </div>
    <p role="status">{busy ? "Conferindo e salvando sua escolha…" : "A prática aguarda sua escolha."}</p>
  </dialog>;
}
