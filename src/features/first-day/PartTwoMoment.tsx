"use client";

import Image from "next/image";
import { Fragment, useContext, useState, type ReactNode } from "react";
import { DragSource, DropTarget, LessonDragProvider, useLessonDrag } from "../first-encounters/LessonDrag";
import type { LessonSoundCue } from "../first-encounters/lesson-sounds";
import type { ChallengeAttempt } from "./first-day-progress";
import type { Bilingual, PartTwoPage, PartTwoArt } from "./part-two-content";
import { partOnePortraitMedia } from "./content";
import { EnglishWords, MeaningContext } from "./WordMeaning";
import { StoryPanel, type BalloonPrint } from "./StoryPanel";

// Balloon centers and mouths follow the two independently framed editions.
// Oval dimensions are in reference-panel pixels (1600 wide or 366 wide).
const placements = {
  request: {
    desktop: { mouth: [.599, .378], headTop: .02, oval: [.457, .120, 282, 103], completed: [.457, .120, 347, 130] },
    portrait: { mouth: [.642, .428], headTop: .16, oval: [.455, .11, 201, 59], completed: [.455, .11, 221, 77] },
  },
  show: {
    desktop: { mouth: [.363, .355], headTop: .00, oval: [.538, .160, 270, 122] },
    portrait: { mouth: [.407, .487], headTop: .17, oval: [.596, .240, 159, 70] },
  },
  reaction: {
    desktop: { mouth: [.803, .374], headTop: .00, oval: [.560, .150, 238, 94], completed: [.560, .150, 295, 127] },
    portrait: { mouth: [.801, .470], headTop: .18, oval: [.545, .245, 143, 48], completed: [.545, .245, 182, 75] },
  },
  agreement: {
    desktop: { mouth: [.472, .487], headTop: .055, oval: [.687, .22, 270, 122] },
    portrait: { mouth: [.415, .462], headTop: .16, oval: [.71, .095, 146, 70] },
  },
  reveal: {
    desktop: { mouth: [.748, .377], headTop: .00, oval: [.530, .175, 244, 100], completed: [.530, .175, 300, 122] },
    portrait: { mouth: [.735, .443], headTop: .18, oval: [.465, .145, 150, 50], completed: [.465, .145, 183, 77] },
  },
  challenge: {
    desktop: { mouth: [.808, .450], headTop: .00, oval: [.545, .145, 485, 108] },
    portrait: { mouth: [.828, .558], headTop: .19, oval: [.535, .248, 248, 62] },
  },
} satisfies Record<string, BalloonPrint>;

const unanchored = {
  desktop: { headTop: .04, oval: [.5, .14, 470, 127], completed: [.5, .14, 550, 165] },
  portrait: { headTop: .12, oval: [.5, .12, 248, 67], completed: [.5, .12, 285, 88] },
} satisfies BalloonPrint;

function StudyArt({ image, portraitImage }: PartTwoArt) {
  return <picture className="fd1-study-art">
    <source media={partOnePortraitMedia} srcSet={portraitImage.src} width={portraitImage.width} height={portraitImage.height}/>
    <Image src={image.src} width={image.width} height={image.height} alt={image.alt} loading="eager" unoptimized/>
  </picture>;
}

function WordTray({ words, order, placed, next, reusable = false }: {
  words: readonly string[]; order: readonly number[]; placed: readonly number[]; next?: number; reusable?: boolean;
}) {
  const lookup = useContext(MeaningContext);
  return <div className="fd1-words fd2-tray" role="group" aria-label="Faixa de palavras" lang="en">
    {order.map(index => <DragSource key={index} disabled={!reusable && placed.includes(index)}
      className={index === next ? "fd1-word fd1-word-next" : "fd1-word"}
      item={{ id: `word-${index}`, kind: "word", value: String(index), label: words[index] }}
      onClick={() => lookup(words[index])}>{words[index]}</DragSource>)}
  </div>;
}

