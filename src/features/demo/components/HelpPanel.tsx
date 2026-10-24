"use client";

import { useId, useRef, useState } from "react";
import { audio } from "../content/media";
import type { DemoNode } from "../model/types";
import { AudioButton } from "./AudioButton";

export function HelpPanel({ node, level, modelHidden, building, onHelp, onToggleModel, onUseSupport }: {
  node: DemoNode; level: number; modelHidden: boolean; building: boolean;
  onHelp: () => void; onToggleModel: () => void; onUseSupport: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [page, setPage] = useState(0);
  if (!node.help.length) return null;
  const last = level === node.help.length;
  const model = node.kind === "response" && page === node.help.length - 1;
  return <aside className="help">
    <button className="text-button" onClick={() => { if (level === 0) onHelp(); setPage(Math.max(0, level - 1)); dialog.current?.showModal(); }}>{level === 0 ? "Ajuda" : "Rever ajuda"}</button>
    <dialog ref={dialog} className="demo-dialog" aria-labelledby={title}>
      <div className="dialog-heading"><h2 id={title}>Um apoio para continuar</h2><button autoFocus onClick={() => dialog.current?.close()}>Voltar à conversa ×</button></div>
      <p className="help-clue">{model && modelHidden ? "O modelo está oculto para você tentar responder." : node.help[page]}</p>
      {model && !modelHidden && node.kind === "response" && <AudioButton audio={node.response}>Ouvir expressão</AudioButton>}
      <nav className="pager" aria-label="Percorrer pistas"><button disabled={page === 0} onClick={() => setPage(page - 1)}>← Anterior</button><span>Pista {page + 1} de {node.help.length}</span>
        <button aria-label="Mais uma pista" disabled={page + 1 >= node.help.length} onClick={() => { if (page + 1 >= level) onHelp(); setPage(page + 1); }}>Próxima →</button></nav>
      {node.kind === "response" && building && last && <div className="actions"><button onClick={() => { onToggleModel(); if (!modelHidden) dialog.current?.close(); }}>{modelHidden ? "Consultar o modelo" : "Tentar sem o modelo"}</button><button className="primary" onClick={() => { dialog.current?.close(); onUseSupport(); }}>Enviar com apoio</button></div>}
      {model && !modelHidden && node.kind === "response" && <p className="muted">{audio[node.response].meaning}</p>}
    </dialog>
  </aside>;
}
