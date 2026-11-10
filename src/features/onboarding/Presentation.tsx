"use client";
import { SoundMenu } from "@/components/interaction/InteractionSounds";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";
import { useVisibleHeight } from "@/components/core/use-visible-height";


import Image from "next/image";
import { TestControls } from "@/features/superuser/TestControls";
import { Brand } from "@/components/ui/Brand";
import { ArrowLeft, ArrowRight, BookOpen, Check, Coffee, LockKeyhole, MessageCircle, MicOff, MoveUpRight, Puzzle, Lightbulb, PenLine, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getMotionPreference, getServerPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { canVisitPresentationScene, presentationFrames, presentationSceneStart, presentationSteps } from "./content";
import { usePresentationFit } from "./use-presentation-fit";
import "./presentation.css";

type Props = { review?: boolean; busy?: boolean; error?: string; onFinish: () => void };

function Scene({ visual, frame }: { visual: string; frame: number }) {
  if (visual === "welcome") return <div className="presentation-orbit">
    <div className="presentation-orbit-ring" /><div className="presentation-orbit-ring" /><div className="presentation-orbit-ring" />
    {frame === 0 ? <div className="presentation-signal">{[0, 1, 2, 3].map(i => <span key={i} style={{ "--i": i } as React.CSSProperties} />)}</div> : <div className="presentation-start"><span><Coffee size={28} /></span><ArrowRight size={22} /><span><BookOpen size={28} /></span><small>Conversa <span><InterfaceIcon name="arrow-right" /></span> Estudo</small></div>}
    <span className="presentation-orbit-spark"><Sparkles size={18} /></span>
  </div>;
  if (visual === "cafe" && frame === 1) return <div className="presentation-support-choice">
    <div className="presentation-support-stack">{[{ label: "Guiado", Icon: Puzzle }, { label: "Com pistas", Icon: Lightbulb }, { label: "Mais autônomo", Icon: PenLine }].map(({ label, Icon }, i) => <div className="presentation-support-card" key={label} style={{ "--i": i } as React.CSSProperties}><span className="presentation-support-icon"><Icon size={24} strokeWidth={1.4} /></span><span><BrowserText>{label}</BrowserText></span><div className="presentation-support-glyph">{[0, 1, 2].map(j => <i key={j} />)}</div></div>)}</div>
    <span className="presentation-support-caption"><MicOff size={15} />Sem microfone. Com o seu apoio.</span>
  </div>;
  if (visual === "cafe") return <div className="presentation-cafe">
    <div className="presentation-photo"><Image src="/demo/cafe/v2/images/V01-960.webp" width={960} height={640} sizes="(max-width: 760px) 90vw, 520px" alt="" /><span>Lucas · A cafeteria</span></div>
    <div className="presentation-floating"><Coffee size={18} /><span>Sua vez na história.</span><MoveUpRight size={17} /></div>
  </div>;
  if (visual === "study") return <div className="presentation-study">
    <div className="presentation-study-number"><strong>{frame === 0 ? <BrowserText>{"8"}</BrowserText> : <BrowserText>{"24"}</BrowserText>}</strong><span>{frame === 0 ? <BrowserText>{"blocos"}</BrowserText> : <BrowserText>{"etapas"}</BrowserText>}</span></div>
    <div className="presentation-study-grid">{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ "--i": i } as React.CSSProperties}><span><BrowserText>{String(i + 1).padStart(2, "0")}</BrowserText></span><div>{[0, 1, 2].map(j => <i key={j} data-filled={frame === 1} />)}</div></div>)}</div>
    <span className="presentation-study-caption"><BookOpen size={15} />O inglês da sua conversa</span>
  </div>;
  if (visual === "class") return <div className="presentation-reward">
    <svg className="presentation-reward-ring" viewBox="0 0 300 300"><circle cx="150" cy="150" r="137" /><circle cx="150" cy="150" r="137" /></svg>
    <div className="presentation-reward-core">{frame === 0 ? <><Check size={25} /><strong>100<span>%</span></strong><small>ESTUDO CONCLUÍDO</small></> : <><span className="presentation-reward-star"><Sparkles size={24} /></span><strong>1<span>h</span></strong><small>AULA GRATUITA</small></>}</div>
    <span className="presentation-reward-tag">{frame === 0 ? <><LockKeyhole size={15} /><BrowserText>Uma conquista que abre portas</BrowserText></> : <><UserRound size={15} /><BrowserText>Você + professor</BrowserText></>}</span>
  </div>;
  return <div className="presentation-panel"><div className="presentation-panel-heading"><span>Meu painel</span><span className="presentation-online" /></div><div className="presentation-panel-greeting">Seu espaço<span>.</span></div><div className="presentation-panel-route">{[{ Icon: Coffee, label: "Conversa" }, { Icon: BookOpen, label: "Estudo" }, { Icon: Sparkles, label: "Aula" }].map(({ Icon, label }, i) => <div key={label} style={{ "--i": i } as React.CSSProperties}><span><Icon size={23} strokeWidth={1.3} /></span><small><BrowserText>{label}</BrowserText></small></div>)}</div><div className="presentation-panel-contact"><MessageCircle size={19} /><span>Fale com o professor</span><ArrowRight size={17} /></div></div>;
}

