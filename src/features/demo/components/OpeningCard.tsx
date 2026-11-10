"use client";
import { SpeakerLabel } from "./SpeakerLabel";
import { BrowserText } from "@/components/i18n/BrowserText";


import type { Ref } from "react";
import type { SceneNode } from "../model/types";
import { audio } from "../content/media";
import { AudioButton } from "./AudioButton";

/** A single reading target, before the learner sees the next task. */
export function OpeningCard({ node, headingRef, onAudioEnded }: { node: SceneNode; headingRef: Ref<HTMLHeadingElement>; onAudioEnded?: () => void }) {
  const dialogue = node.presentation === "dialogue";
  const [caption, ...details] = node.context.split("\n\n");
  if (dialogue) return <article className="opening-card" data-presentation="dialogue">
    <div className="dialogue-copy">
      <SpeakerLabel role="character" />
      <h1 className="scene-utterance" ref={headingRef} tabIndex={-1} lang="en"><BrowserText>{node.heard?.map(id => audio[id].text).join(" ")}</BrowserText></h1>
      {node.context && <p className="dialogue-instruction"><BrowserText>{node.context}</BrowserText></p>}
    </div>
    {node.heard?.length ? <AudioButton audio={node.heard} label="Ouvir fala de Lucas" onEnded={onAudioEnded} /> : null}
  </article>;
  return <article className="opening-card" data-presentation={node.presentation}>
    <h1 ref={headingRef} tabIndex={-1} lang="pt-BR">
      <BrowserText>{caption}</BrowserText>
    </h1>
    {details.map((text, index) => <p key={index}><BrowserText>{text}</BrowserText></p>)}
  </article>;
}
