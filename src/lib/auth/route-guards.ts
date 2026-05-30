import {
  ADMIN_ROUTE_PREFIXES,
  AUTH_ENTRY_ROUTE_PREFIXES,
  PROTECTED_ROUTE_PREFIXES,
  ROUTES,
} from "@/lib/routes";

export type UserRole = "admin" | "student" | undefined;

export interface AuthGuardInput {
  pathname: string;
  pathnameWithSearch?: string;
  hasVerifiedSession?: boolean;
  hasLegacySessionHint?: boolean;
}

export interface AuthGuardDecision {
  allow: boolean;
  redirectTo?: string;
  reason:
    | "allow"
    | "admin_requires_login"
    | "admin_requires_role"
    | "protected_requires_login"
    | "auth_already_logged_admin"
    | "auth_already_logged_student";
}

function matchesPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function evaluateAuthGuard({
  pathname,
  pathnameWithSearch,
  hasVerifiedSession,
  hasLegacySessionHint,
}: AuthGuardInput): AuthGuardDecision {
  const callbackTarget = pathnameWithSearch || pathname;
  const isProtectedPath = matchesPath(pathname, PROTECTED_ROUTE_PREFIXES);
  const isAdminPath = matchesPath(pathname, ADMIN_ROUTE_PREFIXES);
  const isAuthPath = matchesPath(pathname, AUTH_ENTRY_ROUTE_PREFIXES);
  const hasAuthenticatedBoundary = Boolean(hasVerifiedSession || hasLegacySessionHint);

  if (isAdminPath) {
    if (!hasAuthenticatedBoundary) {
      return {
        allow: false,
        redirectTo: `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(callbackTarget)}`,
        reason: "admin_requires_login",
      };
    }

    return { allow: true, reason: "allow" };
  }

  if (isProtectedPath) {
    if (!hasAuthenticatedBoundary) {
      return {
        allow: false,
        redirectTo: `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(callbackTarget)}`,
        reason: "protected_requires_login",
      };
    }

    return { allow: true, reason: "allow" };
  }

  if (isAuthPath && hasAuthenticatedBoundary) {
    return {
      allow: false,
      redirectTo: ROUTES.app.dashboard,
      reason: "auth_already_logged_student",
    };
  }

  return { allow: true, reason: "allow" };
}
