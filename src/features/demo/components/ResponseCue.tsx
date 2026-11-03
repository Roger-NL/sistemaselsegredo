"use client";
import { BrowserText } from "@/components/i18n/BrowserText";


import { useState, type Ref } from "react";
import { audio } from "../content/media";
import type { AudioAccess } from "../model/listening";
import type { AudioId } from "../model/types";
import { AudioButton } from "./AudioButton";

/** The learner hears English, but reads only the intention until practice/help. */
export function ResponseCue({ response, headingRef, onAccess }: { response: AudioId; headingRef: Ref<HTMLHeadingElement>; onAccess: (mode: AudioAccess) => void }) {
  const [failed, setFailed] = useState(false);
  return <article className="opening-card response-cue" data-presentation="prompt">
    <small>Você quer dizer</small>
    <h1 ref={headingRef} tabIndex={-1}><BrowserText>{audio[response].meaning}</BrowserText></h1>
    <p>Ouça um modelo para esta intenção.</p>
    <AudioButton audio={response} label="Ouvir modelo em inglês" onEnded={() => onAccess("heard")} onError={() => setFailed(true)}>Ouvir modelo</AudioButton>
    {failed && <button className="text-button" onClick={() => onAccess("text")}>Seguir para a atividade</button>}
  </article>;
}
