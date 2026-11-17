"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, CalendarDays, Check, Headphones, LayoutDashboard, LoaderCircle, LogOut, Menu, MessageCircle, Route, Settings2, Sparkles, TrendingUp, UserRound, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { displayAccountName, type DashboardAccount } from "@/contracts/dashboard";
import { LessonAccountPanels } from "./LessonAccountPanels";
import { LessonDashboardOverview } from "./LessonDashboardOverview";
import { useLessonAccountProgress } from "./useLessonAccountProgress";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { accountCanPractice } from "@/features/dashboard/practice-access";
import { OPEN_TEACHER_CONVERSATION_EVENT } from "@/features/dashboard/next-step";
import { GuestProgressImport } from "@/features/dashboard/GuestProgressImport";
import { LESSON_SCENES } from "./lesson-one";
import { LESSON_DEMO_HREF, getLessonDashboardSnapshot } from "./lesson-dashboard";
import { useLessonSounds } from "./useLessonSounds";
import { isLessonButtonClick } from "./lesson-sound-events";
import "../dashboard/dashboard.css";
import "../dashboard/comic-dashboard.css";
import "./lesson-dashboard.css";

const SECTIONS = [
  { id: "jornada", label: "Meu percurso" }, { id: "avanco", label: "Meu avanço" },
  { id: "atividades", label: "Minhas atividades" }, { id: "aula-ao-vivo", label: "Minha aula ao vivo" },
  { id: "contato", label: "Professor" },
] as const;
type DashboardSection = typeof SECTIONS[number]["id"];
const isSection = (value: string): value is DashboardSection => SECTIONS.some(section => section.id === value);
const STAGE_DETAILS = { introduction: "Apresentação da aula", guide: "Como usar os controles", lesson: "Atividades e novas conversas", theory: "Explicações por escrito", test: "Perguntas para usar a ideia" } as const;
const ACTIVITIES = LESSON_SCENES.filter(scene => scene.mode === "game").map(scene => ({
  ...scene, rounds: LESSON_SCENES.filter(part => part.game === scene.game).flatMap(part => part.rounds),
}));

export type LessonDashboardProps = { fontClassName?: string; displayName?: string; account?: DashboardAccount | null; preview?: boolean };

