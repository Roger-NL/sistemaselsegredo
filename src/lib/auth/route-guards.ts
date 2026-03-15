import {
  ADMIN_ROUTE_PREFIXES,
  AUTH_ENTRY_ROUTE_PREFIXES,
  PROTECTED_ROUTE_PREFIXES,
  ROUTES,
} from "@/lib/routes";

export type UserRole = "admin" | "student" | undefined;

export interface AuthGuardInput {
  pathname: string;
  token?: string;
  role?: string;
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
  token,
  role,
}: AuthGuardInput): AuthGuardDecision {
  const isProtectedPath = matchesPath(pathname, PROTECTED_ROUTE_PREFIXES);
  const isAdminPath = matchesPath(pathname, ADMIN_ROUTE_PREFIXES);
  const isAuthPath = matchesPath(pathname, AUTH_ENTRY_ROUTE_PREFIXES);

  if (isAdminPath) {
    if (!token) {
      return {
        allow: false,
        redirectTo: ROUTES.auth.login,
        reason: "admin_requires_login",
      };
    }

    if (role !== "admin") {
      return {
        allow: false,
        redirectTo: ROUTES.app.dashboard,
        reason: "admin_requires_role",
      };
    }

    return { allow: true, reason: "allow" };
  }

  if (isProtectedPath) {
    if (!token) {
      return {
        allow: false,
        redirectTo: `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`,
        reason: "protected_requires_login",
      };
    }

    return { allow: true, reason: "allow" };
  }

  if (isAuthPath && token) {
    if (role === "admin") {
      return {
        allow: false,
        redirectTo: ROUTES.admin.dashboard,
        reason: "auth_already_logged_admin",
      };
    }

    return {
      allow: false,
      redirectTo: ROUTES.app.dashboard,
      reason: "auth_already_logged_student",
    };
  }

  return { allow: true, reason: "allow" };
}
