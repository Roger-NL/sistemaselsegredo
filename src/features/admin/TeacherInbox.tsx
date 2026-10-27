"use client";
import { useState, type FormEvent } from "react";
import { LoaderCircle, MessageSquare, Send } from "lucide-react";
import type { TeacherConversation } from "@/contracts/workspace";

const statusLabel = { open: "Aguardando resposta", answered: "Respondida", closed: "Encerrada" };
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function TeacherInbox({ conversations, accountId, onUpdated }: { conversations: TeacherConversation[]; accountId: string; onUpdated: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "answered" | "closed">("all");
  const [body, setBody] = useState("");
  const [close, setClose] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const visible = conversations.filter(item => filter === "all" || item.status === filter);
  const selected = conversations.find(item => item.id === selectedId);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/conversations/${encodeURIComponent(selected.id)}/messages`, { method: "POST", headers: { "Content-Type": "application/json", "X-Workspace-Uid": accountId }, body: JSON.stringify({ body: body.trim(), status: close ? "closed" : "answered" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar a resposta.");
      setBody(""); setClose(false); setNotice("Resposta enviada ao painel do aluno.");
      await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar a resposta."); }
    finally { setBusy(false); }
  }
  return <section className="admin-inbox"><div className="admin-card admin-inbox-list"><header className="admin-card-heading"><div><h2>Contato com o professor<span className="admin-inline-count">{conversations.length}</span></h2><p>Perguntas e respostas dos alunos.</p></div></header><label className="admin-inbox-filter"><span className="admin-sr-only">Filtrar conversas</span><select aria-label="Filtrar conversas" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="all">Todas as conversas</option><option value="open">Aguardando resposta</option><option value="answered">Respondidas</option><option value="closed">Encerradas</option></select></label>{visible.length ? <ul>{visible.map(item => <li key={item.id}><button type="button" disabled={busy} aria-pressed={selectedId === item.id} onClick={() => { setSelectedId(item.id); setBody(""); setClose(false); setError(""); setNotice(""); }}><span className="admin-inbox-student">{item.userName || item.userEmail}</span><strong>{item.subject}</strong><span>{statusLabel[item.status]} · {formatDate(item.updatedAt)}</span></button></li>)}</ul> : <div className="admin-empty"><MessageSquare size={25} /><h3>Nenhuma conversa por aqui.</h3><p>As mensagens enviadas pelos alunos aparecerão nesta caixa.</p></div>}</div><div className="admin-card admin-inbox-thread">{selected ? <><header className="admin-card-heading"><div><h2>{selected.subject}</h2><p>{selected.userName} · {selected.userEmail}</p></div><span className="admin-status">{statusLabel[selected.status]}</span></header><ol className="admin-message-list">{selected.messages.map(message => <li key={message.id} data-author={message.role}><div><strong>{message.authorName || (message.role === "manager" ? "Professor" : "Aluno")}</strong><time dateTime={message.at}>{formatDate(message.at)}</time></div><p>{message.body}</p></li>)}</ol><form className="admin-reply-form" onSubmit={send}><fieldset disabled={busy}><label className="admin-reply-label">Sua resposta<textarea required minLength={1} maxLength={4000} rows={4} value={body} onChange={event => setBody(event.target.value)} placeholder="Escreva para o aluno…" /></label><label className="admin-close-conversation"><input type="checkbox" checked={close} onChange={event => setClose(event.target.checked)} />Encerrar conversa após responder</label><button type="submit" className="admin-button admin-button-primary" disabled={!body.trim() || selected.messages.length >= 100}>{busy ? <LoaderCircle size={15} className="admin-spinner" /> : <Send size={15} />}Enviar resposta</button></fieldset>{error && <p className="admin-form-error" role="alert">{error}</p>}{notice && <p className="admin-dialog-note" role="status">{notice}</p>}</form></> : <div className="admin-inbox-placeholder"><MessageSquare size={30} /><h2>Uma conversa de cada vez.</h2><p>Selecione uma mensagem para acompanhar o histórico e responder.</p></div>}</div></section>;
}
