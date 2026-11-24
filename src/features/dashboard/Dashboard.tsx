"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, BookOpen, CalendarDays, LoaderCircle, LogOut, MessageCircle, RefreshCw, Settings2, UserRound, X } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import { displayAccountName, type DashboardAccount } from "@/contracts/dashboard";
import { LIVE_CLASS_LABELS, liveClassDate } from "@/contracts/live-class";
import { pages } from "@/features/first-day/content";
import { LessonAccountPanels } from "@/features/first-encounters/LessonAccountPanels";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { useLessonSounds } from "@/features/first-encounters/useLessonSounds";
import { FirstDayCatalog, useFirstDayReading } from "./FirstDayCatalog";
import { CatalogHeader } from "./CatalogHeader";
import { GuestProgressImport } from "./GuestProgressImport";
import { OPEN_TEACHER_CONVERSATION_EVENT, teacherReplies } from "./next-step";
import { formatStudentDate } from "./TeacherContact";
import { useStudentWorkspace } from "./use-student-workspace";
import { studentWorkspace } from "./workspace-store";
import "./dashboard.css";
import "./comic-dashboard.css";

const sections = [
  { id: "jornada", label: "Biblioteca" },
  { id: "avanco", label: "Meu avanço" },
  { id: "atividades", label: "Minhas atividades" },
  { id: "aula-ao-vivo", label: "Minha aula ao vivo" },
  { id: "contato", label: "Professor" },
] as const;
type Section = typeof sections[number]["id"];
const isSection = (value: string): value is Section => sections.some(section => section.id === value);

