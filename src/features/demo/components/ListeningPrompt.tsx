"use client";
import { SpeakerLabel } from "./SpeakerLabel";
import { BrowserText } from "@/components/i18n/BrowserText";


import { type Ref } from "react";
import type { AudioId } from "../model/types";
import type { AudioAccess } from "../model/listening";
import { AudioButton } from "./AudioButton";
import { audio as recordings } from "../content/media";

export function ListeningPrompt({ audio, kind, onAccess, headingRef }: {
  audio: AudioId[]; kind: "lucas" | "model"; onAccess: (mode: AudioAccess) => void; headingRef?: Ref<HTMLHeadingElement>;
}) {
  const Heading = headingRef ? "h1" : "h3";
  return <article className="opening-card listening-prompt" data-presentation="prompt">
    <div className="dialogue-copy">
    <SpeakerLabel role={kind === "lucas" ? "character" : "you"} model={kind === "model"} /><Heading ref={headingRef} tabIndex={headingRef ? -1 : undefined} lang={kind === "lucas" ? "en" : undefined}>{kind === "lucas" ? <BrowserText>{audio.map(id => recordings[id].text).join(" ")}</BrowserText> : <BrowserText>{"Escute uma forma de responder."}</BrowserText>}</Heading>
    <p>{kind === "lucas" ? "Leia a fala ou ouça o áudio." : "Ouça um modelo ou vá direto para a atividade."}</p>
    </div>
    <div className="dialogue-actions">
    <AudioButton audio={audio} onEnded={() => onAccess("heard")}>{kind === "lucas" ? <BrowserText>{"Ouvir Lucas"}</BrowserText> : <BrowserText>{"Ouvir modelo"}</BrowserText>}</AudioButton>
    <button className="text-button listening-text-alternative" onClick={() => onAccess("text")}>Li, continuar</button>
    </div>
  </article>;
}
