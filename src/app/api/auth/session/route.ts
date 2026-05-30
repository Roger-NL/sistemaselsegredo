import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getRequestPrincipal } from "@/lib/auth/principal";
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_MAX_AGE_SECONDS, getAuthSessionCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type CreateSessionPayload = {
  idToken?: string;
};

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
    allowLegacyCookie: false,
  });

  if (!principal) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, principal });
}

export async function POST(req: Request) {
  try {
    const idToken = await resolveIdToken(req);

    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: AUTH_SESSION_MAX_AGE_SECONDS * 1000,
    });

    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: false,
      allowLegacyCookie: false,
    });

    const response = NextResponse.json({
      success: true,
      principal,
    });

    response.cookies.set(AUTH_SESSION_COOKIE_NAME, sessionCookie, getAuthSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[api/auth/session] create session error", error);
    return NextResponse.json({ error: "Failed to create server session." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    ...getAuthSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
