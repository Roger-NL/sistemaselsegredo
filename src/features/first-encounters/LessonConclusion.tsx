"use client";

import { useLessonStorage } from "./lesson-storage";

import { LessonButton } from "./LessonButton";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, BookOpen, Eraser } from "lucide-react";
import { useLessonSounds } from "./useLessonSounds";
import { LessonJourney } from "./LessonJourney";
import { CONCLUSION_QUESTIONS, CONCLUSION_THEORY, LESSON_CONCLUSION_STORAGE, createConclusionState, evaluateConclusionAnswer,
  getConclusionAttempt, getConclusionScore, isConclusionComplete, restoreConclusionState, setConclusionDraft, submitConclusionAnswer } from "./lesson-conclusion";
import "./lesson-conclusion.css";

export type LessonConclusionProps = { onReturnToPractice: () => void; onRestartPractice: () => void };

/** Written recap first, then six short checks. It never requests narration. */
export function LessonConclusion({ onReturnToPractice, onRestartPractice }: LessonConclusionProps) {
  const lessonStorage = useLessonStorage();
  const [state, setState] = useState(createConclusionState);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const writing = useRef<HTMLInputElement>(null);
  const sounds = useLessonSounds();
  const page = CONCLUSION_THEORY[state.theoryIndex];
  const question = CONCLUSION_QUESTIONS[state.questionIndex];
  const attempt = getConclusionAttempt(state, question);
  const evaluation = attempt.lastAnswer === null ? null : evaluateConclusionAnswer(question, attempt.lastAnswer);
  const score = getConclusionScore(state);
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
      <div className={`lc-heading ${state.phase === "test" ? "is-test" : ""}`}>
        <div className="lc-heading-copy"><div className="lc-heading-topline"><LessonJourney stage={state.phase === "theory" ? "theory" : "test"}
          completed={state.phase === "theory" ? state.theoryIndex : state.phase === "summary" ? 6 : completedQuestions}
          label={state.phase === "test" ? `Teste ${state.questionIndex + 1}/${CONCLUSION_QUESTIONS.length}` : undefined}/>
          {state.phase === "test" && <button type="button" className="lc-test-restart" aria-label="Recomeçar teste do zero" disabled={!ready} onClick={retake}><RotateCcw size={15} aria-hidden="true"/><span className="lc-restart-full">Recomeçar teste do zero</span><span className="lc-restart-short" aria-hidden="true">Zerar teste</span></button>}</div>
          <h1 id="lesson-title" ref={heading} tabIndex={-1}>{state.phase === "theory" ? page.title : state.phase === "test" ? question.prompt : "Prática, teoria e uma nova tentativa"}</h1></div>
        <div className="lc-page-dots" aria-hidden="true">{Array.from({ length: state.phase === "theory" ? 5 : 6 }, (_, index) =>
          <span key={index} className={state.phase === "summary" || index < (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-done"
            : index === (state.phase === "theory" ? state.theoryIndex : state.questionIndex) ? "is-current" : ""} />)}</div>
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
      </form> : <section className="lc-card lc-summary" aria-label="Resultado da revisão">
        <div className="lc-summary-result"><span>Na primeira resposta de cada pergunta</span>
          <h2>{score.correct} de {score.total} com sentido e forma.</h2>
          <p>Esta contagem mantém a primeira resposta, mesmo quando você corrige depois.</p></div>
        <div className="lc-score-details"><p><span>Sentido da frase</span><strong>{score.meaning}/{score.total}</strong></p>
          <p><span>Uso de am e are</span><strong>{score.form}/{score.total}</strong></p></div>
        <p className="lc-summary-note">Este teste verifica as ideias desta aula. Reveja a teoria ou faça uma nova tentativa quando quiser.</p>
        <div className="lc-summary-actions"><button type="button" onClick={() => goTheory(0)}><BookOpen size={19} aria-hidden="true"/>Rever teoria</button>
          <button type="button" onClick={retake}><RotateCcw size={19} aria-hidden="true"/>Refazer teste</button></div>
      </section>}
      {storageUnavailable && <p className="lc-storage-note" role="status">A revisão funciona aqui, mas este navegador não permitiu guardar seu progresso.</p>}
    </main>
    <footer className="lo-footer lc-footer">
      {state.phase === "summary" ? <><button type="button" className="lc-back" onClick={onReturnToPractice}><ArrowLeft size={18} aria-hidden="true"/>Voltar à prática</button>
        <LessonButton type="button" className="lc-next" onClick={onRestartPractice}>Refazer prática<RotateCcw size={17} aria-hidden="true"/></LessonButton></>
        : <><button type="button" className="lc-back" onClick={previous} disabled={!ready}><ArrowLeft size={19} aria-hidden="true"/>Voltar</button>
          <span className="lc-footer-note">{state.phase === "test" ? "A primeira resposta fica registrada. Você pode corrigir depois." : "Leia no seu ritmo. Esta parte é escrita."}</span>
          {state.phase === "theory" ? <LessonButton type="button" className="lc-next" disabled={!ready} onClick={nextTheory}>
            {state.theoryIndex < 4 ? "Continuar" : complete ? "Ver resultado" : state.testStarted ? "Retomar teste" : "Fazer teste"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
            : evaluation?.correct ? <LessonButton type="button" className="lc-next" onClick={nextQuestion}>{state.questionIndex === 5 ? "Ver resultado" : "Próxima pergunta"}<ArrowRight size={19} aria-hidden="true"/></LessonButton>
              : <LessonButton type="submit" form="lc-answer-form" className="lc-next" disabled={!attempt.draft.trim()}><Check size={19} aria-hidden="true"/>Conferir</LessonButton>}
        </>}
    </footer>
  </>;
}
