import type { LiveClassBooking } from "./live-class";
import type { AccountRole, AccountStatus, TeacherConversation } from "./workspace";
export const STATUS_LABELS = { active: "Ativo", pending: "Pendente", rejected: "Reprovado", suspended: "Suspenso" } as const;
export type UserStatus = AccountStatus;
export type UserRole = AccountRole;
export type AdminUser = {
  id: string; name: string; email: string; role: UserRole; status: UserStatus;
  createdAt: string | null; lastLoginAt: string | null; progress: number;
  demoPercent: number; studyCompleted: number; studyTotal: number;
  loginResetAt: string | null; notes: string;
  conversation: { part: number; completed: boolean } | null;
  lastLearningAt: string | null; canBookLiveClass: boolean; liveClass: LiveClassBooking | null;
};
export type Activity = { id: string; userId: string; name: string; description: string; actorName: string; at: string };
export type AdminState = { users: AdminUser[]; activity: Activity[]; conversations: TeacherConversation[]; currentAccount: { id: string; name: string; email: string }; updatedAt: string };
export type UserDraft = Pick<AdminUser, "name" | "email" | "role" | "notes">;
export type UserOperation = "approve" | "reject" | "suspend" | "activate" | "reset-login" | "reset-progress";
export type AdminAction = { type: "create"; draft: UserDraft } | { type: "edit"; userId: string; draft: UserDraft } | { type: UserOperation; userId: string; reason?: string };
export type ManagementMutationResult = { message: string; resetLink?: string };
