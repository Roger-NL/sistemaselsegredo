"use client";

import { SpeechText } from "./SpeechText";

import { useLessonStorage } from "./lesson-storage";
import type { LessonCompletionReceipt } from "./useLessonAccountProgress";

import { LessonButton } from "./LessonButton";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Eraser } from "lucide-react";
import { useLessonSounds } from "./useLessonSounds";
import { LessonJourney } from "./LessonJourney";
import { LessonStepTransition } from "./LessonStepTransition";
import { IntroductionStage } from "./IntroductionStage";
import { useLessonAudio } from "./useLessonAudio";
import { LESSON_INTRODUCTION_SCENES } from "./lesson-introduction";
import { createRevisionAudioController, REVISION_NARRATIONS } from "./lesson-revision-audio";
import { RecordedSpeechButton } from "./RecordedSpeechButton";
import type { PersonId } from "./lesson-one";
import { TRANSFER_QUESTIONS, getConclusionQuestions, CONCLUSION_THEORY, LESSON_CONCLUSION_STORAGE, createConclusionState, evaluateConclusionAnswer,
  getConclusionAttempt, isConclusionComplete, restoreConclusionState, setConclusionDraft, submitConclusionAnswer } from "./lesson-conclusion";
import "./lesson-conclusion.css";

export type LessonCompletionProps = {
  verify: () => Promise<LessonCompletionReceipt>; leave: (href: "/dashboard" | "/comecar?modo=entrar") => void;
  account: boolean; version: number; saving: boolean; error: string;
};
export type LessonConclusionProps = {
  section?: "teoria" | "teste" | "extras";
  exitLabel?: string;
  onReturnToPractice: () => void;
  /** Kept compatible with saved visits; the completion screen does not offer a reset. */
  onRestartPractice?: () => void;
  completion?: LessonCompletionProps;
};

const RECAP_MODELS = [
  ...LESSON_INTRODUCTION_SCENES.flatMap(scene => scene.models.map((model, modelIndex) => ({ ...model, scene, modelIndex }))),
  ...CONCLUSION_THEORY.flatMap(page => [
    ...(page.id === "forms" ? [] : [{ text: page.english, translation: page.portuguese }]),
    { text: page.example, translation: page.translation },
  ]).map(model => ({ ...model, speaker: "nina" as const, scene: LESSON_INTRODUCTION_SCENES[2], modelIndex: null })),
  ...[
    ["They are friends.", "Eles são amigos."], ["We are here.", "Estamos aqui."],
    ["You're ready.", "Você está pronto ou pronta."],
  ].map(([text, translation]) => ({ text, translation, speaker: "nina" as const, scene: LESSON_INTRODUCTION_SCENES[2], modelIndex: null })),
];

