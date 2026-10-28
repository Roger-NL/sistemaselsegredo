export type LiveClassStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type LiveClassBooking = {
  id: string; userId: string; studentName: string; studentEmail: string;
  start: string; end: string; timezone: string; status: LiveClassStatus;
  revision: number; createdAt: string; updatedAt: string; reason: string; meetingUrl: string;
};
export type LiveClassSlot = { start: string; end: string; day: string; time: string };
export type LiveClassAvailability = {
  userId: string; eligible: boolean; completed: number; total: number;
  month: string; timezone: string; slots: LiveClassSlot[]; booking: LiveClassBooking | null;
};
export const LIVE_CLASS_LABELS: Record<LiveClassStatus, string> = {
  pending: "Aguardando confirmação", confirmed: "Aula confirmada", cancelled: "Escolha outro horário", completed: "Aula realizada",
};
export function liveClassDate(start: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: timezone, day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(start));
}
