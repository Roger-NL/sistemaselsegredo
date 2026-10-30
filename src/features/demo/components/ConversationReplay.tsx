"use client";

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
    <header className="replay-bar"><div><strong>Revendo a conversa</strong><span>Parte {slide.part} de 10 · Fala {index + 1} de {slides.length}</span></div><button onClick={onClose}>Sair da revisão</button></header>
    <SceneFrame activityKey={`replay:${slide.id}`} opening intro={null}
      artwork={<aside className="scene-column"><figure className="scene-art"><picture><source media="(max-width: 760px)" srcSet={slide.image.mobile} /><Image unoptimized width={960} height={640} src={slide.image.path} alt={slide.image.description} /></picture></figure></aside>}>
      <div className="activity-body"><div className="activity-content">
        <article className="opening-card" data-presentation="dialogue">
          <p className="opening-speaker">{slide.role === "character" ? "Lucas" : "Você respondeu"}</p>
          <h1 ref={heading} tabIndex={-1} lang="en">{slide.text}</h1>
          <AudioButton key={slide.id} audio={slide.audioId}>{slide.written === undefined ? "Ouvir" : "Ouvir modelo"}</AudioButton>
          {slide.meaning && <div className="replay-meaning"><button className="text-button" aria-expanded={meaning} onClick={() => setMeaning(!meaning)}>{meaning ? "Ocultar significado" : "Ver significado"}</button>{meaning && <p>{slide.meaning}</p>}</div>}
          {slide.written !== undefined && <p className="replay-model-note">Sua resposta está preservada. O áudio é o modelo desta fala.</p>}
        </article>
      </div></div>
      <nav className="activity-actions replay-pager" aria-label="Percorrer cenas da conversa"><button disabled={index === 0} onClick={() => move(index - 1)}>← Anterior</button>{index === slides.length - 1 ? <button className="primary" onClick={onClose}>Voltar ao resumo</button> : <button className="primary" onClick={() => move(index + 1)}>Próxima fala →</button>}</nav>
    </SceneFrame>
  </div>;
}
