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
import type { TestAction } from "./actions";
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
  const confirmBox = useRef<HTMLElement>(null);
  const [profile,setProfile] = useState<SupportProfile>("beginner");
  const [part,setPart] = useState(1), [node,setNode] = useState("p1.first"), [step,setStep] = useState(0);
  const [busy,setBusy] = useState(false), [notice,setNotice] = useState("");
  const [confirmation,setConfirmation] = useState<TestAction|null>(null);
  const [typed,setTyped] = useState("");
  useEffect(()=>{const element=dialog.current;element?.showModal();return ()=>element?.close();},[]);
  useEffect(()=>{if(confirmation){confirmBox.current?.scrollIntoView({block:"nearest"});confirmBox.current?.querySelector("input")?.focus({preventScroll:true});}},[confirmation]);
  const learning=workspace!.learning, demo=learning.demoSnapshot ? decodeSnapshot(learning.demoSnapshot):null;
  const study=decodeProgress(learning.studySnapshot);
  async function run(input:TestAction,confirmed=false) {
    if (input.action.startsWith("reset-") && !confirmed) {setConfirmation(input);setTyped("");setNotice("");return;}
    setBusy(true);setNotice("");
    try {await studentWorkspace.applyTestControl({...input,...(confirmed?{confirmation:"APAGAR PROGRESSO"}:{})});setConfirmation(null);setNotice("Salvo no banco. As páginas da sua conta já usam o novo progresso.");}
    catch(error) {setNotice(error instanceof Error?error.message:"Não foi possível aplicar o controle.");}
    finally {setBusy(false);}
  }
  const action=(text:string,input:TestAction)=><button type="button" onClick={()=>void run(input)}>{text}</button>;
  return <dialog className="test-controls-dialog" ref={dialog} aria-labelledby="test-controls-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header><div><small>EXCLUSIVO DA SUA CONTA</small><h2 id="test-controls-title">Controles de teste</h2></div><button type="button" disabled={busy} onClick={onClose}>Fechar ×</button></header>
    <div className="test-controls-scroll">
      <p>Estes controles alteram o progresso <strong>no banco de dados</strong>, em local e produção. Não são a simulação isolada do localhost.</p>
      <aside><strong>{learning.testMode?"Percurso de teste ativo":"Percurso normal"} · revisão {learning.revision}</strong><p>Ao aplicar um ajuste, as respostas passam a ser simuladas. Não geram avisos de conclusão, avaliações nem novas reservas. Conta, pagamentos, mensagens, reservas existentes e mídias são preservados.</p></aside>
      <p role="status">Conversa: {demo?`parte ${catalog[demo.nodeId].part} · ${demo.nodeId}`:"não iniciada"}. Estudo: {study.completed.length}/{studySteps.length}.</p>
      <fieldset disabled={busy || confirmation!==null}>
        <section><h3>Apresentação da conta</h3><p>Controle se o painel apresenta novamente a introdução inicial do BasedSpeak. O reset também invalida telas antigas da apresentação.</p><div className="test-control-actions">{action("Reexibir introdução",{action:"reset-presentation"})}{action("Marcar introdução vista",{action:"complete-presentation"})}</div></section>
        <section><h3>Entrada e conversa</h3><p>Ir a uma parte ou momento substitui a conversa por um caminho coerente até esse ponto. Completar uma parte inclui os pré-requisitos; não cria uma conclusão solta.</p>
          <label>Apoio para testar<select value={profile} onChange={e=>setProfile(e.target.value as SupportProfile)}><option value="beginner">Iniciante</option><option value="some">Com pistas</option><option value="less">Menos apoio</option></select></label>
          <div className="test-control-actions">{action("Mostrar apresentação",{action:"reset-demo"})}{action("Iniciar conversa",{action:"start-demo",profile})}{action("Aplicar apoio",{action:"profile",profile})}{action("Recuar uma tela",{action:"back"})}{action("Avançar um momento",{action:"forward"})}{action("Avançar uma parte",{action:"next-part"})}</div>
          <label>Parte<select value={part} onChange={e=>setPart(Number(e.target.value))}>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>Parte {i+1}</option>)}</select></label>
          <div className="test-control-actions">{action("Ir para esta parte",{action:"jump-part",part,profile})}{action("Completar esta parte",{action:"complete-part",part,profile})}</div>
          <label>Momento da conversa<select value={node} onChange={e=>setNode(e.target.value)}>{nodes.map(n=><option value={n.id} key={n.id}>{n.part} · {n.id} · {n.context.slice(0,65)}</option>)}</select></label><div className="test-control-actions">{action("Ir para este momento",{action:"jump-node",node,profile})}{action("Completar conversa",{action:"complete-demo"})}</div>
        </section>
        <section><h3>Estudo: 24 práticas</h3><p>Concluir uma prática marca apenas a prática escolhida como teste com apoio. A posição não altera as demais conclusões.</p><label>Prática<select value={step} onChange={e=>setStep(Number(e.target.value))}>{studySteps.map(({step:s},i)=><option key={s.id} value={i}>{i+1} · {s.title}</option>)}</select></label><div className="test-control-actions">{action("Posicionar nesta prática",{action:"study-position",step})}{action("Marcar como concluída",{action:"study-complete",step})}{action("Marcar como pendente",{action:"study-uncomplete",step})}{action("Completar estudo",{action:"complete-study"})}{action("Zerar estudo",{action:"reset-study"})}</div></section>
        <section><h3>Retrospectiva e replay</h3><p>Preparar uma tela completa a conversa simulada. Abrir o replay apenas consulta as cenas já gravadas.</p><div className="test-control-actions">{action("Preparar final",{action:"review",view:"end"})}{action("Preparar resumo",{action:"review",view:"moments"})}{action("Preparar despedida",{action:"review",view:"thanks"})}{action("Preparar conclusão",{action:"review",view:"done"})}</div><nav><Link href="/demo" onClick={onClose}>Abrir conversa</Link>{demo?.nodeId === "end" && <Link href="/demo?replay=1" onClick={onClose}>Rever cenas e áudios</Link>}<Link href="/demo/estudo?practice=1" onClick={onClose}>Abrir prática selecionada</Link><Link href="/dashboard#aula-ao-vivo" onClick={onClose}>Consultar acesso à aula</Link></nav></section>
        <section><h3>Recomeçar ou concluir o processo</h3><p>Zerar tudo remove a conclusão da introdução, conversa, práticas e eventos de aprendizagem da sua conta. O registro técnico das ações de teste permanece. Para voltar a um percurso normal, é necessário recomeçar sem conclusões simuladas.</p><div className="test-control-actions">{action("Completar tudo para teste",{action:"complete-all"})}{action("Zerar todo o progresso",{action:"reset-all"})}{action("Recomeçar como percurso normal",{action:"reset-real"})}</div></section>
      </fieldset>
      {confirmation && <section ref={confirmBox} className="test-reset-confirm" aria-label="Confirmar reset"><h3>Confirmar alteração no banco</h3><p>{confirmation.action==="reset-demo"?"A conversa será apagada; o estudo será preservado.":confirmation.action==="reset-study"?"O estudo será apagado; a conversa será preservada.":confirmation.action==="reset-presentation"?"A conclusão da introdução será removida; a conversa e o estudo serão preservados.":"Introdução, conversa, estudo e eventos de aprendizagem serão reiniciados."} Essa ação não pode ser desfeita por este painel.</p><label>Digite <span translate="no">APAGAR PROGRESSO</span><input value={typed} disabled={busy} onChange={e=>setTyped(e.target.value)} /></label><div className="test-control-actions"><button type="button" disabled={typed!=="APAGAR PROGRESSO"||busy} onClick={()=>void run(confirmation,true)}>Confirmar reset</button><button type="button" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button></div></section>}
      <p role="status" aria-live="polite">{busy?"Aplicando no banco…":notice}</p>
    </div>
  </dialog>;
}
