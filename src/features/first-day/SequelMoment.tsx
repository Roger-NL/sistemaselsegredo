"use client";

import { useState } from "react";
import { DragSource, DropTarget, LessonDragProvider, useLessonDrag } from "../first-encounters/LessonDrag";
import type { LessonSoundCue } from "../first-encounters/lesson-sounds";
import type { ChallengeAttempt } from "./first-day-progress";
import { ComicStrip, StudyArt } from "./PartTwoMoment";
import type { Bilingual, PartTwoArt } from "./part-two-content";
import { StoryPanel, type BalloonPrint } from "./StoryPanel";
import type { SequelExercise, SequelPage, SequelPanel } from "./sequel-content";
import { sequelBalloonPrints, sequelSpeechBeats, sequelSpeechSplit } from "./sequel-balloon-layout";
import { sequelHintSlots, sequelPlacementWithHints, sequelWordBank } from "./sequel-word-bank";
import { sequelWordTranslation } from "./sequel-word-translations";
import { EnglishWords } from "./WordMeaning";

type Language = keyof Bilingual;
const balloonId = "first-day-sequel-balloon";

const balloonPrints = {
  left: {
    desktop: { mouth: [.29, .33], headTop: .025, oval: [.53, .115, 482, 104] },
    portrait: { mouth: [.23, .43], headTop: .075, oval: [.62, .113, 238, 64] },
  },
  center: {
    desktop: { mouth: [.50, .31], headTop: .025, oval: [.65, .115, 482, 104] },
    portrait: { mouth: [.49, .39], headTop: .075, oval: [.50, .133, 260, 64] },
  },
  right: {
    desktop: { mouth: [.75, .31], headTop: .025, oval: [.76, .115, 482, 104] },
    portrait: { mouth: [.77, .39], headTop: .075, oval: [.36, .113, 238, 64] },
  },
} satisfies Record<string, BalloonPrint>;

function artId(panel: SequelPanel) {
  return panel.art.image.src.split("/").at(-1)?.replace(/\.webp$/, "") ?? "";
}

function printFor(panel: SequelPanel) {
  const focus = panel.portraitFocus ?? (panel.line?.speaker === "Rafael" ? "right" : panel.line?.speaker === "Ana" ? "left" : "center");
  return sequelBalloonPrints[artId(panel)] ?? balloonPrints[focus];
}

function SpokenLine({ panel, lang }: { panel: SequelPanel; lang: Language }) {
  const { line } = panel;
  if (!line) return null;
  const id = artId(panel);
  const parts = sequelSpeechBeats[id];
  const showTranslation = !parts || id === "v2-rafael-despede";
  return (parts ?? [line]).map((part, index) => <div key={part.en} data-fd-dialogue-beat=""
    className="fd1-bubble-body fd-sequel-spoken">
    {index === 0 && <small className={parts ? "sr-only" : undefined}>{line.speaker}</small>}
    <b className="fd1-spoken-line" lang={lang === "en" ? "en" : "pt-BR"}>
      {lang === "en" ? <EnglishWords text={part.en}/> : part.pt}
    </b>
    {showTranslation && <span className="fd1-translation" lang={lang === "en" ? "pt-BR" : "en"}>
      {lang === "en" ? part.pt : <EnglishWords text={part.en}/>}
    </span>}
  </div>);
}

function ArtOnly({ art }: { art: PartTwoArt }) {
  return <div className="fd-scene fd1-scene fd-sequel-art-only"><StudyArt {...art}/></div>;
}

function CheckActions({ canUndo, ready, onUndo, onCheck }: {
  canUndo: boolean;
  ready: boolean;
  onUndo: () => void;
  onCheck: () => void;
}) {
  const { cancel } = useLessonDrag();
  return <div className="fd1-check-actions">
    <button type="button" disabled={!canUndo} onClick={() => { cancel(); onUndo(); }}>Desfazer</button>
    <button type="button" disabled={!ready} onClick={() => { cancel(); onCheck(); }}>
      Conferir
    </button>
  </div>;
}

