"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLiveClasses } from "@/features/live-class/AdminLiveClasses";
import { JourneySummary, StudentFollowUp } from "./StudentFollowUp";
import type { JourneyFilter } from "./student-journey";
import { TeacherInbox } from "./TeacherInbox";
import type { ManagementMutationResult } from "@/contracts/management";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, GraduationCap, Activity as ActivityIcon, ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, Clock3, KeyRound, LayoutDashboard, LoaderCircle, LogOut, MessageSquare, Plus, RotateCcw, Search, ShieldCheck, SlidersHorizontal, UserCheck, Users, UserX, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { STATUS_LABELS, filterUsers, type Activity, type AdminAction, type AdminState, type AdminUser, type UserDraft, type UserOperation, type UserRole, type UserStatus } from "./model";

type View = "overview" | "users" | "approvals" | "activity" | "messages" | "scheduling" | "students";
type Modal = { type: "create" } | { type: "edit"; userId: string } | { type: "operation"; userId: string; operation: UserOperation } | { type: "link"; link: string };
const VIEW_LABELS: Record<View, string> = { overview: "Visão geral", users: "Usuários", approvals: "Aprovações", activity: "Atividade", messages: "Mensagens", scheduling: "Agenda", students: "Alunos" };
const OPERATIONS: Record<UserOperation, { title: string; button: string; description: string; danger?: boolean }> = {
  approve: { title: "Aprovar cadastro?", button: "Aprovar cadastro", description: "O usuário poderá acessar a prática e sincronizar seu progresso na conta." },
  reject: { title: "Reprovar cadastro?", button: "Reprovar cadastro", description: "O cadastro ficará reprovado. Você poderá reativá-lo depois.", danger: true },
  suspend: { title: "Suspender acesso?", button: "Suspender acesso", description: "O login será bloqueado e as sessões existentes serão encerradas até uma reativação manual.", danger: true },
  activate: { title: "Reativar acesso?", button: "Reativar acesso", description: "O login e o acesso à prática serão liberados novamente." },
  "reset-login": { title: "Redefinir login?", button: "Gerar link e encerrar sessões", description: "Encerra as sessões desta conta e gera um link do Firebase para definir uma nova senha. Compartilhe o link somente com o titular." },
  "reset-progress": { title: "Zerar progresso?", button: "Zerar progresso", description: "O progresso da conversa e do estudo será zerado na conta do aluno, inclusive nas sessões abertas ao sincronizar. Essa ação não pode ser desfeita.", danger: true },
};
const date = (value: string | null, withTime = false) => value ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(value)) : "Ainda não acessou";
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
const emptyDraft: UserDraft = { name: "", email: "", role: "student", notes: "" };