function Assembly({ words, placed, slots, translation, prefix, speaker }: {
  words: readonly string[]; placed: readonly number[]; slots: number; translation?: string; prefix?: string; speaker?: string;
}) {
  const { selected } = useLessonDrag();
  const text = placed.map(index => words[index]).join(" ");
  const balloonLabel = speaker ? `Balão de ${speaker}.` : "Seu balão.";
  return <DropTarget id="first-day-bubble" accept={["word"]} disabled={placed.length === slots}
    className="fd1-bubble-body fd2-assembly" label={`${balloonLabel} ${text ? `Montagem até agora: ${text}` : "Colocar palavra"}`}>
    <span className="fd1-slots" lang="en">
      {prefix && <b>{selected ? prefix : <EnglishWords text={prefix}/>}</b>}
      {Array.from({ length: slots }, (_, i) => i < placed.length
        ? <b key={i}>{selected ? words[placed[i]] : <EnglishWords text={words[placed[i]]}/>}</b>
        : <i key={i} data-lesson-drop-anchor={i === placed.length ? "" : undefined} aria-hidden="true"/>)}
    </span>
    {translation && <span className="fd1-translation" lang="pt-BR" aria-live="polite">{translation}</span>}
  </DropTarget>;
}

function StudyCaption({ children, translation }: { children: ReactNode; translation: string }) {
  return <div className="fd1-study-caption">
    <span className="fd1-study-line" lang="en">{children}</span>
    <span className="fd1-study-translation" lang="pt-BR">{translation}</span>
  </div>;
}

type Language = "en" | "pt-BR";

function ReadingText({ text, language }: { text: Bilingual; language: Language }) {
  return language === "en" ? <span lang="en"><EnglishWords text={text.en}/></span> : <span lang="pt-BR">{text.pt}</span>;
}

function SpokenLine({ line, language }: { line: Bilingual; language: Language }) {
  const other = language === "en" ? "pt-BR" : "en";
  return <>
    <b className="fd1-spoken-line"><ReadingText text={line} language={language}/></b>
    <span className="fd1-translation"><ReadingText text={line} language={other}/></span>
  </>;
}

function CompletedLine({ line, language, speaker = "Rafael" }: { line: Bilingual; language: Language; speaker?: string }) {
  return <div className="fd2-completed-line">
    <strong>{speaker}</strong>
    <SpokenLine line={line} language={language}/>
  </div>;
}

type Props = {
  page: PartTwoPage;
  portrait: boolean;
  readingLanguage: Language;
  count: number;
  onPlace: (count: number) => void;
  attempt: ChallengeAttempt;
  onAttempt: (attempt: ChallengeAttempt) => void;
  cue: (sound: LessonSoundCue) => void;
};

function ComicActionMoment({ page, count, onPlace, cue, portrait, readingLanguage }: Omit<Props, "page" | "attempt" | "onAttempt"> & {
  page: Extract<PartTwoPage, { kind: "Ação" }>;
}) {
  const [mistake, setMistake] = useState(false);
  const lookup = useContext(MeaningContext);
  const done = count === page.words.length;
  const placed = page.words.slice(0, count).map((_, index) => index);
  const request = Boolean(page.prefix);
  const art = done ? page.after : page.before;
  const placement = art.placement ?? (page.part !== 2 ? unanchored
    : request ? (done ? placements.show : placements.request) : (done ? placements.agreement : placements.reaction));
  const speaker = page.reply.speaker ?? "Ana";
  const fullLine = { en: [page.prefix?.en, ...page.words].filter(Boolean).join(" "), pt: page.translations[page.words.length] };
  const guidance = <p className="fd1-guidance" aria-live="polite">
    {mistake ? "Tente a palavra destacada." : "Leve a palavra destacada até o balão."}
  </p>;
  function place(index: number) {
    if (done) return;
    lookup("");
    if (index !== count) {
      setMistake(true);
      cue("retry");
      return;
    }
    setMistake(false);
    onPlace(count + 1);
    cue(count + 1 === page.words.length ? "success" : "place");
  }

  return <LessonDragProvider onDrop={item => place(Number(item.value))}>
    <section className="fd1-story fd2-story" data-kind="guided" data-complete={done} aria-label={page.title}>
      <StoryPanel page={{ id: page.id, ...art }} portrait={portrait} placement={placement} expanded={count > 0}
        variant={done ? "dialogue" : "exercise"}>
        {done ? <div className="fd1-bubble-body fd2-reply-balloon" role="status" aria-label={`Resposta de ${speaker}`}>
          <small>{speaker}</small><SpokenLine line={page.reply} language={readingLanguage}/>
        </div> : <Assembly words={page.words} placed={placed} slots={page.words.length} prefix={page.prefix?.en} translation={page.translations[count]}/>}
      </StoryPanel>
      {done ? <div className="fd1-story-strip fd2-reply"><CompletedLine line={fullLine} language={readingLanguage}/></div>
        : <div className="fd1-story-strip fd1-guided-controls">
          {page.aside ? <div className="fd2-guided-context">
            <div><strong>{page.aside.speaker}</strong>{" "}<ReadingText text={page.aside} language={readingLanguage}/></div>
            {guidance}
          </div> : guidance}
          <WordTray words={page.words} order={page.order} placed={placed} next={count}/>
        </div>}
    </section>
  </LessonDragProvider>;
}

