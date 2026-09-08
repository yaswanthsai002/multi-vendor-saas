import { randomUUID } from 'node:crypto';
import { TextEncoder } from 'node:util';

import { getDb } from '@repo/db';
import { authAccounts, users } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

interface GoogleTokenResponse {
  id_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean | string;
  name?: string;
  picture?: string;
}

export interface GoogleAuthResult {
  token: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
    roles: ('customer' | 'vendor' | 'admin')[];
    emailVerifiedAt: Date | null;
  };
  redirectUrl: string;
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new AppError(
      500,
      'GOOGLE_CONFIG_MISSING',
      'Google OAuth client credentials are not configured.',
    );
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Generates Google OAuth 2.0 authorization URL with cryptographic anti-CSRF state.
 */
export async function getGoogleAuthUrl(redirectUrl = '/', fromUrl = '/signin'): Promise<string> {
  const { clientId, redirectUri } = getGoogleConfig();
  const state = randomUUID();

  // Store state in Redis with 10-minute TTL to prevent replay and CSRF
  await redis.set(`oauth_state:${state}`, JSON.stringify({ redirectUrl, fromUrl }), 'EX', 600);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Verifies ID token signature and claims from Google.
 */
export async function verifyGoogleToken(
  idToken: string,
  clientId: string,
): Promise<GoogleIdTokenPayload> {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean | string,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    };
  } catch {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google ID token verification failed.');
  }
}

/**
 * Handles Google OAuth callback, performs implicit account linking, and creates user session.
 */
export async function handleGoogleCallback(code: string, state: string): Promise<GoogleAuthResult> {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();

  // 1. Validate anti-CSRF state from Redis
  const rawState = await redis.get(`oauth_state:${state}`);
  if (!rawState) {
    throw new AppError(
      400,
      'INVALID_OAUTH_STATE',
      'Authentication session expired or invalid. Please try again.',
    );
  }
  await redis.del(`oauth_state:${state}`);

  const parsedState = JSON.parse(rawState) as { redirectUrl?: string };
  const redirectUrl = parsedState.redirectUrl || '/';

  // 2. Exchange authorization code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokens.id_token) {
    throw new AppError(
      400,
      'OAUTH_EXCHANGE_FAILED',
      tokens.error_description ||
        tokens.error ||
        'Failed to exchange authorization code with Google.',
    );
  }

  // 3. Verify ID token
  const googleUser = await verifyGoogleToken(tokens.id_token, clientId);

  const isEmailVerified =
    googleUser.email_verified === true || googleUser.email_verified === 'true';
  if (!isEmailVerified || !googleUser.email) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Google account email is not verified.');
  }

  const email = googleUser.email.trim().toLowerCase();
  const fullName = googleUser.name?.trim() || email.split('@')[0] || 'Google User';
  const providerAccountId = googleUser.sub;

  const db = getDb();

  // 4. Implicit Account Linking Transaction
  // Check if this Google account is already linked
  const existingAuthAccount = await db.query.authAccounts.findFirst({
    where: and(
      eq(authAccounts.provider, 'google'),
      eq(authAccounts.providerAccountId, providerAccountId),
    ),
  });

  let authenticatedUser: typeof users.$inferSelect;

  if (existingAuthAccount) {
    // Case 1: Account already linked -> Fetch user
    const user = await db.query.users.findFirst({
      where: eq(users.userId, existingAuthAccount.userId),
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Linked user record was not found.');
    }
    authenticatedUser = user;
  } else {
    // Case 2: Check if a user with the same email already exists (Implicit Account Linking)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      // Link Google identity to existing user and ensure email is marked verified
      await db.transaction(async (tx) => {
        await tx.insert(authAccounts).values({
          userId: existingUser.userId,
          provider: 'google',
          providerAccountId,
        });

        if (!existingUser.emailVerifiedAt) {
          await tx
            .update(users)
            .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
            .where(eq(users.userId, existingUser.userId));
        }
      });

      authenticatedUser = {
        ...existingUser,
        emailVerifiedAt: existingUser.emailVerifiedAt || new Date(),
      };
    } else {
      // Case 3: Brand new user -> Create user and linked auth account atomically
      const [newUser] = await db.transaction(async (tx) => {
        const [createdUser] = await tx
          .insert(users)
          .values({
            fullName,
            email,
            emailVerifiedAt: new Date(),
            roles: ['customer'],
          })
          .returning();

        await tx.insert(authAccounts).values({
          userId: createdUser.userId,
          provider: 'google',
          providerAccountId,
        });

        return [createdUser];
      });

      authenticatedUser = newUser;
    }
  }

  // 5. Generate application JWT session token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError(500, 'SECRET_MISSING', 'JWT secret is not configured.');
  }

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(authenticatedUser.userId.toString())
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(jwtSecret));

  return {
    token,
    user: {
      userId: authenticatedUser.userId,
      fullName: authenticatedUser.fullName,
      email: authenticatedUser.email,
      roles: authenticatedUser.roles,
      emailVerifiedAt: authenticatedUser.emailVerifiedAt,
    },
    redirectUrl,
  };
}
