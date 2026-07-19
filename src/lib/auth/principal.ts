import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/session";

const USERS_COLLECTION = "users";

export type RequestPrincipalRole = "admin" | "student";
export type RequestPrincipalSubscriptionStatus = "free" | "premium" | "expired";
export type RequestPrincipalSource = "bearer_token" | "session_cookie";

export interface RequestPrincipal {
  uid: string;
  email: string | null;
  role: RequestPrincipalRole;
  subscriptionStatus: RequestPrincipalSubscriptionStatus;
  source: RequestPrincipalSource;
}

export interface RequestPrincipalOptions {
  allowBearer?: boolean;
  allowSessionCookie?: boolean;
}

function normalizeSubscriptionStatus(value: unknown): RequestPrincipalSubscriptionStatus {
  if (value === "premium" || value === "expired") {
    return value;
  }

  return "free";
}

function normalizeRole(adminClaim: unknown): RequestPrincipalRole {
  return adminClaim === true ? "admin" : "student";
}

function extractBearerToken(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function parseCookieHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookiesMap = cookieHeader.split(";").map((chunk) => chunk.trim());
  const targetPrefix = `${name}=`;

  for (const entry of cookiesMap) {
    if (entry.startsWith(targetPrefix)) {
      return decodeURIComponent(entry.slice(targetPrefix.length));
    }
  }

  return null;
}

async function readCookieValue(req: Request | undefined, name: string) {
  if (req) {
    return parseCookieHeader(req.headers.get("cookie"), name);
  }

  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

async function resolveProfile(
  uid: string,
  email: string | null,
  adminClaim: unknown,
  source: RequestPrincipalSource
): Promise<RequestPrincipal> {
  const snapshot = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
  const data = snapshot.exists ? snapshot.data() : null;

  return {
    uid,
    // Only verified Firebase identity claims may grant administrative access.
    email,
    role: normalizeRole(adminClaim),
    subscriptionStatus: normalizeSubscriptionStatus(data?.subscriptionStatus),
    source,
  };
}

async function resolveFromBearer(req: Request): Promise<RequestPrincipal | null> {
  const token = extractBearerToken(req);
  if (!token) {
    return null;
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  return resolveProfile(decodedToken.uid, decodedToken.email ?? null, decodedToken.admin, "bearer_token");
}

async function resolveFromSessionCookie(req?: Request): Promise<RequestPrincipal | null> {
  const sessionCookie = await readCookieValue(req, AUTH_SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }

  const decodedCookie = await adminAuth.verifySessionCookie(sessionCookie, true);
  return resolveProfile(decodedCookie.uid, decodedCookie.email ?? null, decodedCookie.admin, "session_cookie");
}

export async function getRequestPrincipal(
  req?: Request,
  options: RequestPrincipalOptions = {}
): Promise<RequestPrincipal | null> {
  const {
    allowBearer = true,
    allowSessionCookie = true,
  } = options;

  if (req && allowBearer) {
    try {
      const bearerPrincipal = await resolveFromBearer(req);
      if (bearerPrincipal) {
        return bearerPrincipal;
      }
    } catch {
      // Fall through to the server session path during the dual-stack rollout.
    }
  }

  if (allowSessionCookie) {
    try {
      const sessionPrincipal = await resolveFromSessionCookie(req);
      if (sessionPrincipal) {
        return sessionPrincipal;
      }
    } catch {
      // Invalid or expired sessions are unauthenticated.
    }
  }

  return null;
}
