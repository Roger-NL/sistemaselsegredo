"use client";

import Link from "next/link";
import type { WorkspaceState } from "./workspace-store";

export function PracticeAccess({ state, retry }: { state: WorkspaceState; retry: () => Promise<void> }) {
  return <section className="resume" aria-live="polite">
    {state.status === "loading" ? <><h1>Preparando seu espaço.</h1><p role="status">Carregando seu progresso e verificando seu acesso…</p></>
      : state.status === "unauthenticated" ? <><h1>Preparando sua demo.</h1><p>Você pode conversar e estudar sem cadastro. Seu avanço ficará neste navegador.</p><button className="primary" onClick={() => void retry()}>Abrir a demo gratuita</button></>
      : state.status === "error" ? <><h1>Vamos tentar de novo?</h1><p role="alert">{state.error}</p><button className="primary" onClick={() => void retry()}>Tentar novamente</button></>
      : <><h1>Prática indisponível nesta conta.</h1><p>Entre em contato com o professor pelo painel para conferir seu acesso.</p><Link className="primary button-link" href="/dashboard#contato">Falar com o professor</Link></>}
  </section>;
}
