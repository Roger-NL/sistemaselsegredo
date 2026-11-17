import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import { liveClassDate } from "@/contracts/live-class";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";

export type StudentNextStep = {
  kind: "lesson" | "booking" | "requested" | "confirmed" | "completed" | "access";
  word: string; label: string; title: string; description: string; status: string;
  number: string; path: string; href?: string;
};

/** Saved progress belongs to the current account and the current lesson. */
export function studentNextStep(workspace: StudentWorkspace): StudentNextStep {
  const { account, learning } = workspace;
  if (account.status === "suspended" || account.status === "rejected") return { kind: "access", word: "Seu acesso.", label: "Acesso à aula indisponível", title: "Vamos cuidar do seu acesso.", description: "Fale com o professor para conferir sua conta.", status: "Aula indisponível", number: "01", path: "Seu acesso" };
  const snapshot = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning.lessonSnapshot ?? null)?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT);
  const current = snapshot.steps.find(step => step.status === "current");
  const next: StudentNextStep = {
    kind: "lesson", word: snapshot.status === "new" ? "Começar." : snapshot.status === "complete" ? "Rever." : "Continuar.",
    label: snapshot.ctaLabel, title: snapshot.status === "new" ? "Sua primeira aula está aqui." : snapshot.status === "complete" ? "Você concluiu este percurso." : "Continue de onde parou.",
    description: snapshot.status === "complete" ? "Reveja a apresentação, as atividades e a teoria quando quiser." : `${snapshot.percent}% do percurso concluído. ${current ? `Próximo passo: ${current.label}.` : "Eu, você, nós, eles."}`,
    status: snapshot.status === "new" ? "Pronta para começar" : snapshot.status === "complete" ? "Percurso concluído" : "Aula em andamento",
    number: "01", path: "Primeiros encontros", href: snapshot.href,
  };
  if (learning.testMode) return { ...next, word: snapshot.status === "complete" ? "Revisar." : next.word,
    status: snapshot.status === "complete" ? "Conclusão simulada" : next.status,
    description: snapshot.status === "complete" ? "Reveja o percurso. Conclusões simuladas não liberam novas reservas." : next.description };
  // A deliberate reset takes precedence over old booking history on the hero;
  // that booking remains available in the live-class tab.
  if (learning.revision > 0 && snapshot.percent < 100) return next;
  const booking = workspace.liveClass?.userId === account.id ? workspace.liveClass : null;
  const live = { number: "02", path: "Seu encontro com o professor" };
  if (booking?.status === "pending") return { ...live, kind: "requested", word: "Seu pedido.", label: "Acompanhar meu pedido de aula", title: "O professor recebeu seu pedido.", description: `${liveClassDate(booking.start, booking.timezone)} · ${booking.timezone}. Acompanhe a confirmação e as orientações da aula.`, status: "Aguardando confirmação", href: "#aula-ao-vivo" };
  if (booking?.status === "confirmed") return { ...live, kind: "confirmed", word: "Sua aula.", label: "Ver minha aula confirmada", title: "Seu encontro está marcado.", description: `${liveClassDate(booking.start, booking.timezone)} · ${booking.timezone}. Confira os detalhes e as orientações de acesso.`, status: "Aula confirmada", href: "#aula-ao-vivo" };
  if (booking?.status === "completed") return { ...live, kind: "completed", word: "Revisar.", label: "Revisar minha aula", title: "Você concluiu este encontro.", description: "Sua aula foi registrada como realizada. Volte ao percurso para reforçar o que aprendeu ou fale com o professor.", status: "Aula realizada", href: snapshot.href };
  if (snapshot.percent === 100) return { ...live, kind: "booking", word: "Agendar.", label: booking?.status === "cancelled" ? "Escolher outro horário de aula" : "Escolher horário da minha aula gratuita", title: booking?.status === "cancelled" ? "Vamos escolher outro horário?" : "Sua aula gratuita está liberada.", description: "Você concluiu o percurso. Escolha um horário na agenda e envie seu pedido ao professor.", status: "Agenda liberada", href: "#aula-ao-vivo" };
  return next;
}

// Available replies are not an invented unread count.
export function teacherReplies(conversations: TeacherConversation[]) {
  return conversations.filter(item => item.messages.at(-1)?.role === "manager").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export const OPEN_TEACHER_CONVERSATION_EVENT = "basedspeak:open-teacher-conversation";
