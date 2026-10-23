export interface AdminClaimUser {
  isAdmin?: boolean;
}

export function hasAdminClaim(user: AdminClaimUser | null | undefined): boolean {
  return user?.isAdmin === true;
}
