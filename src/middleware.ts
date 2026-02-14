import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Define protected routes
  const protectedPaths = ['/dashboard', '/pilar', '/especialidades', '/perfil'];
  const adminPaths = ['/admin'];
  
  // 2. Define auth routes
  const authPaths = ['/login', '/cadastro'];

  // 3. Check path type
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // 4. Get cookies
  const token = request.cookies.get('es_session_token')?.value;
  const role = request.cookies.get('es_user_role')?.value;

  // 5. Handle Admin Routes
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'admin') {
      // Logged in but not admin -> Redirect to Student Dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 6. Handle Student Protected Routes
  if (isProtectedPath) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    // Optional: If admin tries to access student dashboard, let them? Or redirect to admin?
    // Let them view it to debug/test.
    return NextResponse.next();
  }

  // 7. Handle Auth Routes (Login/Register)
  if (isAuthPath) {
    if (token) {
      // Smart Redirect based on Role
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 8. Allow all others
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)',
  ],
};
