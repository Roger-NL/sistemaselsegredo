"use client";

import { useState, type RefObject } from "react";
import { LessonButton } from "../first-encounters/LessonButton";
import { pages } from "./content";
import type { FirstDayResetTarget } from "./first-day-progress";
import "./first-day-progress-reset.css";

const parts = [...new Map(pages.map(({ part, partTitle }) => [part, partTitle]))];

export function FirstDayProgressReset({ dialogRef, onReset }: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onReset: (target: FirstDayResetTarget) => void;
}) {
  const [target, setTarget] = useState<FirstDayResetTarget | null>(null);
  const dismiss = () => dialogRef.current?.close();

  return <dialog ref={dialogRef} id="fd-progress-reset" className="fd-reset-dialog"
    aria-labelledby="fd-reset-title" aria-describedby="fd-reset-help" onClose={() => setTarget(null)}>
    <h2 id="fd-reset-title">Reiniciar progresso</h2>
    <p id="fd-reset-help">Apague as respostas salvas para refazer uma parte ou a história inteira.</p>
    <form onSubmit={event => {
      event.preventDefault();
      if (target === null) return;
      dismiss();
      onReset(target);
    }}>
      <fieldset className="fd-reset-options">
        <legend className="sr-only">Progresso para reiniciar</legend>
        {parts.map(([part, partTitle]) => <label key={part} className="fd-reset-option">
          <input type="radio" name="fd-reset-target" checked={target === part} onChange={() => setTarget(part)} />
          <span><strong>Parte {part}</strong><small>{partTitle}</small></span>
        </label>)}
        <label className="fd-reset-option fd-reset-option-all">
          <input type="radio" name="fd-reset-target" checked={target === "all"} onChange={() => setTarget("all")} />
          <strong>Todas as partes</strong>
        </label>
      </fieldset>
      <div className="fd-reset-actions">
        <button type="button" className="lo-secondary" onClick={dismiss}>Cancelar</button>
        <LessonButton type="submit" disabled={target === null}>Reiniciar</LessonButton>
      </div>
    </form>
  </dialog>;
}