function CompletionRecap({ disabled, onPractice }: { disabled: boolean; onPractice: () => void }) {
  const audio = useLessonAudio("lesson-completion", createRevisionAudioController);
  const { request, stop } = audio;
  const [index, setIndex] = useState<number | null>(null);
  const [ninaReady, setNinaReady] = useState(false);
  const recapPosition = useRef<HTMLSpanElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const restoreReviewFocus = useRef(false);
  useEffect(() => {
    if (index !== null) recapPosition.current?.focus({ preventScroll: true });
    else if (restoreReviewFocus.current) reviewButton.current?.focus({ preventScroll: true });
  }, [index]);
  const item = index === null ? null : RECAP_MODELS[index];
  const characterReady = useCallback((person: PersonId) => { if (person === "nina") setNinaReady(true); }, []);
  const touched = useRef(false);
  useEffect(() => {
    let live = true;
    if (ninaReady && !disabled && !touched.current) queueMicrotask(() => {
      if (live && !touched.current && !document.hidden) {
        touched.current = true;
        void request("nina", REVISION_NARRATIONS.completion.text, { role: "character", autoplay: true });
      }
    });
    return () => { live = false; };
  }, [ninaReady, disabled, request]);
  useEffect(() => { if (disabled) stop(); }, [disabled, stop]);

  function select(next: number | null) {
    touched.current = true;
    stop();
    restoreReviewFocus.current = true;
    setIndex(next);
    if (next === null) return;
    const model = RECAP_MODELS[next];
    if (audio.has(model.speaker, model.text)) void request(model.speaker, model.text, { role: "character" });
  }
  return <div className={item ? "lc-recap" : "lc-achievement"}>
    <div className="lc-completion-stage"><IntroductionStage scene={item?.scene ?? LESSON_INTRODUCTION_SCENES[2]}
      modelIndex={item?.modelIndex ?? null} speech={audio.speech} onCharacterReady={characterReady} guideLabel="Nina acompanha a conclusão da aula."/></div>
    {item && index !== null ? <div className="lc-completion-copy">
      <span className="lc-recap-position" ref={recapPosition} tabIndex={-1}>Fala {index + 1} de {RECAP_MODELS.length}</span>
      <strong className="lc-recap-english" lang="en"><SpeechText onPlay={() => void request(item.speaker, item.text, { role: "character" })}>{item.text}</SpeechText></strong>
      <p className="lc-recap-translation"><SpeechText onPlay={() => void request("nina", item.translation, { role: "narration" })}>{item.translation}</SpeechText></p>
      <div className="lc-recap-controls">
        <RecordedSpeechButton audio={audio} person={item.speaker} text={item.text} lang="en" role="character" label="Repetir fala"/>
        <RecordedSpeechButton audio={audio} person="nina" text={item.translation} lang="pt" label="Ouvir significado"/>
        <button type="button" disabled={!index} onClick={() => select(index - 1)}>Voltar</button>
        {index + 1 < RECAP_MODELS.length && <button type="button" onClick={() => select(index + 1)}>Avançar</button>}
        <button type="button" onClick={() => select(null)}>Encerrar revisão</button>
      </div>
    </div> : <div className="lc-completion-copy">
      <h2>Parabéns! Você chegou até aqui.</h2>
      <p>Você praticou como se apresentar, perguntar se alguém está pronto e falar sobre uma amizade ou equipe.</p>
      <p>Quer relembrar essas falas?</p>
      <div className="lc-completion-actions"><button type="button" ref={reviewButton} disabled={disabled} onClick={() => select(0)}>Rever as falas</button>
        <button type="button" disabled={disabled} onClick={onPractice}>Praticar mais</button></div>
    </div>}
    {audio.blocked && <button type="button" onClick={() => void audio.unlock()}>Ativar som</button>}
    {audio.error && <p role="status">A fala não carregou. Toque para tentar novamente.</p>}
  </div>;
}

