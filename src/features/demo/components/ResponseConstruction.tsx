"use client";

import type { Dispatch } from "react";
import { flushSync } from "react-dom";
import { BrowserText } from "@/components/i18n/BrowserText";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";
import { constructionView } from "../model/practice";
import type { DemoEvent, DemoState, ResponseNode } from "../model/types";
import "./response-construction.css";

/** Given words are already present. Only missing words belong to the bank. */
export function ResponseConstruction({ node, state, dispatch }: {
  node: ResponseNode; state: DemoState; dispatch: Dispatch<DemoEvent>;
}) {
  const view = constructionView(node, state.assistedBlocks ? "some" : state.activityProfile, state.selected);
  const text = (id: string) => view.blocks.find(block => block.id === id)?.text ?? id;
  function place(block: string) {
    // Run only after an intentional piece click. Flushing the given prefix
    // first also updates the motion hook's current state before feedback for
    // the clicked word. Rendering, resizing and restoring never place words.
    for (const given of view.prefill) flushSync(() => dispatch({ at: node.id, type: "PLACE_BLOCK", block: given }));
    dispatch({ at: node.id, type: "PLACE_BLOCK", block });
  }
  return <div className="construction" data-construction-kind={view.kind}>
    {view.kind === "completion" && <p className="completion-instruction">Complete só a parte que falta.</p>}
    <div className={`answer${view.kind === "completion" ? " completion-answer" : ""}`} aria-label="Sua resposta">
      {view.before && <span className="completion-fixed" lang="en"><BrowserText>{view.before}</BrowserText></span>}
      <ol>{view.selected.map(({ id, index }) => <li key={id}><button onClick={() => dispatch({ at: node.id, type: "RETURN_BLOCKS", index })} aria-label={`Retirar ${text(id)}`}><span lang="en"><BrowserText>{text(id)}</BrowserText></span> <InterfaceIcon name="close" /></button></li>)}</ol>
      {!view.selected.length && (view.kind === "completion" ? <span className="completion-placeholder" aria-label="Parte que falta">___</span> : <span className="muted">Sua resposta aparece aqui</span>)}
      {view.after && <span className="completion-fixed" lang="en"><BrowserText>{view.after}</BrowserText></span>}
    </div>
    <div className="blocks" aria-label="Blocos disponíveis">{view.blocks.map(block => <button className={state.returnedBlocks.includes(block.id) ? `piece-returned return-${state.returnSerial % 2}` : undefined} lang="en" key={block.id} disabled={state.selected.includes(block.id)} onClick={() => place(block.id)}><BrowserText>{block.text}</BrowserText></button>)}</div>
  </div>;
}
