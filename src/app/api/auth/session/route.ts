import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import { getRequestPrincipal } from "@/lib/auth/principal";
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_MAX_AGE_SECONDS, getAuthSessionCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type CreateSessionPayload = {
  idToken?: string;
};

const LEGACY_COOKIE_NAMES = ["es_session_token", "es_user_role", "es_user_status"] as const;

function clearLegacyCookies(response: NextResponse) {
  for (const name of LEGACY_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    ...getAuthSessionCookieOptions(),
    maxAge: 0,
  });
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

async function resolveIdToken(req: Request) {
  const bearerToken = extractBearerToken(req);
  if (bearerToken) {
    return bearerToken;
  }

  try {
    const payload = (await req.json()) as CreateSessionPayload;
    return payload.idToken?.trim() || null;
  } catch {
    return null;
  }
}

function dateKeyInSaoPaulo(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function recordServerLogin(uid: string) {
  const userRef = adminDb.collection("users").doc(uid);
  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) return;
    const data = snapshot.data() ?? {};
    const now = new Date();
    const today = dateKeyInSaoPaulo(now);
    const lastLogin = typeof data.lastLoginDate === "string" ? new Date(data.lastLoginDate) : null;
    if (lastLogin && Number.isFinite(lastLogin.getTime()) && dateKeyInSaoPaulo(lastLogin) === today) return;

    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const currentStreak = typeof data.currentStreak === "number" ? data.currentStreak : 0;
    const nextStreak = lastLogin && Number.isFinite(lastLogin.getTime()) &&
      dateKeyInSaoPaulo(lastLogin) === dateKeyInSaoPaulo(yesterday)
      ? currentStreak + 1
      : 1;

    transaction.update(userRef, {
      currentStreak: nextStreak,
      lastLoginDate: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });
}

export async function GET(req: Request) {
  const principal = await getRequestPrincipal(req, {
    allowBearer: true,
    allowSessionCookie: true,
  });

  if (!principal) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    clearSessionCookie(response);
    clearLegacyCookies(response);
    return response;
  }

  return NextResponse.json({ authenticated: true, principal });
}

export async function POST(req: Request) {
  try {
    const idToken = await resolveIdToken(req);

    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    await recordServerLogin(decodedToken.uid);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: AUTH_SESSION_MAX_AGE_SECONDS * 1000,
    });

    const response = NextResponse.json({
      success: true,
      uid: decodedToken.uid,
    });

    response.cookies.set(AUTH_SESSION_COOKIE_NAME, sessionCookie, getAuthSessionCookieOptions());
    clearLegacyCookies(response);
    return response;
  } catch (error) {
    console.error("[api/auth/session] create session error", error);
    const response = NextResponse.json({ error: "Failed to create server session." }, { status: 401 });
    clearSessionCookie(response);
    clearLegacyCookies(response);
    return response;
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  clearLegacyCookies(response);
  return response;
}
