"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { nodes, catalog } from "@/features/demo/content/catalog";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { decodeProgress, studySteps } from "@/features/theory/progress";
import type { SupportProfile } from "@/features/demo/model/types";
import { testActionDestination, type TestAction } from "./actions";
import "./test-controls.css";
export function TestControls() {
  const { workspace, status } = useStudentWorkspace();
  if (status !== "ready" || !workspace?.account.canTest) return null;
  return <><button type="button" className="test-controls-trigger" aria-label="Controles de superusuário" title={workspace.learning.testMode ? "Percurso de teste: conclusões simuladas, sem liberar novas reservas" : "Controles de teste da minha conta"} onClick={()=>window.dispatchEvent(new Event("basedspeak.test-controls.open"))}><Settings2 size={20} aria-hidden="true" />{workspace.learning.testMode && <span>Teste</span>}</button></>;
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
  const [profile,setProfile] = useState<SupportProfile>("beginner");
  const [part,setPart] = useState(1), [node,setNode] = useState("p1.first"), [step,setStep] = useState(0);
  const [busy,setBusy] = useState(false), [notice,setNotice] = useState("");
  useEffect(()=>{const element=dialog.current;element?.showModal();return ()=>element?.close();},[]);
  const learning=workspace!.learning, demo=learning.demoSnapshot ? decodeSnapshot(learning.demoSnapshot):null;
  const study=decodeProgress(learning.studySnapshot);
  async function run(input:TestAction) {
    setBusy(true);setNotice("");
    try {await studentWorkspace.applyTestControl(input);const destination=testActionDestination(input.action);if(destination){onClose();window.location.assign(destination);return;}setNotice("Pronto. Progresso atualizado.");}
    catch(error) {setNotice(error instanceof Error?error.message:"Não foi possível aplicar o comando.");}
    finally {setBusy(false);}
  }
  const action=(text:string,input:TestAction)=><button type="button" data-test-action={input.action} onClick={()=>void run(input)}>{text}</button>;
  return <dialog className="test-controls-dialog" ref={dialog} aria-labelledby="test-controls-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header><div><small>SUA CONTA DE TESTE</small><h2 id="test-controls-title">O que você quer fazer?</h2></div><button type="button" disabled={busy} onClick={onClose}>Fechar ×</button></header>
    <div className="test-controls-scroll">
      <div className="test-control-summary"><span>{learning.testMode?"Modo de teste":"Percurso normal"}</span><span>{demo?`Conversa · parte ${catalog[demo.nodeId].part}/10`:"Conversa não iniciada"}</span><span>Estudo · {study.completed.length}/24</span></div>
      <fieldset disabled={busy}>
        <div className="test-quick-actions">{action("Apagar tudo",{action:"reset-all"})}{action("Completar tudo",{action:"complete-all"})}{action("Começar do zero, sem simulação",{action:"reset-real"})}</div>
        <nav className="test-page-links" aria-label="Páginas do curso">
          <Link href="/dashboard" onClick={onClose}>Meu painel ↗</Link><Link href="/demo" onClick={onClose}>Conversa ↗</Link><Link href="/demo/estudo?practice=1" onClick={onClose}>Estudo ↗</Link>{demo?.nodeId === "end" && <Link href="/demo?replay=1" onClick={onClose}>Cenas e áudios ↗</Link>}<Link href="/dashboard#aula-ao-vivo" onClick={onClose}>Minha aula ↗</Link>{workspace!.account.role === "manager" && <Link href="/adm" onClick={onClose}>ADM ↗</Link>}
        </nav>
        <div className="test-control-grid">
          <section><h3>Introdução</h3><div className="test-control-actions">{action("Mostrar de novo",{action:"reset-presentation"})}{action("Pular introdução",{action:"complete-presentation"})}</div></section>
          <section><h3>Conversa</h3><div className="test-control-actions">{action("Voltar uma tela",{action:"back"})}{action("Avançar um momento",{action:"forward"})}{action("Próxima parte",{action:"next-part"})}{action("Completar conversa",{action:"complete-demo"})}{action("Apagar conversa",{action:"reset-demo"})}{action("Iniciar conversa",{action:"start-demo",profile})}</div></section>
          <section><h3>Apoio e partes</h3><label>Nível de apoio<select value={profile} onChange={e=>setProfile(e.target.value as SupportProfile)}><option value="beginner">Iniciante</option><option value="some">Com pistas</option><option value="less">Menos apoio</option></select></label><div className="test-control-actions">{action("Usar este apoio",{action:"profile",profile})}</div><label>Parte da conversa<select value={part} onChange={e=>setPart(Number(e.target.value))}>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>Parte {i+1}</option>)}</select></label><div className="test-control-actions">{action("Ir para esta parte",{action:"jump-part",part,profile})}{action("Completar esta parte",{action:"complete-part",part,profile})}</div><label>Momento específico<select value={node} onChange={e=>setNode(e.target.value)}>{nodes.map((n,i)=><option value={n.id} key={n.id}>{i+1}. Parte {n.part} · {n.context.slice(0,65)}</option>)}</select></label><div className="test-control-actions">{action("Ir para este momento",{action:"jump-node",node,profile})}</div></section>
          <section><h3>Estudo</h3><label>Prática<select value={step} onChange={e=>setStep(Number(e.target.value))}>{studySteps.map(({step:s},i)=><option key={s.id} value={i}>{i+1} · {s.title}</option>)}</select></label><div className="test-control-actions">{action("Ir para esta prática",{action:"study-position",step})}{action("Concluir esta prática",{action:"study-complete",step})}{action("Refazer esta prática",{action:"study-uncomplete",step})}{action("Completar estudo",{action:"complete-study"})}{action("Apagar estudo",{action:"reset-study"})}</div><Link href="/demo/estudo?practice=1" onClick={onClose}>Abrir prática selecionada ↗</Link></section>
          <section className="test-review-controls"><h3>Final da demo</h3><div className="test-control-actions">{action("Ver final",{action:"review",view:"end"})}{action("Ver resumo",{action:"review",view:"moments"})}{action("Ver despedida",{action:"review",view:"thanks"})}{action("Ver conclusão",{action:"review",view:"done"})}</div><Link href="/demo" onClick={onClose}>Abrir conversa ↗</Link></section>
        </div>
      </fieldset>
      <p className="test-control-note">Os comandos são imediatos e salvam no banco da sua conta. Reservas, mensagens, pagamentos e mídias ficam preservados. Avanços simulados continuam marcados como teste.</p>
    </div>
    <footer role="status" aria-live="polite">{busy?"Aplicando…":notice||"Escolha um comando acima."}</footer>
  </dialog>;
}
