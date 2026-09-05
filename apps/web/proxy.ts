import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { DEFAULT_UNAUTHENTICATED_REDIRECT, PROTECTED_ROUTE_PREFIXES } from '@/lib/routes.config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(authToken);

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
