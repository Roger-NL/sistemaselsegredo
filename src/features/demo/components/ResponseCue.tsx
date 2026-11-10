"use client";
import { SpeakerLabel } from "./SpeakerLabel";
import { BrowserText } from "@/components/i18n/BrowserText";


import { type Ref } from "react";
import { audio } from "../content/media";
import type { AudioAccess } from "../model/listening";
import type { AudioId } from "../model/types";
import { AudioButton } from "./AudioButton";

/** The learner hears English, but reads only the intention until practice/help. */
export function ResponseCue({ response, context, headingRef, onAccess }: { response: AudioId; context?: string; headingRef: Ref<HTMLHeadingElement>; onAccess: (mode: AudioAccess) => void }) {
  return <article className="opening-card response-cue" data-presentation="prompt">
    <SpeakerLabel role="you" model />
    {context && <p className="response-context"><BrowserText>{context}</BrowserText></p>}
    <h1 ref={headingRef} tabIndex={-1}><BrowserText>{audio[response].meaning}</BrowserText></h1>
    <p>Ouça um modelo para esta intenção.</p>
    <AudioButton audio={response} label="Ouvir modelo em inglês" onEnded={() => onAccess("heard")}>Ouvir modelo</AudioButton>
  </article>;
}
