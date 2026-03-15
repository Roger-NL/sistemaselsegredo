import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { evaluateAuthGuard } from "@/lib/auth/route-guards";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth cookies used by guard rules
  const token = request.cookies.get('es_session_token')?.value;
  const role = request.cookies.get('es_user_role')?.value;
  const decision = evaluateAuthGuard({ pathname, token, role });

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
