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
  const title = required ? "Como quer começar?" : "Modo de áudio";
  const confirmationTitle = required ? "Começar sem áudio?" : "Desativar o áudio?";

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

  function choose(sound: boolean) {
    dialog.current?.close();
    onChoose(sound);
  }

  return <dialog ref={dialog} id="fd-audio-options" data-confirming={confirmSilent || undefined} className="fd-audio-choice"
    aria-labelledby="fd-audio-title" aria-describedby="fd-audio-help"
    onClick={event => {
      if (event.target === event.currentTarget) preferred.current?.focus();
    }}
    onCancel={event => {
      event.preventDefault();
      if (confirmSilent) setConfirmSilent(false);
      else if (!required) dismiss();
    }}>
    {!required && <button type="button" className="fd-audio-dismiss" onClick={dismiss}
      aria-label="Fechar opções de áudio"><X size={19} aria-hidden="true" /></button>}
    <h2 id="fd-audio-title">{confirmSilent ? confirmationTitle : title}</h2>
    {confirmSilent ? <>
      <p id="fd-audio-help">Você pode ativar a narração depois em “Modo de áudio”, na capa.</p>
      <button className="fd-audio-secondary fd-audio-confirm" type="button" onClick={() => choose(false)}>
        <VolumeX size={17} aria-hidden="true" /> {required ? "Confirmar sem áudio" : "Confirmar desativação"}
      </button>
      <div className="fd-audio-alternative">
        <LessonButton ref={preferred} onClick={() => setConfirmSilent(false)}>
          <ArrowLeft size={18} aria-hidden="true" /> Voltar à escolha
        </LessonButton>
      </div>
    </> : <>
      <p id="fd-audio-help">Leia o texto enquanto ouve a história.</p>
      <LessonButton ref={preferred} aria-describedby="fd-audio-recommended" onClick={() => choose(true)}>
        <Volume2 size={18} aria-hidden="true" /> {required ? "Iniciar aula com áudio" : "Ativar áudio"}
      </LessonButton>
      <span className="fd-audio-rating" id="fd-audio-recommended">Recomendado</span>
      <div className="fd-audio-alternative">
        <button className="fd-audio-secondary" type="button" aria-describedby="fd-audio-optional" onClick={() => setConfirmSilent(true)}>
          <VolumeX size={17} aria-hidden="true" /> {required ? "Iniciar sem áudio" : "Desativar áudio"}
        </button>
        <span id="fd-audio-optional">Não recomendado</span>
      </div>
    </>}
  </dialog>;
}
