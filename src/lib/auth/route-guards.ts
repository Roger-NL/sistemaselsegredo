import {
  ADMIN_ROUTE_PREFIXES,
  PROTECTED_ROUTE_PREFIXES,
  ROUTES,
} from "@/lib/routes";

export type UserRole = "admin" | "student" | undefined;

export interface AuthGuardInput {
  pathname: string;
  pathnameWithSearch?: string;
  hasVerifiedSession?: boolean;
}

export interface AuthGuardDecision {
  allow: boolean;
  redirectTo?: string;
  reason:
    | "allow"
    | "admin_requires_login"
    | "admin_requires_role"
    | "protected_requires_login";
}

function matchesPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function evaluateAuthGuard({
  pathname,
  pathnameWithSearch,
  hasVerifiedSession,
}: AuthGuardInput): AuthGuardDecision {
  const callbackTarget = pathnameWithSearch || pathname;
  const isProtectedPath = matchesPath(pathname, PROTECTED_ROUTE_PREFIXES);
  const isAdminPath = matchesPath(pathname, ADMIN_ROUTE_PREFIXES);
  const hasAuthenticatedBoundary = Boolean(hasVerifiedSession);

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

  return { allow: true, reason: "allow" };
}
