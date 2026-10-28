"use client";
import { useState } from "react";
import { ArrowRight, CalendarDays, GraduationCap, MessageSquare, Search } from "lucide-react";
import { STATUS_LABELS, type AdminUser } from "@/contracts/management";
import type { TeacherConversation } from "@/contracts/workspace";
import { LIVE_CLASS_LABELS, liveClassDate } from "@/contracts/live-class";
import { filterJourney, journeyCounts, journeyStage, JOURNEY_LABELS, type JourneyFilter } from "./student-journey";

const summaryStages = ["pending", "not_started", "conversation", "study", "ready", "requested", "scheduled", "completed"] as const;
export function JourneySummary({ users, onChoose }: { users: AdminUser[]; onChoose: (stage: JourneyFilter) => void }) {
  const students = users.filter(user => user.role === "student"), counts = journeyCounts(students);
  return <section className="admin-card admin-journey-summary"><header className="admin-card-heading"><div><h2><GraduationCap size={19} />Acompanhe seus alunos</h2><p>Etapa atual de cada aluno. Contas de manager ficam fora destes totais.</p></div><button type="button" className="admin-text-button" onClick={() => onChoose("all")}>Ver alunos<ArrowRight size={15} /></button></header><div className="admin-journey-counts">{summaryStages.map(stage => <button key={stage} type="button" onClick={() => onChoose(stage)}><span>{JOURNEY_LABELS[stage]}</span><strong>{counts[stage]}</strong><span>Ver pessoas<ArrowRight size={14} /></span></button>)}</div></section>;
}
const savedAt = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : null;
export function StudentFollowUp({ users, conversations, stage, onStageChange, onManage, onSchedule, onMessages }: {
  users: AdminUser[]; conversations: TeacherConversation[]; stage: JourneyFilter; onStageChange: (stage: JourneyFilter) => void;
  onManage: (uid: string) => void; onSchedule: (uid: string) => void; onMessages: (uid: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [includeManagers, setIncludeManagers] = useState(false);
  const visible = filterJourney(users, search, stage, includeManagers);
  const total = users.filter(user => includeManagers || user.role === "student").length;
  return <section className="admin-card admin-followup">
    <header className="admin-card-heading"><div><h2>{includeManagers ? "Pessoas em acompanhamento" : "Acompanhamento dos alunos"}<span className="admin-inline-count">{total}</span></h2><p>Conversa, estudo e aula ao vivo, ligados à mesma conta.</p></div></header>
    <div className="admin-followup-filters"><label className="admin-search"><Search size={17} /><span className="admin-sr-only">Buscar aluno por nome ou e-mail</span><input type="search" placeholder="Buscar aluno por nome ou e-mail" value={search} onChange={event => setSearch(event.target.value)} /></label><label>Etapa<select value={stage} onChange={event => onStageChange(event.target.value as JourneyFilter)}><option value="all">Todas as etapas</option>{Object.entries(JOURNEY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="admin-followup-managers"><input type="checkbox" checked={includeManagers} onChange={event => setIncludeManagers(event.target.checked)} />Incluir contas de manager</label></div>
    <p className="admin-followup-result" role="status">{visible.length} {visible.length === 1 ? "pessoa encontrada" : "pessoas encontradas"}{stage !== "all" ? ` · ${JOURNEY_LABELS[stage]}` : ""}. Último avanço salvo em primeiro lugar.</p>
    <div className="admin-followup-list">{visible.map(user => {
      const current = journeyStage(user), booking = user.liveClass;
      const messages = conversations.filter(item => item.userId === user.id);
      const unanswered = messages.filter(item => item.status === "open").length;
      return <article key={user.id} className="admin-followup-person"><header><div><h3>{user.name}</h3><p>{user.email}</p><div className="admin-followup-badges"><span className="admin-status" data-status={user.status}>{STATUS_LABELS[user.status]}</span>{user.role === "manager" && <span className="admin-status">Manager</span>}<span className="admin-followup-stage" data-stage={current}>{JOURNEY_LABELS[current]}</span></div></div><span className="admin-followup-date">{user.lastLearningAt ? `Último avanço: ${savedAt(user.lastLearningAt)}` : "Ainda não há prática salva"}</span></header>
        <dl className="admin-followup-progress"><div><dt>Conversa da cafeteria</dt><dd>{user.conversation ? user.conversation.completed ? "Conversa concluída" : `Parte ${user.conversation.part} de 10` : "Ainda não começou"}</dd></div><div><dt>Estudo guiado</dt><dd>{user.studyCompleted} de {user.studyTotal} práticas</dd><progress max={user.studyTotal || 1} value={user.studyCompleted} aria-label={`Estudo de ${user.name}`} /></div><div><dt>Aula ao vivo</dt><dd>{booking ? LIVE_CLASS_LABELS[booking.status] : user.canBookLiveClass ? "Agenda liberada" : "Agenda bloqueada"}</dd>{booking ? <><time dateTime={booking.start}>{liveClassDate(booking.start, booking.timezone)}</time><small>{booking.timezone}</small>{booking.status === "cancelled" && <small>Escolha anterior cancelada. {booking.reason}</small>}</> : <small>{user.canBookLiveClass ? "Estudo concluído; aguardando escolha do aluno." : user.status === "suspended" || user.status === "rejected" ? "O acesso à conta precisa estar disponível." : "Libera com 100% do estudo guiado."}</small>}</div></dl>
        <footer><button type="button" className="admin-button" onClick={() => onManage(user.id)}>Ver conta<ArrowRight size={14} /></button>{booking && <button type="button" className="admin-button admin-button-primary" onClick={() => onSchedule(user.id)}><CalendarDays size={15} />{booking.status === "pending" ? "Conferir pedido" : "Ver agendamento"}</button>}<button type="button" className="admin-button" onClick={() => onMessages(user.id)}><MessageSquare size={15} />Mensagens ({messages.length}){unanswered > 0 && <span className="admin-inline-count">{unanswered} sem resposta</span>}</button></footer>
      </article>;
    })}</div>
    {!visible.length && <div className="admin-empty"><GraduationCap size={26} /><h3>{search || stage !== "all" ? "Nenhuma pessoa nesta seleção." : "Nenhum aluno cadastrado."}</h3><p>{search || stage !== "all" ? "Ajuste a busca ou escolha outra etapa." : "As contas de alunos aparecerão aqui com o progresso real."}</p>{(search || stage !== "all") && <button type="button" className="admin-button" onClick={() => { setSearch(""); onStageChange("all"); }}>Limpar filtros</button>}</div>}
  </section>;
}
