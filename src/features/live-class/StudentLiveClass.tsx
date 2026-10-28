"use client";
import "./live-class.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, LockKeyhole, X } from "lucide-react";
import type { StudentWorkspace } from "@/contracts/workspace";
import { LIVE_CLASS_LABELS, liveClassDate, type LiveClassAvailability } from "@/contracts/live-class";
import { calendarDays, offsetMonth } from "./calendar";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { accountCanPractice } from "@/features/dashboard/practice-access";

export function StudentLiveClass({ workspace, disabled }: { workspace: StudentWorkspace; disabled: boolean }) {
  const [data, setData] = useState<LiveClassAvailability | null>(null);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const sequence = useRef(0);
  const uid = workspace.account.id;
  const load = useCallback(async () => {
    const ticket = ++sequence.current;
    try {
      const response = await fetch(`/api/student/live-class${month ? `?month=${month}` : ""}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar sua aula.");
      if (result.userId !== uid) throw new Error("A conta conectada mudou. Atualize o painel.");
      if (ticket === sequence.current) { setData(result); setError(""); }
    } catch (cause) { if (ticket === sequence.current) setError(cause instanceof Error ? cause.message : "Não foi possível carregar sua aula."); }
    finally { if (ticket === sequence.current) setLoading(false); }
  }, [month, uid]);
  // A panel refresh must also reload the booking when study progress is unchanged.
  useEffect(() => {
    const sequenceRef = sequence;
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const interval = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => { sequenceRef.current++; clearInterval(interval); window.removeEventListener("focus", refresh); };
  }, [load, workspace]);
  const booking = data?.booking;
  const available = Boolean(data?.eligible && (!booking || booking.status === "cancelled") && accountCanPractice(workspace.account.status));
  const currentMonth = data ? new Intl.DateTimeFormat("sv-SE", { timeZone: data.timezone, year: "numeric", month: "2-digit" }).format(new Date()) : "";
  const activeDay = day.startsWith(data?.month || "_") ? day : data?.slots[0]?.day || "";
  const times = data?.slots.filter(slot => slot.day === activeDay) || [];
  const choice = times.find(slot => slot.start === selected);

  async function book() {
    if (!choice || busy || disabled || !available) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await studentWorkspace.flush();
      const response = await fetch("/api/student/live-class", { method: "POST", headers: { "Content-Type": "application/json", "X-Workspace-Uid": uid }, body: JSON.stringify({ start: choice.start }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível agendar.");
      if (studentWorkspace.getSnapshot().workspace?.account.id !== uid) throw new Error("A conta conectada mudou. Atualize o painel.");
      setData(previous => previous ? { ...previous, booking: result.booking, slots: [] } : previous);
      setNotice("Pedido enviado ao professor. Acompanhe a confirmação aqui.");
      dialog.current?.close(); setSelected("");
      void studentWorkspace.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível agendar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <article className="student-progress-card live-class-card" id="aula-ao-vivo" tabIndex={-1} aria-label="Minha aula ao vivo">
    <span><CalendarDays size={17} aria-hidden="true" />Minha aula ao vivo</span>
    <strong className="live-class-title">{booking ? LIVE_CLASS_LABELS[booking.status] : loading ? "Carregando…" : available ? "Sua vez de conversar." : "Um próximo encontro."}</strong>
    <p>Uma aula gratuita com o professor, depois do estudo da cafeteria.</p>
    {booking && <div className="live-class-booking"><time dateTime={booking.start}>{liveClassDate(booking.start, booking.timezone)}</time><small>1 hora · {booking.timezone}</small>{booking.reason && <p>{booking.reason}</p>}{booking.status === "confirmed" && (booking.meetingUrl ? <a href={booking.meetingUrl} target="_blank" rel="noreferrer">Entrar na aula ↗</a> : <p>O professor enviará as orientações de acesso pelo contato do painel.</p>)}{booking.status === "pending" && <p>O professor recebeu seu pedido. O horário será confirmado nesta área.</p>}</div>}
    {booking && ["pending", "confirmed"].includes(booking.status) && <a href="#contato">Falar com o professor ↗</a>}
    {!booking && !available && !loading && <p className="live-class-lock"><LockKeyhole size={16} aria-hidden="true" />{!accountCanPractice(workspace.account.status) ? "Seu acesso à aula está indisponível. Fale com o professor." : `Conclua 100% do estudo guiado para liberar a agenda. ${data?.completed ?? workspace.learning.studyCompleted} de ${workspace.learning.studyTotal} práticas concluídas.`}</p>}
    <button type="button" className="dashboard-primary" disabled={!available || disabled || loading} onClick={() => { setNotice(""); dialog.current?.showModal(); void load(); }}><CalendarDays size={16} aria-hidden="true" />{booking?.status === "cancelled" ? "Escolher outro horário" : booking?.status === "pending" ? "Pedido enviado" : booking?.status === "confirmed" ? "Aula agendada" : booking?.status === "completed" ? "Aula concluída" : "Agendar minha aula"}</button>
    {notice && <p role="status" className="student-sent"><Check size={16} />{notice}</p>}
    {error && <div role="alert" className="dashboard-form-error"><p>{error}</p><button type="button" onClick={() => void load()}>Tentar novamente</button></div>}
    <dialog ref={dialog} className="live-class-dialog" aria-labelledby="live-class-dialog-title" onCancel={event => { if (busy) event.preventDefault(); }}>
      <header><div><p className="dashboard-overline">SEU ENCONTRO COM O PROFESSOR</p><h2 id="live-class-dialog-title">Vamos marcar?</h2></div><button type="button" className="dashboard-icon-button" aria-label="Fechar agenda" disabled={busy} onClick={() => dialog.current?.close()}><X size={20} /></button></header>
      <p>Escolha um horário para sua aula gratuita de uma hora. O pedido será enviado ao professor para confirmação.</p>
      {data && <><p className="live-class-timezone">Horários em {data.timezone}.</p><div className="live-class-month"><button type="button" aria-label="Mês anterior" disabled={busy || data.month <= currentMonth} onClick={() => { setMonth(offsetMonth(data.month, -1)); setSelected(""); }}><ChevronLeft size={18} /></button><strong>{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.month}-01T12:00:00Z`))}</strong><button type="button" aria-label="Próximo mês" disabled={busy || data.month >= offsetMonth(currentMonth, 2)} onClick={() => { setMonth(offsetMonth(data.month, 1)); setSelected(""); }}><ChevronRight size={18} /></button></div>
      <div className="live-class-days" aria-label="Escolha o dia">{["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => <span aria-hidden="true" key={`weekday-${index}`}>{label}</span>)}{Array.from({ length: new Date(`${data.month}-01T12:00:00Z`).getUTCDay() }, (_, index) => <span key={`offset-${index}`} />)}{calendarDays(data.month).map(date => <button type="button" key={date} aria-label={`Dia ${date.slice(-2)}`} aria-pressed={date === activeDay} disabled={busy || !data.slots.some(slot => slot.day === date)} onClick={() => { setDay(date); setSelected(""); }}>{Number(date.slice(-2))}</button>)}</div>
      <h3>Horários{activeDay ? ` · ${activeDay.slice(-2)}/${activeDay.slice(5, 7)}` : ""}</h3><div className="live-class-times" aria-label="Escolha o horário">{times.map(slot => <button type="button" key={slot.start} aria-pressed={selected === slot.start} disabled={busy} onClick={() => setSelected(slot.start)}>{slot.time}</button>)}</div>{!times.length && <p>Nenhum horário disponível neste mês. Experimente o próximo.</p>}
      {choice && <p className="live-class-choice">Sua escolha: <strong>{liveClassDate(choice.start, data.timezone)}</strong> · {data.timezone}</p>}</>}
      {error && <p role="alert" className="dashboard-form-error">{error}</p>}
      <footer><button type="button" className="dashboard-primary" disabled={!choice || busy || disabled || !available} onClick={() => void book()}>{busy ? "Enviando pedido…" : "Solicitar este horário"}</button><small>Uma aula gratuita por conta. Você poderá acompanhar o pedido no painel.</small></footer>
    </dialog>
  </article>;
}
