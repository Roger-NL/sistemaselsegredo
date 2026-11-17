"use client";

import { useLessonStorage } from "./lesson-storage";

import { LessonButton } from "./LessonButton";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Eraser, Pause, Volume2 } from "lucide-react";
import { useLessonSounds } from "./useLessonSounds";
import { LessonJourney } from "./LessonJourney";
import { LessonStepTransition } from "./LessonStepTransition";
import { IntroductionStage } from "./IntroductionStage";
import { useLessonAudio } from "./useLessonAudio";
import { LESSON_INTRODUCTION_SCENES } from "./lesson-introduction";
import { createRevisionAudioController, REVISION_NARRATIONS } from "./lesson-revision-audio";
import { TutorialCaption } from "./TutorialCaption";
import type { PersonId } from "./lesson-one";
import { CONCLUSION_QUESTIONS, CONCLUSION_THEORY, LESSON_CONCLUSION_STORAGE, createConclusionState, evaluateConclusionAnswer,
  getConclusionAttempt, isConclusionComplete, restoreConclusionState, setConclusionDraft, submitConclusionAnswer } from "./lesson-conclusion";
import "./lesson-conclusion.css";

export type LessonConclusionProps = {
  onReturnToPractice: () => void;
  /** Kept compatible with saved visits; the completion screen does not offer a reset. */
  onRestartPractice?: () => void;
  /** The owning lesson confirms persistence before navigating to the dashboard. */
  onComplete?: () => Promise<void> | void;
  completionSaving?: boolean;
  completionError?: string;
};

const RECAP_MODELS = LESSON_INTRODUCTION_SCENES.flatMap(scene => scene.models.map((model, modelIndex) => ({ scene, model, modelIndex })));

/** One real voice clock: Nina's local congratulations, then the four recorded actor models. */
function CompletionRecap({ disabled }: { disabled: boolean }) {
  const audio = useLessonAudio("lesson-completion", createRevisionAudioController);
  const { request, stop: stopAudio } = audio;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [sequenceActive, setSequenceActive] = useState(false);
  const [ninaReady, setNinaReady] = useState(false);
  const [narrationComplete, setNarrationComplete] = useState(false);
  const generation = useRef(0);
  const automaticStarted = useRef(false);
  const readyPeople = useRef(new Set<PersonId>());
  const pending = useRef<{ ticket: number; person: PersonId; begin: () => void } | null>(null);
  const selected = activeIndex === null ? null : RECAP_MODELS[activeIndex];

  useEffect(() => {
    const cancel = () => { generation.current++; pending.current = null; stopAudio(); };
    const hidden = () => { if (document.hidden) { cancel(); automaticStarted.current = true; setSequenceActive(false); setNarrationComplete(true); } };
    document.addEventListener("visibilitychange", hidden);
    return () => { cancel(); document.removeEventListener("visibilitychange", hidden); };
  }, [stopAudio]);
  useEffect(() => {
    if (!disabled) return;
    automaticStarted.current = true;
    const ticket = ++generation.current;
    pending.current = null; stopAudio();
    queueMicrotask(() => { if (generation.current === ticket) { setSequenceActive(false); setNarrationComplete(true); } });
  }, [disabled, stopAudio]);

  function stop() {
    generation.current++; automaticStarted.current = true; pending.current = null; stopAudio(); setSequenceActive(false); setNarrationComplete(true);
  }
  const play = useCallback((start = -1, sequence = true, autoplay = false) => {
    if (disabled) return;
    automaticStarted.current = true;
    stopAudio();
    const ticket = ++generation.current;
    setSequenceActive(true);
    function next(index: number) {
      if (generation.current !== ticket) return;
      const item = index < 0 ? null : RECAP_MODELS[index];
      const person = item?.model.speaker ?? "nina";
      const text = item?.model.text ?? REVISION_NARRATIONS.completion.text;
      setActiveIndex(index < 0 ? null : index);
      setNarrationComplete(index >= 0);
      const begin = () => {
        if (generation.current !== ticket) return;
        pending.current = null;
        void request(person, text, { role: "character", autoplay: autoplay || index !== start, onEnded: () => {
          if (generation.current !== ticket) return;
          if (index < 0) setNarrationComplete(true);
          if (sequence && index + 1 < RECAP_MODELS.length) next(index + 1);
          else { setSequenceActive(false); setActiveIndex(null); }
        } }).then(playing => { if (!playing && generation.current === ticket) { setSequenceActive(false); setNarrationComplete(true); } });
      };
      if (readyPeople.current.has(person)) begin();
      else pending.current = { ticket, person, begin };
    }
    next(start);
  }, [disabled, request, stopAudio]);
  useEffect(() => {
    if (!ninaReady || disabled || automaticStarted.current) return;
    let live = true;
    queueMicrotask(() => { if (live && !automaticStarted.current && !document.hidden) play(-1, true, true); });
    return () => { live = false; };
  }, [ninaReady, disabled, play]);
  function characterReady(person: PersonId) {
    if (!readyPeople.current.has(person) && person === "nina") setNinaReady(true);
    readyPeople.current.add(person);
    if (pending.current?.person === person && pending.current.ticket === generation.current) pending.current.begin();
  }

  return <>
    <div className="lc-completion-stage" aria-label="Recapitulação com os personagens da aula">
      <IntroductionStage scene={selected?.scene ?? LESSON_INTRODUCTION_SCENES[2]} modelIndex={selected?.modelIndex ?? null} speech={audio.speech} onCharacterReady={characterReady} guideLabel="Nina celebra a conclusão da aula."/>
    </div>
    <div className="lc-completion-copy">
      <div className="lc-completion-message"><h2>Parabéns! Você chegou até aqui.</h2>
        <TutorialCaption speech={audio.speech} text={REVISION_NARRATIONS.completion.text} clipKey={`nina:${REVISION_NARRATIONS.completion.text}`} complete={narrationComplete || disabled}/></div>
      <div className="lc-completion-models" aria-label="O que você aprendeu">
        {RECAP_MODELS.map(({ model }, index) => <button type="button" key={`${model.speaker}:${model.text}`} data-recap-model={index}
          aria-label={`Ouvir ${model.text}`} aria-pressed={sequenceActive && activeIndex === index} disabled={disabled} onClick={() => play(index, false)}>
          <strong lang="en">{model.text}</strong><span>{model.translation}</span><Volume2 size={17} aria-hidden="true"/>
        </button>)}
      </div>
      <div className="lc-completion-audio">
        {audio.blocked ? <button type="button" disabled={disabled} onClick={() => { const ticket = generation.current; if (activeIndex === null) setNarrationComplete(false); void audio.unlock().then(playing => { if (generation.current === ticket) { setSequenceActive(playing); if (!playing) setNarrationComplete(true); } }); }}>Ativar som<Volume2 size={17} aria-hidden="true"/></button>
          : <button type="button" disabled={disabled} aria-label={sequenceActive ? "Pausar recapitulação" : "Ouvir recapitulação"} onClick={() => sequenceActive ? stop() : play()}>
            {sequenceActive ? <Pause size={17} aria-hidden="true"/> : <Volume2 size={17} aria-hidden="true"/>}{sequenceActive ? "Pausar" : "Ouvir recapitulação"}
          </button>}
        {audio.error && <p role="status">Não foi possível ouvir a fala. Toque para tentar novamente.</p>}
      </div>
    </div>
  </>;
}

