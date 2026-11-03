"use client";
import { BrowserText } from "@/components/i18n/BrowserText";


import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/navigation/AppHeader";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";
import { audio } from "@/features/demo/content/media";
import { getBrowserSnapshot, getServerSnapshot, subscribe } from "@/features/demo/session/browser";
import { lessons, type StudyStep } from "./content";
import { completeStep, decodeProgress, isCorrect, normalizeAnswer, practiceFeedback, studySteps, type StudyProgress } from "./progress";

import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace, type WorkspaceState } from "@/features/dashboard/workspace-store";
import { PracticeAccess } from "@/features/dashboard/PracticeAccess";
import { canPractice, practiceLearning } from "@/features/dashboard/practice-access";
import { GuestProgressImport } from "@/features/dashboard/GuestProgressImport";

const phrases = Object.values(audio).filter((phrase, index, all) => all.findIndex(other => normalizeAnswer(other.text) === normalizeAnswer(phrase.text)) === index);

/** Native controls remain lazy, and playing one published clip pauses the others. */
export function pauseOtherStudyAudio(container: ParentNode, active: HTMLAudioElement) {
  container.querySelectorAll<HTMLAudioElement>("audio").forEach(element => { if (element !== active && !element.paused) element.pause(); });
}
export function CachedAudio({ references, publishedAudio }: { references: StudyStep["storyAudio"]; publishedAudio: PublishedAudioCatalog }) {
  return <>{references.map(reference => {
    const asset = audio[reference.id];
    const source = publishedAudio[reference.id]?.audioUrl;
    return source ? <div key={reference.id} className="study-audio"><span>{reference.scope === "excerpt" ? <BrowserText>{"Ouça a fala completa da história (inclui o trecho): "}</BrowserText> : <BrowserText>{"Ouça a fala da história: "}</BrowserText>}<span lang="en"><BrowserText>{asset.text}</BrowserText></span></span><audio aria-label={`Ouvir fala completa: ${asset.text}`} controls preload="none" src={source} /></div> : null;
  })}</>;
}

export function TheoryExperience({ publishedAudio }: { publishedAudio: PublishedAudioCatalog }) {
  const workspaceState = useStudentWorkspace();
  const allowed = canPractice(workspaceState);
  return <>
    {allowed && <ConnectedTheory key={workspaceState.generation} publishedAudio={publishedAudio} workspaceState={workspaceState} />}
    {!allowed && <main className="study-shell"><AppHeader current="study" /><PracticeAccess state={workspaceState} retry={workspaceState.refresh} /></main>}
  </>;
}

