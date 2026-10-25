"use client";

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
    <h1 ref={headingRef} tabIndex={-1}>{audio[response].meaning}</h1>
    <p>Ouça como dizer isso em inglês.</p>
    <AudioButton audio={response} label="Ouvir resposta em inglês" onEnded={() => onAccess("heard")} onError={() => setFailed(true)}>Ouvir</AudioButton>
    {failed && <button className="text-button" onClick={() => onAccess("text")}>Seguir para a atividade</button>}
  </article>;
}
