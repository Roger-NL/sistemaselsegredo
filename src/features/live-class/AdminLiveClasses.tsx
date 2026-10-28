"use client";
import "./live-class.css";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, RotateCcw } from "lucide-react";
import { LIVE_CLASS_LABELS, liveClassDate, type LiveClassBooking } from "@/contracts/live-class";

export function AdminLiveClasses({ uid }: { uid: string }) {
  const [bookings, setBookings] = useState<LiveClassBooking[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<LiveClassBooking | null>(null);
  const [decision, setDecision] = useState("confirm");
  const [reason, setReason] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const sequence = useRef(0);
  const decisionForm = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!selected) return;
    decisionForm.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    decisionForm.current?.querySelector<HTMLElement>("input,textarea,button")?.focus({ preventScroll: true });
  }, [selected]);
  const load = useCallback(async () => {
    const ticket = ++sequence.current;
    try {
      const response = await fetch("/api/admin/live-classes", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar a agenda.");
      if (ticket === sequence.current) { setBookings(result.bookings); setError(""); }
    } catch (cause) { if (ticket === sequence.current) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a agenda."); }
  }, []);
  useEffect(() => {
    const sequenceRef = sequence;
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const timer = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => { sequenceRef.current++; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/live-classes", { method: "POST", headers: { "Content-Type": "application/json", "X-Workspace-Uid": uid }, body: JSON.stringify({ id: selected.id, revision: selected.revision, decision, reason, meetingUrl }) });
      const result = await response.json();
      if (response.status === 409) { setSelected(null); await load(); }
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a aula.");
      setNotice("Agendamento atualizado. A alteração já está disponível no painel do aluno.");
      setSelected(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a aula."); }
    finally { setBusy(false); }
  }
  return <section className="admin-card live-class-admin">
    <header className="admin-card-heading"><div><h2><CalendarDays size={20} />Aulas gratuitas da cafeteria</h2><p>Pedidos dos alunos após concluir 100% do estudo guiado.</p></div><button type="button" className="admin-button" disabled={busy} onClick={() => void load()}><RotateCcw size={15} />Atualizar agenda</button></header>
    <div className="live-class-admin-toolbar"><label>Mostrar<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todas as aulas</option>{Object.entries(LIVE_CLASS_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label><p><strong>{bookings?.filter(b => b.status === "pending").length ?? "—"}</strong> pedidos aguardando confirmação</p></div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
    {!bookings ? <p role="status" className="admin-empty">{error ? "A agenda não foi carregada. Tente atualizar." : "Carregando agenda…"}</p> : <div className="live-class-admin-list">{bookings.filter(b => filter === "all" || b.status === filter).map(booking => <article key={booking.id} className="live-class-admin-item"><div><span className="admin-status" data-status={booking.status}>{LIVE_CLASS_LABELS[booking.status]}</span><h3>{booking.studentName}</h3><p>{booking.studentEmail}</p><strong>{liveClassDate(booking.start, booking.timezone)}</strong><p>1 hora · {booking.timezone}</p>{booking.reason && <p>Motivo: {booking.reason}</p>}{booking.meetingUrl && <a href={booking.meetingUrl} target="_blank" rel="noreferrer">Link da aula ↗</a>}</div>{["pending", "confirmed"].includes(booking.status) && <div className="live-class-admin-actions">{new Date(booking.start) > new Date() && <button type="button" className="admin-button admin-button-primary" disabled={busy} onClick={() => { setSelected(booking); setDecision("confirm"); setReason(""); setMeetingUrl(booking.meetingUrl); }}>{booking.status === "confirmed" ? "Editar acesso" : "Confirmar aula"}</button>}<button type="button" className="admin-button" disabled={busy} onClick={() => { setSelected(booking); setDecision("cancel"); setReason(""); setMeetingUrl(""); }}>Cancelar horário</button>{booking.status === "confirmed" && new Date(booking.end) <= new Date() && <button type="button" className="admin-button" disabled={busy} onClick={() => { setSelected(booking); setDecision("complete"); setReason(""); setMeetingUrl(booking.meetingUrl); }}>Marcar realizada</button>}</div>}</article>)}{!bookings.some(b => filter === "all" || b.status === filter) && <div className="admin-empty"><CalendarDays size={26} /><h3>Nenhuma aula por aqui.</h3><p>Os agendamentos dos alunos aparecerão nesta agenda.</p></div>}</div>}
    {selected && <form ref={decisionForm} onSubmit={submit} className="live-class-admin-decision"><h3>{decision === "confirm" ? "Confirmar aula" : decision === "cancel" ? "Cancelar agendamento" : "Registrar aula realizada"} · {selected.studentName}</h3><p>{liveClassDate(selected.start, selected.timezone)} · {selected.timezone}</p><fieldset disabled={busy}>{decision === "confirm" && <label>Link de acesso à aula (opcional)<input type="url" placeholder="https://…" value={meetingUrl} onChange={event => setMeetingUrl(event.target.value)} maxLength={1000} /><small>Sem link, envie as orientações pelo contato com o aluno no painel.</small></label>}{decision === "cancel" && <label>Motivo para o aluno<textarea required value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={3} /><small>O horário será liberado e o aluno poderá escolher outro.</small></label>}<div><button type="submit" className="admin-button admin-button-primary">{busy ? "Salvando…" : "Salvar decisão"}</button><button type="button" className="admin-button" onClick={() => setSelected(null)}>Voltar</button></div></fieldset></form>}
  </section>;
}
