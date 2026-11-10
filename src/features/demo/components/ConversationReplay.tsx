"use client";
import { SpeakerLabel } from "./SpeakerLabel";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";
import { AutoFit } from "@/components/core/AutoFit";


import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { replaySlides } from "../model/replay";
import type { DemoState } from "../model/types";
import { AudioButton } from "./AudioButton";
import { SceneFrame } from "./SceneFrame";
import "./conversation-replay.css";

export function ConversationReplay({ state, onClose }: { state: DemoState; onClose: () => void }) {
  const [position, setPosition] = useState(0);
  const [meaning, setMeaning] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const slides = replaySlides(state);
  const index = Math.min(position, slides.length - 1);
  const slide = slides[index];
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [position]);
  function move(next: number) { setPosition(next); setMeaning(false); }
  if (!slide) return <section className="ending"><h1>Não há falas registradas para rever.</h1><button onClick={onClose}>Voltar ao resumo</button></section>;
  return <div className="conversation-replay">
    <header className="replay-bar"><div><strong>Revendo a conversa</strong><span><BrowserText>Parte </BrowserText><BrowserText>{slide.part}</BrowserText> <BrowserText>de 10 · Fala </BrowserText>{<BrowserText>{index + 1}</BrowserText>} <BrowserText>de </BrowserText><BrowserText>{slides.length}</BrowserText></span></div><button onClick={onClose}>Sair da revisão</button></header>
    <SceneFrame activityKey={`replay:${slide.id}`} opening intro={null}
      actions={<nav className="activity-actions replay-pager" aria-label="Percorrer cenas da conversa"><button disabled={index === 0} onClick={() => move(index - 1)}><InterfaceIcon name="arrow-left" /> Anterior</button>{index === slides.length - 1 ? <button className="primary" onClick={onClose}>Voltar ao resumo</button> : <button className="primary" onClick={() => move(index + 1)}>Próxima fala <InterfaceIcon name="arrow-right" /></button>}</nav>}
      artwork={<aside className="scene-column"><figure className="scene-art"><picture><source media="(max-width: 760px)" srcSet={slide.image.mobile} /><Image unoptimized width={960} height={640} src={slide.image.path} alt={slide.image.description} /></picture></figure></aside>}>
      <AutoFit className="activity-body replay-reading"><div className="activity-content">
        <article className="opening-card" data-presentation="dialogue">
          <div className="dialogue-copy">
          <SpeakerLabel role={slide.role} model={slide.role === "you"} />
          <h1 ref={heading} tabIndex={-1} lang="en"><BrowserText>{slide.text}</BrowserText></h1>
          {slide.meaning && <div className="replay-meaning"><button className="text-button" aria-expanded={meaning} onClick={() => setMeaning(!meaning)}>{meaning ? <BrowserText>{"Ocultar significado"}</BrowserText> : <BrowserText>{"Ver significado"}</BrowserText>}</button>{meaning && <p><BrowserText>{slide.meaning}</BrowserText></p>}</div>}
          {slide.written !== undefined && <p className="replay-model-note">Sua resposta está preservada. O áudio é o modelo desta fala.</p>}
          </div>
          <AudioButton key={slide.id} audio={slide.audioId}>{slide.written === undefined ? <BrowserText>{"Ouvir"}</BrowserText> : <BrowserText>{"Ouvir modelo"}</BrowserText>}</AudioButton>
        </article>
      </div></AutoFit>
    </SceneFrame>
  </div>;
}
