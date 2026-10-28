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
          <li><span>01</span><div><h3>Comece agora.</h3><p>A conversa e o estudo são gratuitos. Abra e participe, sem cadastro e sem aprovação.</p></div></li>
          <li><span>02</span><div><h3>Entre na conversa.</h3><p>Conheça Lucas na cafeteria. Escute, escolha e construa suas respostas com três opções de apoio. Sem usar o microfone.</p></div></li>
          <li><span>03</span><div><h3>Veja o que construiu.</h3><p>Revisite suas escolhas e explore o inglês da cafeteria em oito blocos e 24 práticas do estudo guiado.</p></div></li>
        </ol>
        <h3 className="landing-info-support-title">O apoio muda. A conversa continua.</h3>
        <SupportPreview />
        <details className="landing-info-next"><summary>E depois da demo?<Plus size={16} aria-hidden="true" /></summary><p>Concluir 100% do estudo libera o agendamento de uma aula gratuita de 1 hora com professor, uma por conta. No Meu painel, acompanhe seu avanço, o pedido e a confirmação da aula, e fale com o professor. As próximas histórias estão em preparação.</p></details>
        <Link href="/demo" prefetch={false} className="landing-cta">Começar a conversa<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </dialog>
  </>;
}
