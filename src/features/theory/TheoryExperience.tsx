"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/navigation/AppHeader";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";
import { audio } from "@/features/demo/content/media";
import { getBrowserSnapshot, getServerSnapshot, subscribe } from "@/features/demo/session/browser";
import { lessons, type StudyStep } from "./content";
import { completeStep, decodeProgress, isCorrect, normalizeAnswer, studySteps, type StudyProgress } from "./progress";

import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace, type WorkspaceState } from "@/features/dashboard/workspace-store";
import { PracticeAccess } from "@/features/dashboard/PracticeAccess";

const phrases = Object.values(audio).filter((phrase, index, all) => all.findIndex(other => normalizeAnswer(other.text) === normalizeAnswer(phrase.text)) === index);

function CachedAudio({ phrase, publishedAudio }: { phrase: string; publishedAudio: PublishedAudioCatalog }) {
  const asset = Object.values(audio).find(item => normalizeAnswer(item.text) === normalizeAnswer(phrase));
  const source = asset && publishedAudio[asset.id]?.audioUrl;
  return source ? <div className="study-audio"><span>Ouça a frase da história</span><audio aria-label={`Ouvir ${phrase}`} controls preload="none" src={source} /></div> : null;
}

export function TheoryExperience({ publishedAudio }: { publishedAudio: PublishedAudioCatalog }) {
  const workspaceState = useStudentWorkspace();
  const allowed = workspaceState.status === "ready" && workspaceState.workspace?.account.status === "active";
  return <>
    {workspaceState.workspace?.account.status === "active" && <div hidden={!allowed}><ConnectedTheory key={workspaceState.generation} publishedAudio={publishedAudio} workspaceState={workspaceState} /></div>}
    {!allowed && <main className="study-shell"><AppHeader current="study" /><PracticeAccess state={workspaceState} retry={workspaceState.refresh} /></main>}
  </>;
}

