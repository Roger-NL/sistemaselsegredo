import type { AdminUser, UserRole, UserStatus } from "@/contracts/management";
export { STATUS_LABELS } from "@/contracts/management";
export type { Activity, AdminState, AdminUser, UserDraft, UserOperation, UserRole, UserStatus, AdminAction } from "@/contracts/management";
export function filterUsers(users: AdminUser[], search: string, status: UserStatus | "all", role: UserRole | "all") {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const query = normalize(search.trim());
  return users.filter(user => (status === "all" || user.status === status) && (role === "all" || user.role === role) && normalize(`${user.name} ${user.email}`).includes(query));
}
