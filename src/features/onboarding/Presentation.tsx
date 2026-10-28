"use client";

import Image from "next/image";
import { Brand } from "@/components/ui/Brand";
import { ArrowLeft, ArrowRight, BookOpen, Check, Coffee, MessageCircle, MicOff, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getMotionPreference, getServerPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { presentationSteps } from "./content";
import "./presentation.css";

type Props = { review?: boolean; busy?: boolean; error?: string; onFinish: () => void };

export function Presentation({ review = false, busy = false, error = "", onFinish }: Props) {
  const reduced = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = presentationSteps[index];
  const last = index === presentationSteps.length - 1;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [index]);

  return <main className="presentation" data-reduced-motion={reduced} aria-label={review ? "Rever apresentação do BasedSpeak" : "Apresentação do BasedSpeak"} aria-busy={busy}>
    <header className="presentation-header"><Brand /><button type="button" disabled={busy} onClick={onFinish}>{review ? "Voltar ao painel" : "Pular apresentação"}<ArrowRight size={16} aria-hidden="true" /></button></header>
    <div className="presentation-layout">
      <div className="presentation-visual" data-scene={step.visual} aria-hidden="true">
        {step.visual === "cafe" ? <><Image src="/demo/cafe/v2/images/V01-960.webp" width={960} height={640} sizes="(max-width: 760px) 100vw, 50vw" alt="" /><span className="presentation-visual-caption"><MicOff size={16} />Sem microfone. No seu ritmo.</span></> : step.visual === "welcome" ? <div className="presentation-welcome"><Sparkles size={34} strokeWidth={1} /><span>Let’s<br /><i>begin.</i></span><small>Um encontro de cada vez.</small></div> : step.visual === "study" ? <div className="presentation-study"><BookOpen size={32} strokeWidth={1.2} /><strong>8 <span>blocos</span></strong><div>{Array.from({ length: 24 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 18}ms` }} />)}</div><small>24 práticas · O inglês da cafeteria</small></div> : step.visual === "class" ? <div className="presentation-class"><span>ESTUDO CONCLUÍDO</span><div><Check size={22} /><strong>100%</strong></div><p>Uma aula gratuita.<br /><b>1 hora com professor.</b></p></div> : <div className="presentation-map"><span>MEU PAINEL</span>{[[Coffee, "Minha conversa"], [BookOpen, "Meu estudo"], [Sparkles, "Minha aula ao vivo"], [MessageCircle, "Professor"]].map(([Icon, label]) => { const Symbol = Icon as typeof Coffee; return <div key={String(label)}><Symbol size={20} strokeWidth={1.4} /><span>{String(label)}</span><ArrowRight size={15} /></div>; })}</div>}
      </div>
      <section className="presentation-copy" key={index}>
        <p className="presentation-eyebrow">{step.eyebrow}</p>
        <h1 ref={heading} tabIndex={-1}>{step.title}</h1>
        <p className="presentation-description">{step.description}</p>
        <p className="presentation-note">{step.note}</p>
      </section>
    </div>
    <footer className="presentation-footer">
      <div className="presentation-progress"><p aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, "0")} / 05 <span>{step.label}</span></p><nav aria-label="Etapas da apresentação">{presentationSteps.map((item, i) => <button key={item.label} type="button" aria-label={`Etapa ${i + 1}: ${item.label}`} aria-current={index === i ? "step" : undefined} disabled={busy} onClick={() => setIndex(i)}><span /></button>)}</nav></div>
      <div className="presentation-actions"><button type="button" className="presentation-back" disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}><ArrowLeft size={17} aria-hidden="true" />Voltar</button><button type="button" className="presentation-next" disabled={busy} onClick={() => last ? onFinish() : setIndex(index + 1)}>{busy ? "Salvando…" : last ? review ? "Voltar ao painel" : "Conhecer meu painel" : "Continuar"}<ArrowRight size={17} aria-hidden="true" /></button></div>
      {error && <p className="presentation-error" role="alert">{error}</p>}
    </footer>
  </main>;
}
