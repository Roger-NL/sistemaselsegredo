"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, Headphones, LoaderCircle, LogOut, MessageCircle, MicOff, Route, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useJourneyTransition } from "@/components/navigation/JourneyTransition";
import { displayAccountName, type DashboardAccount } from "@/contracts/dashboard";
import { getBrowserSnapshot, getServerSnapshot, subscribe } from "@/features/demo/session/browser";
import { conversationPosition } from "@/features/demo/session/position";
import { visibleViewportSize } from "@/lib/ui/viewport";
import { StudentSections } from "./StudentSections";
import { useStudentWorkspace } from "./use-student-workspace";
import { studentWorkspace } from "./workspace-store";
import { OPEN_TEACHER_CONVERSATION_EVENT, studentNextStep, teacherReplies } from "./next-step";
import { DASHBOARD_SECTION_EVENT, useDashboardSection } from "./use-dashboard-section";
import { getMotionPreference, getServerPreference, saveMotionPreference, subscribePreferences } from "./preferences";

type Panel = "account" | "settings" | "help";

export function Dashboard({ account }: { account: DashboardAccount }) {
  const workspaceState = useStudentWorkspace();
  useDashboardSection(workspaceState.status);
  const workspace = workspaceState.workspace;
  const canPractice = workspaceState.status === "ready" && workspace?.account.status === "active";
  const router = useRouter();
  const journey = useJourneyTransition();
  const shell = useRef<HTMLDivElement>(null);
  const accountDialog = useRef<HTMLDialogElement>(null);
  const settingsDialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const introDialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(account.name);
  const [draftName, setDraftName] = useState(account.name);
  const [busy, setBusy] = useState<"save" | "logout" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [animating, setAnimating] = useState(false);
  const reduced = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const snapshot = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const firstName = displayAccountName(workspace?.account.name ?? name).split(/\s+/, 1)[0];
  const position = conversationPosition(workspace?.learning.demoSnapshot ?? null);
  const completed = Boolean(position?.completed);
  const started = Boolean(position);
  const next = workspace ? studentNextStep(workspace) : null;
  const replies = teacherReplies(workspace?.conversations || []);
  const action = next?.word ?? "Começar.";
  const actionLabel = next?.label ?? "Acessar minha história";

  useLayoutEffect(() => {
    const element = shell.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const update = () => {
      const size = visibleViewportSize({ width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight }, viewport);
      element.style.setProperty("--dashboard-width", `${size.width}px`);
      element.style.setProperty("--dashboard-height", `${size.height}px`);
    };
    update();
    viewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    if (!animating) return;
    const timeout = window.setTimeout(() => setAnimating(false), 1650);
    return () => window.clearTimeout(timeout);
  }, [animating]);

  useEffect(() => {
    if (!canPractice) introDialog.current?.close();
  }, [canPractice]);

  useEffect(() => {
    const panel = new URL(window.location.href).searchParams.get("painel");
    if (panel === "conta") accountDialog.current?.showModal();
    if (panel === "configuracoes") settingsDialog.current?.showModal();
  }, []);

  function openPanel(panel: Panel) {
    setError(""); setMessage("");
    if (panel === "account") {
      setDraftName(workspace?.account.name ?? name);
      accountDialog.current?.showModal();
    } else if (panel === "settings") settingsDialog.current?.showModal();
    else helpDialog.current?.showModal();
  }

  function openStory() {
    if (!canPractice) return;
    setAnimating(!reduced && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    introDialog.current?.showModal();
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy("save"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json", ...(workspace ? { "X-Workspace-Uid": workspace.account.id } : {}) },
        body: JSON.stringify({ name: draftName.trim() }),
      });
      const result = await response.json().catch(() => null) as { error?: unknown; name?: unknown } | null;
      if (!response.ok) { setError(typeof result?.error === "string" ? result.error : "Não foi possível salvar seu nome. Tente novamente."); return; }
      if (typeof result?.name !== "string") { setError("Não foi possível confirmar seu nome. Tente novamente."); return; }
      setName(result.name); setDraftName(result.name); setMessage("Nome atualizado."); void workspaceState.refresh();
    } catch {
      setError("Não foi possível conectar. Confira sua conexão e tente novamente.");
    } finally { setBusy(null); }
  }

  async function signOut() {
    if (busy) return;
    setBusy("logout"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Não foi possível sair. Tente novamente.");
      studentWorkspace.reset();
      // Load the browser SDK only for this explicit action; the server cookie is already cleared.
      try { const { logout } = await import("@/client/auth/service"); await logout(); } catch { /* Server access has ended. */ }
      accountDialog.current?.close();
      router.replace("/comecar?modo=entrar"); router.refresh();
    } catch {
      setError("Não foi possível sair. Confira sua conexão e tente novamente.");
      setBusy(null);
    }
  }

  return <div ref={shell} className="dashboard" data-reduced-motion={reduced}>
    <a className="dashboard-skip" href="#meu-painel">Pular para o conteúdo</a>
    <AppHeader current="dashboard" name={firstName} onAccount={() => openPanel("account")} onSettings={() => openPanel("settings")} onNavigate={journey.cancel} />

    <main id="meu-painel" className="dashboard-main dashboard-wrap">
      <div className="dashboard-welcome"><div><p className="dashboard-overline">{firstName ? `Olá, ${firstName}.` : "Bom ter você por aqui."}</p><h1>Seu espaço.</h1><p className="dashboard-subtitle">Um encontro de cada vez.</p></div><span className="dashboard-aside">Inglês por histórias.</span></div>
      <nav className="student-nav" aria-label="Área do aluno"><a href="#jornada">Meu percurso</a><a href="#avanco">Meu avanço</a><a href="#atividades">Minhas atividades</a><a href="#aula-ao-vivo">Minha aula ao vivo</a><a href="#contato">Professor</a><button type="button" disabled={workspaceState.status === "loading" || workspaceState.saving} onClick={() => void workspaceState.refresh()}>{workspaceState.status === "loading" ? "Atualizando…" : "Atualizar painel"}</button></nav>
      {workspaceState.status === "loading" && <p className="student-status" role="status">Carregando seu espaço…</p>}
      {workspaceState.error && <div className="student-status" role="alert"><p>{workspaceState.error}</p>{workspaceState.status === "unauthenticated" ? <Link href="/comecar?modo=entrar">Entrar novamente</Link> : <button type="button" onClick={() => void workspaceState.refresh()}>Tentar novamente</button>}</div>}
      {workspaceState.notice && <p className="student-status" role="status">{workspaceState.notice}</p>}
      {workspace && workspace.account.status !== "active" && <div className="student-status" role="status"><strong>{workspace.account.status === "pending" ? "Sua conta está aguardando aprovação." : "Seu acesso à prática está indisponível."}</strong><p>Você pode acompanhar seu painel e falar com o professor enquanto aguarda a liberação.</p><a href="#contato">Falar com o professor<ArrowUpRight size={14} aria-hidden="true" /></a></div>}
      {!!replies.length && <aside className="student-reply-notice" aria-label="Respostas do professor"><MessageCircle size={21} aria-hidden="true" /><div><strong>O professor respondeu.</strong><p>{replies.length === 1 ? `Sua conversa “${replies[0].subject}” tem uma resposta.` : `${replies.length} conversas têm resposta do professor.`}</p></div><a href="#contato" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TEACHER_CONVERSATION_EVENT, { detail: replies[0].id }))}>Ver resposta<ArrowUpRight size={16} aria-hidden="true" /></a></aside>}
      <article id="jornada" className="dashboard-journey" aria-labelledby="journey-title">
        <header className="dashboard-card-header"><h2 id="journey-title" tabIndex={-1}><Route size={18} aria-hidden="true" />Seu próximo passo</h2><span className="dashboard-availability">{!workspace ? "Carregando seu percurso" : workspaceState.status !== "ready" ? "Atualizando seu percurso" : next?.status}</span></header>
        <div className="dashboard-card-body"><div className="dashboard-access-area">
          {next?.href && canPractice ? <Link href={next.href} prefetch={false} className="dashboard-access" aria-label={actionLabel} onClick={event => {
            if (!next.href?.startsWith("#") || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); window.history.pushState(null, "", next.href);
            window.dispatchEvent(new CustomEvent(DASHBOARD_SECTION_EVENT, { detail: next.href.slice(1) }));
          }}><span className="dashboard-access-word">{action}</span><span className="dashboard-access-arrow"><ArrowUpRight size={25} aria-hidden="true" /></span></Link> : <button type="button" className="dashboard-access" onClick={openStory} disabled={!canPractice || next?.kind === "access"} aria-label={actionLabel} aria-haspopup="dialog"><span className="dashboard-access-word">{action}</span><span className="dashboard-access-arrow"><ArrowUpRight size={25} aria-hidden="true" /></span></button>}
          <p className="dashboard-access-copy"><strong>{next?.title ?? "Sua primeira história está aqui."}</strong><br />{next?.description ?? "O primeiro encontro com o inglês está aqui."}</p>
        </div><div className="dashboard-path" aria-hidden="true"><span className="dashboard-path-line" /><span className="dashboard-path-dot" /><span className="dashboard-path-number">{next?.number ?? "01"}</span><span className="dashboard-path-label">{next?.path ?? "O seu primeiro encontro"}</span></div></div>
        <footer className="dashboard-card-footer"><span><Sparkles size={14} aria-hidden="true" />Primeira história · A cafeteria</span>{next && next.kind !== "conversation" && next.kind !== "access" ? <button type="button" disabled={!canPractice} aria-label={completed ? "Rever minha conversa" : "Voltar à conversa"} onClick={openStory}>{completed ? "Rever minha conversa" : "Voltar à conversa"}<ArrowUpRight size={14} aria-hidden="true" /></button> : <span>No seu ritmo. Com apoio.</span>}</footer>
      </article>
      <div className="dashboard-after"><p><Headphones size={15} aria-hidden="true" />Você pode ouvir, tentar e pedir ajuda.</p><button type="button" onClick={() => openPanel("help")}>Como funciona minha jornada?<ArrowUpRight size={14} aria-hidden="true" /></button></div>
      {workspace && <div hidden={workspaceState.status === "loading"}><StudentSections workspace={workspace} disabled={workspaceState.status !== "ready"} /></div>}
      {workspaceState.status === "ready" && <p className="student-sync" role="status">{workspaceState.saving ? "Salvando seu progresso…" : "Seu painel está sincronizado com sua conta."}</p>}
      {snapshot.status === "invalid" && <p className="dashboard-storage-note" role="status">Não foi possível retomar a tentativa anterior. Você pode começar uma nova conversa.</p>}
    </main>

    <footer className="dashboard-footer dashboard-wrap"><span>BasedSpeak · Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>

    <dialog ref={accountDialog} className="dashboard-dialog" aria-labelledby="dashboard-account-title" aria-busy={Boolean(busy)}>
      <div className="dashboard-dialog-heading"><h2 id="dashboard-account-title">Minha conta.</h2><button className="dashboard-icon-button" type="button" onClick={() => accountDialog.current?.close()} aria-label="Fechar conta"><X size={19} aria-hidden="true" /></button></div>
      <form onSubmit={saveName}><fieldset disabled={Boolean(busy) || workspaceState.status !== "ready"}><legend className="dashboard-sr-only">Dados da conta</legend><label className="dashboard-field">Como quer ser chamado?<input name="name" autoComplete="given-name" value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={120} required /></label><label className="dashboard-field">E-mail<input type="email" value={workspace?.account.email ?? account.email} readOnly aria-describedby="dashboard-email-note" /></label><p className="dashboard-dialog-note" id="dashboard-email-note">E-mail usado para entrar na sua conta.</p><button type="submit" className="dashboard-primary">{busy === "save" ? <><LoaderCircle size={16} className="dashboard-spinner" aria-hidden="true" />Salvando…</> : "Salvar nome"}</button></fieldset></form>
      {error && <p className="dashboard-form-error" role="alert">{error}</p>}{message && <p className="dashboard-dialog-note" role="status">{message}</p>}
      <button className="dashboard-signout" type="button" disabled={Boolean(busy)} onClick={() => void signOut()}><LogOut size={16} aria-hidden="true" />{busy === "logout" ? "Saindo…" : "Sair da conta"}</button>
    </dialog>

    <dialog ref={settingsDialog} className="dashboard-dialog" aria-labelledby="dashboard-settings-title"><div className="dashboard-dialog-heading"><h2 id="dashboard-settings-title">Do seu jeito.</h2><button className="dashboard-icon-button" type="button" onClick={() => settingsDialog.current?.close()} aria-label="Fechar configurações"><X size={19} aria-hidden="true" /></button></div><label className="dashboard-toggle"><span>Reduzir animações</span><input type="checkbox" checked={reduced} onChange={event => saveMotionPreference(event.target.checked)} /></label><p className="dashboard-dialog-note">Deixa a entrada da história mais discreta. A preferência fica neste navegador. As configurações de movimento do seu dispositivo também são respeitadas.</p></dialog>

    <dialog ref={helpDialog} className="dashboard-dialog" aria-labelledby="dashboard-help-title"><div className="dashboard-dialog-heading"><h2 id="dashboard-help-title">Um passo por vez.</h2><button className="dashboard-icon-button" type="button" onClick={() => helpDialog.current?.close()} aria-label="Fechar explicação"><X size={19} aria-hidden="true" /></button></div><p className="dashboard-help-copy">Sua jornada começa com uma história. Na demo, você participa de uma conversa em inglês e escolhe o apoio que prefere.</p><p className="dashboard-help-copy">Na área de estudo, você pode explorar as expressões da história e acompanhar suas práticas. O painel reúne seu avanço, atividades e mensagens para o professor.</p><p className="dashboard-help-copy">Ao concluir 100% do estudo guiado, você libera a agenda de uma aula gratuita. Acompanhe seu pedido, a confirmação e as orientações em “Minha aula ao vivo”.</p><p className="dashboard-dialog-note">Sua conversa e seu estudo ficam associados à sua conta. Você pode retomar em outro dispositivo após o salvamento.</p></dialog>

    <dialog ref={introDialog} className="dashboard-intro" aria-label="Entrada da história da cafeteria" data-animating={animating} onClose={() => setAnimating(false)} onCancel={journey.cancel}>
      <AppHeader current="dashboard" tone="immersive" name={firstName} onNavigate={() => introDialog.current?.close()} onAccount={() => { introDialog.current?.close(); openPanel("account"); }} onSettings={() => { introDialog.current?.close(); openPanel("settings"); }} />
      <header className="dashboard-intro-header"><button type="button" onClick={() => { journey.cancel(); introDialog.current?.close(); }}><ArrowLeft size={15} aria-hidden="true" />Voltar ao painel</button>{animating && <button type="button" onClick={() => setAnimating(false)}>Pular abertura<ArrowUpRight size={14} aria-hidden="true" /></button>}</header>
      <div className="dashboard-intro-center">
        {animating ? <p className="dashboard-cinematic-word" lang="en" aria-hidden="true">Let’s talk.</p> : <div className="dashboard-reveal">
          <figure><Image src="/demo/cafe/v2/images/V01-960.webp" width={960} height={640} sizes="(max-width: 580px) 85vw, 45vw" alt="Lucas e based no balcão da cafeteria, com seus nomes nos copos." /></figure>
          <div><p className="dashboard-overline">História 01 · A cafeteria</p><h2>Toda conversa<br />tem um começo.</h2><p className="dashboard-intro-description">Conheça Lucas. Escolha o que dizer e construa suas respostas com apoio no seu ritmo.</p><Link href="/demo" prefetch={false} className="dashboard-intro-cta" onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); journey.start({ resume:started, prepare:() => introDialog.current?.close() }); }}>{completed ? "Rever minha conversa" : started ? "Retomar conversa" : "Escolher meu apoio"}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>}
      </div>
      <footer className="dashboard-intro-footer"><span><MicOff size={14} aria-hidden="true" />Sem microfone. Uma resposta por vez.</span><span>{started ? "Conversa na sua conta" : "Sua primeira história"}</span></footer>
    </dialog>
  </div>;
}