function ComicStrip({ page, readingLanguage }: Pick<Props, "readingLanguage"> & { page: Extract<PartTwoPage, { kind: "Tirinha" }> }) {
  return <section className="fd-examples fd1-strip fd2-study" aria-label={page.title}>
    {page.panels.map(panel => <figure key={panel.line.en} className="fd1-study-panel">
      <StudyArt {...panel.art}/>
      <figcaption>
        <span className="fd1-study-label"><ReadingText text={panel.context} language={readingLanguage}/></span>
        <StudyCaption translation={panel.line.pt}><EnglishWords text={panel.line.en}/></StudyCaption>
      </figcaption>
    </figure>)}
  </section>;
}

const ruleTones = ["can", "person", "verb", "context"] as const;

function ComicRule({ page, readingLanguage }: Pick<Props, "readingLanguage"> & { page: Extract<PartTwoPage, { kind: "Explicação" }> }) {
  return <section className="fd-rule fd1-rule fd2-study fd2-rule" aria-label={page.title}>
    <ul className="fd1-rule-formula fd2-formula" aria-label="Partes da frase">
      {page.pieces.map((piece, index) => <Fragment key={piece.token}>
        {index > 0 && <li className="fd1-rule-plus" aria-hidden="true">+</li>}
        <li className="fd1-rule-piece" data-tone={ruleTones[index]}>
          <b lang="en"><EnglishWords text={piece.token}/></b>
          <span><ReadingText text={piece.meaning} language={readingLanguage}/></span>
        </li>
      </Fragment>)}
    </ul>
    <ol className="fd1-rule-examples fd2-rule-examples" aria-label="Exemplos da regra">
      {page.examples.map(example => {
        const tokens = example.tokens ?? example.line.en.split(" ").map((text, piece) => ({ text, piece }));
        return <li key={example.line.en} className="fd1-study-panel">
          <StudyArt {...example.art}/>
          <StudyCaption translation={example.line.pt}>
            {tokens.map(({ text, piece }, index) => <Fragment key={index}>
              {index > 0 && " "}
              {piece === undefined ? <EnglishWords text={text}/>
                : <strong data-tone={ruleTones[piece]}><EnglishWords text={text}/></strong>}
            </Fragment>)}
          </StudyCaption>
          <p className="fd2-rule-note"><ReadingText text={example.explanation} language={readingLanguage}/></p>
        </li>;
      })}
    </ol>
  </section>;
}

function ChallengeActions({ placed, full, onEdit, onCheck, showEditing = true }: {
  placed: readonly number[]; full: boolean; onEdit: (words: readonly number[]) => void; onCheck: () => void; showEditing?: boolean;
}) {
  const { cancel } = useLessonDrag();
  return <div className="fd1-check-actions fd2-check-actions">
    {showEditing && <>
      <button type="button" onClick={() => { cancel(); onEdit(placed.slice(0, -1)); }} disabled={!placed.length}>Desfazer</button>
      <button type="button" onClick={() => { cancel(); onEdit([]); }} disabled={!placed.length}>Limpar</button>
    </>}
    <button type="button" onClick={() => { cancel(); onCheck(); }} disabled={!full}>Conferir</button>
  </div>;
}

type ComicChallengeProps<Page> = Omit<Props, "page" | "count" | "onPlace"> & {
  page: Page;
};
type RequestPage = Extract<PartTwoPage, { kind: "Desafio"; partialRequest: object }>;
type TwoRoundPage = Extract<PartTwoPage, { kind: "Desafio"; partialRequest?: undefined }>;

