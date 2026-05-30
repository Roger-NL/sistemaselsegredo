import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { evaluateAuthGuard } from "@/lib/auth/route-guards";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathnameWithSearch = `${pathname}${search}`;

  const verifiedSessionCookie = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const legacySessionHint = request.cookies.get('es_session_token')?.value;
  const decision = evaluateAuthGuard({
    pathname,
    pathnameWithSearch,
    hasVerifiedSession: Boolean(verifiedSessionCookie),
    hasLegacySessionHint: Boolean(legacySessionHint),
  });

  if (!decision.allow && decision.redirectTo) {
    return NextResponse.redirect(new URL(decision.redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)',
  ],
};
