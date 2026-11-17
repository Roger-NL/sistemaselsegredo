"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CalendarDays, MessageCircle, ArrowUpRight } from "lucide-react";
import type { DashboardAccount } from "@/contracts/dashboard";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { TeacherContact } from "@/features/dashboard/TeacherContact";
import { StudentLiveClass } from "@/features/live-class/StudentLiveClass";
import "./lesson-account-panels.css";

export function LessonAccountPanels({ section, account }: { section: "live" | "teacher"; account: DashboardAccount | null }) {
  if (account) return <ConnectedAccountPanel section={section}/>;
  const live = section === "live";
  const Icon = live ? CalendarDays : MessageCircle;
  return <section className="lesson-account-panels student-empty" data-account-section={section}>
    <Icon size={28} aria-hidden="true"/>
    <h2>{live ? "Minha aula ao vivo." : "Fale com o professor."}</h2>
    <p>{live ? "Entre na sua conta para acompanhar suas aulas e os horários disponíveis." : "Entre na sua conta para abrir suas conversas e enviar uma mensagem ao professor."}</p>
    <Link className="dashboard-primary" href={`/comecar?modo=entrar&retorno=${encodeURIComponent(live ? "/dashboard#aula-ao-vivo" : "/dashboard#contato")}`}>Acessar minha conta<ArrowUpRight size={17} aria-hidden="true"/></Link>
  </section>;
}

function ConnectedAccountPanel({ section }: { section: "live" | "teacher" }) {
  const state = useStudentWorkspace();
  const { refresh } = state;
  useEffect(() => { void refresh(); }, [refresh]);
  if (!state.workspace) return <section className="lesson-account-panels student-empty" aria-busy={state.status === "loading"}>
    <h2>{section === "live" ? "Minha aula ao vivo." : "Fale com o professor."}</h2>
    <p role="status">{state.error || "Carregando os dados da sua conta…"}</p>
    {state.error && <button type="button" className="dashboard-primary" onClick={() => void refresh()}>Tentar novamente</button>}
  </section>;
  const workspace = state.workspace;
  return <div className="lesson-account-panels" data-account-section={section}>
    {section === "live" ? <StudentLiveClass workspace={workspace} disabled={state.status !== "ready"}/>
      : <TeacherContact key={workspace.account.id} conversations={workspace.conversations} disabled={state.status !== "ready"}/>}
  </div>;
}
