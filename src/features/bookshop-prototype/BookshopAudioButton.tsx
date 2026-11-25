"use client";

import { useId, useState, type MouseEvent } from "react";
import "./bookshop-audio-button.css";

type BookshopSpeaker = "ben" | "lara" | "model";

type BookshopAudioButtonProps = {
  text: string;
  speaker?: BookshopSpeaker;
  compact?: boolean;
};

const testNotice = "Botão de escuta acionado em modo de teste. Áudio ainda não conectado.";

/** Records a test request only; this prototype has no audio playback attached. */
export function BookshopAudioButton({ text, speaker = "model", compact = false }: BookshopAudioButtonProps) {
  const statusId = useId();
  const [request, setRequest] = useState<{ text: string; speaker: BookshopSpeaker; count: number } | null>(null);
  const requested = request?.text === text && request.speaker === speaker;
  const status = requested ? "test-requested" : "idle";

  function requestAudio(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("basedspeak:bookshop-audio-request", {
      detail: { text, language: "en", speaker },
    }));
    setRequest(previous => ({ text, speaker, count: (previous?.count ?? 0) + 1 }));
  }

  return (
    <span className="bs-audio-trigger" data-audio-status={status}>
      <button
        type="button"
        className={"bs-audio-button" + (compact ? " is-compact" : "")}
        data-audio-status={status}
        aria-label={"Ouvir: " + text}
        aria-describedby={statusId}
        title="Modo de teste. Áudio ainda não conectado."
        onClick={requestAudio}
      >
        <span className="bs-audio-label" aria-hidden="true">Ouvir</span>
        <svg className="bs-audio-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
          <circle className="bs-audio-ring" cx="16" cy="16" r="14" />
          {requested ? (
            <path className="bs-audio-check" d="m10 16 4 4 8-8" />
          ) : (
            <g className="bs-audio-speaker">
              <path d="M12 13H9v6h3l5 4V9l-5 4Z" />
              <path d="M20 13a5 5 0 0 1 0 6M23 10a9 9 0 0 1 0 12" />
            </g>
          )}
        </svg>
      </button>
      <span id={statusId} className="bs-audio-sr-only" role="status" aria-live="polite" aria-atomic="true">
        <span key={requested ? request.count : "idle"}>
          {requested ? testNotice : "Botão de escuta em modo de teste. Áudio ainda não conectado."}
        </span>
      </span>
    </span>
  );
}
