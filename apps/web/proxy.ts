import { NextResponse, type NextRequest } from 'next/server';

import {
  AUTH_ROUTES,
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  PROTECTED_ROUTE_PREFIXES,
} from '@/lib/routes.config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/home') {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl, 308);
  }

  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(authToken);

  // Redirect authenticated users away from auth pages (/signin, /signup, etc.)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthenticated && isAuthRoute) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetPath = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // Check if current route matches any configured protected prefix
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL(DEFAULT_UNAUTHENTICATED_REDIRECT, request.url);

    redirectUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public image assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
