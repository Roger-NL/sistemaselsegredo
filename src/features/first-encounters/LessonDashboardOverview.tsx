"use client";

import type { MouseEvent } from "react";
import { ArrowUpRight, CalendarDays, MessageCircle, Route, TrendingUp } from "lucide-react";
import { LIVE_CLASS_LABELS, liveClassDate } from "@/contracts/live-class";
import type { StudentWorkspace } from "@/contracts/workspace";
import { teacherReplies } from "@/features/dashboard/next-step";
import { accountCanPractice } from "@/features/dashboard/practice-access";
import type { LessonDashboardSnapshot } from "./lesson-dashboard";
import { LESSON_SCENES } from "./lesson-one";

export type OverviewSection = "avanco" | "atividades" | "aula-ao-vivo" | "contato";
type Props = { snapshot: LessonDashboardSnapshot; workspace: StudentWorkspace | null; ready: boolean; saving: boolean; onOpenSection: (event: MouseEvent<HTMLAnchorElement>, section: OverviewSection) => void };
const activities = LESSON_SCENES.filter(scene => scene.mode === "game").map(scene => ({ title: scene.title, rounds: LESSON_SCENES.filter(part => part.game === scene.game).reduce((sum, part) => sum + part.rounds.length, 0) }));

/** An overview of actual learning and account data; detailed controls stay one click away. */
export function LessonDashboardOverview({ snapshot, workspace, ready, saving, onOpenSection }: Props) {
  const current = snapshot.steps.find(step => step.status === "current");
  const activityStates = activities.map((activity, index) => ({ ...activity, done: snapshot.lessonCompleted >= activities.slice(0, index + 1).reduce((total, item) => total + item.rounds, 0) }));
  const completedActivities = activityStates.filter(activity => activity.done).length;
  const currentActivity = activityStates.find(activity => !activity.done);
  const booking = workspace?.liveClass?.userId === workspace?.account.id ? workspace?.liveClass : null;
  const eligible = Boolean(ready && !saving && workspace && accountCanPractice(workspace.account.status) && !workspace.learning.testMode && snapshot.percent === 100 && workspace.learning.studyTotal === 49 && workspace.learning.studyCompleted === 49);
  const replies = teacherReplies(workspace?.conversations ?? []);
  const waiting = workspace?.conversations.filter(conversation => conversation.status !== "closed" && conversation.messages.at(-1)?.role === "student").length ?? 0;
  const liveValue = booking ? LIVE_CLASS_LABELS[booking.status] : "Um próximo encontro.";
  const liveDetail = booking ? `${liveClassDate(booking.start, booking.timezone)} · ${booking.timezone}` : !workspace ? "Entre na sua conta para acompanhar o agendamento da sua aula." : saving && snapshot.percent === 100 ? "Confirmando seu avanço antes de liberar a agenda…" : eligible ? "Sua aula gratuita de 1 hora está liberada." : "Conclua a aula, a teoria e o teste para liberar sua aula gratuita de 1 hora.";
  const liveAction = booking ? "Ver minha aula" : eligible ? "Escolher horário" : "Como liberar minha aula";
  const teacherValue = replies.length ? "O professor respondeu." : waiting ? "Aguardando resposta." : "Conte com apoio.";
  const teacherDetail = !workspace ? "Entre na sua conta para conversar e acompanhar as respostas." : replies.length ? replies[0].subject : waiting ? `${waiting} ${waiting === 1 ? "conversa com mensagem enviada" : "conversas com mensagens enviadas"}.` : "Tire uma dúvida ou converse sobre o que você aprendeu.";
  function action(section: OverviewSection, label: string) { return <a className="lesson-overview-action" href={`#${section}`} data-conversation-id={section === "contato" ? replies[0]?.id : undefined} onClick={event => onOpenSection(event, section)}>{label}<ArrowUpRight size={15} aria-hidden="true"/></a>; }

  return <section className="lesson-dashboard-overview" aria-label="Resumo do meu painel">
    <article className="lesson-overview-card" data-overview-section="avanco">
      <div className="lesson-overview-heading"><h2>Meu avanço</h2><TrendingUp size={19} aria-hidden="true"/></div>
      <strong className="lesson-overview-value">{ready ? `${snapshot.percent}%` : "—"}</strong>
      <progress value={snapshot.percent} max={100} aria-label="Progresso completo da aula"/>
      <p className="lesson-overview-detail">{!ready ? "Carregando seu avanço…" : current ? `${current.label} · ${current.completed} de ${current.units} etapas` : "Você concluiu todas as etapas."}</p>
      <span className="lesson-overview-stage">{saving ? "Salvando seu avanço…" : `${snapshot.completedUnits} de ${snapshot.totalUnits} etapas no percurso`}</span>
      {action("avanco", "Ver meu avanço")}
    </article>
    <article className="lesson-overview-card" data-overview-section="atividades">
      <div className="lesson-overview-heading"><h2>Minhas atividades</h2><Route size={19} aria-hidden="true"/></div>
      <strong className="lesson-overview-value">{ready ? `${completedActivities} de 6` : "—"}</strong>
      <ol className="lesson-overview-activities" aria-label="Atividades concluídas">{activityStates.map((activity, index) => <li key={activity.title} data-done={activity.done} aria-label={`Atividade ${index + 1}: ${activity.done ? "concluída" : "a concluir"}`}>{index + 1}</li>)}</ol>
      <p className="lesson-overview-detail">{!ready ? "Carregando suas atividades…" : currentActivity ? `A seguir: ${currentActivity.title}.` : "As seis atividades foram concluídas."}</p>
      <span className="lesson-overview-stage">{snapshot.lessonCompleted} de 29 respostas concluídas</span>
      {action("atividades", "Ver atividades")}
    </article>
    <article className="lesson-overview-card" data-overview-section="aula-ao-vivo">
      <div className="lesson-overview-heading"><h2>Minha aula ao vivo</h2><CalendarDays size={19} aria-hidden="true"/></div>
      <strong className="lesson-overview-value">{ready ? liveValue : "—"}</strong>
      <p className="lesson-overview-detail">{ready ? liveDetail : "Carregando sua aula…"}</p>
      {workspace?.learning.testMode && <span className="lesson-overview-stage">Conclusões simuladas não liberam a agenda.</span>}
      {action("aula-ao-vivo", liveAction)}
    </article>
    <article className="lesson-overview-card" data-overview-section="contato">
      <div className="lesson-overview-heading"><h2>Fale com o professor</h2><MessageCircle size={19} aria-hidden="true"/></div>
      <strong className="lesson-overview-value">{ready ? teacherValue : "—"}</strong>
      <p className="lesson-overview-detail">{ready ? teacherDetail : "Carregando suas conversas…"}</p>
      {replies.length > 0 && <span className="lesson-overview-stage">{replies.length} {replies.length === 1 ? "conversa com resposta do professor" : "conversas com respostas do professor"}</span>}
      {action("contato", replies.length ? "Ler resposta" : "Enviar mensagem")}
    </article>
  </section>;
}
