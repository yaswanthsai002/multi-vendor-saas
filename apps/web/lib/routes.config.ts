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
  '/verify-otp',
] as const;

/**
 * Route prefixes requiring an authenticated session.
 * Initialized as an empty array; populate as protected features are developed.
 */
export const PROTECTED_ROUTE_PREFIXES: readonly string[] = [];

/**
 * Default fallback path for unauthenticated users attempting to access protected routes.
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT = '/signin';
