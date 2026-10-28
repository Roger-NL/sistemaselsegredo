import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import { conversationPosition } from "@/features/demo/session/position";
import { liveClassDate } from "@/contracts/live-class";

export type StudentNextStep = {
  kind: "conversation" | "study" | "booking" | "requested" | "confirmed" | "completed" | "access";
  word: string; label: string; title: string; description: string; status: string;
  number: string; path: string; href?: string;
};

/** The current account's saved journey determines the useful next action. */
export function studentNextStep(workspace: StudentWorkspace): StudentNextStep {
  const { account, learning } = workspace;
  const position = conversationPosition(learning.demoSnapshot);
  const booking = workspace.liveClass?.userId === account.id ? workspace.liveClass : null;
  const lesson = { number: "03", path: "Sua aula gratuita" };
  if (account.status === "suspended" || account.status === "rejected") return { kind: "access", word: "Seu acesso.", label: "Acesso à prática indisponível", title: "Vamos cuidar do seu acesso.", description: "Fale com o professor para conferir sua conta.", status: "Prática indisponível", number: "01", path: "Seu acesso" };
  if (booking?.status === "pending") return { ...lesson, kind: "requested", word: "Seu pedido.", label: "Acompanhar meu pedido de aula", title: "O professor recebeu seu pedido.", description: `${liveClassDate(booking.start, booking.timezone)} · ${booking.timezone}. Acompanhe a confirmação e as orientações da aula.`, status: "Aguardando confirmação", href: "#aula-ao-vivo" };
  if (booking?.status === "confirmed") return { ...lesson, kind: "confirmed", word: "Sua aula.", label: "Ver minha aula confirmada", title: "Seu encontro está marcado.", description: `${liveClassDate(booking.start, booking.timezone)} · ${booking.timezone}. Confira os detalhes e as orientações de acesso.`, status: "Aula confirmada", href: "#aula-ao-vivo" };
  if (booking?.status === "completed") return { ...lesson, kind: "completed", word: "Revisar.", label: "Revisar meu estudo", title: "Você concluiu este encontro.", description: "Sua aula foi registrada como realizada. Volte às práticas para reforçar o que aprendeu ou fale com o professor.", status: "Aula realizada", href: "/demo/estudo" };
  if (learning.studyTotal > 0 && learning.studyCompleted === learning.studyTotal) return { ...lesson, kind: "booking", word: "Agendar.", label: booking?.status === "cancelled" ? "Escolher outro horário de aula" : "Escolher horário da minha aula gratuita", title: booking?.status === "cancelled" ? "Vamos escolher outro horário?" : "Sua aula gratuita está liberada.", description: "Você concluiu o estudo guiado. Escolha um horário na agenda e envie seu pedido ao professor.", status: "Agenda liberada", href: "#aula-ao-vivo" };
  if (position?.completed || learning.studyCompleted > 0) return { kind: "study", word: "Estudar.", label: learning.studyCompleted ? "Continuar meu estudo guiado" : "Começar meu estudo guiado", title: "Agora, leve a conversa para o estudo.", description: `${learning.studyCompleted} de ${learning.studyTotal} práticas concluídas. Ao terminar todas, você poderá agendar sua aula gratuita.`, status: position?.completed ? "Conversa concluída" : "Estudo em andamento", number: "02", path: "Estudo guiado", href: "/demo/estudo" };
  return { kind: "conversation", word: position ? "Continuar." : "Começar.", label: position ? "Continuar a história" : "Acessar minha história", title: position ? "Vamos continuar sua história?" : "Sua primeira história está aqui.", description: position ? `Retome da parte ${position.part} de 10, com o apoio que você escolheu.` : "O primeiro encontro com o inglês está aqui.", status: position ? "Você já começou" : "Pronta para começar", number: "01", path: "O seu primeiro encontro" };
}

// These are available replies, not an invented unread count.
export function teacherReplies(conversations: TeacherConversation[]) {
  return conversations.filter(item => item.messages.at(-1)?.role === "manager").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export const OPEN_TEACHER_CONVERSATION_EVENT = "basedspeak:open-teacher-conversation";
