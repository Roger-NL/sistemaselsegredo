"use client";
import { BrowserText } from "@/components/i18n/BrowserText";


import { useState, type Ref } from "react";
import type { AudioId } from "../model/types";
import type { AudioAccess } from "../model/listening";
import { AudioButton } from "./AudioButton";

export function ListeningPrompt({ audio, kind, onAccess, headingRef }: {
  audio: AudioId[]; kind: "lucas" | "model"; onAccess: (mode: AudioAccess) => void; headingRef?: Ref<HTMLHeadingElement>;
}) {
  const [failed, setFailed] = useState(false);
  const Heading = headingRef ? "h1" : "h3";
  return <article className="opening-card listening-prompt" data-presentation="prompt">
    <Heading ref={headingRef} tabIndex={headingRef ? -1 : undefined}>{kind === "lucas" ? <BrowserText>{"Escute Lucas."}</BrowserText> : <BrowserText>{"Escute uma forma de responder."}</BrowserText>}</Heading>
    <p>A frase aparece depois da escuta.</p>
    <AudioButton audio={audio} onEnded={() => onAccess("heard")} onError={() => setFailed(true)}>{kind === "lucas" ? <BrowserText>{"Ouvir Lucas"}</BrowserText> : <BrowserText>{"Ouvir modelo"}</BrowserText>}</AudioButton>
    {failed && <button className="text-button listening-text-alternative" onClick={() => onAccess("text")}>Seguir com a versão em texto</button>}
  </article>;
}