/** Written theory and checks, followed by a completion that preserves the learner's work. */
export function LessonConclusion({ onReturnToPractice, onComplete, completionSaving = false, completionError = "" }: LessonConclusionProps) {
  const lessonStorage = useLessonStorage();
  const [state, setState] = useState(createConclusionState);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionFailure, setCompletionFailure] = useState("");
  const completionLock = useRef(false);
  const mounted = useRef(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const writing = useRef<HTMLInputElement>(null);
  const sounds = useLessonSounds();
  const page = CONCLUSION_THEORY[state.theoryIndex];
  const question = CONCLUSION_QUESTIONS[state.questionIndex];
  const attempt = getConclusionAttempt(state, question);
  const evaluation = attempt.lastAnswer === null ? null : evaluateConclusionAnswer(question, attempt.lastAnswer);
  const complete = isConclusionComplete(state);
  const completedQuestions = CONCLUSION_QUESTIONS.filter(item => {
    const answer = state.attempts[item.id]?.lastAnswer;
    return answer != null && evaluateConclusionAnswer(item, answer).correct;
  }).length;

  useEffect(() => {
    let active = true;
    let raw: string | null = null;
    let unavailable = false;
    try { raw = lessonStorage.getItem(LESSON_CONCLUSION_STORAGE); } catch { unavailable = true; }
    queueMicrotask(() => {
      if (!active) return;
      setState(restoreConclusionState(raw)); setStorageUnavailable(unavailable); setReady(true);
    });
    return () => { active = false; };
  }, [lessonStorage]);
  useEffect(() => {
    if (!ready) return;
    try { lessonStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify(state)); } catch { /* The review still works in memory. */ }
  }, [ready, state, lessonStorage]);
  useEffect(() => { if (ready) heading.current?.focus({ preventScroll: true }); }, [ready, state.phase, state.theoryIndex, state.questionIndex]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function finishLesson() {
    if (completionLock.current || completionSaving || !onComplete) return;
    completionLock.current = true; setCompletionPending(true); setCompletionFailure("");
    sounds.play("advance");
    try { await onComplete(); }
    catch { if (mounted.current) setCompletionFailure("Não foi possível confirmar seu avanço. Tente concluir novamente."); }
    finally { completionLock.current = false; if (mounted.current) setCompletionPending(false); }
  }

  function goTheory(index: number) { sounds.play("advance"); setState(current => ({ ...current, phase: "theory", theoryIndex: index })); }
  function nextTheory() {
    sounds.play("advance");
    setState(current => current.theoryIndex < CONCLUSION_THEORY.length - 1
      ? { ...current, theoryIndex: current.theoryIndex + 1 }
      : { ...current, phase: isConclusionComplete(current) ? "summary" : "test", testStarted: true });
  }
  function nextQuestion() {
    if (!evaluation?.correct) return;
    sounds.play("advance");
    setState(current => current.questionIndex === CONCLUSION_QUESTIONS.length - 1
      ? { ...current, phase: "summary" } : { ...current, questionIndex: current.questionIndex + 1 });
  }
  function check(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (evaluation?.correct) { nextQuestion(); return; }
    if (!attempt.draft.trim()) return;
    sounds.play(evaluateConclusionAnswer(question, attempt.draft).correct ? "success" : "retry");
    setState(current => submitConclusionAnswer(current, question));
  }
  function retake() {
    sounds.play("advance");
    setState({ ...createConclusionState(), phase: "test", testStarted: true });
  }
  function previous() {
    if (state.phase === "theory") {
      if (state.theoryIndex > 0) goTheory(state.theoryIndex - 1); else onReturnToPractice();
    } else if (state.phase === "test") {
      sounds.play("advance");
      setState(current => current.questionIndex > 0 ? { ...current, questionIndex: current.questionIndex - 1 }
        : { ...current, phase: "theory", theoryIndex: CONCLUSION_THEORY.length - 1 });
    }
  }

  return <>
    <main className="lo-main lc-main" id="lesson-main" data-conclusion-phase={state.phase} data-conclusion-index={state.phase === "theory" ? state.theoryIndex : state.questionIndex} aria-busy={!ready}>
      <LessonStepTransition stepKey={`${state.phase}:${state.phase === "theory" ? state.theoryIndex : state.questionIndex}`} className="lc-content">
      <div className={`lc-heading ${state.phase === "test" ? "is-test" : ""}`}>
        <div className="lc-heading-copy"><div className="lc-heading-topline"><LessonJourney stage={state.phase === "theory" ? "theory" : "test"}
          completed={state.phase === "theory" ? state.theoryIndex : state.phase === "summary" ? 6 : completedQuestions}
          label={state.phase === "test" ? `Teste ${state.questionIndex + 1}/${CONCLUSION_QUESTIONS.length}` : undefined}/>
          {state.phase === "test" && <button type="button" className="lc-test-restart" aria-label="Recomeçar teste do zero" disabled={!ready} onClick={retake}><RotateCcw size={15} aria-hidden="true"/><span className="lc-restart-full">Recomeçar teste do zero</span><span className="lc-restart-short" aria-hidden="true">Zerar teste</span></button>}</div>
          <h1 id="lesson-title" ref={heading} tabIndex={-1}>{state.phase === "theory" ? page.title : state.phase === "test" ? question.prompt : "Você concluiu sua primeira aula."}</h1></div>
        {state.phase !== "summary" && <div className="lc-page-dots" aria-hidden="true">{Array.from({ length: state.phase === "theory" ? 5 : 6 }, (_, index) =>
          <span key={index} className={state.phase === "summary" || index < (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-done"
            : index === (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-current" : ""} />)}</div>}
      </div>

      {!ready ? <section className="lc-card lc-loading"><p>Preparando sua revisão…</p></section> : state.phase === "theory" ? <section className={`lc-card lc-theory ${page.id === "forms" ? "lc-rule-page" : ""}`} aria-label="Explicação bilíngue">
        <div className="lc-relation">
          {page.id === "forms" ? <div className="lc-forms" aria-label="I am. You are. We are. They are.">
            <span lang="en">I <strong>am</strong></span><span lang="en">You <strong>are</strong></span>
            <span lang="en">We <strong>are</strong></span><span lang="en">They <strong>are</strong></span>
          </div> : <><strong className="lc-english" lang="en">{page.english}</strong><span className="lc-portuguese">{page.portuguese}</span></>}
          <div className="lc-example"><strong lang="en">{page.example}</strong><span>{page.translation}</span></div>
        </div>
        <div className="lc-explanation"><p>{page.explanationPT}</p><p className="lc-en" lang="en">{page.explanationEN}</p><p className="lc-note">{page.note}</p></div>
      </section> : state.phase === "test" ? <form id="lc-answer-form" className={`lc-card lc-test ${question.kind === "writing" ? "lc-writing-test" : ""}`} onSubmit={check}>
        <div className="lc-question-context"><span>Situação</span><p>{question.context}</p></div>
        <div className="lc-answer-area">
          {question.kind === "choice" ? <fieldset className="lc-choices"><legend className="lc-visually-hidden">Escolha a fala</legend>
            {question.choices?.map(choice => <label key={choice} className={`lc-choice ${attempt.draft === choice ? "is-selected" : ""}`}>
              <input type="radio" name={question.id} value={choice} checked={attempt.draft === choice}
                onChange={() => setState(current => setConclusionDraft(current, question, choice))} />
              <span lang="en">{choice}</span><span className="lc-choice-check" aria-hidden="true">{attempt.draft === choice && <Check size={18} />}</span>
            </label>)}
          </fieldset> : <div className="lc-writing"><label htmlFor="lc-written-answer">Sua frase em inglês</label>
            <div className="lc-input-row"><input ref={writing} id="lc-written-answer" type="text" value={attempt.draft} maxLength={120} autoComplete="off" autoCapitalize="off" spellCheck={false}
              placeholder="Escreva aqui…" onChange={event => { const draft = event.currentTarget.value; setState(current => setConclusionDraft(current, question, draft)); }} />
              <button type="button" className="lc-clear" disabled={!attempt.draft} aria-label="Apagar resposta" onClick={() => {
                setState(current => setConclusionDraft(current, question, "")); writing.current?.focus();
              }}><Eraser size={18} aria-hidden="true"/><span>Apagar</span></button></div>
            <p className="lc-writing-note">Maiúsculas e ponto final não tiram acerto.</p>
          </div>}
        </div>
        <div className={`lc-feedback ${evaluation ? evaluation.correct ? "is-correct" : "is-retry" : ""}`} role="status" aria-live="polite" aria-atomic="true">
          {evaluation ? <><strong>{evaluation.correct ? "Faz sentido." : evaluation.meaningCorrect ? "Ajuste am ou are." : "Observe quem está falando."}</strong>
            <p>{evaluation.explanationPT}</p><p lang="en" className="lc-feedback-en">{evaluation.explanationEN}</p>
            {evaluation.correct && evaluation.notes.map(note => <p key={note}>{note}</p>)}
          </> : <p>Escolha ou escreva a fala e toque em <strong>Conferir</strong>. Depois da resposta, você verá a explicação.</p>}
        </div>
      </form> : <section className="lc-card lc-completion" aria-label="Aula concluída">
        <CompletionRecap disabled={completionSaving || completionPending}/>
      </section>}
      </LessonStepTransition>
      {storageUnavailable && <p className="lc-storage-note" role="status">A revisão funciona aqui, mas este navegador não permitiu guardar seu progresso.</p>}
    </main>
    <footer className="lo-footer lc-footer">
      {state.phase === "summary" ? <><p className="lc-completion-save" role={completionError || completionFailure ? "alert" : "status"}>
          {completionError || completionFailure || (completionSaving || completionPending ? "Confirmando seu avanço…" : "Conclua para confirmar seu avanço e voltar ao painel.")}</p>
        <LessonButton type="button" className="lc-next lc-complete" disabled={!ready || completionSaving || completionPending || !onComplete} aria-busy={completionSaving || completionPending} onClick={() => void finishLesson()}>Concluir e voltar ao painel<ArrowRight size={19} aria-hidden="true"/></LessonButton></>
        : <><button type="button" className="lc-back" onClick={previous} disabled={!ready}><ArrowLeft size={19} aria-hidden="true"/>Voltar</button>
          <span className="lc-footer-note">{state.phase === "test" ? "A primeira resposta fica registrada. Você pode corrigir depois." : "Leia no seu ritmo. Esta parte é escrita."}</span>
          {state.phase === "theory" ? <LessonButton type="button" className="lc-next" disabled={!ready} onClick={nextTheory}>
            {state.theoryIndex < 4 ? "Continuar" : complete ? "Concluir aula" : state.testStarted ? "Retomar teste" : "Fazer teste"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
            : evaluation?.correct ? <LessonButton type="button" className="lc-next" onClick={nextQuestion}>{state.questionIndex === 5 ? "Concluir aula" : "Próxima pergunta"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
              : <LessonButton type="submit" form="lc-answer-form" className="lc-next" disabled={!attempt.draft.trim()}><Check size={19} aria-hidden="true"/>Conferir</LessonButton>}
        </>}
    </footer>
  </>;
}
