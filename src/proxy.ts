import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { evaluateAuthGuard } from "@/server/auth/route-guards";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/session-cookie";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathnameWithSearch = `${pathname}${search}`;

  const verifiedSessionCookie = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const decision = evaluateAuthGuard({
    pathname,
    pathnameWithSearch,
    hasVerifiedSession: Boolean(verifiedSessionCookie),
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
