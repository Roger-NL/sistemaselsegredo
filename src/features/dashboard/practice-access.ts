import type { WorkspaceState } from "./workspace-store";

export function accountCanPractice(status?: string) { return status === "active" || status === "pending"; }
export function canPractice(state: WorkspaceState) {
  return state.workspace ? state.status === "ready" && accountCanPractice(state.workspace.account.status) : state.status === "unauthenticated" && Boolean(state.guestLearning);
}
export function practiceLearning(state: WorkspaceState) { return state.workspace?.learning || state.guestLearning || null; }
