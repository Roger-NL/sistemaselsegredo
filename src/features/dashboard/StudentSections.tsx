"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import type { StudentWorkspace } from "@/contracts/workspace";
import { StudentLiveClass } from "@/features/live-class/StudentLiveClass";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { TeacherContact, formatStudentDate } from "./TeacherContact";
import { accountCanPractice } from "./practice-access";
export { TeacherContact, TeacherThread, formatStudentDate } from "./TeacherContact";

/** Compatibility view; every learning measure now comes from the new lesson. */
export function StudentSections({ workspace, disabled }: { workspace: StudentWorkspace; disabled: boolean }) {
  const { learning, account } = workspace;
  const snapshot = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning.lessonSnapshot ?? null)?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT);
  const current = snapshot.steps.find(step => step.status === "current");
  const allowed = !disabled && accountCanPractice(account.status);
  const progress = <><span>Primeiros encontros</span><strong>{snapshot.percent}%</strong><progress value={snapshot.percent} max={100} aria-label="Percurso da aula"/><p>{current ? `${current.label}: ${current.completed} de ${current.units} etapas concluídas.` : "Você concluiu o percurso desta aula."}</p></>;
  return <>
    <section className="student-section" id="avanco" aria-labelledby="student-progress-title">
      <div className="student-section-heading"><div><p className="dashboard-overline">Um passo de cada vez</p><h2 id="student-progress-title" tabIndex={-1}>Meu avanço.</h2></div><span>{learning.updatedAt ? `Atualizado em ${formatStudentDate(learning.updatedAt)}` : "Seu percurso começa aqui"}</span></div>
      <div className="student-progress-grid">{allowed ? <Link href={snapshot.href} prefetch={false} className="student-progress-card student-progress-link" aria-label={snapshot.ctaLabel}>{progress}<span className="student-progress-cta">{snapshot.ctaLabel}<ArrowUpRight size={16} aria-hidden="true"/></span></Link> : <article className="student-progress-card">{progress}</article>}
        <StudentLiveClass key={`${account.id}:${learning.revision}`} workspace={workspace} disabled={disabled}/>
      </div>
    </section>
    <section className="student-section" id="atividades" aria-labelledby="student-activities-title"><div className="student-section-heading"><div><p className="dashboard-overline">O que você já fez</p><h2 id="student-activities-title" tabIndex={-1}>Minhas atividades.</h2></div></div>
      {workspace.activities.length ? <ol className="student-activities">{workspace.activities.map(activity => <li key={activity.id}><span className="student-activity-icon"><BookOpen size={17} aria-hidden="true"/></span><div><strong><BrowserText>{activity.title}</BrowserText></strong><time dateTime={activity.at}>{formatStudentDate(activity.at)}</time></div></li>)}</ol> : <div className="student-empty"><BookOpen size={24} aria-hidden="true"/><p>Ainda não há atividades registradas.</p><span>Ao praticar, seus registros aparecerão aqui.</span></div>}
    </section>
    <TeacherContact key={`${account.id}:${learning.revision}`} conversations={workspace.conversations} disabled={disabled}/>
  </>;
}
