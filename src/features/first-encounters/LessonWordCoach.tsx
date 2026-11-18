"use client";

import { SpeechText } from "./SpeechText";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import { RecordedSpeechButton } from "./RecordedSpeechButton";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { useLessonAudio } from "./useLessonAudio";
import { createRevisionAudioController, WORD_NARRATIONS } from "./lesson-revision-audio";
import { useLessonStorage } from "./lesson-storage";
import { LESSON_MECHANICS_STORAGE } from "./lesson-mechanics";
import "./lesson-word-coach.css";

export const WORD_MEANINGS: Record<string, { meaning: string; example: string; explanation: string; }> = {
  I: { meaning: "eu", example: "I am Nina.", explanation: WORD_NARRATIONS.I },
  you: { meaning: "você", example: "You are Ana.", explanation: WORD_NARRATIONS.you },
  we: { meaning: "nós", example: "We are a team.", explanation: WORD_NARRATIONS.we },
  they: { meaning: "eles / elas", example: "They are a team.", explanation: WORD_NARRATIONS.they },
  am: { meaning: "sou, em I am", example: "I am Nina.", explanation: WORD_NARRATIONS.am },
  are: { meaning: "é / somos / são", example: "You are Ana.", explanation: WORD_NARRATIONS.are },
};

/** First contact explains a piece without taking away the drop target or changing its geometry. */
export function LessonWordCoach({ enabled, onOpen, manualReadingRef }: {
  enabled: boolean; onOpen: () => void; manualReadingRef?: RefObject<(() => Promise<void> | undefined) | null>;
}) {
  const storage = useLessonStorage();
  const [word, setWord] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const audio = useLessonAudio(word ?? "no-word", createRevisionAudioController);
  const { request, stop, whenIdle } = audio;
  useEffect(() => {
    if (!manualReadingRef) return;
    manualReadingRef.current = () => whenIdle(true);
    return () => { manualReadingRef.current = null; };
  }, [whenIdle, manualReadingRef]);
  const played = useRef<string | null>(null), openRef = useRef(onOpen);
  const cancelWordAudio = useCallback(() => { stop(); }, [stop]);
  useEffect(() => { openRef.current = onOpen; }, [onOpen]);
  useEffect(() => {
    if (!enabled) {
      stop(); played.current = null;
      queueMicrotask(() => setWord(null));
      return;
    }
    const explain = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const piece = event.target.closest<HTMLElement>('[data-drag-kind="word"]');
      if (!piece) return;
      if (event.type === "pointerdown" && (event as PointerEvent).pointerType === "touch") return;
      if (event.type === "pointermove" && !piece.hasAttribute("data-lesson-dragging")) return;
      const name = piece.getAttribute("aria-label") ?? "";
      if (!Object.hasOwn(WORD_MEANINGS, name)) return;
      try {
        const value = JSON.parse(storage.getItem(LESSON_MECHANICS_STORAGE) ?? '{"version":1,"seen":[]}');
        const words: string[] = Array.isArray(value.words) ? value.words : [];
        if (words.includes(name)) return;
        storage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ ...value, version: 1, words: [...words, name] }));
      } catch { /* Explaining a word remains available when storage is unavailable. */ }
      openRef.current(); setReady(false); setWord(name);
    };
    const manual = (event: Event) => { const name = (event as CustomEvent).detail; if (typeof name === "string" && Object.hasOwn(WORD_MEANINGS, name)) { openRef.current(); played.current = null; setReady(false); setWord(name); } };
    const cancel = (event: Event) => {
      stop();
      const text = (event as CustomEvent<string>).detail;
      if (text && Object.hasOwn(WORD_MEANINGS, text)) {
        played.current = text;
      } else {
        setWord(null); played.current = null;
      }
    };
    document.addEventListener("lesson-stop-word-coach", cancel);
    document.addEventListener("lesson-explain-word", manual);
    document.addEventListener("pointerdown", explain);
    document.addEventListener("pointermove", explain);
    document.addEventListener("lesson-select-word", explain);
    document.addEventListener("click", explain);
    return () => { document.removeEventListener("lesson-stop-word-coach", cancel); document.removeEventListener("lesson-explain-word", manual); document.removeEventListener("pointerdown", explain); document.removeEventListener("pointermove", explain); document.removeEventListener("lesson-select-word", explain); document.removeEventListener("click", explain); cancelWordAudio(); };
  }, [enabled, storage, stop, cancelWordAudio]);
  const item = word ? WORD_MEANINGS[word] : null;
  function close() { stop(); setWord(null); played.current = null; }
  useEffect(() => {
    if (!word || !ready || played.current === word) return;
    played.current = word;
    void request("nina", WORD_NARRATIONS[word as keyof typeof WORD_NARRATIONS], { role: "character", autoplay: true });
  }, [word, ready, request]);
  if (!enabled) return null;
  return <>
    {word && item && <aside className="lo-word-coach" aria-label={`Entenda ${word}`}>
      <div className="lo-word-coach-avatar"><AnimatedCharacter person="nina" cue="self-point" speech={audio.speech} onReady={() => setReady(true)}/></div>
      <div><strong><span lang="en"><SpeechText onPlay={() => void request("nina", word, { role: "character" })}>{word}</SpeechText></span> <span aria-hidden="true">→</span> {item.meaning}</strong><p>{item.explanation}</p><span className="lo-word-coach-example">Exemplo: <span lang="en"><SpeechText onPlay={() => void request("nina", item.example, { role: "character" })}>{item.example}</SpeechText></span></span>
        <div className="lo-word-coach-listen">
          <RecordedSpeechButton audio={audio} person="nina" text={item.explanation} lang="pt" role="character" label="Ouvir explicação da palavra"/>
          <RecordedSpeechButton audio={audio} person="nina" text={word} lang="en" role="character" label={`Ouvir a palavra ${word} em inglês`}/>
          <RecordedSpeechButton audio={audio} person="nina" text={item.example} lang="en" role="character" label="Ouvir exemplo da palavra"/>
        </div></div>
      <button type="button" className="lo-word-coach-close" onClick={close} aria-label="Fechar explicação da palavra"><X size={18}/></button>
    </aside>}
  </>;
}