function ConnectedTheory({ publishedAudio, workspaceState }: { publishedAudio: PublishedAudioCatalog; workspaceState: WorkspaceState }) {
  const progress = decodeProgress(practiceLearning(workspaceState)?.studySnapshot ?? null);
  const guest = !workspaceState.workspace;
  const ready = true;
  const [view, setView] = useState<"overview" | "study" | "phrases" | "finished">(()=>typeof window !== "undefined" && new URLSearchParams(window.location.search).get("practice") === "1" ? "study" : "overview");
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
  const lived = new Set(session.state?.transcript.map(line => normalizeAnswer(line.written ?? audio[line.audioId].text)) ?? []);
  const filtered = phrases.filter(item => `${item.text} ${item.meaning}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));

  return <main className="study-shell" onPlay={event => pauseOtherStudyAudio(event.currentTarget, event.target as HTMLAudioElement)}>
    <AppHeader current="study" guest={guest} />
    <GuestProgressImport state={workspaceState} />
    <nav className="study-breadcrumb" aria-label="Etapas da experiência"><Link href="/demo">A conversa</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">O inglês por trás dela</span></nav>
    <p className="study-notice" role="status">{guest ? <BrowserText>{"Demo livre. Seu avanço fica salvo neste navegador."}</BrowserText> : workspaceState.saving ? <BrowserText>{"Salvando seu estudo…"}</BrowserText> : <BrowserText>{"Estudo sincronizado com sua conta."}</BrowserText>}</p>{workspaceState.notice && <p className="study-notice" role="status"><BrowserText>{workspaceState.notice}</BrowserText></p>}
    {allDone && (view === "overview" || view === "finished") && <section className="study-completion" aria-label="Do estudo à aula ao vivo"><Check size={23} aria-hidden="true" /><div><h2>Seu estudo está concluído.</h2><p>{guest ? <BrowserText>{"Para pedir sua aula gratuita, crie uma conta ou entre. Depois, escolha salvar este percurso na conta para continuar sem refazer as práticas."}</BrowserText> : workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? <BrowserText>{"Consulte o pedido, a confirmação ou o registro da sua aula gratuita no painel."}</BrowserText> : <BrowserText>{"Você já fez todas as práticas. O próximo encontro é uma aula gratuita com o professor."}</BrowserText>}</p></div>{workspaceState.saving ? <button className="study-primary" disabled>Confirmando seu progresso…</button> : <Link className="study-primary" prefetch={false} href={guest ? "/comecar" : "/dashboard#aula-ao-vivo"}>{guest ? <BrowserText>{"Criar minha conta para a aula"}</BrowserText> : workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? <BrowserText>{"Ver minha aula ao vivo"}</BrowserText> : <BrowserText>{"Agendar minha aula gratuita"}</BrowserText>}<ArrowRight size={17} aria-hidden="true" /></Link>}{guest && <Link href="/comecar?modo=entrar">Já tenho conta</Link>}</section>}
    {view === "overview" && <>
      <section className="study-intro"><div><p className="study-eyebrow">Depois da cafeteria · estudo guiado</p><h1 ref={heading} tabIndex={-1}>Uma conversa.<br />Muito para descobrir.</h1><p className="study-lead">Entenda as palavras, as expressões e o jeito de construir as frases. Um pequeno passo de cada vez.</p><div className="study-intro-actions"><button className="study-primary" disabled={!ready} onClick={() => open(progress.position)}>{allDone ? <BrowserText>{"Revisitar meu estudo"}</BrowserText> : completedCount ? <BrowserText>{"Continuar meu estudo"}</BrowserText> : <BrowserText>{"Começar a descobrir"}</BrowserText>}<ArrowRight size={18} aria-hidden="true" /></button><button className="study-text-button" onClick={() => setView("phrases")}>Consultar as expressões</button></div></div><aside className="study-intro-note"><BookOpen size={26} strokeWidth={1.3} aria-hidden="true" /><p>Primeiro, o sentido.<br />Depois, as peças.<br /><strong>Agora, do seu jeito.</strong></p><span>8 blocos · 24 pequenas práticas<br />Sem cronômetro. No seu ritmo.</span></aside></section>
      <section className="study-path" aria-labelledby="path-title"><div className="study-section-heading"><h2 id="path-title">Entenda sua primeira conversa</h2><span><BrowserText>{completedCount}</BrowserText> <BrowserText>de </BrowserText><BrowserText>{studySteps.length}</BrowserText> <BrowserText>práticas concluídas</BrowserText></span></div><progress max={studySteps.length} value={completedCount} aria-label="Práticas concluídas" />
        <ol>{lessons.map((lesson, i) => { const done = lesson.steps.filter(step => progress.completed.includes(step.id)).length; return <li key={lesson.id}><button disabled={!ready} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)) < 0 ? studySteps.findIndex(item => item.lesson.id === lesson.id) : studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)))}><span className="study-number">{done === lesson.steps.length ? <Check size={22} aria-label="Concluído" /> : <BrowserText>{String(i + 1).padStart(2, "0")}</BrowserText>}</span><span className="study-path-copy"><strong><BrowserText>{lesson.title}</BrowserText></strong><span><BrowserText>{lesson.description}</BrowserText></span></span><span className="study-path-count"><BrowserText>{done}</BrowserText><BrowserText>/</BrowserText><BrowserText>{lesson.steps.length}</BrowserText></span><ArrowRight size={20} aria-hidden="true" /></button></li>; })}</ol>
        <p className="study-small">{guest ? <BrowserText>{"Seu avanço fica salvo neste navegador. Uma conta permite continuar em outros dispositivos."}</BrowserText> : <BrowserText>{"Seu avanço fica salvo na sua conta."}</BrowserText>} <BrowserText>Concluir as práticas não é uma avaliação de nível.</BrowserText></p>
      </section>
    </>}
    {view === "study" && <div className="study-workspace"><aside className="study-sidebar"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Todos os blocos</button><p className="study-eyebrow">Seu percurso</p><ol>{lessons.map((lesson, index) => <li key={lesson.id}><button aria-current={current.lesson.id === lesson.id ? "step" : undefined} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id))}><span><BrowserText>{String(index + 1).padStart(2, "0")}</BrowserText></span><BrowserText>{lesson.title}</BrowserText></button></li>)}</ol><p className="study-small">Uma pausa também faz parte.<br />Seu ponto de retorno fica salvo.</p></aside>
      <section className="study-main"><div className="study-step-meta"><button className="study-text-button study-mobile-back" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Blocos</button><span><BrowserText>{current.lesson.title}</BrowserText></span><span><BrowserText>Passo </BrowserText>{<BrowserText>{progress.position + 1}</BrowserText>}<BrowserText>/</BrowserText><BrowserText>{studySteps.length}</BrowserText></span></div><progress max={studySteps.length} value={completedCount} aria-label="Práticas concluídas" />
        <StudyCard key={current.step.id} step={current.step} headingRef={heading} publishedAudio={publishedAudio} onComplete={supported => save(completeStep(progress, current.step.id, supported))} onNext={next} onPrevious={progress.position > 0 ? () => open(progress.position - 1) : undefined} />
      </section>
    </div>}
    {view === "phrases" && <section className="study-glossary"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Voltar aos blocos</button><p className="study-eyebrow">Para ter por perto</p><h1 ref={heading} tabIndex={-1}>O inglês da cafeteria.</h1><p>As expressões de todos os caminhos da história. Abra uma frase para consultar seu significado.</p><label htmlFor="phrase-search">Encontrar uma expressão em inglês ou português</label><input id="phrase-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tente: mine, gostar, despedir…" /><p className="study-small" role="status"><BrowserText>{filtered.length}</BrowserText> <BrowserText>expressões</BrowserText></p><div className="study-phrase-list">{filtered.map(item => <details key={item.id}><summary><span lang="en"><BrowserText>{item.text}</BrowserText></span>{lived.has(normalizeAnswer(item.text)) && <small>Na sua conversa</small>}</summary><p><BrowserText>{item.meaning}</BrowserText></p><CachedAudio references={[{ id: item.id, scope: "full" }]} publishedAudio={publishedAudio} /></details>)}</div>{filtered.length === 0 && <p>Nenhuma expressão encontrada. Tente outra palavra.</p>}</section>}
    {view === "finished" && <section className="study-finished"><p className="study-eyebrow">Uma pausa para perceber</p><h1 ref={heading} tabIndex={-1}>{allDone ? <><BrowserText>Você concluiu</BrowserText><br /><BrowserText>este percurso.</BrowserText></> : <><BrowserText>Seu percurso</BrowserText><br /><BrowserText>até aqui.</BrowserText></>}</h1><p><BrowserText>Você concluiu </BrowserText><BrowserText>{completedCount}</BrowserText> <BrowserText>das </BrowserText><BrowserText>{studySteps.length}</BrowserText> <BrowserText>práticas. </BrowserText>{progress.supported.length > 0 ? <BrowserText>{`${progress.supported.length} com consulta ao modelo na tentativa registrada. Você pode revisitá-las para tentar sem essa consulta.`}</BrowserText> : <BrowserText>{"Volte outro dia e experimente responder sem consultar as explicações."}</BrowserText>}</p><div className="study-intro-actions"><button className="study-primary" onClick={() => open(Math.max(0, studySteps.findIndex(({ step }) => progress.supported.includes(step.id) || !progress.completed.includes(step.id))))}><RotateCcw size={18} aria-hidden="true" />{allDone ? <BrowserText>{"Revisitar as práticas"}</BrowserText> : <BrowserText>{"Continuar descobrindo"}</BrowserText>}</button><button onClick={() => setView("overview")}>Ver meu percurso</button><Link href="/demo">Rever a conversa</Link></div><p className="study-small">A marca de consulta registra apenas o modelo aberto naquela tentativa; explicações, pistas e feedback também são apoios. Este percurso é uma primeira exploração. A revisão e o uso em outras situações continuam fazendo parte do aprendizado.</p></section>}
    <footer className="study-footer"><span>BasedSpeak · Do encontro ao entendimento.</span><Link href="/demo">Voltar à conversa</Link></footer>
  </main>;
}

export function StudyCard({ step, publishedAudio, onComplete, onNext, onPrevious, headingRef }: { step: StudyStep; publishedAudio: PublishedAudioCatalog; onComplete: (supported: boolean) => void; onNext: () => void; onPrevious?: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const [phase, setPhase] = useState<"learn" | "practice">("learn");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "retry" | "model" | null>(null);
  const [model, setModel] = useState(false);
  const [hint, setHint] = useState(false);
  const practice = step.practice;
  const solution = practice.kind === "write" ? practice.answers[0] : practice.answer;
  const locked = feedback === "correct" || feedback === "model";
  const tokens = practice.kind === "order" ? [...practice.tokens, ...(practice.distractors ?? [])] : [];
  const inputAnswer = practice.kind === "order" ? selected.map(index => tokens[index]).join(" ") : answer;
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

  return <article className="study-card"><h1 ref={headingRef} tabIndex={-1}><BrowserText>{step.title}</BrowserText></h1>
    {phase === "learn" ? <><div className="study-quote"><span className="study-eyebrow">Uma frase para explorar</span><p lang="en"><BrowserText>{step.phrase}</BrowserText></p><span><BrowserText>{step.meaning}</BrowserText></span><CachedAudio references={step.storyAudio} publishedAudio={publishedAudio} />{step.storyAudio.length === 0 && <p className="study-small">Exemplo novo, sem gravação na história.</p>}</div><p className="study-explanation"><BrowserText>{step.body}</BrowserText></p><details className="study-deeper"><summary>Entender um pouco mais</summary><p><BrowserText>{step.detail}</BrowserText></p></details><div className="study-card-actions">{onPrevious && <button className="study-text-button" onClick={onPrevious}><ArrowLeft size={16} aria-hidden="true" />Anterior</button>}<button className="study-primary" onClick={() => setPhase("practice")}>Experimentar<ArrowRight size={18} aria-hidden="true" /></button></div></>
      : <><p className="study-eyebrow"><BrowserText>Sua vez · </BrowserText>{practice.kind === "order" ? <BrowserText>{"Organize as peças"}</BrowserText> : practice.kind === "write" ? <BrowserText>{"Complete em inglês"}</BrowserText> : <BrowserText>{"Escolha pelo sentido"}</BrowserText>}</p><h2 ref={practiceHeading} tabIndex={-1}><BrowserText>{practice.prompt}</BrowserText></h2><form onSubmit={check}>
        {practice.context && <ol className="study-practice-context">{practice.context.map(item => <li key={item.text}><span lang="en"><BrowserText>{item.text}</BrowserText></span><small><BrowserText>{item.meaning}</BrowserText></small></li>)}</ol>}
        {practice.instruction && <p className="study-practice-instruction"><BrowserText>{practice.instruction}</BrowserText></p>}
        {practice.kind === "choice" && <fieldset className="study-choices"><legend className="study-sr-only">Escolha uma resposta</legend>{practice.options.map((option, index) => <label key={option} data-selected={answer === option}><input type="radio" name={step.id} value={option} checked={answer === option} disabled={locked} onChange={() => { setAnswer(option); edit(); }} /><span className="study-choice-letter" aria-hidden="true"><BrowserText>{String.fromCharCode(65 + index)}</BrowserText></span><span><BrowserText>{option}</BrowserText></span></label>)}</fieldset>}
        {practice.kind === "order" && <><div className="study-answer-bank" aria-label="Sua frase"><span className="study-small">Toque em uma peça para devolvê-la</span><div>{selected.length ? selected.map((index, position) => <button type="button" lang="en" disabled={locked} key={index} aria-label={`Devolver ${tokens[index]}`} onClick={() => { setSelected(selected.filter((_, i) => i !== position)); edit(); }}><BrowserText>{tokens[index]}</BrowserText> <span aria-hidden="true">×</span></button>) : <p className="study-small">Sua frase aparece aqui.</p>}</div></div><div className="study-token-bank" aria-label="Peças disponíveis">{tokens.map((token, index) => <button key={index} type="button" lang="en" disabled={locked || selected.includes(index)} onClick={() => { setSelected([...selected, index]); edit(); }}><BrowserText>{token}</BrowserText></button>)}</div></>}
        {practice.kind === "write" && <><label className="study-input-label" htmlFor={`answer-${step.id}`}>Sua resposta em inglês</label><input id={`answer-${step.id}`} lang="en" autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={locked} value={answer} onChange={event => { setAnswer(event.target.value); edit(); }} /><button type="button" className="study-text-button" onClick={() => setHint(!hint)} aria-expanded={hint}>{hint ? <BrowserText>{"Fechar pista"}</BrowserText> : <BrowserText>{"Quero uma pista"}</BrowserText>}</button>{hint && <p className="study-hint"><BrowserText>{practice.hint}</BrowserText></p>}</>}
        <div className="study-feedback" role="status" aria-live="polite">{feedback === "retry" && <><strong>Ainda não combina com esta proposta.</strong><p><BrowserText>{practiceFeedback(practice, inputAnswer)}</BrowserText> {practice.kind === "write" && <BrowserText>{"Outras formas podem ser válidas; aqui praticamos a estrutura deste passo."}</BrowserText>}</p></>}{feedback === "correct" && <><strong>{model ? <BrowserText>{"Você praticou com apoio."}</BrowserText> : <BrowserText>{"Isso combina com a situação."}</BrowserText>}</strong><p><BrowserText>{practice.explanation}</BrowserText></p></>}{feedback === "model" && <><strong>Um jeito de dizer:</strong><p lang="en"><BrowserText>{solution}</BrowserText></p><p><BrowserText>{practice.explanation}</BrowserText></p></>}</div>
        <div className="study-card-actions"><button type="button" className="study-text-button" onClick={() => setPhase("learn")}><ArrowLeft size={16} aria-hidden="true" />Rever explicação</button>{!locked && <button className="study-primary" disabled={!inputAnswer.trim()}>Conferir<Check size={18} aria-hidden="true" /></button>}</div>
      </form>{locked ? <div className="study-next"><button className="study-text-button" onClick={retry}>Tentar outra vez</button><button className="study-primary" onClick={onNext}>Continuar<ArrowRight size={18} aria-hidden="true" /></button></div> : <button className="study-text-button study-model" onClick={reveal}>Consultar um modelo e continuar com apoio</button>}</>}
  </article>;
}
