"use client";

import Image from "next/image";
import { Brand } from "@/components/ui/Brand";
import { ArrowLeft, ArrowRight, BookOpen, Check, Coffee, LockKeyhole, MessageCircle, MicOff, MoveUpRight, Puzzle, Lightbulb, PenLine, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getMotionPreference, getServerPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { presentationFrames, presentationSceneStart, presentationSteps } from "./content";
import "./presentation.css";

type Props = { review?: boolean; busy?: boolean; error?: string; onFinish: () => void };

function Scene({ visual, frame }: { visual: string; frame: number }) {
  if (visual === "welcome") return <div className="presentation-orbit">
    <div className="presentation-orbit-ring" /><div className="presentation-orbit-ring" /><div className="presentation-orbit-ring" />
    {frame === 0 ? <div className="presentation-signal">{[0, 1, 2, 3].map(i => <span key={i} style={{ "--i": i } as React.CSSProperties} />)}</div> : <div className="presentation-start"><span><Coffee size={28} /></span><ArrowRight size={22} /><span><BookOpen size={28} /></span><small>Conversa <span>→</span> Estudo</small></div>}
    <span className="presentation-orbit-spark"><Sparkles size={18} /></span>
  </div>;
  if (visual === "cafe" && frame === 1) return <div className="presentation-support-choice">
    <div className="presentation-support-stack">{[{ label: "Guiado", Icon: Puzzle }, { label: "Com pistas", Icon: Lightbulb }, { label: "Mais autônomo", Icon: PenLine }].map(({ label, Icon }, i) => <div className="presentation-support-card" key={label} style={{ "--i": i } as React.CSSProperties}><span className="presentation-support-icon"><Icon size={24} strokeWidth={1.4} /></span><span>{label}</span><div className="presentation-support-glyph">{[0, 1, 2].map(j => <i key={j} />)}</div></div>)}</div>
    <span className="presentation-support-caption"><MicOff size={15} />Sem microfone. Com o seu apoio.</span>
  </div>;
  if (visual === "cafe") return <div className="presentation-cafe">
    <div className="presentation-photo"><Image src="/demo/cafe/v2/images/V01-960.webp" width={960} height={640} sizes="(max-width: 760px) 90vw, 520px" alt="" /><span>Lucas · A cafeteria</span></div>
    <div className="presentation-floating"><Coffee size={18} /><span>Sua vez na história.</span><MoveUpRight size={17} /></div>
  </div>;
  if (visual === "study") return <div className="presentation-study">
    <div className="presentation-study-number"><strong>{frame === 0 ? "8" : "24"}</strong><span>{frame === 0 ? "blocos" : "práticas"}</span></div>
    <div className="presentation-study-grid">{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ "--i": i } as React.CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span><div>{[0, 1, 2].map(j => <i key={j} data-filled={frame === 1} />)}</div></div>)}</div>
    <span className="presentation-study-caption"><BookOpen size={15} />O inglês da sua conversa</span>
  </div>;
  if (visual === "class") return <div className="presentation-reward">
    <svg className="presentation-reward-ring" viewBox="0 0 300 300"><circle cx="150" cy="150" r="137" /><circle cx="150" cy="150" r="137" /></svg>
    <div className="presentation-reward-core">{frame === 0 ? <><Check size={25} /><strong>100<span>%</span></strong><small>ESTUDO CONCLUÍDO</small></> : <><span className="presentation-reward-star"><Sparkles size={24} /></span><strong>1<span>h</span></strong><small>AULA GRATUITA</small></>}</div>
    <span className="presentation-reward-tag">{frame === 0 ? <><LockKeyhole size={15} />Uma conquista que abre portas</> : <><UserRound size={15} />Você + professor</>}</span>
  </div>;
  return <div className="presentation-panel"><div className="presentation-panel-heading"><span>Meu painel</span><span className="presentation-online" /></div><div className="presentation-panel-greeting">Seu espaço<span>.</span></div><div className="presentation-panel-route">{[{ Icon: Coffee, label: "Conversa" }, { Icon: BookOpen, label: "Estudo" }, { Icon: Sparkles, label: "Aula" }].map(({ Icon, label }, i) => <div key={label} style={{ "--i": i } as React.CSSProperties}><span><Icon size={23} strokeWidth={1.3} /></span><small>{label}</small></div>)}</div><div className="presentation-panel-contact"><MessageCircle size={19} /><span>Fale com o professor</span><ArrowRight size={17} /></div></div>;
}

export function Presentation({ review = false, busy = false, error = "", onFinish }: Props) {
  const reduced = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const [cursor, setCursor] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const frame = presentationFrames[cursor];
  const step = presentationSteps[frame.stepIndex];
  const last = cursor === presentationFrames.length - 1;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [cursor]);

  return <main className="presentation" data-scene={frame.visual} data-reduced-motion={reduced} aria-label={review ? "Rever apresentação do BasedSpeak" : "Apresentação do BasedSpeak"} aria-busy={busy}>
    <header className="presentation-header"><Brand /><button type="button" disabled={busy} onClick={onFinish}>{review ? "Voltar ao painel" : "Pular apresentação"}<ArrowRight size={15} aria-hidden="true" /></button></header>
    <div className="presentation-stage" key={cursor}>
      <div className="presentation-art" aria-hidden="true"><Scene visual={frame.visual} frame={frame.frameIndex} /></div>
      <section className="presentation-copy">
        <p className="presentation-eyebrow">{frame.eyebrow}</p>
        <h1 ref={heading} tabIndex={-1}>{frame.title.split("|").map((line, i) => <span key={line} style={{ "--line": i } as React.CSSProperties}>{line}</span>)}</h1>
        <p className="presentation-description">{frame.description}</p>
      </section>
    </div>
    <footer className="presentation-footer">
      <div className="presentation-progress"><p aria-live="polite" aria-atomic="true">{String(frame.stepIndex + 1).padStart(2, "0")} / 05 <span>{step.label}</span><span className="presentation-frame-count">{frame.frameIndex + 1}/{step.frames.length}</span></p><nav aria-label="Etapas da apresentação">{presentationSteps.map((item, i) => <button key={item.label} type="button" aria-label={`Etapa ${i + 1}: ${item.label}`} aria-current={frame.stepIndex === i ? "step" : undefined} disabled={busy} onClick={() => setCursor(presentationSceneStart(i))}><span /></button>)}</nav></div>
      <div className="presentation-actions"><button type="button" className="presentation-back" aria-label="Voltar" disabled={cursor === 0 || busy} onClick={() => setCursor(cursor - 1)}><ArrowLeft size={17} aria-hidden="true" /><span>Voltar</span></button><button type="button" className="presentation-next" disabled={busy} onClick={() => last ? onFinish() : setCursor(cursor + 1)}>{busy ? "Salvando…" : last ? review ? "Voltar ao painel" : "Abrir meu painel" : "Continuar"}<ArrowRight size={17} aria-hidden="true" /></button></div>
      {error && <p className="presentation-error" role="alert">{error}</p>}
    </footer>
  </main>;
}