export function Presentation({ review = false, busy = false, error = "", onFinish }: Props) {
  const reduced = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const [cursor, setCursor] = useState(0);
  const [furthestFrame, setFurthestFrame] = useState(0);
  const root = useRef<HTMLElement>(null);
  const stageArea = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useVisibleHeight(root, "--presentation-height");
  usePresentationFit(stageArea, stage, cursor);
  const frame = presentationFrames[cursor];
  const step = presentationSteps[frame.stepIndex];
  const last = cursor === presentationFrames.length - 1;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [cursor]);

  function moveTo(next: number) {
    setCursor(next);
    setFurthestFrame(previous => Math.max(previous, next));
  }

  return <main ref={root} className="presentation" data-scene={frame.visual} data-reduced-motion={reduced} aria-label={review ? "Rever apresentação do BasedSpeak" : "Apresentação do BasedSpeak"} aria-busy={busy}>
    <header className="presentation-header"><Brand href="/dashboard" /><div className="presentation-header-actions"><TestControls />{review && <button type="button" disabled={busy} onClick={onFinish}>Voltar ao painel<ArrowRight size={15} aria-hidden="true" /></button>}<SoundMenu /></div></header>
    <div ref={stageArea} className="presentation-stage-area"><div className="presentation-stage-fit">
    <div ref={stage} className="presentation-stage" key={cursor}>
      <div className="presentation-art" aria-hidden="true"><Scene visual={frame.visual} frame={frame.frameIndex} /></div>
      <section className="presentation-copy">
        <p className="presentation-eyebrow"><BrowserText>{frame.eyebrow}</BrowserText></p>
        <h1 ref={heading} tabIndex={-1}>{frame.title.split("|").map((line, i) => <span key={line} style={{ "--line": i } as React.CSSProperties}><BrowserText>{line}</BrowserText></span>)}</h1>
        <p className="presentation-description"><BrowserText>{frame.description}</BrowserText></p>
      </section>
    </div>
    </div></div>
    <footer className="presentation-footer">
      <div className="presentation-progress"><p aria-live="polite" aria-atomic="true"><BrowserText>{String(frame.stepIndex + 1).padStart(2, "0")}</BrowserText> <BrowserText>/ 05 </BrowserText><span><BrowserText>{step.label}</BrowserText></span><span className="presentation-frame-count">{<BrowserText>{frame.frameIndex + 1}</BrowserText>}<BrowserText>/</BrowserText><BrowserText>{step.frames.length}</BrowserText></span></p><nav aria-label="Etapas da apresentação">{presentationSteps.map((item, i) => <button key={item.label} type="button" aria-label={`Etapa ${i + 1}: ${item.label}`} aria-current={frame.stepIndex === i ? "step" : undefined} data-ui-sound={cursor === presentationSceneStart(i) ? "none" : presentationFrames[presentationSceneStart(i)].sound} disabled={busy || !canVisitPresentationScene(i, furthestFrame, review)} onClick={() => moveTo(presentationSceneStart(i))}><span /></button>)}</nav></div>
      <div className="presentation-actions"><button type="button" className="presentation-back" data-ui-sound={presentationFrames[Math.max(0, cursor - 1)].sound} aria-label="Voltar" disabled={cursor === 0 || busy} onClick={() => moveTo(cursor - 1)}><ArrowLeft size={17} aria-hidden="true" /><span>Voltar</span></button><button type="button" className="presentation-next" data-ui-sound={last ? "advance" : presentationFrames[cursor + 1].sound} disabled={busy} onClick={() => last ? onFinish() : moveTo(cursor + 1)}>{busy ? <BrowserText>{"Salvando…"}</BrowserText> : last ? review ? <BrowserText>{"Voltar ao painel"}</BrowserText> : <BrowserText>{"Abrir meu painel"}</BrowserText> : <BrowserText>{"Continuar"}</BrowserText>}<ArrowRight size={17} aria-hidden="true" /></button></div>
      {error && <p className="presentation-error" role="alert"><BrowserText>{error}</BrowserText></p>}
    </footer>
  </main>;
}
