import { NextResponse } from "next/server";
import { getAdminAuth } from "@/server/firebase";
import { recordVerifiedLogin } from "@/server/auth/service";
import { getRequestPrincipal } from "@/server/auth/principal";
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_MAX_AGE_SECONDS, getAuthSessionCookieOptions } from "@/server/auth/session-cookie";
import { hasSameOrigin } from "@/server/http/request";

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

export async function GET(req: Request) {
  const principal = await getRequestPrincipal(req, {
    allowBearer: true,
    allowSessionCookie: true,
  });

  if (!principal) {
    const response = NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    clearSessionCookie(response);
    clearLegacyCookies(response);
    return response;
  }

  return NextResponse.json({ authenticated: true, principal }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: Request) {
  if (!hasSameOrigin(req)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  try {
    const idToken = await resolveIdToken(req);

    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken, true);
    if (!Number.isFinite(decodedToken.auth_time) || Date.now() / 1000 - decodedToken.auth_time > 5 * 60) {
      throw new Error("RECENT_SIGN_IN_REQUIRED");
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: AUTH_SESSION_MAX_AGE_SECONDS * 1000,
    });
    await recordVerifiedLogin(decodedToken);

    const response = NextResponse.json({
      success: true,
      uid: decodedToken.uid,
    });

    response.cookies.set(AUTH_SESSION_COOKIE_NAME, sessionCookie, getAuthSessionCookieOptions());
    clearLegacyCookies(response);
    return response;
  } catch (error) {
    console.error("[api/auth/session] create session failed", error instanceof Error ? error.name : "UnknownError");
    const response = NextResponse.json({ error: "Failed to create server session." }, { status: 401 });
    clearSessionCookie(response);
    clearLegacyCookies(response);
    return response;
  }
}

export async function DELETE(req: Request) {
  if (!hasSameOrigin(req)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  clearLegacyCookies(response);
  return response;
}
