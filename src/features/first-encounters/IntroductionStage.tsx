"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef } from "react";
import type { LessonSpeechDriver } from "./lesson-audio";
import { PERSON_NAMES, type PersonId } from "./lesson-one";
import type { IntroductionScene } from "./lesson-introduction";

const Character = dynamic(() => import("./AnimatedCharacter").then(module => module.AnimatedCharacter), { ssr: false });
const CAST: readonly PersonId[] = ["nina", "ana", "leo", "maya"];

/** Keep one native rig per person loaded; only the current speaker receives the voice clock. */
export function IntroductionStage({ scene, modelIndex, speech, onCharacterReady, guideLabel = "Nina apresenta a aula." }: {
  scene: IntroductionScene; modelIndex: number | null; speech: LessonSpeechDriver;
  onCharacterReady: (person: PersonId) => void;
  guideLabel?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const tail = useRef<SVGPathElement>(null);
  const model = modelIndex === null ? undefined : scene.models[modelIndex];
  const speaker = model?.speaker ?? "nina";
  const group = scene.id === "we-and-they";

  useLayoutEffect(() => {
    const stage = root.current, speechBubble = bubble.current;
    if (!stage || !speechBubble) return;
    function placeBubble() {
      if (!stage || !speechBubble) return;
      const canvas = stage.querySelector<HTMLCanvasElement>(`[data-introduction-person="${speaker}"] canvas`);
      if (!canvas) return;
      const bounds = stage.getBoundingClientRect(), actor = canvas.getBoundingClientRect();
      if (!actor.width || !actor.height) return;
      // The same 360×460 artboards/head coordinates used by LessonStage.
      const scale = Math.min(actor.width / 360, actor.height / 460);
      const mouthX = actor.left - bounds.left + actor.width / 2;
      const mouthY = actor.bottom - bounds.top - (460 - 161) * scale;
      const headTop = actor.bottom - bounds.top - (460 - 45) * scale;
      const width = speechBubble.offsetWidth, height = speechBubble.offsetHeight;
      const x = Math.max(8, Math.min(bounds.width - width - 8, mouthX - width / 2));
      const y = Math.max(6, headTop - height - 9);
      const start = Math.max(12, Math.min(width - 12, mouthX - x));
      const gap = Math.max(5, Math.min(14, headTop - y - height - 2));
      const tip = start + (mouthX - x - start) * gap / Math.max(1, mouthY - y - height);
      speechBubble.style.left = `${x}px`; speechBubble.style.top = `${y}px`;
      tail.current?.setAttribute("d", `M ${start - 7} -1 L ${tip} ${gap} L ${start + 7} -1`);
      speechBubble.dataset.speechOwner = speaker;
    }
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(placeBubble) : null;
    resize?.observe(stage); resize?.observe(speechBubble);
    const children = new MutationObserver(placeBubble);
    children.observe(stage, { childList: true, subtree: true });
    placeBubble();
    return () => { resize?.disconnect(); children.disconnect(); };
  }, [speaker, model?.text]);

  return <div ref={root} className="li-character-scene" data-introduction-stage={scene.id}
    data-stage-guide={!model} data-stage-group={group && Boolean(model)} data-stage-speaker={speaker}
    aria-label={!model ? guideLabel : group ? `${PERSON_NAMES[speaker]} fala sobre a equipe de Ana e Leo.` : `${PERSON_NAMES[speaker]} fala ${speaker === "ana" ? "de si" : "com Ana"}.`}>
    {!model && <span className="li-guide-label">Nina · sua guia</span>}
    {group && model && <div className="li-stage-team" aria-label="Equipe de Ana e Leo"><span>Equipe</span></div>}
    <div className="li-stage-floor" aria-hidden="true"/>
    {CAST.map(person => {
      const visible = model ? person !== "nina" && (group || person !== "maya") : person === "nina";
      return <div key={person} className="li-actor" data-introduction-person={person} data-visible={visible}
        data-speaker={visible && person === speaker} aria-hidden={!visible}>
        <Character person={person} cue={person === "nina" ? "wave" : "idle"} cueKey={scene.id === "self-and-you" ? 0 : scene.id === "we-and-they" ? 1 : 2}
          pause={!visible} speech={visible && person === speaker ? speech : undefined}
          speechListenerSide={person === "leo" ? "left" : "right"} onReady={() => onCharacterReady(person)}/>
        <span className="li-actor-name">{PERSON_NAMES[person]}</span>
      </div>;
    })}
    {model && <div ref={bubble} className="li-stage-speech" lang="en"><strong>{model.text}</strong>
      <svg aria-hidden="true" className="li-stage-speech-tail"><path ref={tail}/></svg>
    </div>}
  </div>;
}
