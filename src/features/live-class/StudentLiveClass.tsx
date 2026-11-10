"use client";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";

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
    <strong className="live-class-title">{booking ? <BrowserText>{LIVE_CLASS_LABELS[booking.status]}</BrowserText> : loading ? <BrowserText>{"Carregando…"}</BrowserText> : available ? <BrowserText>{"Sua vez de conversar."}</BrowserText> : <BrowserText>{"Um próximo encontro."}</BrowserText>}</strong>
    <p>Uma aula gratuita com o professor, depois do estudo da cafeteria.</p>
    {booking && <div className="live-class-booking"><time dateTime={booking.start}><BrowserText>{liveClassDate(booking.start, booking.timezone)}</BrowserText></time><small><BrowserText>1 hora · </BrowserText><BrowserText>{booking.timezone}</BrowserText></small>{booking.reason && <p><BrowserText>{booking.reason}</BrowserText></p>}{booking.status === "confirmed" && (booking.meetingUrl ? <a href={booking.meetingUrl} target="_blank" rel="noreferrer">Entrar na aula <InterfaceIcon name="arrow-up-right" /></a> : <p>O professor enviará as orientações de acesso pelo contato do painel.</p>)}{booking.status === "pending" && <p>O professor recebeu seu pedido. O horário será confirmado nesta área.</p>}</div>}
    {booking && ["pending", "confirmed"].includes(booking.status) && <a href="#contato">Falar com o professor <InterfaceIcon name="arrow-up-right" /></a>}
    {!booking && !available && !loading && <p className="live-class-lock"><LockKeyhole size={16} aria-hidden="true" />{!accountCanPractice(workspace.account.status) ? <BrowserText>{"Seu acesso à aula está indisponível. Fale com o professor."}</BrowserText> : <BrowserText>{`Conclua 100% do estudo guiado para liberar a agenda. ${data?.completed ?? workspace.learning.studyCompleted} de ${workspace.learning.studyTotal} etapas concluídas.`}</BrowserText>}</p>}
    <button type="button" className="dashboard-primary" disabled={!available || disabled || loading} onClick={() => { setNotice(""); dialog.current?.showModal(); void load(); }}><CalendarDays size={16} aria-hidden="true" />{booking?.status === "cancelled" ? <BrowserText>{"Escolher outro horário"}</BrowserText> : booking?.status === "pending" ? <BrowserText>{"Pedido enviado"}</BrowserText> : booking?.status === "confirmed" ? <BrowserText>{"Aula agendada"}</BrowserText> : booking?.status === "completed" ? <BrowserText>{"Aula concluída"}</BrowserText> : <BrowserText>{"Agendar minha aula"}</BrowserText>}</button>
    {notice && <p role="status" className="student-sent"><Check size={16} /><BrowserText>{notice}</BrowserText></p>}
    {error && <div role="alert" className="dashboard-form-error"><p><BrowserText>{error}</BrowserText></p><button type="button" onClick={() => void load()}>Tentar novamente</button></div>}
    <dialog ref={dialog} className="live-class-dialog" aria-labelledby="live-class-dialog-title" onCancel={event => { if (busy) event.preventDefault(); }}>
      <header><div><p className="dashboard-overline">SEU ENCONTRO COM O PROFESSOR</p><h2 id="live-class-dialog-title">Vamos marcar?</h2></div><button type="button" className="dashboard-icon-button" aria-label="Fechar agenda" disabled={busy} onClick={() => dialog.current?.close()}><X size={20} /></button></header>
      <p>Escolha um horário para sua aula gratuita de uma hora. O pedido será enviado ao professor para confirmação.</p>
      {data && <><p className="live-class-timezone"><BrowserText>Horários em </BrowserText><BrowserText>{data.timezone}</BrowserText><BrowserText>.</BrowserText></p><div className="live-class-month"><button type="button" aria-label="Mês anterior" disabled={busy || data.month <= currentMonth} onClick={() => { setMonth(offsetMonth(data.month, -1)); setSelected(""); }}><ChevronLeft size={18} /></button><strong><BrowserText>{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.month}-01T12:00:00Z`))}</BrowserText></strong><button type="button" aria-label="Próximo mês" disabled={busy || data.month >= offsetMonth(currentMonth, 2)} onClick={() => { setMonth(offsetMonth(data.month, 1)); setSelected(""); }}><ChevronRight size={18} /></button></div>
      <div className="live-class-days" aria-label="Escolha o dia">{["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => <span aria-hidden="true" key={`weekday-${index}`}><BrowserText>{label}</BrowserText></span>)}{Array.from({ length: new Date(`${data.month}-01T12:00:00Z`).getUTCDay() }, (_, index) => <span key={`offset-${index}`} />)}{calendarDays(data.month).map(date => <button type="button" key={date} aria-label={`Dia ${date.slice(-2)}`} aria-pressed={date === activeDay} disabled={busy || !data.slots.some(slot => slot.day === date)} onClick={() => { setDay(date); setSelected(""); }}><BrowserText>{Number(date.slice(-2))}</BrowserText></button>)}</div>
      <h3><BrowserText>Horários</BrowserText>{activeDay ? <BrowserText>{` · ${activeDay.slice(-2)}/${activeDay.slice(5, 7)}`}</BrowserText> : <BrowserText>{""}</BrowserText>}</h3><div className="live-class-times" aria-label="Escolha o horário">{times.map(slot => <button type="button" key={slot.start} aria-pressed={selected === slot.start} disabled={busy} onClick={() => setSelected(slot.start)}><BrowserText>{slot.time}</BrowserText></button>)}</div>{!times.length && <p>Nenhum horário disponível neste mês. Experimente o próximo.</p>}
      {choice && <p className="live-class-choice"><BrowserText>Sua escolha: </BrowserText><strong><BrowserText>{liveClassDate(choice.start, data.timezone)}</BrowserText></strong> <BrowserText>· </BrowserText><BrowserText>{data.timezone}</BrowserText></p>}</>}
      {error && <p role="alert" className="dashboard-form-error"><BrowserText>{error}</BrowserText></p>}
      <footer><button type="button" className="dashboard-primary" disabled={!choice || busy || disabled || !available} onClick={() => void book()}>{busy ? <BrowserText>{"Enviando pedido…"}</BrowserText> : <BrowserText>{"Solicitar este horário"}</BrowserText>}</button><small>Uma aula gratuita por conta. Você poderá acompanhar o pedido no painel.</small></footer>
    </dialog>
  </article>;
}
