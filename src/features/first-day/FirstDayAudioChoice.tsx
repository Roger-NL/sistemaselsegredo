"use client";

import { ArrowLeft, Volume2, VolumeX, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { LessonButton } from "../first-encounters/LessonButton";
import "./first-day-audio-choice.css";

export function FirstDayAudioChoice({ required, shouldOpen, onChoose, onDismiss }: {
  required: boolean;
  shouldOpen: () => boolean;
  onChoose: (sound: boolean) => void;
  onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const preferred = useRef<HTMLButtonElement>(null);
  const [confirmSilent, setConfirmSilent] = useState(false);

  useLayoutEffect(() => {
    const panel = dialog.current;
    if (panel && !panel.open && shouldOpen()) panel.showModal();
    if (panel?.open && !panel.contains(document.activeElement)) preferred.current?.focus();
  }, [shouldOpen]);

  useLayoutEffect(() => {
    if (dialog.current?.open) preferred.current?.focus();
  }, [confirmSilent]);

  function dismiss() {
    dialog.current?.close();
    onDismiss();
  }

  return <dialog ref={dialog} id="fd-audio-options" data-confirming={confirmSilent || undefined} className="fd-audio-choice" aria-labelledby="fd-audio-title"
    onCancel={event => {
      event.preventDefault();
      if (confirmSilent) setConfirmSilent(false);
      else if (!required) dismiss();
    }}>
    {!required && <button type="button" className="fd-audio-dismiss" onClick={dismiss} aria-label="Fechar opções de áudio"><X size={19}/></button>}
    <h2 id="fd-audio-title">{confirmSilent ? "Começar sem áudio?" : "Como quer começar?"}</h2>
    {confirmSilent ? <>
      <p>Você poderá ativar a voz depois em “Modo de áudio”.</p>
      <button className="fd-audio-secondary fd-audio-confirm" type="button" onClick={() => onChoose(false)}>
        <VolumeX size={17}/> Confirmar sem áudio
      </button>
      <div className="fd-audio-alternative">
        <LessonButton ref={preferred} onClick={() => setConfirmSilent(false)}><ArrowLeft size={18}/> Voltar à escolha</LessonButton>
      </div>
    </> : <>
      <p id="fd-audio-help">Ouça a voz e acompanhe o texto ao mesmo tempo.</p>
      <LessonButton ref={preferred} aria-describedby="fd-audio-help fd-audio-recommended" onClick={() => onChoose(true)}>
        <Volume2 size={18}/> Iniciar aula com áudio
      </LessonButton>
      <span className="fd-audio-rating" id="fd-audio-recommended">Recomendado</span>
      <div className="fd-audio-alternative">
        <button className="fd-audio-secondary" type="button" aria-describedby="fd-audio-optional" onClick={() => setConfirmSilent(true)}>
          <VolumeX size={17}/> Iniciar sem áudio
        </button>
        <span id="fd-audio-optional">Não recomendado</span>
      </div>
    </>}
  </dialog>;
}
