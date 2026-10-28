import type { LiveClassBooking } from "./live-class";

export type AccountStatus = "active" | "pending" | "rejected" | "suspended";
export type AccountRole = "student" | "manager";
export type WorkspaceAccount = { id: string; name: string; email: string; status: AccountStatus; role: AccountRole };
export type LearningProgress = {
  revision: number;
  demoSnapshot: string | null;
  studySnapshot: string | null;
  demoPercent: number;
  studyCompleted: number;
  studyTotal: number;
  updatedAt: string | null;
};
export type StudentActivity = { id: string; kind: string; title: string; at: string };
export type TeacherMessage = { id: string; authorId: string; authorName: string; role: "student" | "manager"; body: string; at: string };
export type TeacherConversation = {
  id: string; userId: string; userName: string; userEmail: string;
  subject: string; status: "open" | "answered" | "closed";
  createdAt: string; updatedAt: string; messages: TeacherMessage[];
};
export type StudentWorkspace = { account: WorkspaceAccount; learning: LearningProgress; activities: StudentActivity[]; conversations: TeacherConversation[]; liveClass: LiveClassBooking | null };
export type SaveLearningInput = { revision: number; demoSnapshot?: string | null; studySnapshot?: string | null };

// All routes require a verified server session. Mutations require same-origin JSON
// and X-Workspace-Uid matching the verified account (prevents cross-tab login races).
// GET /api/student/workspace -> StudentWorkspace
// PUT /api/student/learning (SaveLearningInput) -> { learning: LearningProgress }
// POST /api/student/learning/import (revision 0 + explicit public journey) -> { learning: LearningProgress }; only empty accounts
// POST /api/student/conversations { subject, body } -> { conversation: TeacherConversation }
// POST /api/student/conversations/[id]/messages { body } -> { conversation: TeacherConversation }
// Errors: { error: string }; 401 unauthenticated, 403 inactive account,
// 409 learning reset in another session (reload GET before another write).
