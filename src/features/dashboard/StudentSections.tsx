"use client";

import Link from "next/link";
import { StudentLiveClass } from "@/features/live-class/StudentLiveClass";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, BookOpen, Check, MessageCircle, Send } from "lucide-react";
import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import { studentWorkspace } from "./workspace-store";
import { conversationPosition } from "@/features/demo/session/position";

export function formatStudentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function StudentSections({ workspace, disabled }: { workspace: StudentWorkspace; disabled: boolean }) {
  const { learning, account } = workspace;
  const position = conversationPosition(learning.demoSnapshot);
  return <>
    <section className="student-section" id="avanco" aria-labelledby="student-progress-title">
      <div className="student-section-heading"><div><p className="dashboard-overline">Um passo de cada vez</p><h2 id="student-progress-title" tabIndex={-1}>Meu avanço.</h2></div><span>{learning.updatedAt ? `Atualizado em ${formatStudentDate(learning.updatedAt)}` : "Seu percurso começa aqui"}</span></div>
      <div className="student-progress-grid">
        <article className="student-progress-card"><span>Conversa da cafeteria</span><strong>{learning.demoPercent}%</strong><progress value={learning.demoPercent} max={100} aria-label="Avanço na conversa da cafeteria" /><p>{position ? position.completed ? "Você chegou ao fim da conversa." : `Parte ${position.part} de 10. Seu ponto de retorno está guardado.` : "Ainda não há progresso desta história salvo na sua conta."}</p>{position && account.status === "active" && <Link href="/demo" prefetch={true}>{position.completed ? "Rever conversa" : "Retomar conversa"}<ArrowUpRight size={16} aria-hidden="true" /></Link>}</article>
        <article className="student-progress-card"><span>Estudo guiado</span><strong>{learning.studyCompleted}<small> / {learning.studyTotal}</small></strong><progress value={learning.studyCompleted} max={learning.studyTotal || 1} aria-label="Práticas de estudo concluídas" /><p>Práticas concluídas. Você pode revisitar os blocos quando quiser.</p>{account.status === "active" && <Link href="/demo/estudo" prefetch={false}>Ir para meu estudo<ArrowUpRight size={16} aria-hidden="true" /></Link>}</article>
        <StudentLiveClass key={account.id} workspace={workspace} disabled={disabled} />
      </div>
    </section>
    <section className="student-section" id="atividades" aria-labelledby="student-activities-title">
      <div className="student-section-heading"><div><p className="dashboard-overline">O que você já fez</p><h2 id="student-activities-title" tabIndex={-1}>Minhas atividades.</h2></div></div>
      {workspace.activities.length ? <ol className="student-activities">{workspace.activities.map(activity => <li key={activity.id}><span className="student-activity-icon"><BookOpen size={17} aria-hidden="true" /></span><div><strong>{activity.title}</strong><time dateTime={activity.at}>{formatStudentDate(activity.at)}</time></div></li>)}</ol> : <div className="student-empty"><BookOpen size={24} strokeWidth={1.4} aria-hidden="true" /><p>Ainda não há atividades registradas.</p><span>Ao praticar, seus registros aparecerão aqui.</span></div>}
    </section>
    <TeacherContact key={account.id} conversations={workspace.conversations} disabled={disabled} />
  </>;
}

export function TeacherContact({ conversations, disabled }: { conversations: TeacherConversation[]; disabled: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const current = conversations.find(item => item.id === selected);
  const closed = current?.status === "closed";
  const labels = { open: "Aguardando resposta", answered: "Professor respondeu", closed: "Conversa encerrada" };
  const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function choose(id: string | null) {
    if (sending) return;
    setSelected(id); setBody(""); setSubject(""); setError(""); setNotice("");
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || disabled || closed || !body.trim() || (!current && !subject.trim())) return;
    setSending(true); setError(""); setNotice("");
    try {
      const conversation = await studentWorkspace.sendMessage(subject.trim(), body.trim(), current?.id);
      setSelected(conversation.id); setBody(""); setSubject(""); setNotice("Mensagem enviada ao professor.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar. Sua mensagem continua aqui para tentar novamente."); }
    finally { setSending(false); }
  }

  return <section className="student-section" id="contato" aria-labelledby="student-contact-title">
    <div className="student-section-heading"><div><p className="dashboard-overline">Vamos conversar</p><h2 id="student-contact-title" tabIndex={-1}>Fale com o professor.</h2></div><MessageCircle size={24} strokeWidth={1.4} aria-hidden="true" /></div>
    <p className="student-contact-intro">Envie uma dúvida ou conte como está sendo seu estudo. As respostas ficam nesta área; use “Atualizar painel” para conferir novas mensagens.</p>
    <div className="student-contact-grid">
      <aside className="student-conversations" aria-label="Minhas conversas com o professor"><button className="student-new-conversation" type="button" onClick={() => choose(null)} disabled={sending} aria-pressed={!current}>Nova conversa<Send size={15} aria-hidden="true" /></button>
        {sorted.length ? <ul>{sorted.map(conversation => <li key={conversation.id}><button type="button" disabled={sending} aria-pressed={selected === conversation.id} onClick={() => choose(conversation.id)}><strong>{conversation.subject}</strong><span>{labels[conversation.status]}</span><time dateTime={conversation.updatedAt}>{formatStudentDate(conversation.updatedAt)}</time></button></li>)}</ul> : <p className="student-small">Você ainda não enviou mensagens. Comece uma nova conversa para falar com o professor.</p>}
      </aside>
      <div className="student-compose" aria-busy={sending}>
        {current ? <TeacherThread conversation={current} /> : <><h3>Nova mensagem.</h3><p className="student-small">A mensagem será salva na sua conta e recebida pelo professor.</p></>}
        {closed ? <p className="student-small">Esta conversa foi encerrada. Abra uma nova conversa para continuar o contato.</p> : <form onSubmit={send}><fieldset disabled={disabled || sending}>
          {!current && <label>Assunto<input name="subject" value={subject} onChange={event => setSubject(event.target.value)} maxLength={160} required /></label>}
          <label>{current ? "Sua resposta" : "Mensagem"}<textarea name="body" rows={5} value={body} onChange={event => setBody(event.target.value)} maxLength={4000} required /></label>
          <div className="student-compose-actions"><span>{body.length}/4000</span><button className="dashboard-primary" type="submit" disabled={!body.trim() || (!current && !subject.trim())}>{sending ? "Enviando…" : "Enviar mensagem"}<Send size={16} aria-hidden="true" /></button></div>
        </fieldset></form>}
        {error && <p className="dashboard-form-error" role="alert">{error}</p>}{notice && <p className="student-sent" role="status"><Check size={16} aria-hidden="true" />{notice}</p>}
      </div>
    </div>
  </section>;
}

export function TeacherThread({ conversation }: { conversation: TeacherConversation }) {
  const labels = { open: "Aguardando resposta", answered: "Professor respondeu", closed: "Conversa encerrada" };
  return <><div className="student-thread-heading"><h3>{conversation.subject}</h3><span>{labels[conversation.status]}</span></div><ol className="student-messages" aria-label={`Mensagens: ${conversation.subject}`}>{conversation.messages.map(message => <li key={message.id} data-author={message.role}><div><strong>{message.role === "manager" ? message.authorName ? `${message.authorName} · Professor` : "Professor" : "Você"}</strong><time dateTime={message.at}>{formatStudentDate(message.at)}</time></div><p>{message.body}</p></li>)}</ol></>;
}
