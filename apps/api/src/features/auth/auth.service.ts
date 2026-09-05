import { TextEncoder } from 'util';

import { db } from '@repo/db';
import { users } from '@repo/db/schema';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';

import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';

import type { ResetPasswordInput, SignInInput, SignupInput } from './auth.schema.js';

export async function signup(input: SignupInput) {
  // Normalize email for consistent database lookups and prevent case-sensitive duplicates
  const email = input.email.trim().toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    // If email enumeration is a major concern, we could return a 201 Success here
    // and send a generic "If this email is valid, you'll receive a confirmation link" email.
    // For most B2B/B2C platforms, throwing a 409 Conflict provides better user experience.
    throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
  }

  // Hash password using Argon2id (modern standard, resistant to GPU attacks)
  const passwordHash = await argon2.hash(input.password);

  try {
    const [user] = await db
      .insert(users)
      .values({ fullName: input.fullName.trim(), email, passwordHash, roles: ['customer'] })
      .returning();
    // Strip out sensitive fields (like passwordHash) before returning the user object
    return {
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
    }
    throw error;
  }
}

// Static dummy hash to ensure uniform execution timing against user enumeration
const DUMMY_ARGON2_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export async function signin(input: SignInInput) {
  // Normalize email for consistent database lookups and prevent case-sensitive duplicates
  const email = input.email.trim().toLowerCase();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const hashToVerify = user?.passwordHash || DUMMY_ARGON2_HASH;
  // Verify password using Argon2id
  const matchPassword = await argon2.verify(hashToVerify, input.password);

  if (!user || !matchPassword) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'SECRET_MISSING', 'JWT secret is not configured');
  }

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(user.userId.toString())
    .setIssuedAt('perigee-api')
    .setAudience('perigee-web-app')
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(secret));

  return {
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
      emailVerifiedAt: user.emailVerifiedAt,
    },
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  // 1. Get verified email directly from Redis token
  const email = await redis.get(`password_reset_token:${input.resetToken}`);
  if (!email) {
    throw new AppError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or expired.');
  }

  // 2. Ensure user exists
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new AppError(400, 'INVALID_RESET_TOKEN', 'Unable to reset password for this user.');
  }

  // 3. Hash & update password
  const passwordHash = await argon2.hash(input.newPassword);

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, email));

  // 4. Remove token to prevent replay
  await redis.del(`password_reset_token:${input.resetToken}`);

  return { message: 'Password has been reset successfully.' };
}
