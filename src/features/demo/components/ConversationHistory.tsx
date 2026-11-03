"use client";
import { BrowserText } from "@/components/i18n/BrowserText";


import { useId, useRef, useState } from "react";
import { audio } from "../content/media";
import { AudioButton } from "./AudioButton";
import type { DemoState, TranscriptLine } from "../model/types";

export function ConversationHistory({ state, lines, label = "Conversa até aqui", fromStart = false }: {
  state: DemoState; lines: TranscriptLine[]; label?: string; fromStart?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [position, setPosition] = useState(0);
  const [meaning, setMeaning] = useState(false);
  if (!lines.length) return null;
  const index = Math.min(position, lines.length - 1);
  const line = lines[index];
  const asset = audio[line.audioId];
  function move(next: number) { setPosition(next); setMeaning(false); }
  return <div className="conversation-history">
    <button className="text-button" onClick={() => { move(fromStart ? 0 : lines.length - 1); dialog.current?.showModal(); }}><BrowserText>{label}</BrowserText>{state.phase === "recall" ? <BrowserText>{" · com apoio"}</BrowserText> : <BrowserText>{""}</BrowserText>}</button>
    <dialog ref={dialog} className="demo-dialog history-dialog" aria-labelledby={title}>
      <div className="dialog-heading"><h2 id={title}><BrowserText>{label}</BrowserText></h2><button autoFocus onClick={() => dialog.current?.close()} aria-label="Fechar conversa">Fechar ×</button></div>
      <article className={`history-line ${line.role === "you" ? "history-you" : ""}`}>
        <small>{line.role === "you" ? <BrowserText>{"Você"}</BrowserText> : <BrowserText>{"Lucas"}</BrowserText>} <BrowserText>· Parte </BrowserText><BrowserText>{line.part}</BrowserText></small>
        <p lang="en">{line.written ?? <BrowserText>{asset.text}</BrowserText>}</p>
        <div className="actions"><AudioButton key={line.id} audio={line.audioId}>{line.written ? <BrowserText>{"Ouvir modelo"}</BrowserText> : <BrowserText>{"Ouvir"}</BrowserText>}</AudioButton>
          {!(line.audioId === "C01" && state.nodeId === "p2.question") && <button aria-expanded={meaning} onClick={() => setMeaning(!meaning)}>{meaning ? <BrowserText>{"Ocultar significado"}</BrowserText> : <BrowserText>{"Ver significado"}</BrowserText>}</button>}</div>
        {meaning && <p className="meaning"><BrowserText>{asset.meaning}</BrowserText></p>}
      </article>
      <nav className="pager" aria-label="Percorrer conversa"><button disabled={index === 0} onClick={() => move(index - 1)}>← Anterior</button><span role="status"><BrowserText>Fala </BrowserText>{<BrowserText>{index + 1}</BrowserText>} <BrowserText>de </BrowserText><BrowserText>{lines.length}</BrowserText></span><button disabled={index === lines.length - 1} onClick={() => move(index + 1)}>Próxima →</button></nav>
    </dialog>
  </div>;
}