function Highlight({ text }: { text: string }) {
  const terms = /\b(Ana|Leo|Maya|Sam|Nina|ready|friends|here|team|pronta|pronto|equipe|amigos|aqui|vocês|nome)\b/gi;
  return <>{text.split(terms).map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</>;
}

/** Written theory and checks, followed by a completion that preserves the learner's work. */
export function LessonConclusion({ onReturnToPractice, completion, section, exitLabel }: LessonConclusionProps) {
  const lessonStorage = useLessonStorage();
  const [state, setState] = useState(() => {
    const initial = createConclusionState();
    if (section && section !== "teoria") initial.phase = "test";
    return initial;
  });
  const [extraOpen, setExtraOpen] = useState(false);
  const sectionAudio = useLessonAudio(`${extraOpen}:${state.phase}:${state.theoryIndex}:${state.theoryBlock}:${state.questionIndex}`, createRevisionAudioController);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionFailure, setCompletionFailure] = useState("");
  const [confirmation, setConfirmation] = useState<{ receipt: LessonCompletionReceipt; version: number } | null>(null);
  const receipt = confirmation && confirmation.version === completion?.version ? confirmation.receipt : null;
  const verification = useRef({ attempt: 0 });
  const completionLock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const writing = useRef<HTMLInputElement>(null);
  const sounds = useLessonSounds();
  const exampleBlock = state.theoryBlock === 1;
  const page = CONCLUSION_THEORY[state.theoryIndex];
  const questions = section === "extras" ? TRANSFER_QUESTIONS : getConclusionQuestions(state);
  const question = questions[state.questionIndex];
  const testSound = useRef<{ visit: number; last?: Promise<void> }>({ visit: 0 });
  const [readingLock, setReadingLock] = useState<Promise<void>>();
  const readingLocked = !sounds.muted && Boolean(readingLock);
  useLayoutEffect(() => {
    const sequence = testSound.current;
    return () => { sequence.visit++; sequence.last = undefined; };
  }, [question.id, state.phase, extraOpen]);
  const allChoicesRecorded = question.choices?.every(choice => sectionAudio.has("nina", choice));
  function spoken(text: string) {
    return <SpeechText onPlay={() => void sectionAudio.request("nina", text, { role: "narration" })}>{text}</SpeechText>;
  }
  const choiceRequest = useRef(0);
  function hearChoice(choice: string) {
    const ticket = ++choiceRequest.current;
    const visit = testSound.current.visit;
    const play = () => {
      if (ticket === choiceRequest.current && visit === testSound.current.visit) {
        void sectionAudio.request("nina", choice, { role: "narration" });
      }
    };
    if (readingLocked && readingLock) void readingLock.then(play);
    else play();
  }
  const attempt = getConclusionAttempt(state, question);
  const evaluation = attempt.lastAnswer === null ? null : evaluateConclusionAnswer(question, attempt.lastAnswer);
  const complete = isConclusionComplete(state);
  const completedQuestions = questions.filter(item => {
    const answer = state.attempts[item.id]?.lastAnswer;
    return answer != null && evaluateConclusionAnswer(item, answer).correct;
  }).length;

  useEffect(() => {
    let active = true;
    if (section) {
      queueMicrotask(() => { if (active) setReady(true); });
      return () => { active = false; };
    }
    let raw: string | null = null;
    let unavailable = false;
    try { raw = lessonStorage.getItem(LESSON_CONCLUSION_STORAGE); } catch { unavailable = true; }
    queueMicrotask(() => {
      if (!active) return;
      setState(restoreConclusionState(raw)); setStorageUnavailable(unavailable); setReady(true);
    });
    return () => { active = false; };
  }, [lessonStorage, section]);
  useEffect(() => {
    if (!ready || section) return;
    try { lessonStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify(state)); } catch { /* The review still works in memory. */ }
  }, [ready, state, lessonStorage, section]);
  useEffect(() => { if (ready && !extraOpen) heading.current?.focus({ preventScroll: true }); }, [ready, extraOpen, state.phase, state.theoryIndex, state.theoryBlock, state.questionIndex]);
  const verify = completion?.verify, version = completion?.version;
  useEffect(() => {
    if (!ready || state.phase !== "summary" || !verify || version === undefined) return;
    const tracker = verification.current;
    const ticket = ++tracker.attempt;
    // Run after the summary has been staged, including on a restored visit.
    void Promise.resolve().then(async () => {
      if (ticket !== tracker.attempt) return;
      setConfirmation(null); setCompletionFailure(""); setCompletionPending(false); completionLock.current = false;
      try {
        const checked = await verify();
        if (ticket === tracker.attempt) setConfirmation({ receipt: checked, version });
      } catch {
        if (ticket === tracker.attempt) setCompletionFailure("Não foi possível confirmar seu avanço. Confira a conexão e tente novamente.");
      }
    });
    return () => { tracker.attempt++; };
  }, [ready, state.phase, verify, version]);

  async function finishLesson() {
    if (completionLock.current || completion?.saving || !completion?.verify) return;
    const previous = completion.error || completionFailure ? null : receipt;
    const tracker = verification.current;
    const ticket = ++tracker.attempt;
    completionLock.current = true; setCompletionPending(true); setCompletionFailure("");
    sounds.play("advance");
    try {
      const checked = await completion.verify();
      if (ticket !== tracker.attempt) return;
      setConfirmation({ receipt: checked, version: completion.version });
      if (previous === checked) completion.leave(checked === "account" ? "/dashboard" : "/comecar?modo=entrar");
    } catch {
      if (ticket === tracker.attempt) { setConfirmation(null); setCompletionFailure("Não foi possível confirmar seu avanço. Confira a conexão e tente novamente."); }
    } finally {
      if (ticket === tracker.attempt) { completionLock.current = false; setCompletionPending(false); }
    }
  }
  const completionError = completionFailure || completion?.error;
  const completionBusy = completionPending || completion?.saving || (!receipt && !completionError);
  const completionMessage = completionPending ? "Confirmando seu avanço…" : completionError || (completionBusy ? "Confirmando seu avanço…"
    : receipt === "account" ? "49 de 49 etapas salvas na sua conta."
    : receipt === "guest-local" ? "Avanço salvo neste navegador. No painel, você pode levá-lo para uma conta sem progresso."
    : "Seu progresso está apenas nesta sessão. Ao sair, você poderá perdê-lo.");

  function goTheory(index: number, theoryBlock: 0 | 1) { sounds.play("advance"); setState(current => ({ ...current, phase: "theory", theoryIndex: index, theoryBlock })); }
  function nextTheory() {
    sounds.play("advance");
    if (section && exampleBlock && state.theoryIndex === CONCLUSION_THEORY.length - 1) { onReturnToPractice(); return; }
    if (!exampleBlock) { setState(current => ({ ...current, theoryBlock: 1 })); return; }
    setState(current => current.theoryIndex < CONCLUSION_THEORY.length - 1
      ? { ...current, theoryIndex: current.theoryIndex + 1, theoryBlock: 0 }
      : { ...current, phase: isConclusionComplete(current) ? "summary" : "test", testStarted: true });
  }
  function nextQuestion() {
    if (!evaluation?.correct) return;
    sounds.play("advance");
    setState(current => current.questionIndex === questions.length - 1
      ? { ...current, phase: "summary" } : { ...current, questionIndex: current.questionIndex + 1 });
  }
  function check(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (evaluation?.correct) { nextQuestion(); return; }
    if (!attempt.draft.trim()) return;
    writing.current?.blur();
    if (!sounds.muted) {
      const cue = evaluateConclusionAnswer(question, attempt.draft).correct ? "success" : "retry";
      const sequence = testSound.current;
      const visit = sequence.visit;
      const reading = sequence.last ?? readingLock ?? sectionAudio.whenIdle();
      // Unlock on the submit gesture even when the spoken option has yet to finish.
      if (reading) void sounds.unlock();
      const until = reading ? reading.then(() => visit === sequence.visit ? sounds.play(cue) : undefined) : sounds.play(cue);
      if (until) {
        sequence.last = until;
        setReadingLock(until);
        void until.then(() => {
          if (sequence.last === until) sequence.last = undefined;
          setReadingLock(current => current === until ? undefined : current);
        });
      }
    }
    setState(current => submitConclusionAnswer(current, question));
  }
  function retake() {
    sounds.play("advance");
    setState({ ...createConclusionState(), phase: "test", testStarted: true });
  }
  function previous() {
    if (state.phase === "theory") {
      if (exampleBlock) goTheory(state.theoryIndex, 0);
      else if (state.theoryIndex > 0) goTheory(state.theoryIndex - 1, 1);
      else onReturnToPractice();
    } else if (state.phase === "test") {
      if (section && state.questionIndex === 0) { onReturnToPractice(); return; }
      sounds.play("advance");
      setState(current => current.questionIndex > 0 ? { ...current, questionIndex: current.questionIndex - 1 }
        : { ...current, phase: "theory", theoryIndex: CONCLUSION_THEORY.length - 1, theoryBlock: 1 });
    }
  }

  if (extraOpen) return <LessonConclusion section="extras" exitLabel={section ? "Voltar ao teste" : "Voltar à conquista"} onReturnToPractice={() => setExtraOpen(false)}/>;

  return <>
    <main className="lo-main lc-main" id="lesson-main" data-conclusion-phase={state.phase} data-theory-block={state.phase === "theory" ? Number(exampleBlock) : undefined} data-conclusion-index={state.phase === "theory" ? state.theoryIndex : state.questionIndex} aria-busy={!ready}>
      <LessonStepTransition stepKey={state.phase === "theory" ? `theory:${state.theoryIndex}:${Number(exampleBlock)}` : `${state.phase}:${state.questionIndex}`} className="lc-content">
      <div className={`lc-heading ${state.phase === "test" ? "is-test" : ""}`}>
        <div className="lc-heading-copy"><div className="lc-heading-topline">{section ? <span>{section === "teoria" ? `Teoria · ${state.theoryIndex + 1}/5` : `Treino · ${state.questionIndex + 1}/${questions.length}`}</span> : <LessonJourney stage={state.phase === "theory" ? "theory" : "test"}
          completed={state.phase === "theory" ? state.theoryIndex : state.phase === "summary" ? 6 : completedQuestions}
          label={state.phase === "test" ? `Teste ${state.questionIndex + 1}/${questions.length}` : undefined}/>}
          {exitLabel && <button type="button" className="lc-review-exit" onClick={onReturnToPractice}>{exitLabel}</button>}
          {section === "teste" && state.phase === "test" && <button type="button" disabled={!ready} onClick={() => setExtraOpen(true)}>Praticar mais</button>}
          {state.phase === "test" && <button type="button" className="lc-test-restart" aria-label="Recomeçar teste do zero" disabled={!ready} onClick={retake}><RotateCcw size={15} aria-hidden="true"/><span className="lc-restart-full">Recomeçar teste do zero</span><span className="lc-restart-short" aria-hidden="true">Zerar teste</span></button>}</div>
          <h1 id="lesson-title" ref={heading} tabIndex={-1}>{state.phase === "theory" ? page.title : state.phase === "test" ? <Highlight text={question.prompt}/> : section ? "Treino concluído!" : "Aula 1 concluída!"}</h1></div>
        {state.phase !== "summary" && <div className="lc-page-dots" aria-hidden="true">{Array.from({ length: state.phase === "theory" ? 5 : questions.length }, (_, index) =>
          <span key={index} className={state.phase === "summary" || index < (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-done"
            : index === (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-current" : ""} />)}</div>}
      </div>

      {!ready ? <section className="lc-card lc-loading"><p>Preparando sua revisão…</p></section> : state.phase === "theory" ? <section className={`lc-card lc-theory ${page.id === "forms" ? "lc-rule-page" : ""}`} aria-label="Explicação bilíngue">
        <div className="lc-relation">
          {page.id === "forms" && !exampleBlock ? <div className="lc-forms" aria-label="I am. You are. We are. They are.">
            {page.english.split(" · ").map(form => {
              const [pronoun, verb] = form.split(" ");
              return <span key={form} lang="en"><SpeechText onPlay={() => void sectionAudio.request("nina", form)}>{pronoun} <strong>{verb}</strong></SpeechText>
                <RecordedSpeechButton audio={sectionAudio} person="nina" text={form} lang="en"/></span>;
            })}
          </div> : <><strong className="lc-english" lang="en">{spoken(exampleBlock ? page.example : page.english)}</strong><span className="lc-portuguese">{spoken(exampleBlock ? page.translation : page.portuguese)}</span></>}
        {(page.id !== "forms" || exampleBlock) && <RecordedSpeechButton audio={sectionAudio} person="nina" text={exampleBlock ? page.example : page.english} lang="en" disabled={readingLocked}/>}
        <RecordedSpeechButton audio={sectionAudio} person="nina" text={exampleBlock ? page.translation : page.portuguese} lang="pt" disabled={readingLocked}/>
        </div>
        <div className="lc-explanation"><p>{spoken(exampleBlock ? page.note : page.explanationPT)}</p><RecordedSpeechButton audio={sectionAudio} person="nina" text={exampleBlock ? page.note : page.explanationPT} lang="pt" disabled={readingLocked}/></div>
      </section> : state.phase === "test" ? <form id="lc-answer-form" className={`lc-card lc-test ${question.kind === "writing" ? "lc-writing-test" : ""}`} onSubmit={check}>
        <div className="lc-question-context"><span>Situação</span><p><Highlight text={question.context}/></p></div>
        <div className="lc-answer-area">
          {question.kind === "choice" ? <fieldset className="lc-choices"><legend className="lc-visually-hidden">Escolha a fala</legend>
            {question.choices?.map(choice => <div key={choice} className="lc-choice-row"><label className={`lc-choice ${attempt.draft === choice ? "is-selected" : ""}`}>
              <input type="radio" name={question.id} value={choice} checked={attempt.draft === choice}
                onClick={() => hearChoice(choice)}
                onChange={() => setState(current => setConclusionDraft(current, question, choice))} />
              <span lang="en"><Highlight text={choice}/></span><span className="lc-choice-check" aria-hidden="true"/>
            </label>{(allChoicesRecorded || evaluation?.correct) && <RecordedSpeechButton audio={sectionAudio} person="nina" text={choice} lang="en" disabled={readingLocked}/>}</div>)}
          </fieldset> : <div className="lc-writing"><label htmlFor="lc-written-answer">Sua frase em inglês</label>
            <div className="lc-input-row"><input ref={writing} enterKeyHint="done" id="lc-written-answer" type="text" value={attempt.draft} maxLength={120} autoComplete="off" autoCapitalize="off" spellCheck={false}
              placeholder="Escreva aqui…" onChange={event => { const draft = event.currentTarget.value; setState(current => setConclusionDraft(current, question, draft)); }} />
              <button type="button" className="lc-clear" disabled={!attempt.draft} aria-label="Apagar resposta" onClick={() => {
                setState(current => setConclusionDraft(current, question, "")); writing.current?.focus({ preventScroll: true });
              }}><Eraser size={18} aria-hidden="true"/><span>Apagar</span></button></div>
            <p className="lc-writing-note">Maiúsculas e ponto final não tiram acerto.</p>
          </div>}
        </div>
        <div className={`lc-feedback ${evaluation ? evaluation.correct ? "is-correct" : "is-retry" : ""}`} role="status" aria-live="polite" aria-atomic="true">
          {evaluation ? <><strong>{evaluation.feedbackTitle}</strong>
            <p>{spoken(evaluation.explanationPT)}</p><RecordedSpeechButton audio={sectionAudio} person="nina" text={evaluation.explanationPT} lang="pt" disabled={readingLocked}/><p lang="en" className="lc-feedback-en">{spoken(evaluation.explanationEN)}</p><RecordedSpeechButton audio={sectionAudio} person="nina" text={evaluation.explanationEN} lang="en" disabled={readingLocked}/>
            {evaluation.correct && evaluation.notes.map(note => <p key={note}>{note}</p>)}
          </> : <p>{question.kind === "choice" ? "Escolha uma fala" : "Escreva sua resposta"} e toque em <strong>Conferir</strong>.</p>}
        </div>
      </form> : <section className="lc-card lc-completion" aria-label="Aula concluída">
        {section ? <div className="lc-completion-copy"><h2>Você terminou este treino.</h2>
          {section !== "extras" && <button type="button" onClick={() => setExtraOpen(true)}>Praticar mais</button>}
          </div> : <CompletionRecap disabled={completionPending} onPractice={() => setExtraOpen(true)}/>}
      </section>}
      </LessonStepTransition>
      {storageUnavailable && <p className="lc-storage-note" role="status">A revisão funciona aqui, mas este navegador não permitiu guardar seu progresso.</p>}
    </main>
    <footer className="lo-footer lc-footer">
      {section && state.phase === "summary" ? <LessonButton onClick={onReturnToPractice}>Sair do treino</LessonButton> : state.phase === "summary" ? <><p id="lc-completion-status" className="lc-completion-save" role={completionError ? "alert" : "status"}>{completionMessage}</p>
        <LessonButton type="button" className="lc-next lc-complete" disabled={!ready || !!completionBusy || !verify} aria-busy={!!completionBusy} aria-describedby="lc-completion-status" onClick={() => void finishLesson()}>
          {completionError ? "Tentar confirmar novamente" : completion?.account ? "Voltar ao meu painel" : "Entrar ou criar conta"}<ArrowRight size={19} aria-hidden="true"/></LessonButton></>
        : <><button type="button" className="lc-back" onClick={previous} disabled={!ready}><ArrowLeft size={19} aria-hidden="true"/>Voltar</button>
          <span className="lc-footer-note">{section ? "Prática livre." : state.phase === "test" ? "A primeira resposta fica registrada. Você pode corrigir depois." : "Leia no seu ritmo."}</span>
          {state.phase === "theory" ? <LessonButton type="button" className="lc-next" disabled={!ready} onClick={nextTheory}>
            {!exampleBlock || state.theoryIndex < CONCLUSION_THEORY.length - 1 ? "Avançar" : section ? "Terminar revisão" : complete ? "Concluir aula" : state.testStarted ? "Retomar teste" : "Fazer teste"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
            : evaluation?.correct ? <LessonButton type="button" className="lc-next" onClick={nextQuestion}>{state.questionIndex === questions.length - 1 ? section ? "Terminar treino" : "Concluir aula" : "Próxima pergunta"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
              : <LessonButton type="submit" form="lc-answer-form" className="lc-next" disabled={!attempt.draft.trim()} data-sound-silent="true"><Check size={19} aria-hidden="true"/>Conferir</LessonButton>}
        </>}
    </footer>
  </>;
}
