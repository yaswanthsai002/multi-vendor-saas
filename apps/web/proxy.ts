import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentUserServer } from './lib/auth/current-user';
import { verifyAuthToken } from './lib/auth/verify-token';

import {
  AUTH_ROUTES,
  DEFAULT_AUTHENTICATED_REDIRECT,
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  PROTECTED_ROUTE_PREFIXES,
  ROLE_PROTECTED_ROUTE_PREFIXES,
} from '@/lib/routes.config';

// Resolves a `?redirect=` param to a same-origin path only.
// A plain startsWith('/') check lets `//evil.com` through — browsers treat
// that as protocol-relative, i.e. an off-site redirect. Parsing as a URL
// and comparing origins closes that off for every case, not just `//`.
function safeRedirectTarget(raw: string | null, request: NextRequest): string {
  if (!raw) return '/';
  try {
    const target = new URL(raw, request.url);
    if (target.origin !== request.nextUrl.origin) return '/';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/';
  }
}

function toSignIn(request: NextRequest, clearCookie = false, error?: string) {
  const redirectUrl = new URL(DEFAULT_UNAUTHENTICATED_REDIRECT, request.url);
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  if (error) redirectUrl.searchParams.set('error', error);
  const response = NextResponse.redirect(redirectUrl);
  if (clearCookie) response.cookies.delete('auth_token');
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url), 308);
  }

  const rawToken = request.cookies.get('auth_token')?.value;
  const payload = rawToken ? await verifyAuthToken(rawToken) : null;
  const isAuthenticated = Boolean(payload);

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthenticated && isAuthRoute) {
    const target = safeRedirectTarget(request.nextUrl.searchParams.get('redirect'), request);
    return NextResponse.redirect(new URL(target, request.url));
  }

  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAuthenticated && isProtectedRoute) {
    // rawToken present but invalid (expired/tampered) vs absent — either way, not authenticated.
    return toSignIn(request, Boolean(rawToken), 'unauthenticated');
  }

  const isAuthorisedRoute = ROLE_PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isAuthorisedRoute) {
    if (!isAuthenticated) {
      return toSignIn(request, Boolean(rawToken), 'unauthenticated');
    }

    // Roles aren't in the JWT, so this tier genuinely needs the backend.
    // Failure here (network blip, API restart) must degrade to signin,
    // not crash the whole navigation.
    let roles: string[];
    try {
      const cookieHeader = request.headers.get('cookie') ?? '';
      const { user } = await getCurrentUserServer(cookieHeader);
      if (!user) {
        // Locally-valid JWT but backend says no user — token was revoked
        // server-side, or the account no longer exists. Force reauth,
        // don't silently drop them on '/'.
        return toSignIn(request, true, 'unauthenticated');
      }
      roles = user.roles ?? [];
    } catch {
      return toSignIn(request, false, 'unauthenticated');
    }

    const isAdmin = roles.includes('admin');
    const isVendor = roles.includes('vendor');

    if (!isAdmin && !isVendor) {
      const redirectUrl = new URL(DEFAULT_AUTHENTICATED_REDIRECT, request.url);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith('/admin') && !isAdmin) {
      const redirectUrl = new URL(DEFAULT_AUTHENTICATED_REDIRECT, request.url);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
