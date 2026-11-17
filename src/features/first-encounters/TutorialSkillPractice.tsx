"use client";

import { LessonButton } from "./LessonButton";

import { Check, Eraser, Grip, RotateCcw } from "lucide-react";
import { useRef, type FormEvent } from "react";
import { DragSource, DropTarget, useLessonDrag, type DragItem } from "./LessonDrag";
import "./tutorial-skill-practice.css";

export type TutorialWordDraft = { pronoun?: "I"; verb?: "am" };
export type TutorialWritingResult = { correct: boolean; note: string };
export type TutorialWritingState = { text: string; result: TutorialWritingResult | null };
export type TutorialSkillPracticeProps = {
  kind: "words" | "write";
  words: TutorialWordDraft;
  writing: TutorialWritingState;
  onWordsChange: (next: TutorialWordDraft) => void;
  onWritingChange: (next: TutorialWritingState) => void;
  onInteraction: () => void;
};

/** The same provider can contain the whole tutorial; these IDs stay local. */
export function applyTutorialWordDrop(current: TutorialWordDraft, item: DragItem, target: string): TutorialWordDraft {
  if (item.kind !== "word") return current;
  if (target === "tutorial:word:pronoun" && item.id === "tutorial:word:I" && item.value === "I") {
    return current.pronoun === "I" ? current : { ...current, pronoun: "I" };
  }
  if (target === "tutorial:word:verb" && item.id === "tutorial:word:am" && item.value === "am") {
    return current.verb === "am" ? current : { ...current, verb: "am" };
  }
  return current;
}

/** A controls rehearsal: acknowledge meaning and always show the valid model. */
export function evaluateTutorialWriting(text: string): TutorialWritingResult {
  const normalized = text.normalize("NFKC").replace(/[’‘]/g, "'").trim().toLowerCase()
    .replace(/[.,!?;:]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return { correct: false, note: "Escreva a fala da Ana para conferir." };
  const expanded = normalized.replace(/^(?:i'm|im|iam|i m)\b/, "i am");
  const match = /^i(?: (am|are|is))? (ana|anna)$/.exec(expanded);
  if (!match) return { correct: false, note: "Nesta prática, Ana fala de si. Experimente o modelo I am Ana." };
  if (match[1] !== "am") return { correct: true, note: "A ideia ficou clara. A forma que vamos praticar é I am Ana." };
  if (match[2] === "anna") return { correct: true, note: "Entendi. A personagem desta cena se chama Ana: I am Ana." };
  return { correct: true, note: "Isso! A fala da Ana é I am Ana." };
}

export function TutorialSkillPractice({ kind, words, writing, onWordsChange, onWritingChange, onInteraction }: TutorialSkillPracticeProps) {
  const input = useRef<HTMLInputElement>(null);
  const { cancel } = useLessonDrag();
  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); onInteraction();
    if (!writing.text.trim() || writing.result?.correct) return;
    onWritingChange({ text: writing.text, result: evaluateTutorialWriting(writing.text) });
  }
  function clear() {
    onInteraction(); onWritingChange({ text: "", result: null }); input.current?.focus();
  }

  return <section className="tsp-panel" data-tutorial-practice={kind} aria-label={kind === "words" ? "Treino de montar a fala" : "Treino de escrever a fala"}
    onPointerDownCapture={onInteraction} onKeyDownCapture={onInteraction}>
    {kind === "words" ? <>
      <div className="tsp-sentence" aria-label="Monte I am Ana">
        <div data-tutorial-cue="slot-I"><DropTarget id="tutorial:word:pronoun" accept={["word"]} label="Primeiro espaço da fala: I" className={`tsp-word-slot ${words.pronoun ? "is-filled" : ""}`}>
          <span>{words.pronoun ?? "I"}</span>
        </DropTarget></div>
        <div data-tutorial-cue="slot-am"><DropTarget id="tutorial:word:verb" accept={["word"]} label="Segundo espaço da fala: am" className={`tsp-word-slot ${words.verb ? "is-filled" : ""}`}>
          <span>{words.verb ?? "am"}</span>
        </DropTarget></div>
        <strong lang="en">Ana.</strong>
      </div>
      <div className="tsp-word-bank" aria-label="Peças da fala">
        <div className="tsp-word-anchor" data-tutorial-cue="word-I"><DragSource item={{ id: "tutorial:word:I", kind: "word", value: "I", label: "I" }} className="tsp-word"><Grip size={16} aria-hidden="true"/><span lang="en">I</span></DragSource></div>
        <div className="tsp-word-anchor" data-tutorial-cue="word-am"><DragSource item={{ id: "tutorial:word:am", kind: "word", value: "am", label: "am" }} className="tsp-word"><Grip size={16} aria-hidden="true"/><span lang="en">am</span></DragSource></div>
      </div>
      <button type="button" data-tutorial-cue="refazer" className="tsp-reset" aria-label="Refazer montagem" onClick={() => { cancel(); onInteraction(); onWordsChange({}); }}><RotateCcw size={16} aria-hidden="true"/>Refazer</button>
    </> : <form className="tsp-writing" onSubmit={check}>
      <div className="tsp-model"><span>Modelo</span><strong lang="en">I am Ana.</strong></div>
      <input ref={input} data-tutorial-cue="write-input" type="text" aria-label="Sua fala em inglês" value={writing.text} maxLength={120}
        onChange={event => {
          // Consume the edit before stopping audio can rerender this controlled field.
          const text = event.currentTarget.value;
          onWritingChange({ text, result: null });
          onInteraction();
        }}
        placeholder="Escreva aqui…" autoComplete="off" autoCapitalize="off" spellCheck={false}/>
      <div className="tsp-writing-actions">
        <button type="button" data-tutorial-cue="apagar" className="tsp-clear" aria-label="Apagar o que escrevi" disabled={!writing.text} onClick={clear}><Eraser size={16} aria-hidden="true"/>Apagar</button>
        <LessonButton type="submit" data-tutorial-cue="conferir" className="tsp-check" aria-label="Conferir escrita" disabled={!writing.text.trim() || Boolean(writing.result?.correct)}><Check size={17} aria-hidden="true"/>Conferir</LessonButton>
      </div>
      {writing.result && <p className={`tsp-result ${writing.result.correct ? "is-correct" : "is-retry"}`} role="status">{writing.result.note}</p>}
    </form>}
  </section>;
}