export function LessonDashboard({ fontClassName = "", displayName, account = null, preview = false }: LessonDashboardProps) {
  const progress = useLessonAccountProgress();
  const workspaceState = useStudentWorkspace();
  const workspace = workspaceState.workspace;
  const { ready, storageAvailable } = progress;
  const snapshot = getLessonDashboardSnapshot(progress.input);
  const router = useRouter();
  const [name, setName] = useState(account?.name ?? displayName ?? "");
  const [draftName, setDraftName] = useState(name);
  const [profileBusy, setProfileBusy] = useState<"save" | "logout" | null>(null);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [resetting, setResetting] = useState(false);
  const [section, setSection] = useState<DashboardSection>("jornada");
  const [notice, setNotice] = useState("");
  const [refreshNotice, setRefreshNotice] = useState("");
  const menu = useRef<HTMLDetailsElement>(null);
  const settings = useRef<HTMLDialogElement>(null);
  const accountDialog = useRef<HTMLDialogElement>(null);
  const help = useRef<HTMLDialogElement>(null);
  const activePanel = useRef<HTMLDivElement>(null);
  const openingThread = useRef<string | null>(null);
  const sounds = useLessonSounds();
  const firstName = displayAccountName(workspace?.account.name ?? name).split(/\s+/, 1)[0];
  const accountBound = Boolean(account || workspace);
  const canOpenLesson = ready && !profileBusy && (!accountBound || workspaceState.status === "ready" && Boolean(workspace && accountCanPractice(workspace.account.status)));
  const accessDenied = Boolean(workspace && !accountCanPractice(workspace.account.status));
  const heroHref = snapshot.href;
  const heroLabel = snapshot.ctaLabel;
  const currentStep = snapshot.steps.find(step => step.status === "current");
  const actionWord = snapshot.status === "new" ? "Começar." : snapshot.status === "complete" ? "Rever." : "Continuar.";

  useEffect(() => {
    let mounted = true;
    const readHash = () => { const hash = window.location.hash.slice(1); setSection(isSection(hash) ? hash : "jornada"); };
    const outside = (event: PointerEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false; };
    queueMicrotask(() => {
      if (!mounted) return;
      readHash();
      const panel = new URL(window.location.href).searchParams.get("painel");
      if (panel === "conta") accountDialog.current?.showModal();
      if (panel === "configuracoes") settings.current?.showModal();
    });
    window.addEventListener("hashchange", readHash); document.addEventListener("pointerdown", outside);
    return () => { mounted = false; window.removeEventListener("hashchange", readHash); document.removeEventListener("pointerdown", outside); };
  }, []);
  useEffect(() => { if (ready) activePanel.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true }); }, [ready, section]);

  useEffect(() => {
    if (section !== "contato" || !openingThread.current) return;
    const id = openingThread.current;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(OPEN_TEACHER_CONVERSATION_EVENT, { detail: id }));
      openingThread.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [section]);

  function closeMenu() { if (menu.current) menu.current.open = false; }
  function chooseSection(event: MouseEvent<HTMLAnchorElement>, next: DashboardSection) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); closeMenu(); openingThread.current = next === "contato" ? event.currentTarget.dataset.conversationId ?? null : null; sounds.play("tap"); setSection(next); window.history.pushState(null, "", `#${next}`);
  }
  function openSettings() { closeMenu(); setNotice(""); settings.current?.showModal(); }
  function openAccount() {
    closeMenu(); setProfileError(""); setProfileNotice("");
    setDraftName(workspace?.account.name ?? name); accountDialog.current?.showModal();
  }
  async function refreshDashboard() {
    progress.refresh(); await workspaceState.refresh(); setRefreshNotice("Painel atualizado.");
  }
  async function resetDemo() {
    if (resetting || !canOpenLesson) return;
    setResetting(true); setNotice("");
    try { await progress.reset(); setNotice("Percurso reiniciado. Sua conta, mensagens e aulas foram preservadas."); sounds.play("advance"); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Não foi possível recomeçar o percurso. Tente novamente."); }
    finally { setResetting(false); }
  }
  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uid = workspace?.account.id;
    if (profileBusy || !uid || workspaceState.status !== "ready") return;
    setProfileBusy("save"); setProfileError(""); setProfileNotice("");
    try {
      const response = await fetch("/api/account/profile", { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Workspace-Uid": uid }, body: JSON.stringify({ name: draftName.trim() }) });
      const result = await response.json().catch(() => null) as { error?: unknown; name?: unknown } | null;
      if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "Não foi possível salvar seu nome. Tente novamente.");
      if (studentWorkspace.getSnapshot().workspace?.account.id !== uid) throw new Error("A conta conectada mudou. Atualize o painel.");
      if (typeof result?.name !== "string") throw new Error("Não foi possível confirmar seu nome. Tente novamente.");
      setName(result.name); setDraftName(result.name); setProfileNotice("Nome atualizado."); await workspaceState.refresh();
    } catch (cause) { setProfileError(cause instanceof Error ? cause.message : "Não foi possível conectar. Tente novamente."); }
    finally { setProfileBusy(null); }
  }
  async function signOut() {
    if (profileBusy) return;
    setProfileBusy("logout"); setProfileError(""); setProfileNotice("");
    try {
      await studentWorkspace.flush();
      const response = await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Não foi possível sair. Tente novamente.");
      studentWorkspace.reset();
      try { const { logout } = await import("@/client/auth/service"); await logout(); } catch { /* The server session has already ended. */ }
      accountDialog.current?.close(); router.replace("/comecar?modo=entrar"); router.refresh();
    } catch (cause) { setProfileError(cause instanceof Error ? cause.message : "Não foi possível sair. Tente novamente."); setProfileBusy(null); }
  }

  return <div className={`dashboard lesson-demo-dashboard ${fontClassName}`} data-dashboard-status={snapshot.status} data-dashboard-section={section}
    data-ui-sound-scope="local" onClickCapture={event => { if (isLessonButtonClick(event.target)) sounds.play("tap"); }}>
    <a className="dashboard-skip" href="#meu-painel">Pular para o conteúdo</a>
    <header className="app-header dashboard-header" data-tone="paper">
      <Brand href="/dashboard"/>
      <a href="#jornada" className="app-header-panel" aria-current="page" onClick={event => chooseSection(event, "jornada")}><LayoutDashboard size={15} aria-hidden="true"/>Meu painel</a>
      <div className="app-header-tools">{firstName && <span className="app-header-name">{firstName}</span>}
        <button type="button" className="dashboard-tool lesson-dashboard-test" onClick={openSettings}><Settings2 size={17} aria-hidden="true"/><span>{preview ? "Teste" : "Configurações"}</span></button>
        <details ref={menu} className="app-header-menu" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeMenu(); }}
          onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); closeMenu(); menu.current?.querySelector("summary")?.focus(); } }}>
          <summary aria-label="Menu de navegação"><Menu size={18} aria-hidden="true"/><span>Menu</span></summary>
          <nav className="app-menu-panel" aria-label="Menu do BasedSpeak" onClick={event => { if (event.target instanceof Element && event.target.closest("a[href],button")) closeMenu(); }}>
            <p>Seu espaço no BasedSpeak</p>
            <a href="#jornada" onClick={event => chooseSection(event, "jornada")}><LayoutDashboard size={17} aria-hidden="true"/>Meu percurso</a>
            <a href="#avanco" onClick={event => chooseSection(event, "avanco")}><TrendingUp size={17} aria-hidden="true"/>Meu avanço</a>
            <a href="#atividades" onClick={event => chooseSection(event, "atividades")}><Route size={17} aria-hidden="true"/>Minhas atividades</a>
            <a href="#aula-ao-vivo" onClick={event => chooseSection(event, "aula-ao-vivo")}><CalendarDays size={17} aria-hidden="true"/>Minha aula ao vivo</a>
            <a href="#contato" onClick={event => chooseSection(event, "contato")}><MessageCircle size={17} aria-hidden="true"/>Professor</a>
            <div className="app-menu-divider"/>
            <button type="button" className="app-menu-action" onClick={openSettings}><Settings2 size={17} aria-hidden="true"/>Configurações da demo</button>
            <button type="button" className="app-menu-action" onClick={openAccount}><UserRound size={17} aria-hidden="true"/>Minha conta</button>
          </nav>
        </details>
      </div>
    </header>

    <main id="meu-painel" className="dashboard-main dashboard-wrap" aria-busy={!ready}>
      <div className="dashboard-welcome"><div><p className="dashboard-overline">{firstName ? `Olá, ${firstName}.` : "Bom ter você por aqui."}</p><h1 tabIndex={-1}>Seu espaço.</h1><p className="dashboard-subtitle">Aprenda, pratique e avance.</p></div><span className="dashboard-aside">Inglês na prática.</span></div>
      <nav className="student-nav" aria-label="Área do aluno">{SECTIONS.map(item => <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? "page" : undefined} onClick={event => chooseSection(event, item.id)}>{item.label}</a>)}
        <button type="button" disabled={!ready} onClick={() => void refreshDashboard()}>{ready ? "Atualizar painel" : "Atualizando…"}</button>
      </nav>
      {(progress.error || workspaceState.error) && <div className="lesson-dashboard-account-status" role="alert"><span>{progress.error || workspaceState.error}</span><button type="button" onClick={() => void refreshDashboard()}>Tentar novamente</button></div>}
      {(progress.saving || workspaceState.saving || progress.notice) && <p className="lesson-dashboard-account-status" role="status">{progress.saving || workspaceState.saving ? "Salvando seu avanço…" : progress.notice}</p>}
      <div ref={activePanel} className={`lesson-dashboard-panel${section === "jornada" ? " is-overview" : ""}`} id={section === "contato" || section === "aula-ao-vivo" ? `panel-${section}` : section}>
        {section === "jornada" ? <>
          <article className="dashboard-journey" aria-labelledby="journey-title">
            <header className="dashboard-card-header"><h2 id="journey-title" tabIndex={-1}><Route size={18} aria-hidden="true"/>Seu próximo passo</h2><span className="dashboard-availability">{!ready ? "Carregando seu percurso" : snapshot.status === "new" ? "Disponível" : snapshot.status === "complete" ? "Percurso concluído" : `${snapshot.percent}% concluído`}</span></header>
            <div className="dashboard-card-body"><div className="dashboard-access-area">
              {canOpenLesson ? <Link href={heroHref} prefetch={false} className="dashboard-access" aria-label={heroLabel} onClick={event => {
                const target = heroHref.slice(1);
                if (heroHref.startsWith("#") && isSection(target)) chooseSection(event, target);
                sounds.play("advance");
              }}><span className="dashboard-access-word">{actionWord}</span><span className="dashboard-access-arrow"><ArrowUpRight size={25} aria-hidden="true"/></span></Link>
                : <button type="button" className="dashboard-access" disabled aria-label={accessDenied ? "Acesso à aula indisponível" : "Carregando seu percurso"}><span className="dashboard-access-word">{accessDenied ? "Seu acesso." : "Aguarde."}</span><span className="dashboard-access-arrow"><ArrowUpRight size={25} aria-hidden="true"/></span></button>}
              <p className="dashboard-access-copy"><strong>{(snapshot.status === "new" ? "Sua primeira aula está aqui." : snapshot.status === "complete" ? "Você concluiu este percurso." : "Continue de onde parou.")}</strong><br/>{(snapshot.status === "complete" ? "Reveja a apresentação e explore as cenas outra vez." : `Eu, você, nós, eles. ${currentStep ? `Seu próximo passo: ${currentStep.label.toLowerCase()}.` : "Aprenda, pratique e avance."}`)}</p>
            </div><div className="dashboard-path" aria-hidden="true"><span className="dashboard-path-line"/><span className="dashboard-path-dot"/><span className="dashboard-path-number">01</span><span className="dashboard-path-label">Aula 1 · Inglês do zero</span></div></div>
            <footer className="dashboard-card-footer"><span><Sparkles size={14} aria-hidden="true"/>Primeiros encontros · Eu, você, nós, eles</span><Link href={`${LESSON_DEMO_HREF}?apresentacao=1`} prefetch={false}>Rever apresentação<ArrowUpRight size={14} aria-hidden="true"/></Link></footer>
          </article>
          <LessonDashboardOverview snapshot={snapshot} workspace={workspace} ready={ready} saving={progress.saving || workspaceState.saving} onOpenSection={chooseSection}/>
          <div className="dashboard-after"><p><Headphones size={15} aria-hidden="true"/>Você pode ouvir, tentar e pedir ajuda.</p><button type="button" onClick={() => help.current?.showModal()}>Como funciona meu percurso?<ArrowUpRight size={14} aria-hidden="true"/></button></div>
        </> : section === "avanco" ? <section className="lesson-dashboard-advance dashboard-pane" aria-labelledby="lesson-progress-title">
          <div className="student-section-heading"><div><p className="dashboard-overline">Um passo de cada vez</p><h2 id="lesson-progress-title" tabIndex={-1}>Meu avanço.</h2></div><span>Seu progresso nesta demo</span></div>
          <div className="lesson-dashboard-progress"><strong>{snapshot.percent}%</strong><progress value={snapshot.percent} max={100} aria-label="Progresso da demo"/><p>{snapshot.completedUnits} de {snapshot.totalUnits} etapas concluídas.</p></div>
          <ol className="lesson-dashboard-steps">{snapshot.steps.map((step, index) => <li key={step.id} data-dashboard-step={step.id} data-step-status={step.status} aria-current={step.status === "current" ? "step" : undefined}><span aria-hidden="true">{step.status === "done" ? <Check size={17}/> : index + 1}</span><div><strong>{step.label}</strong><small>{STAGE_DETAILS[step.id]}</small></div><b>{step.completed}/{step.units}</b></li>)}</ol>
        </section> : section === "atividades" ? <section className="dashboard-pane" aria-labelledby="lesson-activities-title">
          <div className="student-section-heading"><div><p className="dashboard-overline">O que você já fez</p><h2 id="lesson-activities-title" tabIndex={-1}>Minhas atividades.</h2></div></div>
          <div className="lesson-dashboard-activities">{ACTIVITIES.map((activity, index) => {
            const before = ACTIVITIES.slice(0, index).reduce((sum, item) => sum + item.rounds.length, 0);
            const done = snapshot.lessonCompleted >= before + activity.rounds.length;
            const unlocked = snapshot.lessonCompleted >= before;
            return <article className="lesson-dashboard-activity" key={activity.id} data-activity-status={done ? "done" : unlocked ? "current" : "locked"}>
              <span>Atividade {index + 1}</span><h3>{activity.title}</h3><p>{done ? "Concluída" : unlocked && snapshot.stage === "lesson" ? "Em andamento" : "A seguir"}</p>
              {!done && unlocked && canOpenLesson ? <Link href={snapshot.href} prefetch={false}>{snapshot.ctaLabel}<ArrowUpRight size={14} aria-hidden="true"/></Link> : <span className="lesson-dashboard-locked">{done ? "Atividade concluída" : "Ainda não liberada"}</span>}
            </article>;
          })}</div>
        </section> : <LessonAccountPanels section={section === "aula-ao-vivo" ? "live" : "teacher"} account={account ?? workspace?.account ?? null}/>}
      </div>
      <p className="dashboard-sr-only" role="status">{refreshNotice}</p>
      {!storageAvailable && <p className="dashboard-storage-note" role="status">Este navegador não permitiu ler seu progresso salvo. Você ainda pode começar a demo.</p>}
    </main>

    <dialog ref={settings} className="dashboard-dialog" aria-labelledby="lesson-dashboard-settings-title" onClose={() => menu.current?.querySelector("summary")?.focus()}>
      <div className="dashboard-dialog-heading"><h2 id="lesson-dashboard-settings-title">Do seu jeito.</h2><button type="button" className="dashboard-icon-button" aria-label="Fechar configurações" onClick={() => settings.current?.close()}><X size={19} aria-hidden="true"/></button></div>
      <label className="dashboard-toggle"><span><Bell size={16} aria-hidden="true"/> Sons de confirmação</span><input type="checkbox" checked={!sounds.muted} onChange={() => { const wasMuted = sounds.muted; sounds.toggleMuted(); if (wasMuted) sounds.play("tap"); }}/></label>
      <p className="dashboard-dialog-note">Os efeitos sonoros não alteram o volume das falas da aula.</p>
      <button type="button" className="dashboard-primary" disabled={!canOpenLesson || resetting || progress.saving} onClick={() => void resetDemo()}>{resetting ? "Recomeçando…" : "Recomeçar percurso"}</button><p className="dashboard-dialog-note">Reinicia apenas as etapas desta aula. Sua conta, mensagens, agendamentos e preferência de som são preservados.</p>
      {notice && <p className="dashboard-dialog-note" role="status">{notice}</p>}
    </dialog>
    <dialog ref={accountDialog} className="dashboard-dialog" aria-labelledby="lesson-account-title" aria-busy={Boolean(profileBusy)} onCancel={event => { if (profileBusy) event.preventDefault(); }}>
      <div className="dashboard-dialog-heading"><h2 id="lesson-account-title">Minha conta.</h2><button type="button" className="dashboard-icon-button" disabled={Boolean(profileBusy)} aria-label="Fechar conta" onClick={() => accountDialog.current?.close()}><X size={19} aria-hidden="true"/></button></div>
      {accountBound ? <><form onSubmit={saveName}><fieldset disabled={Boolean(profileBusy) || workspaceState.status !== "ready"}>
        <legend className="dashboard-sr-only">Dados da conta</legend><label className="dashboard-field">Como quer ser chamado?<input name="name" autoComplete="given-name" value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={120} required/></label>
        <label className="dashboard-field">E-mail<input type="email" value={workspace?.account.email ?? account?.email ?? ""} readOnly/></label>
        <button type="submit" className="dashboard-primary">{profileBusy === "save" ? <><LoaderCircle size={16} aria-hidden="true"/>Salvando…</> : "Salvar nome"}</button>
      </fieldset></form><GuestProgressImport state={workspaceState}/><button type="button" className="dashboard-signout" disabled={Boolean(profileBusy)} onClick={() => void signOut()}><LogOut size={16} aria-hidden="true"/>{profileBusy === "logout" ? "Saindo…" : "Sair da conta"}</button></>
        : <><p className="dashboard-help-copy">Entre para salvar seu percurso na conta e falar com o professor.</p><Link className="dashboard-primary" href="/comecar?modo=entrar">Entrar na minha conta</Link></>}
      {profileError && <p className="dashboard-form-error" role="alert">{profileError}</p>}{profileNotice && <p className="dashboard-dialog-note" role="status">{profileNotice}</p>}
    </dialog>
    <dialog ref={help} className="dashboard-dialog" aria-labelledby="lesson-dashboard-help-title"><div className="dashboard-dialog-heading"><h2 id="lesson-dashboard-help-title">Um passo por vez.</h2><button type="button" className="dashboard-icon-button" aria-label="Fechar explicação" onClick={() => help.current?.close()}><X size={19} aria-hidden="true"/></button></div><p className="dashboard-help-copy">Conheça a aula, experimente os controles e participe das cenas em inglês. Depois, leia a teoria e faça o teste.</p><p className="dashboard-help-copy">O painel reúne seu avanço, as seis atividades, sua aula ao vivo e o contato com o professor. Abra cada área para ver os detalhes.</p><p className="dashboard-dialog-note">{accountBound ? "Seu avanço fica associado à sua conta após o salvamento." : "Sem entrar, o progresso fica neste navegador. Você pode associá-lo à sua conta por uma escolha explícita."}</p></dialog>
  </div>;
}
