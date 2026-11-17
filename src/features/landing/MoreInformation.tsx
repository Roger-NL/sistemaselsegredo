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
        <p className="landing-info-lead">Sua primeira aula de inglês, com apoio para participar.</p>
        <ol className="landing-info-steps">
          <li><span>01</span><div><h3>Conheça e experimente.</h3><p>Uma apresentação e um guia mostram o que aprender e como usar os controles. A aula é gratuita, sem cadastro.</p></div></li>
          <li><span>02</span><div><h3>Aprenda nas cenas.</h3><p>Conheça Ana, Leo, Maya, Sam e Nina. Escute, clique, arraste as falas e monte suas respostas em seis atividades. Sem usar o microfone.</p></div></li>
          <li><span>03</span><div><h3>Entenda e use.</h3><p>Depois da prática, leia cinco explicações e responda a seis perguntas. Aprenda a usar I am, you are, we are e they are.</p></div></li>
        </ol>
        <h3 className="landing-info-support-title">Escolha, monte e escreva.</h3>
        <SupportPreview />
        <details className="landing-info-next"><summary>E depois da aula?<Plus size={16} aria-hidden="true" /></summary><p>Concluir o percurso e o teste libera o agendamento de uma aula gratuita de 1 hora com professor, uma por conta. No Meu painel, acompanhe seu avanço, o pedido e a confirmação da aula, e fale com o professor.</p></details>
        <Link href="/demo" prefetch={false} className="landing-cta">Começar a aula<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </dialog>
  </>;
}
