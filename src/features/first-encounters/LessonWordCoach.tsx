"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { useLessonAudio } from "./useLessonAudio";
import { createRevisionAudioController, REVISION_NARRATIONS } from "./lesson-revision-audio";
import { useLessonStorage } from "./lesson-storage";
import { LESSON_MECHANICS_STORAGE } from "./lesson-mechanics";
import "./lesson-word-coach.css";

export const WORD_MEANINGS: Record<string, { meaning: string; example: string; explanation: string; family: number }> = {
  I: { meaning: "eu", example: "I am Nina.", explanation: "Quem fala aponta para si. Com I, complete com am.", family: 0 },
  you: { meaning: "você", example: "You are Ana.", explanation: "Quem fala se dirige à outra pessoa. Com you, complete com are.", family: 0 },
  we: { meaning: "nós", example: "We are a team.", explanation: "Quem fala faz parte do grupo. Com we, complete com are.", family: 1 },
  they: { meaning: "eles / elas", example: "They are a team.", explanation: "Quem fala descreve outras pessoas. Com they, complete com are.", family: 1 },
  am: { meaning: "sou, em I am", example: "I am Nina.", explanation: "I am forma eu sou nesta cena. A peça am acompanha I.", family: 0 },
  are: { meaning: "é / somos / são", example: "You are Ana.", explanation: "You are: você é. We are: nós somos. They are: eles ou elas são.", family: 0 },
};

/** First contact explains a piece without taking away the drop target or changing its geometry. */
export function LessonWordCoach({ enabled, onOpen }: { enabled: boolean; onOpen: () => void }) {
  const storage = useLessonStorage();
  const [word, setWord] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const audio = useLessonAudio(word ?? "no-word", createRevisionAudioController);
  const { request, stop } = audio;
  const ticket = useRef(0), played = useRef<string | null>(null), openRef = useRef(onOpen);
  const cancelWordAudio = useCallback(() => { ticket.current++; stop(); }, [stop]);
  useEffect(() => { openRef.current = onOpen; }, [onOpen]);
  useEffect(() => {
    if (!enabled) {
      ticket.current++; stop(); played.current = null;
      queueMicrotask(() => setWord(null));
      return;
    }
    const explain = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const piece = event.target.closest<HTMLElement>('[data-drag-kind="word"]');
      if (!piece) return;
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
    const cancel = () => { ticket.current++; stop(); setWord(null); played.current = null; };
    document.addEventListener("lesson-stop-word-coach", cancel);
    document.addEventListener("lesson-explain-word", manual);
    document.addEventListener("pointerdown", explain);
    document.addEventListener("click", explain);
    return () => { document.removeEventListener("lesson-stop-word-coach", cancel); document.removeEventListener("lesson-explain-word", manual); document.removeEventListener("pointerdown", explain); document.removeEventListener("click", explain); cancelWordAudio(); };
  }, [enabled, storage, stop, cancelWordAudio]);
  const item = word ? WORD_MEANINGS[word] : null;
  function close() { ticket.current++; stop(); setWord(null); played.current = null; }
  function play() {
    if (!item) return;
    const generation = ++ticket.current;
    const guide = (item.family === 0 ? REVISION_NARRATIONS.self : REVISION_NARRATIONS.team);
    void request("nina", guide.text, { role: "character", onEnded: () => {
      if (generation === ticket.current) void request("nina", item.example, { role: "character" });
    } });
  }
  useEffect(() => {
    if (!word || !ready || played.current === word) return;
    played.current = word;
    const generation = ++ticket.current;
    const entry = WORD_MEANINGS[word], guide = (entry.family === 0 ? REVISION_NARRATIONS.self : REVISION_NARRATIONS.team);
    void request("nina", guide.text, { role: "character", autoplay: true, onEnded: () => {
      if (generation === ticket.current) void request("nina", entry.example, { role: "character", autoplay: true });
    } });
  }, [word, ready, request]);
  if (!enabled) return null;
  return <>
    {word && item && <aside className="lo-word-coach" aria-label={`Entenda ${word}`}>
      <div className="lo-word-coach-avatar"><AnimatedCharacter person="nina" cue="self-point" speech={audio.speech} onReady={() => setReady(true)}/></div>
      <div><strong><span lang="en">{word}</span> <span aria-hidden="true">→</span> {item.meaning}</strong><p>{item.explanation}</p><span className="lo-word-coach-example">Exemplo: <span lang="en">{item.example}</span></span><button type="button" onClick={play} aria-label="Ouvir explicação da palavra"><Volume2 size={16}/>Ouvir</button></div>
      <button type="button" className="lo-word-coach-close" onClick={close} aria-label="Fechar explicação da palavra"><X size={18}/></button>
    </aside>}
  </>;
}
