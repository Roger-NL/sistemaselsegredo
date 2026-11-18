import type { ReactNode } from "react";

/** Keeps the text's existing typography while making the recording keyboard-accessible. */
export function SpeechText({ children, onPlay }: { children: ReactNode; onPlay: () => void }) {
  return <button type="button" className="lesson-speech-text" data-sound-silent="true" onClick={onPlay}>{children}</button>;
}