function Exercise({ panel, exercise, portrait, lang, placed: savedWords, guided, onEdit, onSolve, cue }: {
  panel: SequelPanel;
  exercise: SequelExercise;
  portrait: boolean;
  lang: Language;
  placed: readonly number[];
  guided: boolean;
  onEdit: (placed: readonly number[]) => void;
  onSolve: () => void;
  cue: (sound: LessonSoundCue) => void;
}) {
  const [wrong, setWrong] = useState(false);
  const choose = exercise.mode === "choose";
  const { words, order: answer } = choose ? { words: exercise.bank[lang], order: exercise.solution[lang] }
    : sequelWordBank(exercise.bank[lang], exercise.solution[lang]);
  const speaker = panel.line?.speaker ?? "Rafael";
  const language = lang === "pt" ? "pt-BR" : "en";
  const instruction = exercise.instruction;
  const translationLanguage = lang === "pt" ? "en" : "pt-BR";
  const spokenWords = answer.map(index => words[index]);
  const original = spokenWords.join(" ");
  const splitAt = sequelSpeechSplit(artId(panel), lang, panel.line?.[lang], spokenWords);
  const split = splitAt > 0 && splitAt < answer.length;
  const speechEnds = split ? [splitAt, answer.length] : [answer.length];
  const hints = exercise.prefilled ? new Set(exercise.prefilled[lang]) : sequelHintSlots(speechEnds);
  const placed = sequelPlacementWithHints(savedWords, answer, hints);
  let lastEnteredSlot = placed.length - 1;
  while (hints.has(lastEnteredSlot)) lastEnteredSlot--;
  const hasEnteredWords = lastEnteredSlot >= 0;
  const activeBeat = split && placed.length >= splitAt ? 1 : 0;
  const activeStart = speechEnds[activeBeat - 1] ?? 0;
  const activeWords = answer.slice(activeStart, speechEnds[activeBeat]).filter((_, slot) => !hints.has(activeStart + slot));
  const pieces = words.flatMap((word, index) => choose || activeWords.includes(index) ? [{ word, index }] : []);
  const mistakeAt = placed.findIndex((index, slot) => words[index] !== words[answer[slot]]);
  const correctCount = mistakeAt < 0 ? placed.length : mistakeAt;

  function edit(next: readonly number[]) {
    setWrong(false);
    onEdit(next);
  }

  function check(indices: readonly number[]) {
    const correct = indices.length === answer.length && indices.every((index, slot) => words[index] === words[answer[slot]]);
    setWrong(!correct);
    cue(correct ? "success" : "retry");
    if (correct) onSolve();
  }

  function place(value: string) {
    const index = Number(value);
    if (!activeWords.includes(index) || placed.includes(index) || placed.length === answer.length) return;
    if (guided && words[index] !== words[answer[placed.length]]) {
      setWrong(true);
      cue("retry");
      return;
    }
    const next = sequelPlacementWithHints([...placed, index], answer, hints);
    if (guided && next.length === answer.length) {
      check(next);
    } else {
      edit(next);
      cue("place");
    }
  }

  const guidance = wrong ? "Tente outra opção." : choose ? "" : "Arraste as palavras para o balão.";

  const scene = <section className="fd1-story fd-sequel-story" data-exercise="" aria-label={instruction}>
      {choose ? <ArtOnly art={panel.art}/> : <StoryPanel page={{ id: panel.art.image.src, ...panel.art }} portrait={portrait} placement={printFor(panel)}
        variant="exercise" expanded={hasEnteredWords}>
        {speechEnds.map((end, beat) => {
          const start = speechEnds[beat - 1] ?? 0;
          const active = activeBeat === beat && placed.length < answer.length;
          const phrase = placed.slice(start, end).map(index => words[index]).join(" ");
          const translation = hasEnteredWords ? sequelWordTranslation(original, lang, Math.min(end, correctCount), start) : "";
          const label = `Balão de ${speaker}${split ? `. Parte ${beat + 1} de 2` : ""}${phrase ? `. ${phrase}` : ""}`;
          const slots = <>
            {!split && <small>{speaker}</small>}
            <span className="fd1-slots" lang={language}>
              {answer.slice(start, end).map((_, index) => {
                const slot = start + index;
                if (hints.has(slot)) return <b className="fd-sequel-prefilled" key={slot}>{words[answer[slot]]}</b>;
                return slot < placed.length ? <b key={slot}>{words[placed[slot]]}</b>
                  : <i key={slot} data-lesson-drop-anchor={slot === placed.length ? "" : undefined} aria-hidden="true"/>;
              })}
            </span>
            {translation && <span className="fd1-translation" lang={translationLanguage} aria-live="polite">{translation}</span>}
          </>;
          return <div key={start} data-fd-dialogue-beat="" data-fd-active-beat={split && active ? "" : undefined}>
            {active ? <DropTarget id={balloonId} accept={["word"]} className="fd1-bubble-body fd-sequel-spoken"
              label={label}>{slots}</DropTarget>
              : <div className="fd1-bubble-body fd-sequel-spoken">{slots}</div>}
          </div>;
        })}
      </StoryPanel>}
      <fieldset className="fd-sequel-exercise">
        <legend lang="pt-BR">{instruction}</legend>
        <div className="fd1-words fd-sequel-choices" data-choice={choose || undefined} lang={language}>
          {pieces.map(({ word, index }) => choose
            ? <button key={index} className="fd1-word" type="button" onClick={() => check([index])}>{word}</button>
            : <DragSource key={index} className={guided && index === answer[placed.length]
            ? "fd1-word fd1-word-next" : "fd1-word"}
            item={{ id: `sequel-word-${index}`, kind: "word", value: String(index), label: word }}
            disabled={placed.includes(index) || placed.length === answer.length}>{word}</DragSource>)}
        </div>
        <div className="fd-sequel-feedback" lang="pt-BR">
          <span role="status">{guidance}</span>
          {!choose && !guided && <CheckActions canUndo={hasEnteredWords} ready={placed.length === answer.length}
            onUndo={() => edit(placed.slice(0, lastEnteredSlot))} onCheck={() => check(placed)}/>}
        </div>
      </fieldset>
    </section>;

  return choose ? scene : <LessonDragProvider onDrop={item => place(item.value)} animatePlacement>{scene}</LessonDragProvider>;
}

