"use client";

import { useContext, useEffect, useId, type ReactNode } from "react";
import { DemoAudioContext } from "../audio/use-demo-audio";
import type { AudioId } from "../model/types";

const statuses = { idle: "", loading: "Preparando áudio", playing: "Reproduzindo áudio", paused: "Áudio pausado", ended: "Áudio concluído", error: "Não foi possível ouvir. Tente novamente." };

/** The indicator belongs to this trigger, including inside history/help dialogs. */
export function AudioButton({ audio, children = "Ouvir", label }: { audio: AudioId | AudioId[]; children?: ReactNode; label?: string }) {
  const controller = useContext(DemoAudioContext);
  const source = useId();
  const release = controller?.release;
  useEffect(() => () => release?.(source), [release, source]);
  if (!controller) throw new Error("DEMO_AUDIO_PROVIDER_REQUIRED");
  const active = controller.playback.source === source;
  const status = active ? controller.playback.status : "idle";
  const progress = active ? controller.playback.progress : 0;
  return <span className="audio-trigger" data-audio-status={status}>
    <button type="button" className="text-button audio-button" aria-label={label} aria-busy={status === "loading"} onClick={() => void controller.replay(audio, source)}>
      <span>{children}</span>
      <svg className="audio-ring" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="audio-ring-track" cx="12" cy="12" r="9" />
        <circle className="audio-ring-fill" cx="12" cy="12" r="9" pathLength="100" strokeDasharray={status === "loading" ? "24 76" : "100"} strokeDashoffset={status === "loading" ? 0 : 100 * (1 - progress)} />
      </svg>
    </button>
    <span className="audio-sr-only" role="status">{status === "error" ? "" : statuses[status]}</span>
    {status === "error" && <span className="audio-inline-error" role="status">{statuses.error}</span>}
  </span>;
}