function ConnectedTheory({ publishedAudio, workspaceState }: { publishedAudio: PublishedAudioCatalog; workspaceState: WorkspaceState }) {
  const progress = decodeProgress(workspaceState.workspace?.learning.studySnapshot ?? null);
  const ready = true;
  const [view, setView] = useState<"overview" | "study" | "phrases" | "finished">("overview");
  const [search, setSearch] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const session = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const current = studySteps[progress.position];
  const completedCount = progress.completed.length;
  const allDone = completedCount === studySteps.length;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [view, progress.position]);

  function save(next: StudyProgress) {
    studentWorkspace.stage("studySnapshot", JSON.stringify(next), workspaceState.generation);
  }
  function open(position: number) {
    save({ ...progress, position }); setView("study"); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function next() {
    if (progress.position === studySteps.length - 1) { setView("finished"); window.scrollTo({ top: 0, behavior: "instant" }); }
    else open(progress.position + 1);
  }
  const lived = new Set(session.state?.transcript.map(line => normalizeAnswer(audio[line.audioId].text)) ?? []);
  const filtered = phrases.filter(item => `${item.text} ${item.meaning}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));

  return <main className="study-shell">
    <AppHeader current="study" />
    <nav className="study-breadcrumb" aria-label="Etapas da experiência"><Link href="/demo">A conversa</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">O inglês por trás dela</span></nav>
    <p className="study-notice" role="status">{workspaceState.saving ? "Salvando seu estudo…" : "Estudo sincronizado com sua conta."}</p>{workspaceState.notice && <p className="study-notice" role="status">{workspaceState.notice}</p>}
    {allDone && (view === "overview" || view === "finished") && <section className="study-completion" aria-label="Do estudo à aula ao vivo"><Check size={23} aria-hidden="true" /><div><h2>Seu estudo está concluído.</h2><p>{workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? "Consulte o pedido, a confirmação ou o registro da sua aula gratuita no painel." : "Você já fez todas as práticas. O próximo encontro é uma aula gratuita com o professor."}</p></div>{workspaceState.saving ? <button className="study-primary" disabled>Confirmando seu progresso…</button> : <Link className="study-primary" prefetch={false} href="/dashboard#aula-ao-vivo">{workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? "Ver minha aula ao vivo" : "Agendar minha aula gratuita"}<ArrowRight size={17} aria-hidden="true" /></Link>}</section>}
    {view === "overview" && <>
      <section className="study-intro"><div><p className="study-eyebrow">Depois da cafeteria · estudo guiado</p><h1 ref={heading} tabIndex={-1}>Uma conversa.<br />Muito para descobrir.</h1><p className="study-lead">Entenda as palavras, as expressões e o jeito de construir as frases. Um pequeno passo de cada vez.</p><div className="study-intro-actions"><button className="study-primary" disabled={!ready} onClick={() => open(progress.position)}>{allDone ? "Revisitar meu estudo" : completedCount ? "Continuar meu estudo" : "Começar a descobrir"}<ArrowRight size={18} aria-hidden="true" /></button><button className="study-text-button" onClick={() => setView("phrases")}>Consultar as expressões</button></div></div><aside className="study-intro-note"><BookOpen size={26} strokeWidth={1.3} aria-hidden="true" /><p>Primeiro, o sentido.<br />Depois, as peças.<br /><strong>Agora, do seu jeito.</strong></p><span>8 blocos · 24 pequenas práticas<br />Sem cronômetro. No seu ritmo.</span></aside></section>
      <section className="study-path" aria-labelledby="path-title"><div className="study-section-heading"><h2 id="path-title">Entenda sua primeira conversa</h2><span>{completedCount} de {studySteps.length} práticas concluídas</span></div><progress max={studySteps.length} value={completedCount} aria-label="Práticas concluídas" />
        <ol>{lessons.map((lesson, i) => { const done = lesson.steps.filter(step => progress.completed.includes(step.id)).length; return <li key={lesson.id}><button disabled={!ready} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)) < 0 ? studySteps.findIndex(item => item.lesson.id === lesson.id) : studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)))}><span className="study-number">{done === lesson.steps.length ? <Check size={22} aria-label="Concluído" /> : String(i + 1).padStart(2, "0")}</span><span className="study-path-copy"><strong>{lesson.title}</strong><span>{lesson.description}</span></span><span className="study-path-count">{done}/{lesson.steps.length}</span><ArrowRight size={20} aria-hidden="true" /></button></li>; })}</ol>
        <p className="study-small">Seu avanço fica salvo na sua conta. Concluir as práticas não é uma avaliação de nível.</p>
      </section>
    </>}
    {view === "study" && <div className="study-workspace"><aside className="study-sidebar"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Todos os blocos</button><p className="study-eyebrow">Seu percurso</p><ol>{lessons.map((lesson, index) => <li key={lesson.id}><button aria-current={current.lesson.id === lesson.id ? "step" : undefined} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id))}><span>{String(index + 1).padStart(2, "0")}</span>{lesson.title}</button></li>)}</ol><p className="study-small">Uma pausa também faz parte.<br />Seu ponto de retorno fica salvo.</p></aside>
      <section className="study-main"><div className="study-step-meta"><button className="study-text-button study-mobile-back" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Blocos</button><span>{current.lesson.title}</span><span>Passo {progress.position + 1}/{studySteps.length}</span></div><progress max={studySteps.length} value={completedCount} aria-label="Práticas concluídas" />
        <StudyCard key={current.step.id} step={current.step} headingRef={heading} publishedAudio={publishedAudio} onComplete={supported => save(completeStep(progress, current.step.id, supported))} onNext={next} onPrevious={progress.position > 0 ? () => open(progress.position - 1) : undefined} />
      </section>
    </div>}
    {view === "phrases" && <section className="study-glossary"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Voltar aos blocos</button><p className="study-eyebrow">Para ter por perto</p><h1 ref={heading} tabIndex={-1}>O inglês da cafeteria.</h1><p>As expressões de todos os caminhos da história. Abra uma frase para consultar seu significado.</p><label htmlFor="phrase-search">Encontrar uma expressão em inglês ou português</label><input id="phrase-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tente: mine, gostar, despedir…" /><p className="study-small" role="status">{filtered.length} expressões</p><div className="study-phrase-list">{filtered.map(item => <details key={item.id}><summary><span lang="en">{item.text}</span>{lived.has(normalizeAnswer(item.text)) && <small>Na sua conversa</small>}</summary><p>{item.meaning}</p><CachedAudio phrase={item.text} publishedAudio={publishedAudio} /></details>)}</div>{filtered.length === 0 && <p>Nenhuma expressão encontrada. Tente outra palavra.</p>}</section>}
    {view === "finished" && <section className="study-finished"><p className="study-eyebrow">Uma pausa para perceber</p><h1 ref={heading} tabIndex={-1}>{allDone ? <>Você concluiu<br />este percurso.</> : <>Seu percurso<br />até aqui.</>}</h1><p>Você concluiu {completedCount} das {studySteps.length} práticas. {progress.supported.length > 0 ? `${progress.supported.length} com consulta ao modelo. Você pode revisitá-las para tentar com menos apoio.` : "Volte outro dia e experimente responder sem consultar as explicações."}</p><div className="study-intro-actions"><button className="study-primary" onClick={() => open(Math.max(0, studySteps.findIndex(({ step }) => progress.supported.includes(step.id) || !progress.completed.includes(step.id))))}><RotateCcw size={18} aria-hidden="true" />{allDone ? "Revisitar as práticas" : "Continuar descobrindo"}</button><button onClick={() => setView("overview")}>Ver meu percurso</button><Link href="/demo">Rever a conversa</Link></div><p className="study-small">Este percurso é uma primeira exploração. A revisão e o uso em outras situações continuam fazendo parte do aprendizado.</p></section>}
    <footer className="study-footer"><span>BasedSpeak · Do encontro ao entendimento.</span><Link href="/demo">Voltar à conversa</Link></footer>
  </main>;
}

function StudyCard({ step, publishedAudio, onComplete, onNext, onPrevious, headingRef }: { step: StudyStep; publishedAudio: PublishedAudioCatalog; onComplete: (supported: boolean) => void; onNext: () => void; onPrevious?: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const [phase, setPhase] = useState<"learn" | "practice">("learn");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "retry" | "model" | null>(null);
  const [model, setModel] = useState(false);
  const [hint, setHint] = useState(false);
  const practice = step.practice;
  const solution = practice.kind === "write" ? practice.answers[0] : practice.answer;
  const locked = feedback === "correct" || feedback === "model";
  const inputAnswer = practice.kind === "order" ? selected.map(index => practice.tokens[index]).join(" ") : answer;
  const practiceHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (phase === "practice") practiceHeading.current?.focus(); else headingRef.current?.focus(); }, [phase, headingRef]);
  function check(event: FormEvent) {
    event.preventDefault();
    if (locked || !inputAnswer.trim()) return;
    if (isCorrect(practice, inputAnswer)) { setFeedback("correct"); onComplete(model); }
    else setFeedback("retry");
  }
  function edit() { setFeedback(null); }
  function reveal() { setModel(true); setFeedback("model"); onComplete(true); }
  function retry() {
    setFeedback(null); setAnswer(""); setSelected([]); setModel(false); setHint(false);
  }

  return <article className="study-card"><h1 ref={headingRef} tabIndex={-1}>{step.title}</h1>
    {phase === "learn" ? <><div className="study-quote"><span className="study-eyebrow">Uma frase para explorar</span><p lang="en">{step.phrase}</p><span>{step.meaning}</span><CachedAudio phrase={step.phrase} publishedAudio={publishedAudio} /></div><p className="study-explanation">{step.body}</p><details className="study-deeper"><summary>Entender um pouco mais</summary><p>{step.detail}</p></details><div className="study-card-actions">{onPrevious && <button className="study-text-button" onClick={onPrevious}><ArrowLeft size={16} aria-hidden="true" />Anterior</button>}<button className="study-primary" onClick={() => setPhase("practice")}>Experimentar<ArrowRight size={18} aria-hidden="true" /></button></div></>
      : <><p className="study-eyebrow">Sua vez · {practice.kind === "order" ? "Organize as peças" : practice.kind === "write" ? "Complete em inglês" : "Escolha pelo sentido"}</p><h2 ref={practiceHeading} tabIndex={-1}>{practice.prompt}</h2><form onSubmit={check}>
        {practice.kind === "choice" && <fieldset className="study-choices"><legend className="study-sr-only">Escolha uma resposta</legend>{practice.options.map((option, index) => <label key={option} data-selected={answer === option}><input type="radio" name={step.id} value={option} checked={answer === option} disabled={locked} onChange={() => { setAnswer(option); edit(); }} /><span className="study-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</fieldset>}
        {practice.kind === "order" && <><div className="study-answer-bank" aria-label="Sua frase"><span className="study-small">Toque em uma peça para devolvê-la</span><div>{selected.length ? selected.map((index, position) => <button type="button" lang="en" disabled={locked} key={index} aria-label={`Devolver ${practice.tokens[index]}`} onClick={() => { setSelected(selected.filter((_, i) => i !== position)); edit(); }}>{practice.tokens[index]} <span aria-hidden="true">×</span></button>) : <p className="study-small">Sua frase aparece aqui.</p>}</div></div><div className="study-token-bank" aria-label="Peças disponíveis">{practice.tokens.map((token, index) => <button key={index} type="button" lang="en" disabled={locked || selected.includes(index)} onClick={() => { setSelected([...selected, index]); edit(); }}>{token}</button>)}</div></>}
        {practice.kind === "write" && <><label className="study-input-label" htmlFor={`answer-${step.id}`}>Sua resposta em inglês</label><input id={`answer-${step.id}`} lang="en" autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={locked} value={answer} onChange={event => { setAnswer(event.target.value); edit(); }} /><button type="button" className="study-text-button" onClick={() => setHint(!hint)} aria-expanded={hint}>{hint ? "Fechar pista" : "Quero uma pista"}</button>{hint && <p className="study-hint">{practice.hint}</p>}</>}
        <div className="study-feedback" role="status" aria-live="polite">{feedback === "retry" && <><strong>Ainda não combina com esta proposta.</strong><p>{practice.explanation} {practice.kind === "write" && "Outras formas podem ser válidas; aqui praticamos a estrutura deste passo."}</p></>}{feedback === "correct" && <><strong>{model ? "Você praticou com apoio." : "Isso combina com a situação."}</strong><p>{practice.explanation}</p></>}{feedback === "model" && <><strong>Um jeito de dizer:</strong><p lang="en">{solution}</p><p>{practice.explanation}</p></>}</div>
        <div className="study-card-actions"><button type="button" className="study-text-button" onClick={() => setPhase("learn")}><ArrowLeft size={16} aria-hidden="true" />Rever explicação</button>{!locked && <button className="study-primary" disabled={!inputAnswer.trim()}>Conferir<Check size={18} aria-hidden="true" /></button>}</div>
      </form>{locked ? <div className="study-next"><button className="study-text-button" onClick={retry}>Tentar outra vez</button><button className="study-primary" onClick={onNext}>Continuar<ArrowRight size={18} aria-hidden="true" /></button></div> : <button className="study-text-button study-model" onClick={reveal}>Consultar um modelo e continuar com apoio</button>}</>}
  </article>;
}