export function SequelMoment({ page, portrait, frame, exercise, readingLanguage, exerciseLanguage = readingLanguage,
  count, attempt, onEdit, onSolve, cue }: {
  page: SequelPage;
  portrait: boolean;
  frame: number;
  exercise: SequelExercise | undefined;
  readingLanguage: "en" | "pt-BR";
  exerciseLanguage?: "en" | "pt-BR";
  count: number;
  attempt: ChallengeAttempt | undefined;
  onEdit: (placed: readonly number[]) => void;
  onSolve: () => void;
  cue: (sound: LessonSoundCue) => void;
}) {
  const lang = readingLanguage === "en" ? "en" : "pt";
  if (page.kind === "Tirinha") return <ComicStrip page={page}/>;
  if (page.kind === "Explicação") return <section className="fd-rule fd1-rule" aria-label={page.title}>
    <div className="fd1-rule-examples" data-panel-count={page.examples.length}>
      {page.examples.map(example => <figure className="fd1-study-panel" key={example.line.en}>
        <StudyArt {...example.art} strip/>
        <figcaption className="fd1-study-caption">
          <small className="fd1-rule-context" lang="pt-BR">{example.context}</small>
          <b className="fd1-study-line" lang="en"><EnglishWords text={example.line.en}/></b>
          <span className="fd1-study-translation" lang="pt-BR">{example.line.pt}</span>
        </figcaption>
      </figure>)}
    </div>
  </section>;

  const panel: SequelPanel = page.kind === "História" ? page.panels[frame] : page.closing?.[frame] ?? { art: page.art };
  const challenge = page.kind === "Desafio";
  const bankLanguage = challenge ? "en" : exerciseLanguage;
  if (exercise) return <Exercise key={`${bankLanguage}:${count}`} panel={panel} portrait={portrait} exercise={exercise}
    lang={bankLanguage === "en" ? "en" : "pt"}
    guided={page.kind === "História" || Boolean(page.closing && frame === 1)}
    placed={attempt?.language === bankLanguage ? attempt.placed : []} onEdit={onEdit} onSolve={onSolve} cue={cue}/>;

  return <section className="fd1-story fd-sequel-story" aria-label={page.title}>
    {panel.line ? <StoryPanel page={{ id: panel.art.image.src, ...panel.art }} portrait={portrait} placement={printFor(panel)} variant="dialogue">
      <SpokenLine panel={panel} lang={challenge ? "en" : lang}/>
    </StoryPanel> : <ArtOnly art={panel.art}/>}
    {page.kind === "Desafio" && (!page.closing || frame === page.closing.length - 1) &&
      <output className="fd-sequel-confirmation" role="status" lang="pt-BR">{page.confirmation}</output>}
  </section>;
}
