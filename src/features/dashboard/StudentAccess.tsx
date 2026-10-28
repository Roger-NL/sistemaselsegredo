"use client";
import { CalendarDays, Check, MessageCircle } from "lucide-react";
import type { WorkspaceState } from "./workspace-store";

/** Make the first visit and the approval handoff understandable without an extra signup step. */
export function StudentAccess({ state }: { state: WorkspaceState; refresh: () => Promise<void> }) {
  const workspace = state.workspace;
  if (!workspace) return null;
  const { account, learning } = workspace;
  if (account.status === "suspended" || account.status === "rejected") return <div className="student-status" role="status"><strong>Seu acesso à prática está indisponível.</strong><p>Fale com o professor para conferir sua conta.</p><a href="#contato">Falar com o professor</a></div>;
  if (account.role === "manager" || learning.demoSnapshot || learning.studyCompleted > 0 || workspace.liveClass) return null;
  return <section className="student-access-guide" aria-labelledby="student-access-title">
    <header><p className="dashboard-overline">Seu primeiro acesso</p><h2 id="student-access-title">Tudo pronto para começar.</h2><p>A demo é livre: você já pode conversar e estudar, sem esperar aprovação. Na sua conta, o avanço fica salvo para continuar em outros dispositivos.</p></header>
    <ol aria-label="Etapas do primeiro acesso">
      <li data-step="done"><Check size={18} aria-hidden="true" /><div><strong>Conta criada</strong><span>Seu painel já está disponível.</span></div></li>
      <li data-step="current"><MessageCircle size={18} aria-hidden="true" /><div><strong>Conversa e estudo</strong><span>Use “Começar” logo abaixo.</span></div></li>
      <li data-step="next"><CalendarDays size={18} aria-hidden="true" /><div><strong>Aula gratuita</strong><span>Libera ao concluir 100% do estudo guiado.</span></div></li>
    </ol>
  </section>;
}
