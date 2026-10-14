import { TextEncoder } from 'util';

import { getDb } from '@repo/db';
import { users } from '@repo/db/schema';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';

import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import { sendOtp } from './otp.service.js';

import type {
  ChangePasswordInput,
  InitiateAvatarUploadInput,
  ResetPasswordInput,
  SignInInput,
  SignupInput,
  UpdateMeInput,
} from './auth.schema.js';

export interface SignupResult {
  user: {
    userId: string;
    fullName: string;
    email: string;
    roles: ('customer' | 'vendor' | 'admin')[];
    emailVerifiedAt: Date | null;
  };
  verificationPendingToken?: string;
}

export async function signup(input: SignupInput): Promise<SignupResult> {
  const db = getDb();
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

    let verificationPendingToken: string | undefined;
    // Automatically send initial verification OTP
    try {
      const otpResult = await sendOtp({ email, purpose: 'email_verification' });
      verificationPendingToken = otpResult.verificationPendingToken;
    } catch {
      // Non-blocking: user can still trigger OTP resend on /verify-email
    }

    // Strip out sensitive fields (like passwordHash) before returning the user object
    return {
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      verificationPendingToken,
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
  const db = getDb();
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

  if (!user.emailVerifiedAt) {
    throw new AppError(
      403,
      'EMAIL_NOT_VERIFIED',
      'Please verify your email address before signing in.',
    );
  }

  if (user.status === 'suspended') {
    throw new AppError(
      403,
      'ACCOUNT_SUSPENDED',
      user.suspensionReason
        ? `Your account has been suspended: ${user.suspensionReason}`
        : 'Your account has been suspended. Please contact support.',
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'SECRET_MISSING', 'JWT secret is not configured');
  }

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(user.userId.toString())
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(secret));

  return {
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
    },
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  const db = getDb();
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

export async function getMe(userId: string) {
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (user.status === 'suspended') {
    throw new AppError(
      403,
      'ACCOUNT_SUSPENDED',
      user.suspensionReason
        ? `Your account has been suspended: ${user.suspensionReason}`
        : 'Your account has been suspended. Please contact support.',
    );
  }

  return {
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      avatarUrl: user.avatarUrl,
    },
  };
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!existing) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const updateData: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.fullName !== undefined) {
    updateData.fullName = input.fullName;
  }
  if (input.avatarUrl !== undefined) {
    updateData.avatarUrl = input.avatarUrl;
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.userId, userId))
    .returning();

  return {
    user: {
      userId: updated.userId,
      fullName: updated.fullName,
      email: updated.email,
      roles: updated.roles,
      status: updated.status,
      emailVerifiedAt: updated.emailVerifiedAt,
      avatarUrl: updated.avatarUrl,
    },
    message: 'Profile updated successfully.',
  };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user || !user.passwordHash) {
    throw new AppError(
      400,
      'CANNOT_CHANGE_PASSWORD',
      'Account does not have a local password configured.',
    );
  }

  const validPassword = await argon2.verify(user.passwordHash, input.currentPassword);
  if (!validPassword) {
    throw new AppError(
      400,
      'INVALID_CURRENT_PASSWORD',
      'The current password provided is incorrect.',
    );
  }

  const newHash = await argon2.hash(input.newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date(),
    })
    .where(eq(users.userId, userId));

  return { message: 'Password has been changed successfully.' };
}

export async function initiateAvatarUpload(userId: string, input: InitiateAvatarUploadInput) {
  const ext = input.fileName.split('.').pop() || 'png';
  const objectKey = `avatars/${userId}-${Date.now()}.${ext}`;
  const bucket = STORAGE_BUCKETS.productMedia;

  const uploadUrl = await storageService.generatePresignedPutUrl(
    objectKey,
    input.mimeType,
    900,
    bucket,
  );

  const publicUrl = storageService.resolveUrl(objectKey, bucket);

  return {
    uploadUrl,
    publicUrl,
    objectKey,
  };
}