function PartialRequest({ page, attempt, onAttempt, cue, portrait, readingLanguage }: ComicChallengeProps<RequestPage>) {
  const request = page.partialRequest;
  const round = page.rounds[0];
  const { placed, result } = attempt;
  const solved = result === "correct";
  const full = placed.length === round.solution.length;
  const [showHint, setShowHint] = useState(false);
  const lookup = useContext(MeaningContext);
  const art = solved ? request.revealArt : round.art;
  const [start, verb, end] = request.fixed;
  const [subject, article] = round.solution.map(index => round.bank[index]);
  const line = {
    en: `${start} ${subject} ${verb} ${article} ${end}`,
    pt: round.translation,
  };
  const feedback = showHint ? request.answerHint
    : result === "incorrect" ? round.retryHint
    : { en: "Fill the two boxes.", pt: "Complete os dois quadradinhos." };

  function edit(next: readonly number[]) {
    lookup("");
    setShowHint(false);
    onAttempt({ round: 0, placed: next });
  }

  function place(index: number, slot: number) {
    if (solved || slot > placed.length || placed[slot] === index) return;
    const at = placed.indexOf(index);
    if (at !== -1 && slot === placed.length) return;
    const next = [...placed];
    if (at !== -1) next[at] = next[slot];
    next[slot] = index;
    edit(next);
    cue("place");
  }

  function check() {
    if (!full || solved) return;
    const correct = placed.every((index, slot) => index === round.solution[slot]);
    onAttempt({ round: 0, placed, result: correct ? "correct" : "incorrect" });
    cue(correct ? "success" : "retry");
  }

  return <LessonDragProvider onDrop={(item, target) => place(Number(item.value), Number(target))}>
    <section className="fd1-story fd2-story fd2-challenge fd2-partial-request" data-kind="challenge"
      data-complete={solved} aria-label="Pedido para virar a página">
      <StoryPanel page={{ id: page.id, ...art }} portrait={portrait} placement={art.placement ?? (solved ? placements.reveal : placements.challenge)}
        expanded={solved} variant={solved ? "dialogue" : "exercise"}>
        {solved ? <div className="fd1-bubble-body fd2-reply-balloon">
          <small>Rafael</small><SpokenLine line={request.closing} language={readingLanguage}/>
        </div> : <div className="fd1-bubble-body fd2-request-bubble" role="group" aria-label="Balão de Rafael">
          <div className="fd2-request-sentence" lang="en">
            {round.solution.map((_, slot) => <Fragment key={slot}>
              <b>{request.fixed[slot]}</b>
              <DropTarget id={String(slot)} accept={["word"]}
                className="fd2-request-slot" disabled={slot > placed.length}
                label={`Quadradinho ${slot + 1}${placed[slot] === undefined ? "" : `: ${round.bank[placed[slot]]}`}`}>
                {placed[slot] === undefined ? null : round.bank[placed[slot]]}
              </DropTarget>
            </Fragment>)}
            <b>{end}</b>
          </div>
        </div>}
      </StoryPanel>
      {solved ? <div className="fd1-story-strip fd2-reply fd2-request-solved" role="status">
        <CompletedLine line={line} language={readingLanguage}/>
        <CompletedLine line={request.reply} language={readingLanguage} speaker="Ana"/>
        <strong>Você completou o diálogo!</strong>
      </div> : <div className="fd1-story-strip fd2-challenge-controls">
        <div className="fd2-instruction">
          <p className="fd2-question"><ReadingText text={round.instruction} language={readingLanguage}/></p>
          <p className="fd2-request-glossary">{request.glossary[readingLanguage === "en" ? "en" : "pt"]}</p>
          <p className="fd2-instruction-help" data-result={result} aria-live="polite" lang={readingLanguage}>
            {readingLanguage === "en" ? feedback.en : feedback.pt}
          </p>
          {result === "incorrect" && !showHint && <button type="button" className="fd2-request-hint"
            onClick={() => setShowHint(true)}>Mais uma dica</button>}
        </div>
        <WordTray words={round.bank} order={round.bank.map((_, index) => index)} placed={placed} reusable
          next={showHint ? round.solution[0] : undefined}/>
        <ChallengeActions placed={placed} full={full} onEdit={edit} onCheck={check} showEditing={false}/>
      </div>}
    </section>
  </LessonDragProvider>;
}

