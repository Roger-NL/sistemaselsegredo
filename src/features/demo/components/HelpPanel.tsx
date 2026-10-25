"use client";

import { useId, useRef, useState } from "react";
import { audio } from "../content/media";
import type { DemoNode } from "../model/types";
import { AudioButton } from "./AudioButton";

export function HelpPanel({ node, level, onHelp, onReveal }: { node: DemoNode; level: number; onHelp: () => void; onReveal: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [page, setPage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  if (!node.help.length) return null;
  if (node.kind === "response") return <aside className="help">
    <button className="text-button" onClick={() => { setRevealed(true); onReveal(); dialog.current?.showModal(); }}>Ajuda</button>
    <dialog ref={dialog} className="demo-dialog" aria-labelledby={title}>
      <div className="dialog-heading"><h2 id={title}>Uma resposta possível</h2><button autoFocus onClick={() => dialog.current?.close()}>Voltar à atividade ×</button></div>
      {revealed && <><p className="help-solution" lang="en">{audio[node.response].text}</p><p>{audio[node.response].meaning}</p><AudioButton audio={node.response}>Ouvir</AudioButton></>}
    </dialog>
  </aside>;
  return <aside className="help">
    <button className="text-button" onClick={() => { if (level === 0) onHelp(); setPage(Math.max(0, level - 1)); dialog.current?.showModal(); }}>Ajuda</button>
    <dialog ref={dialog} className="demo-dialog" aria-labelledby={title}>
      <div className="dialog-heading"><h2 id={title}>Um apoio para continuar</h2><button autoFocus onClick={() => dialog.current?.close()}>Voltar à conversa ×</button></div>
      <p className="help-clue">{node.help[page]}</p>
      <nav className="pager" aria-label="Percorrer pistas"><button disabled={page === 0} onClick={() => setPage(page - 1)}>← Anterior</button><span>Pista {page + 1} de {node.help.length}</span><button aria-label="Mais uma pista" disabled={page + 1 >= node.help.length} onClick={() => { if (page + 1 >= level) onHelp(); setPage(page + 1); }}>Próxima →</button></nav>
    </dialog>
  </aside>;
}
