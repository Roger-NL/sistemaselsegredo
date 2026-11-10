"use client";
import { useVisibleHeight } from "@/components/core/use-visible-height";
import { AutoFit } from "@/components/core/AutoFit";
import { SpeakerLabel } from "@/features/demo/components/SpeakerLabel";
import { BrowserText } from "@/components/i18n/BrowserText";


import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Lightbulb, RotateCcw, Volume2 } from "lucide-react";
import { AppHeader } from "@/components/navigation/AppHeader";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";
import { audio } from "@/features/demo/content/media";
import { getBrowserSnapshot, getServerSnapshot, subscribe } from "@/features/demo/session/browser";
import { lessons, type StudyStep } from "./content";
import { completeStep, decodeProgress, isCorrect, isCorrectGap, normalizeAnswer, practiceFeedback, studySteps, type StudyProgress } from "./progress";

import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace, type WorkspaceState } from "@/features/dashboard/workspace-store";
import { PracticeAccess } from "@/features/dashboard/PracticeAccess";
import { canPractice, practiceLearning } from "@/features/dashboard/practice-access";
import { GuestProgressImport } from "@/features/dashboard/GuestProgressImport";
import { playInteractionSound } from "@/components/interaction/sounds";
import { StudyPieceBoard } from "./StudyPieceBoard";
import { StudyText } from "./StudyText";

const phrases = Object.values(audio).filter((phrase, index, all) => all.findIndex(other => other.role === phrase.role && normalizeAnswer(other.text) === normalizeAnswer(phrase.text)) === index);

/** Native controls remain lazy, and playing one published clip pauses the others. */
export function pauseOtherStudyAudio(container: ParentNode, active: HTMLAudioElement) {
  container.querySelectorAll<HTMLAudioElement>("audio").forEach(element => { if (element !== active && !element.paused) element.pause(); });
}
export function CachedAudio({ references, publishedAudio }: { references: StudyStep["storyAudio"]; publishedAudio: PublishedAudioCatalog }) {
  const [rate, setRate] = useState(1);
  return <>{references.map(reference => {
    const asset = audio[reference.id];
    const source = publishedAudio[reference.id]?.audioUrl;
    return source ? <div key={reference.id} className="study-audio"><SpeakerLabel role={asset.role} model={asset.role === "you"} /><label className="study-listening-speed">Ritmo de escuta<select aria-label={`Velocidade: ${asset.role === "you" ? "sua resposta" : "Lucas"} — ${asset.text}`} value={rate} onChange={event => setRate(Number(event.target.value))}><option value={1}>Lento (padrão)</option><option value={0.8}>Ainda mais lento</option></select></label>{reference.scope === "excerpt" && <span>Ouvir fala completa da história</span>}<audio ref={element => { if (element) { element.playbackRate = rate; element.preservesPitch = true; } }} aria-label={`Ouvir ${asset.role === "you" ? "modelo da sua resposta" : "Lucas"}: ${asset.text}`} controls preload="none" src={source} /></div> : null;
  })}</>;
}

export function TheoryExperience({ publishedAudio, resumeStudy = false }: { publishedAudio: PublishedAudioCatalog; resumeStudy?: boolean }) {
  const workspaceState = useStudentWorkspace();
  const allowed = canPractice(workspaceState);
  return <>
    {allowed && <ConnectedTheory key={`${workspaceState.generation}:${resumeStudy}`} publishedAudio={publishedAudio} workspaceState={workspaceState} resumeStudy={resumeStudy} />}
    {!allowed && <main className="study-shell"><AppHeader current="study" /><PracticeAccess state={workspaceState} retry={workspaceState.refresh} /></main>}
  </>;
}

