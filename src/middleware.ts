import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Define protected routes
  // Any route starting with these paths requires authentication
  const protectedPaths = ['/dashboard', '/pilar', '/especialidades', '/perfil'];
  
  // 2. Define auth routes (redirect to dashboard if already logged in)
  const authPaths = ['/login', '/cadastro'];

  // 3. Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // 4. Get the session token from cookies
  // Note: We use 'es_session_token' as defined in auth-service.ts
  const token = request.cookies.get('es_session_token')?.value;

  // 5. Handle Protected Routes
  if (isProtectedPath) {
    if (!token) {
      // User is not logged in, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    // User is logged in, allow access
    return NextResponse.next();
  }

  // 6. Handle Auth Routes (Login/Register)
  if (isAuthPath) {
    if (token) {
      // User is already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // User is not logged in, allow access to login/register
    return NextResponse.next();
  }

  // 7. Allow all other routes (Landing page, public assets, etc)
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder content (images, fonts, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\..*).*)',
  ],
};