export function AdminWorkspace() {
  const [state, setState] = useState<AdminState | null>(null);
  const [view, setView] = useState<View>("overview");
  const [journeyFilter, setJourneyFilter] = useState<JourneyFilter>("all");
  const [focusUserId, setFocusUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [modal, setModal] = useState<Modal | null>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const requestSequence = useRef(0);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  const refresh = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/workspace", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) { router.replace("/adm/entrar"); router.refresh(); return; }
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar o painel.");
      if (sequence === requestSequence.current) { setState(result as AdminState); setLoadError(""); }
    } catch (cause) {
      if (sequence === requestSequence.current) setLoadError(cause instanceof Error ? cause.message : "Não foi possível carregar a gestão.");
    } finally { if (sequence === requestSequence.current) setRefreshing(false); }
  }, [router]);

  useEffect(() => {
    const sequenceRef = requestSequence;
    void refresh();
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    const interval = window.setInterval(onFocus, 30_000);
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); sequenceRef.current++; };
  }, [refresh]);

  useEffect(() => {
    if (modal) { if (!dialog.current?.open) dialog.current?.showModal(); }
    else dialog.current?.close();
  }, [modal]);

  async function commit(action: AdminAction) {
    if (!state || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json", "X-Workspace-Uid": state.currentAccount.id }, body: JSON.stringify(action) });
      const result = await response.json() as ManagementMutationResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir a alteração.");
      setNotice(result.message);
      await refresh();
      setModal(result.resetLink ? { type: "link", link: result.resetLink } : null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir a alteração."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error("SESSION_CLEAR_FAILED");
      try { await (await import("@/client/auth/service")).logout(); } catch { /* Server access has ended. */ }
      router.replace("/adm/entrar"); router.refresh();
    }
    catch { setLoadError("Não foi possível sair. Tente novamente."); }
    finally { setBusy(false); }
  }

  function open(next: Modal) {
    if (busy) return;
    setError(""); setReason("");
    if (next.type === "create") setDraft(emptyDraft);
    if (next.type === "edit") {
      const user = state?.users.find(candidate => candidate.id === next.userId);
      if (!user) return;
      setDraft({ name: user.name, email: user.email, role: user.role, notes: user.notes });
    }
    setModal(next);
  }

  function navigate(next: View, nextStatus: UserStatus | "all" = "all") {
    setFocusUserId(null); setJourneyFilter("all");
    setView(next); setStatus(next === "approvals" ? "all" : nextStatus); setSearch(""); setRole("all");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.type === "create") void commit({ type: "create", draft });
    else if (modal?.type === "edit") void commit({ type: "edit", userId: modal.userId, draft });
    else if (modal?.type === "operation") void commit({ type: modal.operation, userId: modal.userId, reason });

  }

  const users = state?.users ?? [];
  const pending = users.filter(user => user.status === "pending");
  const visible = filterUsers(users, search, view === "approvals" ? "pending" : status, role);
  const selected = modal && "userId" in modal ? users.find(user => user.id === modal.userId) : undefined;
  const modalTitle = modal?.type === "create" ? "Novo usuário" : modal?.type === "edit" ? "Gerenciar conta" : modal?.type === "link" ? "Link de acesso" : modal?.type === "operation" ? OPERATIONS[modal.operation].title : "";

  return <div className="admin-shell">
    <a href="#admin-content" className="admin-skip">Pular para o conteúdo</a>
    <aside className="admin-sidebar">
      <div className="admin-brand"><Brand href="/adm" /><span>ADMINISTRAÇÃO</span></div>
      <div className="admin-workspace"><span className="admin-workspace-icon"><ShieldCheck size={19} aria-hidden="true" /></span><div><strong>Área de gestão</strong><small>Workspace BasedSpeak</small></div><span className="admin-live-dot" /></div>
      <p className="admin-nav-label">PRINCIPAL</p>
      <nav aria-label="Administração">
        {([{ key: "overview", Icon: LayoutDashboard }, { key: "students", Icon: GraduationCap }, { key: "users", Icon: Users }, { key: "approvals", Icon: UserCheck }, { key: "activity", Icon: ActivityIcon }, { key: "messages", Icon: MessageSquare }, { key: "scheduling", Icon: CalendarDays }] as const).map(({ key, Icon }) => <button key={key} type="button" aria-current={view === key ? "page" : undefined} onClick={() => navigate(key)}><Icon size={18} aria-hidden="true" />{VIEW_LABELS[key]}{key === "approvals" && pending.length > 0 && <span className="admin-nav-count">{pending.length}</span>}{key === "scheduling" && !!users.filter(user => user.liveClass?.status === "pending").length && <span className="admin-nav-count">{users.filter(user => user.liveClass?.status === "pending").length}</span>}{key === "messages" && !!state?.conversations.filter(item => item.status === "open").length && <span className="admin-nav-count">{state.conversations.filter(item => item.status === "open").length}</span>}</button>)}
      </nav>
      <div className="admin-sidebar-bottom"><div className="admin-system-status"><ShieldCheck size={17} aria-hidden="true" /><div><strong>Gestão conectada</strong><p>Contas, estudo e contato no mesmo espaço.</p></div></div><Link href="/dashboard" className="admin-back"><Users size={16} aria-hidden="true" />Área do aluno<ArrowUpRight size={14} aria-hidden="true" /></Link><button type="button" className="admin-back admin-signout" disabled={busy} onClick={() => void signOut()}><LogOut size={15} aria-hidden="true" />Sair da gestão</button></div>
    </aside>

    <div className="admin-body">
      <header className="admin-topbar"><div><span>Workspace</span><ChevronRight size={13} aria-hidden="true" /><strong>{VIEW_LABELS[view]}</strong></div><span className="admin-manager"><button type="button" className="admin-icon-button" aria-label="Atualizar dados" disabled={refreshing || busy} onClick={() => void refresh()}><RotateCcw size={15} className={refreshing ? "admin-spinner" : undefined} /></button><span className="admin-avatar admin-avatar-small">{initials(state?.currentAccount.name || "M")}</span><span>{state?.currentAccount.name || "Manager"}</span></span></header>
      <main id="admin-content" className="admin-main">
        {loadError && <div className="admin-alert" role="alert"><span>{loadError}</span><button className="admin-text-button" type="button" onClick={() => void refresh()}>Tentar novamente</button></div>}
        <div className="admin-page-heading"><div><p className="admin-eyebrow">BASED SPEAK / MANAGEMENT</p><h1>{view === "students" ? "Cada pessoa, seu percurso." : view === "overview" ? "Tudo sob controle." : view === "users" ? "Pessoas, em primeiro lugar." : view === "approvals" ? "Novos começos." : view === "scheduling" ? "Um encontro marcado." : view === "messages" ? "Uma conversa aproxima." : "Cada alteração, registrada."}</h1><p>{view === "students" ? "Acompanhe o avanço e encontre quem precisa do seu próximo cuidado." : view === "overview" ? "Uma visão do seu espaço. Pessoas, acessos e próximos passos." : view === "users" ? "Encontre usuários, ajuste contas e gerencie acessos." : view === "approvals" ? "Revise os cadastros que aguardam sua aprovação." : view === "scheduling" ? "Acompanhe os pedidos e confirme as aulas gratuitas dos alunos." : view === "messages" ? "Leia as dúvidas dos alunos e responda como professor." : "Acompanhe as ações realizadas na gestão."}</p></div><button className="admin-button admin-button-primary" type="button" disabled={!state || busy} onClick={() => open({ type: "create" })}><Plus size={17} aria-hidden="true" />Novo usuário</button></div>
        <div role="status" aria-live="polite" className={notice ? "admin-notice" : "admin-sr-only"}>{notice && <><CheckCheck size={17} aria-hidden="true" /><span>{notice}</span><button type="button" className="admin-icon-button" aria-label="Fechar aviso" onClick={() => setNotice("")}><X size={16} /></button></>}</div>

        {!state ? <p className="admin-empty" role="status">{loadError ? "Os dados não foram carregados." : "Carregando as contas e atividades…"}</p> : <>
          {focusUserId && (view === "scheduling" || view === "messages") && <div className="admin-student-context"><span>Mostrando {view === "scheduling" ? "aulas" : "mensagens"} de <strong>{users.find(user => user.id === focusUserId)?.name || "esta conta"}</strong></span><button type="button" className="admin-text-button" onClick={() => setFocusUserId(null)}>Ver todos<X size={14} /></button><button type="button" className="admin-text-button" onClick={() => navigate("students")}>Voltar aos alunos<ArrowRight size={14} /></button></div>}
          {view === "students" && <StudentFollowUp users={users} conversations={state.conversations} stage={journeyFilter} onStageChange={setJourneyFilter} onManage={userId => open({ type: "edit", userId })} onSchedule={userId => { setFocusUserId(userId); setView("scheduling"); }} onMessages={userId => { setFocusUserId(userId); setView("messages"); }} />}
          {view === "scheduling" && <AdminLiveClasses key={`${state.currentAccount.id}:${focusUserId || "all"}`} uid={state.currentAccount.id} userId={focusUserId || undefined} onUpdated={refresh} />}
          {view === "overview" && <>
            <section className="admin-stats" aria-label="Resumo de usuários">
              {([{ label: "Total de usuários", value: users.length, subtitle: "Pessoas neste workspace", Icon: Users, status: "all" }, { label: "Acessos ativos", value: users.filter(user => user.status === "active").length, subtitle: "Contas com acesso liberado", Icon: UserCheck, status: "active" }, { label: "Aguardando aprovação", value: pending.length, subtitle: "Cadastros para revisar", Icon: Clock3, status: "pending" }, { label: "Acessos suspensos", value: users.filter(user => user.status === "suspended").length, subtitle: "Contas com acesso pausado", Icon: UserX, status: "suspended" }] as const).map(card => <button type="button" key={card.label} className="admin-stat" onClick={() => navigate(card.status === "pending" ? "approvals" : "users", card.status)}><span className="admin-stat-heading">{card.label}<card.Icon size={17} aria-hidden="true" /></span><strong>{String(card.value).padStart(2, "0")}</strong><span className="admin-stat-footer">{card.subtitle}<ArrowUpRight size={15} aria-hidden="true" /></span></button>)}
            </section>
            <JourneySummary users={users} onChoose={stage => { navigate("students"); setJourneyFilter(stage); }} />
            <div className="admin-overview-grid"><section className="admin-card"><header className="admin-card-heading"><div><h2>Na sua fila <span className="admin-inline-count">{pending.length}</span></h2><p>Um novo passo começa com sua aprovação.</p></div><button type="button" className="admin-text-button" onClick={() => navigate("approvals")}>Ver todos<ArrowRight size={15} aria-hidden="true" /></button></header>{pending.length ? <div className="admin-pending-list">{pending.slice(0, 3).map(user => <div key={user.id} className="admin-pending-row"><UserIdentity user={user} /><div className="admin-approval-actions"><button type="button" className="admin-icon-button admin-reject" aria-label={`Reprovar ${user.name}`} onClick={() => open({ type: "operation", userId: user.id, operation: "reject" })}><X size={17} aria-hidden="true" /></button><button type="button" className="admin-button admin-approve" aria-label={`Aprovar ${user.name}`} onClick={() => open({ type: "operation", userId: user.id, operation: "approve" })}><Check size={15} aria-hidden="true" />Aprovar</button></div></div>)}</div> : <Empty title="Tudo em dia." description="Nenhum cadastro aguardando aprovação." />}</section><section className="admin-quick-card"><span className="admin-quick-icon"><SlidersHorizontal size={23} aria-hidden="true" /></span><p className="admin-eyebrow">GESTÃO DE ACESSOS</p><h2>O cuidado está<br />nos detalhes.</h2><p>Edite contas, redefina logins e acompanhe cada pessoa em um só lugar.</p><button type="button" className="admin-button" onClick={() => navigate("users")}>Gerenciar usuários<ArrowUpRight size={16} aria-hidden="true" /></button><span className="admin-quick-decoration" aria-hidden="true">↗</span></section></div>
            <section className="admin-card admin-recent"><header className="admin-card-heading"><div><h2>Últimas atividades</h2><p>O que aconteceu por aqui.</p></div><button type="button" className="admin-text-button" onClick={() => navigate("activity")}>Ver histórico<ArrowRight size={15} aria-hidden="true" /></button></header><ActivityList items={state.activity.slice(0, 4)} /></section>
          </>}

          {(view === "users" || view === "approvals") && <section className="admin-card">
            <header className="admin-card-heading"><div><h2>{view === "users" ? "Todos os usuários" : "Cadastros pendentes"}<span className="admin-inline-count">{view === "users" ? users.length : pending.length}</span></h2><p>{view === "users" ? "As contas e os perfis da sua comunidade." : "Aprovar libera a prática. Reprovar bloqueia o login e mantém o cadastro no histórico."}</p></div></header>
            <div className="admin-filters"><label className="admin-search"><Search size={17} aria-hidden="true" /><span className="admin-sr-only">Buscar por nome ou e-mail</span><input type="search" placeholder="Buscar por nome ou e-mail" value={search} onChange={event => setSearch(event.target.value)} /></label>{view === "users" && <label className="admin-select"><span className="admin-sr-only">Filtrar por status</span><select aria-label="Filtrar por status" value={status} onChange={event => setStatus(event.target.value as UserStatus | "all")}><option value="all">Todos os status</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}<label className="admin-select"><span className="admin-sr-only">Filtrar por perfil</span><select aria-label="Filtrar por perfil" value={role} onChange={event => setRole(event.target.value as UserRole | "all")}><option value="all">Todos os perfis</option><option value="student">Aluno</option><option value="manager">Manager</option></select></label></div>
            <p className="admin-table-hint">Deslize a tabela para ver os controles<ArrowRight size={13} aria-hidden="true" /></p><div className="admin-table-scroll"><table className="admin-table"><caption className="admin-sr-only">{view === "users" ? "Usuários cadastrados" : "Cadastros aguardando aprovação"}</caption><thead><tr><th scope="col">Usuário</th><th scope="col">Perfil</th><th scope="col">Status</th><th scope="col">{view === "approvals" ? "Cadastro" : "Progresso"}</th><th scope="col"><span className="admin-sr-only">Ações</span></th></tr></thead><tbody>{visible.map(user => <tr key={user.id}><td><UserIdentity user={user} /></td><td><span className="admin-role">{user.role === "manager" ? "Manager" : "Aluno"}</span></td><td><StatusBadge status={user.status} /></td><td>{view === "approvals" ? <span className="admin-date">{date(user.createdAt)}</span> : <div className="admin-progress"><span className="admin-progress-track" role="progressbar" aria-valuenow={user.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso de ${user.name}`}><span style={{ width: `${user.progress}%` }} /></span><span>{user.progress}%</span></div>}</td><td><div className="admin-row-actions">{view === "approvals" && <><button type="button" className="admin-icon-button admin-reject" aria-label={`Reprovar ${user.name}`} onClick={() => open({ type: "operation", userId: user.id, operation: "reject" })}><X size={17} /></button><button type="button" className="admin-button admin-approve" aria-label={`Aprovar ${user.name}`} onClick={() => open({ type: "operation", userId: user.id, operation: "approve" })}><Check size={15} />Aprovar</button></>}<button type="button" className="admin-text-button" aria-label={`Gerenciar ${user.name}`} onClick={() => open({ type: "edit", userId: user.id })}>{view === "approvals" ? "Ver conta" : "Gerenciar"}<ChevronRight size={14} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div>
            {!visible.length && <Empty title={view === "approvals" && !pending.length ? "Tudo em dia." : "Nenhum usuário encontrado."} description={search || status !== "all" || role !== "all" ? "Tente outro nome ou ajuste os filtros." : view === "approvals" ? "Novos cadastros aparecerão aqui para revisão." : "Adicione um usuário para começar."} />}
            <footer className="admin-table-footer"><span>{visible.length} {visible.length === 1 ? "usuário encontrado" : "usuários encontrados"}</span>{(search || status !== "all" || role !== "all") && <button type="button" className="admin-text-button" onClick={() => { setSearch(""); setStatus("all"); setRole("all"); }}>Limpar filtros<X size={13} /></button>}</footer>
          </section>}

          {view === "messages" && <TeacherInbox key={focusUserId || "all"} conversations={focusUserId ? state.conversations.filter(item => item.userId === focusUserId) : state.conversations} accountId={state.currentAccount.id} onUpdated={refresh} />}
          {view === "activity" && <section className="admin-card"><header className="admin-card-heading"><div><h2>Histórico de gestão<span className="admin-inline-count">{state.activity.length}</span></h2><p>Últimos 150 registros de gestão. Horários no fuso deste navegador.</p></div><ActivityIcon size={21} aria-hidden="true" /></header><ActivityList items={state.activity} /></section>}
        </>}
        <footer className="admin-footer"><span>BasedSpeak<span className="admin-footer-dot">·</span>Área administrativa</span><span>{state ? `Atualizado em ${date(state.updatedAt, true)}` : "Conectando à gestão"}</span><div className="admin-footer-tools"><Link href="/dashboard"><Users size={14} aria-hidden="true" />Área do aluno</Link><button type="button" disabled={busy} onClick={() => void signOut()}><LogOut size={13} aria-hidden="true" />Sair</button></div></footer>
      </main>
    </div>

    <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-dialog-title" onCancel={event => { if (busy) event.preventDefault(); else setModal(null); }} onClose={() => setModal(null)}>
      {modal && <><header className="admin-dialog-heading"><div><p className="admin-eyebrow">GESTÃO DE USUÁRIOS</p><h2 id="admin-dialog-title">{modalTitle}</h2></div><button type="button" className="admin-icon-button" aria-label="Fechar janela" disabled={busy} onClick={() => setModal(null)}><X size={20} aria-hidden="true" /></button></header><form onSubmit={submit}><fieldset className="admin-form-fields" disabled={busy}>
        {(modal.type === "create" || modal.type === "edit") && <>
          {selected && <div className="admin-account-summary"><UserIdentity user={selected} /><StatusBadge status={selected.status} /></div>}
          <div className="admin-fields"><label>Nome completo<input autoFocus type="text" value={draft.name} required minLength={2} maxLength={120} autoComplete="off" onChange={event => setDraft({ ...draft, name: event.target.value })} /></label><label>E-mail de login<input type="email" value={draft.email} required maxLength={254} autoComplete="off" onChange={event => setDraft({ ...draft, email: event.target.value })} /></label><label>Perfil<select disabled={selected?.id === state?.currentAccount.id} aria-label="Perfil" value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as UserRole })}><option value="student">Aluno</option><option value="manager">Manager</option></select></label><label>Observações internas <span className="admin-optional">(opcional)</span><textarea value={draft.notes} rows={3} maxLength={1000} onChange={event => setDraft({ ...draft, notes: event.target.value })} /></label></div>
          {modal.type === "create" && <p className="admin-dialog-note">A conta será criada no Firebase como pendente. Ao concluir, compartilhe o link de definição de senha e aprove o acesso.</p>}
          {selected && <><dl className="admin-account-meta"><div><dt>Cadastro</dt><dd>{date(selected.createdAt)}</dd></div><div><dt>Último acesso</dt><dd>{date(selected.lastLoginAt, true)}</dd></div><div><dt>Conversa</dt><dd>{selected.conversation?.completed ? "Conversa concluída" : selected.conversation ? `Parte ${selected.conversation.part} de 10` : "Ainda não começou"}</dd></div><div><dt>Estudo</dt><dd>{selected.studyCompleted} de {selected.studyTotal} atividades</dd></div><div><dt>Redefinição de login</dt><dd>{selected.loginResetAt ? date(selected.loginResetAt, true) : "Nenhuma solicitação"}</dd></div></dl><section className="admin-account-controls" aria-label="Controles da conta"><h3>Controles da conta</h3><p>Salve as edições antes de executar uma ação.</p><div>{selected.status === "pending" ? <><button type="button" className="admin-button admin-approve" onClick={() => open({ type: "operation", userId: selected.id, operation: "approve" })}><Check size={15} />Aprovar</button><button type="button" className="admin-button admin-button-danger" onClick={() => open({ type: "operation", userId: selected.id, operation: "reject" })}><X size={15} />Reprovar</button></> : <button type="button" className="admin-button" disabled={selected.id === state?.currentAccount.id} onClick={() => open({ type: "operation", userId: selected.id, operation: selected.status === "active" ? "suspend" : "activate" })}><UserCheck size={15} />{selected.status === "active" ? "Suspender acesso" : "Reativar acesso"}</button>}<button type="button" className="admin-button" disabled={selected.id === state?.currentAccount.id} onClick={() => open({ type: "operation", userId: selected.id, operation: "reset-login" })}><KeyRound size={15} />Redefinir login</button><button type="button" className="admin-button" onClick={() => open({ type: "operation", userId: selected.id, operation: "reset-progress" })}><RotateCcw size={15} />Zerar progresso</button></div></section></>}
        </>}
        {modal.type === "operation" && <><p className="admin-dialog-description">{OPERATIONS[modal.operation].description}</p>{selected ? <div className="admin-confirm-user"><UserIdentity user={selected} /></div> : <p className="admin-alert">Este usuário não está mais disponível. Feche a janela e tente novamente.</p>}{modal.operation === "reject" && <div className="admin-fields"><label>Motivo da reprovação <span className="admin-optional">(opcional)</span><textarea rows={3} maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></label></div>}</>}
        {modal.type === "link" && <><p className="admin-dialog-description">Compartilhe este link somente com o titular da conta. Ele permite definir a senha; nenhum e-mail foi enviado por esta operação.</p><div className="admin-fields admin-access-link"><label>Link de definição de senha<input readOnly value={modal.link} onFocus={event => event.currentTarget.select()} /></label><button className="admin-button" type="button" onClick={() => { void navigator.clipboard.writeText(modal.link).then(() => setNotice("Link copiado."), () => setError("Selecione o link e copie manualmente.")); }}>Copiar link</button></div></>}
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <footer className="admin-dialog-footer"><button type="button" className="admin-button" onClick={() => setModal(null)}>{modal.type === "link" ? "Fechar" : "Cancelar"}</button>{modal.type !== "link" && <button className={`admin-button ${modal.type === "operation" && OPERATIONS[modal.operation].danger ? "admin-button-danger" : "admin-button-primary"}`} type="submit" disabled={modal.type === "operation" && !selected}>{busy ? <><LoaderCircle size={15} className="admin-spinner" />Salvando…</> : modal.type === "create" ? "Criar usuário" : modal.type === "edit" ? "Salvar alterações" : OPERATIONS[modal.operation].button}</button>}</footer></fieldset>
      </form></>}
    </dialog>
  </div>;
}

function UserIdentity({ user }: { user: Pick<AdminUser, "name" | "email"> }) {
  return <div className="admin-identity"><span className="admin-avatar" aria-hidden="true">{initials(user.name)}</span><div><strong>{user.name}</strong><span>{user.email}</span></div></div>;
}
function StatusBadge({ status }: { status: UserStatus }) {
  return <span className="admin-status" data-status={status}><span />{STATUS_LABELS[status]}</span>;
}
function Empty({ title, description }: { title: string; description: string }) {
  return <div className="admin-empty"><CheckCheck size={25} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></div>;
}
function ActivityList({ items }: { items: Activity[] }) {
  return items.length ? <ol className="admin-activity-list">{items.map(item => <li key={item.id}><span className="admin-activity-icon"><ActivityIcon size={16} aria-hidden="true" /></span><div><strong>{item.description}</strong><span>{item.name}{item.actorName ? ` · Por ${item.actorName}` : ""}</span></div><time dateTime={item.at}>{date(item.at, true)}</time></li>)}</ol> : <Empty title="Uma página em branco." description="Suas próximas alterações aparecerão aqui." />;
}
