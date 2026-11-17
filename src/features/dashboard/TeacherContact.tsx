"use client";

import { BrowserText } from "@/components/i18n/BrowserText";
import { useEffect, useState, type FormEvent } from "react";
import { Check, MessageCircle, Send } from "lucide-react";
import type { TeacherConversation } from "@/contracts/workspace";
import { studentWorkspace } from "./workspace-store";
import { OPEN_TEACHER_CONVERSATION_EVENT } from "./next-step";

export function formatStudentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
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

  useEffect(() => {
    const reveal = (event: Event) => {
      const id = (event as CustomEvent<unknown>).detail;
      if (sending || typeof id !== "string" || !conversations.some(item => item.id === id)) return;
      setSelected(id); setBody(""); setSubject(""); setError(""); setNotice("");
    };
    window.addEventListener(OPEN_TEACHER_CONVERSATION_EVENT, reveal);
    return () => window.removeEventListener(OPEN_TEACHER_CONVERSATION_EVENT, reveal);
  }, [conversations, sending]);

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
    <p className="student-contact-intro">Envie uma dúvida ou conte como está sendo seu estudo. As respostas aparecem aqui e o painel confere atualizações automaticamente enquanto está aberto.</p>
    <div className="student-contact-grid">
      <aside className="student-conversations" aria-label="Minhas conversas com o professor"><button className="student-new-conversation" type="button" onClick={() => choose(null)} disabled={sending} aria-pressed={!current}>Nova conversa<Send size={15} aria-hidden="true" /></button>
        {sorted.length ? <ul>{sorted.map(conversation => <li key={conversation.id}><button type="button" disabled={sending} aria-pressed={selected === conversation.id} onClick={() => choose(conversation.id)}><strong><BrowserText>{conversation.subject}</BrowserText></strong><span><BrowserText>{labels[conversation.status]}</BrowserText></span><time dateTime={conversation.updatedAt}><BrowserText>{formatStudentDate(conversation.updatedAt)}</BrowserText></time></button></li>)}</ul> : <p className="student-small">Você ainda não enviou mensagens. Comece uma nova conversa para falar com o professor.</p>}
      </aside>
      <div className="student-compose" aria-busy={sending}>
        {current ? <TeacherThread conversation={current} /> : <><h3>Nova mensagem.</h3><p className="student-small">A mensagem será salva na sua conta e recebida pelo professor.</p></>}
        {closed ? <p className="student-small">Esta conversa foi encerrada. Abra uma nova conversa para continuar o contato.</p> : <form onSubmit={send}><fieldset disabled={disabled || sending}>
          {!current && <label>Assunto<input name="subject" value={subject} onChange={event => setSubject(event.target.value)} maxLength={160} required /></label>}
          <label>{current ? <BrowserText>{"Sua resposta"}</BrowserText> : <BrowserText>{"Mensagem"}</BrowserText>}<textarea name="body" rows={5} value={body} onChange={event => setBody(event.target.value)} maxLength={4000} required /></label>
          <div className="student-compose-actions"><span><BrowserText>{body.length}</BrowserText><BrowserText>/4000</BrowserText></span><button className="dashboard-primary" type="submit" disabled={!body.trim() || (!current && !subject.trim())}>{sending ? <BrowserText>{"Enviando…"}</BrowserText> : <BrowserText>{"Enviar mensagem"}</BrowserText>}<Send size={16} aria-hidden="true" /></button></div>
        </fieldset></form>}
        {error && <p className="dashboard-form-error" role="alert"><BrowserText>{error}</BrowserText></p>}{notice && <p className="student-sent" role="status"><Check size={16} aria-hidden="true" /><BrowserText>{notice}</BrowserText></p>}
      </div>
    </div>
  </section>;
}

export function TeacherThread({ conversation }: { conversation: TeacherConversation }) {
  const labels = { open: "Aguardando resposta", answered: "Professor respondeu", closed: "Conversa encerrada" };
  return <><div className="student-thread-heading"><h3><BrowserText>{conversation.subject}</BrowserText></h3><span><BrowserText>{labels[conversation.status]}</BrowserText></span></div><ol className="student-messages" aria-label={`Mensagens: ${conversation.subject}`}>{conversation.messages.map(message => <li key={message.id} data-author={message.role}><div><strong>{message.role === "manager" ? message.authorName ? <BrowserText>{`${message.authorName} · Professor`}</BrowserText> : <BrowserText>{"Professor"}</BrowserText> : <BrowserText>{"Você"}</BrowserText>}</strong><time dateTime={message.at}><BrowserText>{formatStudentDate(message.at)}</BrowserText></time></div><p><BrowserText>{message.body}</BrowserText></p></li>)}</ol></>;
}
