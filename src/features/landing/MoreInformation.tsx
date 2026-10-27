"use client";

import Link from "next/link";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { useRef } from "react";
import { SupportPreview } from "./SupportPreview";

export function MoreInformation() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="landing-more" type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Dê uma espiada<Plus size={16} aria-hidden="true" /></button>
    <dialog ref={dialog} className="landing-info" aria-labelledby="landing-info-title" onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
    }}>
      <div className="landing-info-content">
        <header className="landing-info-header"><span>POR DENTRO DO BASEDSPEAK</span><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Fechar informações"><X size={21} aria-hidden="true" /></button></header>
        <h2 id="landing-info-title">Você entende<br />fazendo.</h2>
        <p className="landing-info-lead">Uma história para viver o inglês, com apoio para participar.</p>
        <ol className="landing-info-steps">
          <li><span>01</span><div><h3>Crie sua conta.</h3><p>Com e-mail e senha. A demo é gratuita e não pede cartão.</p></div></li>
          <li><span>02</span><div><h3>Entre na conversa.</h3><p>Escute, escolha e construa suas respostas. Sem usar o microfone.</p></div></li>
          <li><span>03</span><div><h3>Veja o que construiu.</h3><p>No final, revisite a conversa e as escolhas que você fez.</p></div></li>
        </ol>
        <h3 className="landing-info-support-title">O apoio muda. A conversa continua.</h3>
        <SupportPreview />
        <details className="landing-info-next"><summary>E depois da demo?<Plus size={16} aria-hidden="true" /></summary><p>A proposta do curso é aprofundar o inglês dessa história e seguir para novas conversas. Essa próxima etapa ainda está em preparação.</p></details>
        <Link href="/comecar" prefetch={false} className="landing-cta">Criar conta e experimentar<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </dialog>
  </>;
}