function ConnectedTheory({ publishedAudio, workspaceState, resumeStudy }: { publishedAudio: PublishedAudioCatalog; workspaceState: WorkspaceState; resumeStudy: boolean }) {
  const shell = useRef<HTMLElement>(null);
  useVisibleHeight(shell, "--study-height");
  const progress = decodeProgress(practiceLearning(workspaceState)?.studySnapshot ?? null);
  const guest = !workspaceState.workspace;
  const ready = true;
  const [view, setView] = useState<"overview" | "study" | "phrases" | "finished">(resumeStudy ? "study" : "overview");
  const [search, setSearch] = useState("");

  const heading = useRef<HTMLHeadingElement>(null);
  const session = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const current = studySteps[progress.position];
  useEffect(() => () => studentWorkspace.endEdit(workspaceState.generation), [workspaceState.generation, view, current.step.id]);
  const completedCount = progress.completed.length;
  const allDone = completedCount === studySteps.length;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [view, progress.position]);

  function save(next: StudyProgress) {
    return studentWorkspace.stage("studySnapshot", JSON.stringify(next), workspaceState.generation);
  }
  function acknowledge() {
    const learned = completeStep(progress, current.step.id, progress.supported.includes(current.step.id));
    const last = progress.position === studySteps.length - 1;
    if (!save({ ...learned, position: last ? progress.position : progress.position + 1 })) return;
    setView(last ? "finished" : "study");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function open(position: number) {
    save({ ...progress, position }); setView("study"); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function next() {
    if (progress.position === studySteps.length - 1) { setView("finished"); window.scrollTo({ top: 0, behavior: "instant" }); }
    else open(progress.position + 1);
  }
  const lived = new Set(session.state?.transcript.map(line => `${line.role}:${normalizeAnswer(line.written ?? audio[line.audioId].text)}`) ?? []);
  const filtered = phrases.filter(item => `${item.text} ${item.meaning}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));

  return <main ref={shell} className="study-shell" data-view={view} onPlay={event => pauseOtherStudyAudio(event.currentTarget, event.target as HTMLAudioElement)}>
    <AppHeader current="study" guest={guest} />
    <GuestProgressImport state={workspaceState} />
    {view !== "study" && <nav className="study-breadcrumb" aria-label="Etapas da experiência"><Link href="/demo">A conversa</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Meu estudo</span></nav>}
    <p className={view === "study" ? "study-sr-only" : "study-session-note"} role="status">{guest ? <BrowserText>{"Seu avanço fica salvo neste navegador."}</BrowserText> : workspaceState.saving ? <BrowserText>{"Salvando seu estudo…"}</BrowserText> : <BrowserText>{"Estudo sincronizado com sua conta."}</BrowserText>}</p>{workspaceState.notice && <p className="study-notice" role="status"><BrowserText>{workspaceState.notice}</BrowserText></p>}
    {allDone && (view === "overview" || view === "finished") && <section className="study-completion" aria-label="Do estudo à aula ao vivo"><Check size={23} aria-hidden="true" /><div><h2>Seu estudo está concluído.</h2><p>{guest ? <BrowserText>{"Para pedir sua aula gratuita, crie uma conta ou entre. Depois, escolha salvar este percurso na conta para continuar sem refazer o percurso."}</BrowserText> : workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? <BrowserText>{"Consulte o pedido, a confirmação ou o registro da sua aula gratuita no painel."}</BrowserText> : <BrowserText>{"Você percorreu todas as etapas. O próximo encontro é uma aula gratuita com o professor."}</BrowserText>}</p></div>{workspaceState.saving ? <button className="study-primary" disabled>Confirmando seu progresso…</button> : <Link className="study-primary" prefetch={false} href={guest ? "/comecar" : "/dashboard#aula-ao-vivo"}>{guest ? <BrowserText>{"Criar minha conta para a aula"}</BrowserText> : workspaceState.workspace?.liveClass && workspaceState.workspace.liveClass.status !== "cancelled" ? <BrowserText>{"Ver minha aula ao vivo"}</BrowserText> : <BrowserText>{"Agendar minha aula gratuita"}</BrowserText>}<ArrowRight size={17} aria-hidden="true" /></Link>}{guest && <Link href="/comecar?modo=entrar">Já tenho conta</Link>}</section>}
    {view === "overview" && <>
      <section className="study-intro"><div><p className="study-eyebrow">8 blocos · 24 etapas</p><h1 ref={heading} tabIndex={-1}>Seu inglês, passo a passo.</h1><p className="study-lead">Entenda como o inglês funciona, com exemplos da conversa.</p><div className="study-intro-actions"><button className="study-primary" disabled={!ready} onClick={() => open(progress.position)}>{allDone ? <BrowserText>{"Revisitar meu estudo"}</BrowserText> : completedCount ? <BrowserText>{"Continuar meu estudo"}</BrowserText> : <BrowserText>{"Começar a descobrir"}</BrowserText>}<ArrowRight size={18} aria-hidden="true" /></button><button className="study-text-button" onClick={() => setView("phrases")}>Consultar as expressões</button></div></div></section>
      <section className="study-path" aria-labelledby="path-title"><div className="study-section-heading"><h2 id="path-title">Entenda sua primeira conversa</h2><span><BrowserText>{completedCount}</BrowserText> <BrowserText>de </BrowserText><BrowserText>{studySteps.length}</BrowserText> <BrowserText>etapas concluídas</BrowserText></span></div><progress max={studySteps.length} value={completedCount} aria-label="Etapas concluídas" />
        <ol>{lessons.map((lesson, i) => { const done = lesson.steps.filter(step => progress.completed.includes(step.id)).length; return <li key={lesson.id}><button disabled={!ready} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)) < 0 ? studySteps.findIndex(item => item.lesson.id === lesson.id) : studySteps.findIndex(item => item.lesson.id === lesson.id && !progress.completed.includes(item.step.id)))}><span className="study-number">{done === lesson.steps.length ? <Check size={22} aria-label="Concluído" /> : <BrowserText>{String(i + 1).padStart(2, "0")}</BrowserText>}</span><span className="study-path-copy"><strong><BrowserText>{lesson.title}</BrowserText></strong><span><BrowserText>{lesson.description}</BrowserText></span></span><span className="study-path-count"><BrowserText>{done}</BrowserText><BrowserText>/</BrowserText><BrowserText>{lesson.steps.length}</BrowserText></span><ArrowRight size={20} aria-hidden="true" /></button></li>; })}</ol>
        <p className="study-small">{guest ? <BrowserText>{"Seu avanço fica salvo neste navegador. Uma conta permite continuar em outros dispositivos."}</BrowserText> : <BrowserText>{"Seu avanço fica salvo na sua conta."}</BrowserText>} <BrowserText>Este percurso é uma introdução; não é uma avaliação de nível.</BrowserText></p>
      </section>
    </>}
    {view === "study" && <div className="study-workspace"><aside className="study-sidebar"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Todos os blocos</button><p className="study-eyebrow">Seu percurso</p><ol>{lessons.map((lesson, index) => <li key={lesson.id}><button aria-current={current.lesson.id === lesson.id ? "step" : undefined} onClick={() => open(studySteps.findIndex(item => item.lesson.id === lesson.id))}><span><BrowserText>{String(index + 1).padStart(2, "0")}</BrowserText></span><BrowserText>{lesson.title}</BrowserText></button></li>)}</ol><p className="study-small">Uma pausa também faz parte.<br />Seu ponto de retorno fica salvo.</p></aside>
      <section className="study-main"><div className="study-step-meta"><button className="study-text-button study-mobile-back" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Blocos</button><span><BrowserText>{current.lesson.title}</BrowserText></span><span><BrowserText>Passo </BrowserText>{<BrowserText>{progress.position + 1}</BrowserText>}<BrowserText>/</BrowserText><BrowserText>{studySteps.length}</BrowserText></span></div><progress max={studySteps.length} value={completedCount} aria-label="Etapas concluídas" />
        <StudyCard onEdit={() => studentWorkspace.beginEdit(workspaceState.generation)} onAcknowledge={acknowledge} key={current.step.id} step={current.step} nextStepTitle={studySteps[progress.position + 1]?.step.title} headingRef={heading} publishedAudio={publishedAudio} onComplete={supported => save(completeStep(progress, current.step.id, supported))} onNext={next} onSkip={workspaceState.workspace?.account.role === "manager" ? next : undefined} onPrevious={progress.position > 0 ? () => open(progress.position - 1) : undefined} />
      </section>
    </div>}
    {view === "phrases" && <section className="study-glossary"><button className="study-text-button" onClick={() => setView("overview")}><ArrowLeft size={16} aria-hidden="true" />Voltar aos blocos</button><p className="study-eyebrow">Para ter por perto</p><h1 ref={heading} tabIndex={-1}>O inglês da cafeteria.</h1><p>As falas de Lucas e os modelos para você responder. Cada card indica quem fala. Abra uma frase para consultar seu significado.</p><label htmlFor="phrase-search">Encontrar uma expressão em inglês ou português</label><input id="phrase-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Busque uma palavra ou expressão…" /><p className="study-small" role="status"><BrowserText>{filtered.length}</BrowserText> <BrowserText>falas</BrowserText></p><div className="study-phrase-list">{filtered.map(item => <details key={item.id} data-speaker={item.role}><summary><span className="study-phrase-speaker"><BrowserText>{item.role === "you" ? "Você · modelo da resposta" : "Lucas · fala dele"}</BrowserText></span><span lang="en" translate="no"><StudyText english>{item.text}</StudyText></span>{lived.has(`${item.role}:${normalizeAnswer(item.text)}`) && <small>Na sua conversa</small>}</summary><p><BrowserText>{item.meaning}</BrowserText></p><CachedAudio references={[{ id: item.id, scope: "full" }]} publishedAudio={publishedAudio} /></details>)}</div>{filtered.length === 0 && <p>Nenhuma expressão encontrada. Tente outra palavra.</p>}</section>}
    {view === "finished" && <section className="study-finished"><p className="study-eyebrow">Uma pausa para perceber</p><h1 ref={heading} tabIndex={-1}>{allDone ? <><BrowserText>Você concluiu</BrowserText><br /><BrowserText>este percurso.</BrowserText></> : <><BrowserText>Seu percurso</BrowserText><br /><BrowserText>até aqui.</BrowserText></>}</h1><p><BrowserText>Você concluiu </BrowserText><BrowserText>{completedCount}</BrowserText> <BrowserText>das </BrowserText><BrowserText>{studySteps.length}</BrowserText> <BrowserText>etapas. </BrowserText>{progress.supported.length > 0 ? <BrowserText>{`${progress.supported.length} etapas com registro de consulta ao modelo. Você pode revisitar os exemplos e as práticas.`}</BrowserText> : <BrowserText>{"Você pode voltar aos exemplos e às atividades quando quiser."}</BrowserText>}</p><div className="study-intro-actions"><button className="study-primary" onClick={() => open(Math.max(0, studySteps.findIndex(({ step }) => (step.mode === "practice" && progress.supported.includes(step.id)) || !progress.completed.includes(step.id))))}><RotateCcw size={18} aria-hidden="true" />{allDone ? <BrowserText>{"Revisitar o estudo"}</BrowserText> : <BrowserText>{"Continuar descobrindo"}</BrowserText>}</button><button onClick={() => setView("overview")}>Ver meu percurso</button><Link href="/demo">Rever a conversa</Link></div><p className="study-small">A marca de consulta registra apenas o modelo aberto naquela tentativa; explicações, pistas e feedback também são apoios. Este percurso é uma primeira exploração. A revisão e o uso em outras situações continuam fazendo parte do aprendizado.</p></section>}
    <footer className="study-footer"><span>BasedSpeak · Do encontro ao entendimento.</span><Link href="/demo">Voltar à conversa</Link></footer>
  </main>;
}

export function StudyCard({ step, publishedAudio, onComplete, onNext, onAcknowledge, onPrevious, headingRef, onEdit, onSkip, nextStepTitle }: { onAcknowledge: () => void; nextStepTitle?: string; onSkip?: () => void; onEdit?: () => void; step: StudyStep; publishedAudio: PublishedAudioCatalog; onComplete: (supported: boolean) => void; onNext: () => void; onPrevious?: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const practice = step.practice;
  const inlineGaps = practice.kind === "write" ? practice.gaps : undefined;
  const [gapAnswers, setGapAnswers] = useState<string[]>(() => inlineGaps?.map(() => "") ?? []);
  const [phase, setPhase] = useState<"learn" | "practice">("learn");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "retry" | "model" | null>(null);
  const [model, setModel] = useState(false);
  const locked = feedback === "correct" || feedback === "model";
  const actionLabel = practice.kind === "order" ? "Monte" : practice.kind === "choice" ? practice.placement ? "Responda" : "Escolha" : inlineGaps ? "Complete" : "Escreva";
  const tokens = practice.kind === "order" ? [...practice.tokens, ...(practice.distractors ?? [])] : [];
  const inputAnswer = inlineGaps ? gapAnswers.join(" ") : practice.kind === "order" ? selected.map(index => tokens[index]).join(" ") : answer;
  const canCheck = inlineGaps ? gapAnswers.every(value => value.trim()) : practice.kind === "order" ? selected.length === practice.tokens.length : Boolean(inputAnswer.trim());
  const gapInputs = useRef<(HTMLInputElement | null)[]>([]);
  const practiceHeading = useRef<HTMLHeadingElement>(null);
  const reading = useRef<HTMLDivElement>(null);
  const practiceFormId = `study-practice-${step.id}`;
  useEffect(() => {
    if (reading.current) reading.current.scrollTop = 0;
    if (phase === "practice") {
      practiceHeading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    } else headingRef.current?.focus();
  }, [phase, headingRef]);
  function check(event: FormEvent) {
    event.preventDefault();
    if (locked || !canCheck) return;
    if (isCorrect(practice, inlineGaps ? gapAnswers : inputAnswer)) { void playInteractionSound("correct"); setFeedback("correct"); onComplete(model); }
    else {
      void playInteractionSound("retry"); setFeedback("retry");
      const firstWrong = inlineGaps?.findIndex((gap, index) => !isCorrectGap(gap, gapAnswers[index]));
      if (firstWrong !== undefined && firstWrong >= 0) requestAnimationFrame(() => {
        const input = gapInputs.current[firstWrong];
        input?.focus({ preventScroll: true });
        input?.scrollIntoView?.({ block: "center" });
      });
    }
  }
  function edit() { onEdit?.(); setFeedback(null); }
  function reveal() {
    onEdit?.();
    if (inlineGaps) setGapAnswers(inlineGaps.map(gap => gap.answers[0]));
    else if (practice.kind === "write") setAnswer(practice.answers[0]);
    if (practice.kind === "choice") setAnswer(practice.answer);
    if (practice.kind === "order") setSelected(practice.answer.split(/\s+/).map(word => tokens.indexOf(word)));
    setModel(true); setFeedback("model"); onComplete(true);
  }
  function retry() {
    onEdit?.();
    setFeedback(null); setAnswer(""); setGapAnswers(inlineGaps?.map(() => "") ?? []); setSelected([]); setModel(false);
  }

  return <article className="study-card" data-phase={phase} data-feedback={feedback ?? "none"}>
    <AutoFit className="study-card-reading" shellRef={reading}>
    <h1 ref={headingRef} tabIndex={-1} className={phase === "practice" ? "study-sr-only" : undefined}><StudyText>{step.title}</StudyText></h1>
    <p className="study-language-key"><span aria-hidden="true" />Os destaques indicam palavras e expressões em inglês para estudar.</p>
    {step.mode === "practice" && <ol className="study-task-path study-sr-only" aria-label="Caminho deste passo">
      <li aria-current={phase === "learn" ? "step" : undefined}><span aria-hidden="true">1</span> Entenda</li>
      <li aria-current={phase === "practice" && !locked ? "step" : undefined}><span aria-hidden="true">2</span> <BrowserText>{actionLabel}</BrowserText></li>
      <li aria-current={phase === "practice" && locked ? "step" : undefined}><span aria-hidden="true">3</span> Confira</li>
    </ol>}
    {phase === "learn" ? <>
      <div className="study-quote">
        <p lang="en" translate="no"><StudyText english>{step.phrase}</StudyText></p>
        <span><BrowserText>{step.meaning}</BrowserText></span>
        {step.storyAudio.some(reference => publishedAudio[reference.id]?.audioUrl) && <details className="study-listen">
          <summary><Volume2 size={17} aria-hidden="true" />Ouvir exemplo<ChevronDown size={15} aria-hidden="true" /></summary>
          <CachedAudio references={step.storyAudio} publishedAudio={publishedAudio} />
        </details>}
      </div>
      <section className="study-reason" aria-label="Por que funciona">
        <h2><Lightbulb size={17} aria-hidden="true" />O porquê</h2>
        <p><StudyText>{step.why}</StudyText></p>
      </section>
      {step.examples && <ul className="study-examples" aria-label="Veja a diferença">{step.examples.map(example => <li key={example.text}>
        <div><span lang="en" translate="no"><StudyText english>{example.text}</StudyText></span><small><BrowserText>{example.meaning}</BrowserText></small></div>
        {example.note && <span className="study-example-note"><StudyText>{example.note}</StudyText></span>}
      </li>)}</ul>}
      <details className="study-deeper">
        <summary>Mais detalhes<ChevronDown size={17} aria-hidden="true" /></summary>
        <p className="study-explanation"><StudyText>{step.body}</StudyText></p>
        <p><StudyText>{step.detail}</StudyText></p>
      </details>

    </> : <>
      <h2 className="study-task-heading" ref={practiceHeading} tabIndex={-1}><StudyText>{practice.prompt}</StudyText></h2>
      <form id={practiceFormId} onSubmit={check}>
        {practice.context && <ol className="study-practice-context">{practice.context.map(item => <li key={item.text}><span lang="en" translate="no"><StudyText english>{item.text}</StudyText></span><small><BrowserText>{item.meaning}</BrowserText></small></li>)}</ol>}
        {practice.instruction && <p className="study-practice-instruction"><StudyText>{practice.instruction}</StudyText></p>}
        {practice.kind === "choice" && !practice.placement && <fieldset className="study-choices"><legend className="study-sr-only">Escolha uma resposta</legend>{practice.options.map((option, index) => <label key={option} data-selected={answer === option}>
          <input type="radio" name={step.id} value={option} checked={answer === option} disabled={locked} onChange={() => { setAnswer(option); edit(); }} />
          <span className="study-choice-letter" aria-hidden="true"><BrowserText>{String.fromCharCode(65 + index)}</BrowserText></span>
          <span><StudyText english={practice.optionLanguage === "en"}>{option}</StudyText></span>
        </label>)}</fieldset>}
        {practice.kind === "choice" && practice.placement && <StudyPieceBoard tokens={practice.options} selected={answer ? [practice.options.indexOf(answer)] : []} onChange={selection => { setAnswer(selection.length ? practice.options[selection[0]] : ""); edit(); }} slots={1} locked={locked} mode="reply" cue={practice.placement.cue} />}
        {practice.kind === "order" && <StudyPieceBoard tokens={tokens} selected={selected} onChange={selection => { setSelected(selection); edit(); }} slots={practice.tokens.length} locked={locked} />}
        {inlineGaps && <fieldset className="study-gap-list"><legend className="study-sr-only">Complete as lacunas nas frases</legend>{inlineGaps.map((gap, index) => <label className="study-gap-row" key={index}>
          <span className="study-gap-sentence" lang="en" translate="no">
            <BrowserText>{gap.before}</BrowserText>
            <input className="study-gap" ref={element => { gapInputs.current[index] = element; }} aria-describedby={feedback === "retry" && !isCorrectGap(gap, gapAnswers[index]) ? "gap-feedback-" + step.id + "-" + index : undefined} aria-label={"Lacuna " + (index + 1) + ": " + gap.meaning} aria-invalid={feedback === "retry" ? !isCorrectGap(gap, gapAnswers[index]) : undefined} style={{ width: Math.max(6, ...gap.answers.map(value => value.length + 3)) + "ch" }} lang="en" autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={locked} value={gapAnswers[index]} onChange={event => { setGapAnswers(gapAnswers.map((value, position) => position === index ? event.target.value : value)); edit(); }} />
            <BrowserText>{gap.after}</BrowserText>
          </span>
          <small><BrowserText>{gap.meaning}</BrowserText></small>
          {feedback === "retry" && !isCorrectGap(gap, gapAnswers[index]) && gap.feedback && <small className="study-gap-feedback" id={"gap-feedback-" + step.id + "-" + index}><StudyText>{gap.feedback}</StudyText></small>}
        </label>)}</fieldset>}
        {practice.kind === "write" && !inlineGaps && <>
          <label className="study-input-label" htmlFor={"answer-" + step.id}>Sua resposta em inglês</label>
          <input id={"answer-" + step.id} lang="en" autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={locked} value={answer} onChange={event => { setAnswer(event.target.value); edit(); }} />
        </>}
        {feedback && <div className="study-feedback" data-state={feedback}>
          <div role="status" aria-live="polite">
            <strong>{feedback === "retry" ? <BrowserText>Vamos ajustar</BrowserText> : feedback === "model" ? <BrowserText>Com apoio</BrowserText> : <><Check size={18} aria-hidden="true" /><BrowserText>Certo.</BrowserText></>}</strong>
            {feedback === "retry" && <p><StudyText>{inlineGaps ? "Ajuste a lacuna destacada." : practiceFeedback(practice, inputAnswer)}</StudyText></p>}
            {locked && <p><StudyText>{step.why}</StudyText></p>}
          </div>
          {locked && <details className="study-result-detail">
            <summary>Entender a resposta<ChevronDown size={16} aria-hidden="true" /></summary>
            <p><StudyText>{practice.explanation}</StudyText></p>
            <button type="button" className="study-text-button" onClick={() => setPhase("learn")}>Rever explicação</button>
          </details>}
        </div>}
        {!locked && <>
          <details className="study-support">
            <summary><Lightbulb size={17} aria-hidden="true" />Ajuda<ChevronDown size={15} aria-hidden="true" /></summary>
            <div className="study-support-content">
              <p className="study-hint"><StudyText>{practice.hint}</StudyText></p>
              <div className="study-support-actions">
                <button type="button" className="study-text-button" onClick={() => setPhase("learn")}>Rever explicação</button>
                <button type="button" className="study-text-button" onClick={reveal}>Ver modelo</button>
              </div>
              <small>Ver o modelo registra esta prática com apoio.</small>
            </div>
          </details>

        </>}
      </form>

    </>}
    </AutoFit>
    <div className="study-card-controls" key={`${phase}:${locked ? "locked" : "open"}`}>
      {phase === "learn" ? <>
      <div className="study-card-actions">
        {onPrevious && <button className="study-text-button" data-ui-sound="advance" onClick={onPrevious}><ArrowLeft size={16} aria-hidden="true" />Anterior</button>}
        {step.mode === "practice" ? <button className="study-primary" data-ui-sound="advance" onClick={() => { onEdit?.(); setPhase("practice"); }}>Praticar<ArrowRight size={18} aria-hidden="true" /></button>
          : <button className="study-primary" data-ui-sound="advance" onClick={onAcknowledge}>Entendi, continuar<ArrowRight size={18} aria-hidden="true" /></button>}
      </div>
      </> : locked ? <>
      <div className="study-next">
        {nextStepTitle && <p className="study-next-preview"><BrowserText>{"A seguir: " + nextStepTitle}</BrowserText></p>}
        <button className="study-text-button" onClick={retry}>Tentar outra vez</button>
        <button className="study-primary" data-ui-sound="advance" onClick={onNext}>Continuar<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
      </> : <>
          <div className="study-checkbar"><button type="submit" form={practiceFormId} className="study-primary" data-ui-sound="none" disabled={!canCheck}>Conferir<Check size={18} aria-hidden="true" /></button></div>
      </>}
    {onSkip && !locked && <button type="button" className="study-text-button study-admin-skip" data-ui-sound="advance" onClick={onSkip}>Avançar sem concluir (ADM)<ArrowRight size={16} aria-hidden="true" /></button>}
    </div>
  </article>;
}
