"use client";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { CONCLUSION_THEORY, CONCLUSION_QUESTIONS } from "@/features/first-encounters/lesson-conclusion";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { testActionDestination, type TestAction } from "./actions";
import "./test-controls.css";
export function TestControls() {
  const { workspace, status } = useStudentWorkspace();
  if (status !== "ready" || !workspace?.account.canTest) return null;
  return <button type="button" className="test-controls-trigger" aria-label="Controles de teste da minha conta" aria-haspopup="dialog" title={workspace.learning.testMode ? "Percurso de teste: conclusões simuladas, sem liberar novas reservas" : "Controles de teste da minha conta"} onClick={()=>window.dispatchEvent(new Event("basedspeak.test-controls.open"))}><Settings2 size={20} aria-hidden="true" /><span>Teste</span></button>;
}
export function TestControlsOverlay() {
  const [open,setOpen] = useState(false);
  const {workspace,status} = useStudentWorkspace();
  useEffect(()=>{const show=()=>setOpen(true);window.addEventListener("basedspeak.test-controls.open",show);return()=>window.removeEventListener("basedspeak.test-controls.open",show);},[]);
  return open && status === "ready" && workspace?.account.canTest ? <TestPanel onClose={()=>setOpen(false)} /> : null;
}
function TestPanel({onClose}:{onClose:()=>void}) {
  const {workspace} = useStudentWorkspace();
  const dialog = useRef<HTMLDialogElement>(null);
  const [part,setPart] = useState(1), [node,setNode] = useState(LESSON_SCENES[0].rounds[0].id), [step,setStep] = useState(0);
  const [busy,setBusy] = useState(false), [notice,setNotice] = useState("");
  const running = useRef(false);
  useEffect(()=>{const element=dialog.current;element?.showModal();return ()=>element?.close();},[]);
  const learning = workspace!.learning;
  const snapshot = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning.lessonSnapshot ?? null)?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT);
  const activities = LESSON_SCENES.filter(scene => scene.mode === "game");
  const rounds = LESSON_SCENES.flatMap(scene => scene.rounds.map(round => ({ ...round, game: scene.game })));
  const reviewSteps = [...CONCLUSION_THEORY.map(page => `Teoria · ${page.title}`), ...CONCLUSION_QUESTIONS.map((question, index) => `Teste ${index + 1} · ${question.prompt}`)];
  async function run(input:TestAction) {
    if (running.current) return;
    running.current=true;
    setBusy(true);setNotice("");
    try {await studentWorkspace.applyTestControl(input);const destination=testActionDestination(input.action);if(destination){onClose();window.location.assign(destination);return;}setNotice("Pronto. Progresso atualizado.");}
    catch(error) {setNotice(error instanceof Error?error.message:"Não foi possível aplicar o comando.");}
    finally {running.current=false;setBusy(false);}
  }
  const action=(text:string,input:TestAction)=><button type="button" data-test-action={input.action} onClick={()=>void run(input)}><BrowserText>{text}</BrowserText></button>;
  return <dialog className="test-controls-dialog" ref={dialog} aria-labelledby="test-controls-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header><div><small>SUA CONTA DE TESTE</small><h2 id="test-controls-title">O que você quer fazer?</h2></div><button type="button" disabled={busy} onClick={onClose}>Fechar <InterfaceIcon name="close" /></button></header>
    <div className="test-controls-scroll">
      <div className="test-control-summary"><span>{learning.testMode ? "Modo de teste" : "Percurso normal"}</span><span>{snapshot.percent}% do percurso</span><span>{snapshot.completedUnits}/49 etapas</span></div>
      <fieldset disabled={busy}>
        <div className="test-quick-actions">{action("Recomeçar percurso real", { action: "reset-real" })}{action("Completar percurso simulado", { action: "complete-all" })}</div>
        <nav className="test-page-links" aria-label="Páginas do curso"><Link href="/dashboard" onClick={onClose}>Meu painel</Link><Link href="/demo" onClick={onClose}>Aula</Link><Link href="/demo?retomar=conclusao" onClick={onClose}>Teoria e teste</Link><Link href="/dashboard#aula-ao-vivo" onClick={onClose}>Minha aula ao vivo</Link>{workspace!.account.role === "manager" && <Link href="/adm" onClick={onClose}>ADM</Link>}</nav>
        <div className="test-control-grid">
          <section><h3>Apresentação</h3><div className="test-control-actions">{action("Mostrar de novo", { action: "reset-presentation" })}{action("Concluir apresentação", { action: "complete-presentation" })}</div></section>
          <section><h3>Aula visual</h3><div className="test-control-actions">{action("Voltar uma rodada", { action: "back" })}{action("Avançar uma rodada", { action: "forward" })}{action("Próxima atividade", { action: "next-part" })}{action("Completar atividades", { action: "complete-demo" })}{action("Recomeçar atividades", { action: "reset-demo" })}</div></section>
          <section><h3>Seis atividades</h3><label>Atividade<select value={part} onChange={event => setPart(Number(event.target.value))}>{activities.map(scene => <option key={scene.id} value={scene.game}>{scene.game}. {scene.title}</option>)}</select></label><div className="test-control-actions">{action("Ir para esta atividade", { action: "jump-part", part })}{action("Completar esta atividade", { action: "complete-part", part })}</div><label>Rodada<select value={node} onChange={event => setNode(event.target.value)}>{rounds.map((round, index) => <option key={round.id} value={round.id}>{index + 1}. Atividade {round.game} · {round.instruction.slice(0, 65)}</option>)}</select></label><div className="test-control-actions">{action("Ir para esta rodada", { action: "jump-node", node })}</div></section>
          <section><h3>Teoria e teste</h3><label>Página ou pergunta<select value={step} onChange={event => setStep(Number(event.target.value))}>{reviewSteps.map((label, index) => <option key={index} value={index}>{label}</option>)}</select></label><div className="test-control-actions">{action("Ir para esta etapa", { action: "study-position", step })}{action("Concluir esta etapa", { action: "study-complete", step })}{action("Refazer esta etapa", { action: "study-uncomplete", step })}{action("Completar teoria e teste", { action: "complete-study" })}{action("Recomeçar teoria e teste", { action: "reset-study" })}</div></section>
        </div>
      </fieldset>
      <p className="test-control-note">Estes comandos alteram o percurso de teste da conta conectada. As conclusões simuladas não liberam novas reservas. Use o painel para acompanhar mensagens e aulas já agendadas.</p>
    </div>
    <footer role="status" aria-live="polite">{busy?<BrowserText>{"Aplicando…"}</BrowserText>:notice||<BrowserText>{"Escolha um comando acima."}</BrowserText>}</footer>
  </dialog>;
}