export function Dashboard({ account }: { account: DashboardAccount }) {
  const reading = useFirstDayReading();
  const workspaceState = useStudentWorkspace();
  const workspace = workspaceState.workspace;
  const router = useRouter();
  const [name, setName] = useState(account.name);
  const [draftName, setDraftName] = useState(name);
  const [profileBusy, setProfileBusy] = useState<"save" | "logout" | null>(null);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [section, setSection] = useState<Section>("jornada");
  const [notice, setNotice] = useState("");
  const [refreshNotice, setRefreshNotice] = useState("");
  const settings = useRef<HTMLDialogElement>(null);
  const accountDialog = useRef<HTMLDialogElement>(null);
  const activePanel = useRef<HTMLDivElement>(null);
  const openingThread = useRef<string | null>(null);
  const sounds = useLessonSounds();
  const firstName = displayAccountName(workspace?.account.name ?? name).split(/\s+/, 1)[0];
  const scene = pages[reading.progress.position - 1];
  const learning = section === "avanco" ? workspace?.learning : undefined;
  const historical = decodeLessonAccountSnapshot(learning?.lessonSnapshot ?? null);
  const previous = historical ? getLessonDashboardSnapshot(historical.progress) : null;
  const previousCompleted = previous?.completedUnits ?? learning?.studyCompleted ?? 0;
  const previousTotal = previous?.totalUnits ?? learning?.studyTotal ?? 0;
  const currentBooking = workspace?.liveClass?.userId === workspace?.account.id ? workspace?.liveClass : null;
  const latestReply = teacherReplies(workspace?.conversations ?? [])[0];

  useEffect(() => {
    let mounted = true;
    const readHash = () => {
      const hash = window.location.hash.slice(1);
      setSection(isSection(hash) ? hash : "jornada");
    };
    queueMicrotask(() => {
      if (!mounted) return;
      readHash();
      const panel = new URL(window.location.href).searchParams.get("painel");
      if (panel === "conta") accountDialog.current?.showModal();
      if (panel === "configuracoes") settings.current?.showModal();
    });
    window.addEventListener("hashchange", readHash);
    return () => {
      mounted = false;
      window.removeEventListener("hashchange", readHash);
    };
  }, []);

  useEffect(() => {
    if (section !== "jornada") activePanel.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [section]);

  useEffect(() => {
    if (section !== "contato" || !openingThread.current) return;
    const id = openingThread.current;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(OPEN_TEACHER_CONVERSATION_EVENT, { detail: id }));
      openingThread.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [section]);

  function chooseSection(event: MouseEvent<HTMLAnchorElement>, next: Section) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openingThread.current = next === "contato" ? event.currentTarget.dataset.conversationId ?? null : null;
    if (section !== next) {
      sounds.play("tap");
      setSection(next);
      window.history.pushState(null, "", `#${next}`);
    }
  }

  function openSettings() {
    setNotice("");
    settings.current?.showModal();
  }

  function openAccount() {
    setProfileError("");
    setProfileNotice("");
    setDraftName(workspace?.account.name ?? name);
    accountDialog.current?.showModal();
  }

  async function refreshDashboard() {
    reading.refresh();
    await workspaceState.refresh();
    setRefreshNotice("Painel atualizado.");
  }

  function resetReading() {
    if (!window.confirm("Recomeçar First Day e apagar o avanço da leitura neste navegador?")) return;
    reading.clear();
    setNotice("Leitura reiniciada neste navegador.");
    sounds.play("advance");
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uid = workspace?.account.id;
    if (profileBusy || !uid || workspaceState.status !== "ready") return;
    setProfileBusy("save");
    setProfileError("");
    setProfileNotice("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Workspace-Uid": uid },
        body: JSON.stringify({ name: draftName.trim() }),
      });
      const result = await response.json().catch(() => null) as { error?: unknown; name?: unknown } | null;
      if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "Não foi possível salvar seu nome. Tente novamente.");
      if (studentWorkspace.getSnapshot().workspace?.account.id !== uid) throw new Error("A conta conectada mudou. Atualize o painel.");
      if (typeof result?.name !== "string") throw new Error("Não foi possível confirmar seu nome. Tente novamente.");
      setName(result.name);
      setDraftName(result.name);
      setProfileNotice("Nome atualizado.");
      await workspaceState.refresh();
    } catch (cause) {
      setProfileError(cause instanceof Error ? cause.message : "Não foi possível conectar. Tente novamente.");
    } finally {
      setProfileBusy(null);
    }
  }

  async function signOut() {
    if (profileBusy) return;
    setProfileBusy("logout");
    setProfileError("");
    setProfileNotice("");
    try {
      await studentWorkspace.flush();
      const response = await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Não foi possível sair. Tente novamente.");
      studentWorkspace.reset();
      try { const { logout } = await import("@/client/auth/service"); await logout(); } catch { /* The server session has already ended. */ }
      accountDialog.current?.close();
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setProfileError(cause instanceof Error ? cause.message : "Não foi possível sair. Tente novamente.");
      setProfileBusy(null);
    }
  }

  return <div className="dashboard dashboard-catalog dashboard-catalog-account" data-dashboard-section={section}>
    <a className="catalog-skip" href="#meu-painel">Pular para o conteúdo</a>
    <CatalogHeader home="/dashboard">
      {firstName && <p>{firstName}</p>}
      {sections.map(item => <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? "page" : undefined} onClick={event => chooseSection(event, item.id)}>{item.label}</a>)}
      <div className="app-menu-divider"/>
      <button type="button" className="app-menu-action" disabled={workspaceState.status === "loading"} onClick={() => void refreshDashboard()}><RefreshCw size={17} aria-hidden="true"/>Atualizar painel</button>
      <button type="button" className="app-menu-action" onClick={openSettings}><Settings2 size={17} aria-hidden="true"/>Configurações</button>
      <button type="button" className="app-menu-action" onClick={openAccount}><UserRound size={17} aria-hidden="true"/>Minha conta</button>
    </CatalogHeader>

    <main id="meu-painel" className="catalog-main catalog-wrap" aria-busy={workspaceState.status === "loading"}>
      <h1 className="dashboard-sr-only">Meu painel</h1>
      {workspaceState.error && <div className="student-status" role="alert"><span>{workspaceState.error}</span><button type="button" onClick={() => void refreshDashboard()}>Tentar novamente</button></div>}
      {(workspaceState.saving || workspaceState.notice) && <p className="student-status" role="status">{workspaceState.saving ? "Salvando seu avanço…" : workspaceState.notice}</p>}

      <div ref={activePanel} id={section === "contato" || section === "aula-ao-vivo" ? `panel-${section}` : section}>
        {section === "jornada" ? <>
          <FirstDayCatalog position={reading.progress.position}/>
          <section className="catalog-account-overview" aria-label="Resumo da minha conta">
            <article className="student-progress-card">
              <span><CalendarDays size={17} aria-hidden="true"/> Minha aula ao vivo</span>
              <p>{currentBooking ? LIVE_CLASS_LABELS[currentBooking.status] : "Consulte sua agenda."}</p>
              {currentBooking && <time dateTime={currentBooking.start}>{liveClassDate(currentBooking.start, currentBooking.timezone)}</time>}
              <a className="student-progress-cta" href="#aula-ao-vivo" onClick={event => chooseSection(event, "aula-ao-vivo")}>Ver minha aula<ArrowUpRight size={15} aria-hidden="true"/></a>
            </article>
            <article className="student-progress-card">
              <span><MessageCircle size={17} aria-hidden="true"/> Fale com o professor</span>
              <p>{latestReply ? <BrowserText>{latestReply.subject}</BrowserText> : "Envie mensagem ou acompanhe suas conversas."}</p>
              <a className="student-progress-cta" href="#contato" data-conversation-id={latestReply?.id} onClick={event => chooseSection(event, "contato")}>{latestReply ? "Ler resposta" : "Conversas"}<ArrowUpRight size={15} aria-hidden="true"/></a>
            </article>
          </section>
        </> : section === "avanco" ? <section className="catalog-account-pane" aria-labelledby="catalog-progress-title">
          <div className="student-section-heading"><h2 id="catalog-progress-title" tabIndex={-1}>Meu avanço</h2></div>
          <article className="student-progress-card">
            <span lang="en">First Day</span>
            <p>{scene ? `Página ${reading.progress.position} de ${pages.length} · ${scene.title}` : "Você ainda não começou a ler."}</p>
            <progress value={Math.max(0, reading.progress.position)} max={pages.length} aria-label="Página atual de First Day"/>
            <p>A leitura fica salva neste navegador.</p>
          </article>
          {previousCompleted > 0 && previousTotal > 0 && <article className="student-progress-card catalog-previous-progress">
            <span>Histórico da conta</span>
            <p>{previousCompleted} de {previousTotal} etapas concluídas no percurso anterior.</p>
          </article>}
        </section> : section === "atividades" ? <section className="catalog-account-pane" aria-labelledby="catalog-activities-title">
          <div className="student-section-heading"><h2 id="catalog-activities-title" tabIndex={-1}>Minhas atividades</h2></div>
          {workspace?.activities.length ? <ol className="student-activities">{workspace.activities.map(activity => <li key={activity.id}><span className="student-activity-icon"><BookOpen size={17} aria-hidden="true"/></span><div><strong><BrowserText>{activity.title}</BrowserText></strong><time dateTime={activity.at}>{formatStudentDate(activity.at)}</time></div></li>)}</ol>
            : <div className="student-empty"><BookOpen size={24} aria-hidden="true"/><p>Ainda não há atividades registradas.</p></div>}
        </section> : <LessonAccountPanels section={section === "aula-ao-vivo" ? "live" : "teacher"} account={account}/>}
      </div>
      <p className="dashboard-sr-only" role="status">{refreshNotice}</p>
    </main>
    <dialog ref={settings} className="dashboard-dialog" aria-labelledby="lesson-dashboard-settings-title">
      <div className="dashboard-dialog-heading"><h2 id="lesson-dashboard-settings-title">Configurações</h2><button type="button" className="dashboard-icon-button" aria-label="Fechar configurações" onClick={() => settings.current?.close()}><X size={19} aria-hidden="true"/></button></div>
      <label className="dashboard-toggle"><span><Bell size={16} aria-hidden="true"/> Sons de confirmação do painel</span><input type="checkbox" checked={!sounds.muted} onChange={() => { const wasMuted = sounds.muted; sounds.toggleMuted(); if (wasMuted) sounds.play("tap"); }}/></label>
      <button type="button" className="dashboard-primary" disabled={!scene} onClick={resetReading}>Recomeçar leitura</button>
      <p className="dashboard-dialog-note">Reinicia o First Day neste navegador.</p>
      {notice && <p className="dashboard-dialog-note" role="status">{notice}</p>}
    </dialog>
    <dialog ref={accountDialog} className="dashboard-dialog" aria-labelledby="lesson-account-title" aria-busy={Boolean(profileBusy)} onCancel={event => { if (profileBusy) event.preventDefault(); }}>
      <div className="dashboard-dialog-heading"><h2 id="lesson-account-title">Minha conta</h2><button type="button" className="dashboard-icon-button" disabled={Boolean(profileBusy)} aria-label="Fechar conta" onClick={() => accountDialog.current?.close()}><X size={19} aria-hidden="true"/></button></div>
      <form onSubmit={saveName}><fieldset disabled={Boolean(profileBusy) || workspaceState.status !== "ready"}>
        <legend className="dashboard-sr-only">Dados da conta</legend>
        <label className="dashboard-field">Como quer ser chamado?<input name="name" autoComplete="given-name" value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={120} required/></label>
        <label className="dashboard-field">E-mail<input type="email" value={workspace?.account.email ?? account.email} readOnly/></label>
        <button type="submit" className="dashboard-primary">{profileBusy === "save" ? <><LoaderCircle size={16} aria-hidden="true"/>Salvando…</> : "Salvar nome"}</button>
      </fieldset></form>
      <GuestProgressImport state={workspaceState}/>
      <button type="button" className="dashboard-signout" disabled={Boolean(profileBusy)} onClick={() => void signOut()}><LogOut size={16} aria-hidden="true"/>{profileBusy === "logout" ? "Saindo…" : "Sair da conta"}</button>
      {profileError && <p className="dashboard-form-error" role="alert">{profileError}</p>}
      {profileNotice && <p className="dashboard-dialog-note" role="status">{profileNotice}</p>}
    </dialog>
  </div>;
}
