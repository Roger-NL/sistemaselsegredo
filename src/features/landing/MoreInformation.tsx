"use client";

import Link from "next/link";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { useRef } from "react";
import { SupportPreview } from "./SupportPreview";

export function MoreInformation() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="landing-more" type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Como é a aula<Plus size={16} aria-hidden="true" /></button>
    <dialog ref={dialog} className="landing-info" aria-labelledby="landing-info-title" onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
    }}>
      <div className="landing-info-content">
        <header className="landing-info-header"><span>POR DENTRO DA AULA</span><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Fechar informações"><X size={21} aria-hidden="true" /></button></header>
        <h2 id="landing-info-title">Primeiros encontros</h2>
        <p className="landing-info-lead">Aprenda a dizer seu nome em inglês e a falar de quem está com você. A primeira aula é gratuita e você pode começar sem cadastro.</p>
        <ol className="landing-info-steps">
          <li><span aria-hidden="true">01</span><div><h3>Apresentação e guia</h3><p>Ouça Ana se apresentar. Em “Como funciona”, Nina explica em português como arrastar um balão, juntar as palavras e conferir o que você escreveu.</p></div></li>
          <li><span aria-hidden="true">02</span><div><h3>Aula prática</h3><p>Ana e Leo formam uma equipe. Quem pode dizer “nós”? E quem diria “eles”? Em cada cena, você observa quem está falando e escolhe a frase que faz sentido.</p></div></li>
          <li><span aria-hidden="true">03</span><div><h3>Teoria, teste e conclusão</h3><p>Depois da prática, veja por que a frase muda. No teste, escolha e escreva respostas para novas situações. Na conclusão, você pode ouvir as falas de novo.</p></div></li>
        </ol>
        <h3 className="landing-info-support-title">Exemplos da aula</h3>
        <SupportPreview />
        <details className="landing-info-next">
          <summary>Como peço a aula ao vivo?<Plus size={16} aria-hidden="true" /></summary>
          <p>No seu painel, você acompanha o progresso salvo na conta. Depois de concluir a aula e o teste, veja se a agenda está liberada. Você pode solicitar um horário disponível e aguardar a confirmação do professor. É uma aula gratuita de uma hora por conta.</p>
        </details>
        <Link href="/demo" prefetch={false} className="landing-cta">Começar a aula gratuita<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </dialog>
  </>;
}