function ComicChallenge({ page, attempt, onAttempt, cue, portrait, readingLanguage }: ComicChallengeProps<TwoRoundPage>) {
  const roundIndex = attempt.round ?? 0;
  const round = page.rounds[roundIndex] ?? page.rounds[0];
  const { placed, result } = attempt;
  const full = placed.length === round.solution.length;
  const solved = result === "correct" && roundIndex === 1;
  const requestRound = page.rounds[0];
  const requestLine = { en: requestRound.solution.map(i => requestRound.bank[i]).join(" "), pt: requestRound.translation };
  const directions = round.choice
    ? { en: "Choose one option, then press Conferir.", pt: "Escolha uma opção e toque em Conferir." }
    : { en: `Use ${round.solution.length} words. Select a word, then the bubble.`,
        pt: `Use ${round.solution.length} palavras. Selecione uma e depois o balão.` };
  const help = result === "incorrect" ? round.retryHint : directions;
  const placement = round.art.placement ?? unanchored;
  const lookup = useContext(MeaningContext);
  function place(index: number) {
    if (full || placed.includes(index)) return;
    lookup("");
    onAttempt({ round: roundIndex, placed: [...placed, index] });
    cue("place");
  }
  function edit(next: readonly number[]) {
    lookup("");
    onAttempt({ round: roundIndex, placed: next });
  }
  function check() {
    if (!full || solved) return;
    if (placed.every((index, slot) => index === round.solution[slot])) {
      onAttempt(roundIndex === 0 ? { round: 1, placed: [] } : { round: 1, placed, result: "correct" });
      cue("success");
    } else {
      onAttempt({ round: roundIndex, placed, result: "incorrect" });
      cue("retry");
    }
  }

  return <LessonDragProvider key={roundIndex} onDrop={item => place(Number(item.value))}>
    <section className="fd1-story fd2-story fd2-challenge" data-kind="challenge" data-complete={solved} data-round={roundIndex + 1} aria-label="Desafio em dois turnos">
      <StoryPanel page={{ id: page.id, ...round.art }} portrait={portrait} placement={placement}
        expanded={placed.length > 0} variant={solved ? "dialogue" : "exercise"}>
        {solved ? <div className="fd1-bubble-body fd2-reply-balloon" role="status">
          <small>{round.speaker ?? (round.choice ? "Resposta" : "Rafael")}</small>
          <SpokenLine line={{ en: placed.map(i => round.bank[i]).join(" "), pt: round.translation }} language={readingLanguage}/>
        </div> : round.choice ? <div className="fd1-bubble-body fd2-choice-preview">
          <span className="fd1-slots" lang="en">{placed.length ? <b>{round.bank[placed[0]]}</b> : <i aria-hidden="true"/>}</span>
        </div> : <Assembly words={round.bank} placed={placed} slots={round.solution.length} speaker={round.speaker}/>}
      </StoryPanel>
      {solved ? <div className="fd1-story-strip fd2-reply fd2-solved" role="status">
        <CompletedLine line={requestLine} language={readingLanguage} speaker={requestRound.speaker ?? (requestRound.choice ? "Resposta" : "Rafael")}/>
        <strong>{round.choice ? "Você completou o desafio!" : "Você completou o diálogo!"}</strong>
      </div> : <div className="fd1-story-strip fd2-challenge-controls">
        <div className="fd2-instruction" aria-live="polite" aria-atomic="true">
          <strong>{roundIndex + 1} / {page.rounds.length} · <ReadingText text={round.label} language={readingLanguage}/></strong>
          <p className="fd2-question"><ReadingText text={round.instruction} language={readingLanguage}/></p>
          <p className="fd2-instruction-help" data-result={result} lang={readingLanguage}>
            {readingLanguage === "en" ? help.en : help.pt}
          </p>
        </div>
        {round.choice ? <div className="fd1-words fd2-tray" role="group" aria-label="Escolhas do desafio" lang="en">
          {round.bank.map((choice, index) => <button type="button" key={choice} className="fd1-word"
            aria-pressed={placed[0] === index} onClick={() => edit([index])}>{choice}</button>)}
        </div> : <WordTray words={round.bank} order={round.bank.map((_, i) => i)} placed={placed}/>}
        <ChallengeActions placed={placed} full={full} onCheck={check} onEdit={edit} showEditing={!round.choice}/>
      </div>}
    </section>
  </LessonDragProvider>;
}

export function PartTwoMoment(props: Props) {
  const { page, readingLanguage } = props;
  switch (page.kind) {
    case "Ação": return <ComicActionMoment {...props} page={page}/>;
    case "Tirinha": return <ComicStrip page={page} readingLanguage={readingLanguage}/>;
    case "Explicação": return <ComicRule page={page} readingLanguage={readingLanguage}/>;
    case "Desafio": return page.partialRequest ? <PartialRequest {...props} page={page}/> : <ComicChallenge {...props} page={page}/>;
  }
}
