/**
 * Route classification configuration.
 */

/**
 * Routes that belong to the authentication flow.
 */
export const AUTH_ROUTES = [
  '/signup',
  '/signin',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
] as const;

/**
 * Route prefixes requiring an authenticated session.
 */
export const AUTHENTICATED_ROUTE_PREFIXES: readonly string[] = [
  '/admin',
  '/vendor',
  '/checkout',
  '/orders',
] as const;

/**
 * Route prefixes requiring an authorised session.
 */
export const AUTHORISED_ROUTE_PREFIXES: readonly string[] = ['/admin', '/vendor'] as const;

/**
 * Default fallback path for unauthenticated users attempting to access AUTHENTICATED routes.
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT = '/signin';

/**
 * Default fallback path for authenticated users attempting to access authorised routes.
 */
export const DEFAULT_AUTHENTICATED_REDIRECT = '/';
