"use client";
import { Check, Clock3, MessageCircle } from "lucide-react";
import type { WorkspaceState } from "./workspace-store";

/** Make the first visit and the approval handoff understandable without an extra signup step. */
export function StudentAccess({ state, refresh }: { state: WorkspaceState; refresh: () => Promise<void> }) {
  const workspace = state.workspace;
  if (!workspace) return null;
  const { account, learning } = workspace;
  const pending = account.status === "pending";
  if (account.status === "suspended" || account.status === "rejected") return <div className="student-status" role="status"><strong>Seu acesso à prática está indisponível.</strong><p>Fale com o professor para conferir sua conta.</p><a href="#contato">Falar com o professor</a></div>;
  if (!pending && (account.role === "manager" || learning.demoSnapshot || learning.studyCompleted > 0 || workspace.liveClass)) return null;
  return <section className="student-access-guide" aria-labelledby="student-access-title">
    <header><p className="dashboard-overline">Seu primeiro acesso</p><h2 id="student-access-title">{pending ? "Sua conta está aguardando aprovação." : "Tudo pronto para começar."}</h2><p>{pending ? "Seu cadastro chegou ao professor. Assim que ele aprovar, a conversa e o estudo serão liberados aqui, sem precisar criar outra conta." : "Seu acesso à demo está liberado. Comece pela conversa da cafeteria e escolha o apoio que prefere. Depois, explore o estudo guiado."}</p></header>
    <ol aria-label="Etapas do primeiro acesso">
      <li data-step="done"><Check size={18} aria-hidden="true" /><div><strong>Conta criada</strong><span>Seu painel já está disponível.</span></div></li>
      <li data-step={pending ? "current" : "done"}>{pending ? <Clock3 size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}<div><strong>Aprovação do professor</strong><span>{pending ? "Aguardando liberação." : "Acesso liberado."}</span></div></li>
      <li data-step={pending ? "locked" : "current"}><MessageCircle size={18} aria-hidden="true" /><div><strong>Primeira conversa</strong><span>{pending ? "Disponível após a aprovação." : "Use “Começar” logo abaixo."}</span></div></li>
    </ol>
    {pending && <footer><p>O painel confere a aprovação automaticamente enquanto estiver aberto. Não é preciso sair e entrar de novo.</p><div><button type="button" className="dashboard-primary" disabled={state.status !== "ready" || state.saving} onClick={() => void refresh()}>Conferir aprovação</button><a href="#contato">Falar com o professor</a></div></footer>}
  </section>;
}
