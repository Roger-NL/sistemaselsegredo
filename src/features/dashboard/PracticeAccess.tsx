"use client";

import Link from "next/link";
import type { WorkspaceState } from "./workspace-store";

export function PracticeAccess({ state, retry }: { state: WorkspaceState; retry: () => Promise<void> }) {
  return <section className="resume" aria-live="polite">
    {state.status === "loading" ? <><h1>Preparando seu espaço.</h1><p role="status">Carregando seu progresso e verificando seu acesso…</p></>
      : state.status === "unauthenticated" ? <><h1>Entre para continuar.</h1><p>Seu progresso fica associado à sua conta.</p><Link className="primary button-link" href="/comecar?modo=entrar">Entrar na minha conta</Link></>
      : state.status === "error" ? <><h1>Vamos tentar de novo?</h1><p role="alert">{state.error}</p><button className="primary" onClick={() => void retry()}>Tentar novamente</button></>
      : <><h1>{state.workspace?.account.status === "pending" ? "Aguardando aprovação." : "Prática indisponível."}</h1><p>{state.workspace?.account.status === "pending" ? "Seu cadastro já chegou ao professor. A prática será liberada após a aprovação, sem precisar entrar de novo. Esta página confere a liberação automaticamente." : "Entre em contato com o professor pelo painel para conferir seu acesso."}</p>{state.workspace?.account.status === "pending" && <button type="button" className="primary" onClick={() => void retry()}>Conferir aprovação</button>}<Link className="primary button-link" href="/dashboard#contato">Falar com o professor</Link></>}
  </section>;
}
