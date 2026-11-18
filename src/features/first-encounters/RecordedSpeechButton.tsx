"use client";

import { Pause, Volume2 } from "lucide-react";
import { getLessonAudioKey, type LessonSpeechRole } from "./lesson-audio";
import type { PersonId } from "./lesson-one";
import type { useLessonAudio } from "./useLessonAudio";

type Player = Pick<ReturnType<typeof useLessonAudio>, "has" | "request" | "pause" | "playingKey">;

/** A recording is offered only for the exact visible utterance and assigned voice. */
export function RecordedSpeechButton({ audio, person, text, lang, label, role = "narration", disabled = false }: {
  audio: Player; person: PersonId; text: string; lang: "en" | "pt"; label?: string; role?: LessonSpeechRole; disabled?: boolean;
}) {
  if (!audio.has(person, text)) return null;
  const playing = audio.playingKey === getLessonAudioKey(person, text);
  const name = playing ? `Pausar leitura de ${text}` : label ?? `Ouvir em ${lang === "en" ? "inglês" : "português"}: ${text}`;
  return <button type="button" className="lo-audio-button recorded-speech-button" data-audio-person={person} data-audio-text={text}
    data-audio-lang={lang} data-sound-silent="true" aria-label={name} aria-pressed={playing} title={name} disabled={disabled && !playing}
    onClick={event => {
      event.preventDefault(); event.stopPropagation();
      if (playing) audio.pause();
      else void audio.request(person, text, { role });
    }}>
    {playing ? <Pause size={16} aria-hidden="true"/> : <Volume2 size={16} aria-hidden="true"/>}
    <span>{lang === "en" ? "EN" : "PT"}</span>
  </button>;
}
