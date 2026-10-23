"use client";

import { useId, useRef, useState } from "react";
import { audio } from "../content/media";
import type { DemoState, TranscriptLine } from "../model/types";

export function ConversationHistory({ state, lines, onReplay, label = "Conversa até aqui", fromStart = false }: {
  state: DemoState; lines: TranscriptLine[]; onReplay: (id: TranscriptLine["audioId"]) => void; label?: string; fromStart?: boolean;
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
    <button className="text-button" onClick={() => { move(fromStart ? 0 : lines.length - 1); dialog.current?.showModal(); }}>{label}{state.phase === "recall" ? " · consultar com apoio" : ""}</button>
    <dialog ref={dialog} className="demo-dialog history-dialog" aria-labelledby={title}>
      <div className="dialog-heading"><h2 id={title}>{label}</h2><button autoFocus onClick={() => dialog.current?.close()} aria-label="Fechar conversa">Fechar ×</button></div>
      <article className={`history-line ${line.role === "you" ? "history-you" : ""}`}>
        <small>{line.role === "you" ? "Você" : "Lucas"} · Parte {line.part}</small>
        <p lang="en">{line.written ?? asset.text}</p>
        <div className="actions"><button onClick={() => onReplay(line.audioId)}>{line.written ? "Ouvir modelo" : "Ouvir"}</button>
          {!(line.audioId === "C01" && state.nodeId === "p2.question") && <button aria-expanded={meaning} onClick={() => setMeaning(!meaning)}>{meaning ? "Ocultar significado" : "Ver significado"}</button>}</div>
        {meaning && <p className="meaning">{asset.meaning}</p>}
      </article>
      <nav className="pager" aria-label="Percorrer conversa"><button disabled={index === 0} onClick={() => move(index - 1)}>← Anterior</button><span role="status">Fala {index + 1} de {lines.length}</span><button disabled={index === lines.length - 1} onClick={() => move(index + 1)}>Próxima →</button></nav>
    </dialog>
  </div>;
}
