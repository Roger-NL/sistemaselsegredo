import type { AdminUser } from "@/contracts/management";
import { filterUsers } from "./model";

export const JOURNEY_LABELS = {
  pending: "Aguardando aprovação", not_started: "Ainda não começou", conversation: "Na conversa", study: "No estudo guiado",
  ready: "Pode agendar", requested: "Aula solicitada", scheduled: "Aula confirmada", completed: "Aula realizada", inactive: "Acesso indisponível",
} as const;
export type JourneyStage = keyof typeof JOURNEY_LABELS;
export type JourneyFilter = JourneyStage | "all";
// An existing reservation remains visible even if access/progress is later reset.
export function journeyStage(user: AdminUser): JourneyStage {
  if (user.liveClass?.status === "pending") return "requested";
  if (user.liveClass?.status === "confirmed") return "scheduled";
  if (user.liveClass?.status === "completed") return "completed";
  if (user.status === "suspended" || user.status === "rejected") return "inactive";
  if (user.canBookLiveClass) return "ready";
  if (user.studyCompleted > 0 || user.conversation?.completed) return "study";
  if (user.conversation) return "conversation";
  if (user.status === "pending") return "pending";
  return "not_started";
}
export function journeyCounts(users: AdminUser[]) {
  const counts = Object.fromEntries(Object.keys(JOURNEY_LABELS).map(key => [key, 0])) as Record<JourneyStage, number>;
  for (const user of users) counts[journeyStage(user)]++;
  return counts;
}
export function filterJourney(users: AdminUser[], search: string, stage: JourneyFilter, includeManagers = false) {
  return filterUsers(users, search, "all", includeManagers ? "all" : "student")
    .filter(user => stage === "all" || journeyStage(user) === stage)
    .sort((a, b) => (b.lastLearningAt || "").localeCompare(a.lastLearningAt || "") || a.name.localeCompare(b.name, "pt-BR"));
}
