import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

import { getDb } from '@repo/db';
import { users } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';

import { verifyOtpSchema, type SendOtpInput, type VerifyOtpInput } from './auth.schema.js';

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 300; // 5 minutes validity
const COOLDOWN_SECONDS = 60; // 60 seconds resend cooldown
const MAX_VERIFY_ATTEMPTS = 3; // Maximum failed attempts before OTP invalidation

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 1) return `${local}••••••@${domain}`;
  const firstChar = local[0];
  return `${firstChar}••••••@${domain}`;
}

/**
 * Generates a cryptographically secure alphanumeric OTP.
 */
export function generateAlphanumericOtp(length = OTP_LENGTH): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += CHARSET[randomInt(0, CHARSET.length)];
  }
  return otp;
}

/**
 * Computes SHA-256 hash of an OTP string for secure Redis storage.
 */
function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function getOtpKey(purpose: string, email: string): string {
  return `otp:${purpose}:${email}`;
}

function getCooldownKey(purpose: string, email: string): string {
  return `otp_cooldown:${purpose}:${email}`;
}

/**
 * Generates and stores an OTP with rate limiting cooldown and TTL.
 */
export async function sendOtp(input: SendOtpInput) {
  const email = input.email.trim().toLowerCase();
  const cooldownKey = getCooldownKey(input.purpose, email);

  // Check 60-second resend cooldown
  const remainingCooldown = await redis.ttl(cooldownKey);
  if (remainingCooldown > 0) {
    throw new AppError(
      429,
      'RESEND_COOLDOWN',
      `Please wait ${remainingCooldown} seconds before requesting a new OTP.`,
    );
  }

  const otp = generateAlphanumericOtp();
  const otpHash = hashOtp(otp);
  const otpKey = getOtpKey(input.purpose, email);

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[DEV ONLY] OTP for ${email} (${input.purpose}): ${otp}`);
  }

  // Store hashed OTP with TTL in seconds
  const payload = JSON.stringify({ otpHash, attempts: 0 });
  await redis.set(otpKey, payload, 'EX', OTP_TTL_SECONDS);

  // Set cooldown key to prevent rapid re-sending
  await redis.set(cooldownKey, '1', 'EX', COOLDOWN_SECONDS);

  // Generate verification pending token to secure and state-manage the session across refreshes
  const verificationPendingToken = randomBytes(24).toString('hex');
  await redis.set(
    `email_verification_pending:${verificationPendingToken}`,
    JSON.stringify({ email, purpose: input.purpose }),
    'EX',
    900, // 15 minutes
  );

  // NOTE: For POC, the OTP is returned directly in the response payload.
  // In production, dispatch an email or SMS task (e.g. via BullMQ or notification service).
  return {
    message: 'Verification code has been sent.',
    email,
    purpose: input.purpose,
    verificationPendingToken,
    expiresIn: OTP_TTL_SECONDS,
    resendCooldown: COOLDOWN_SECONDS,
    otp,
  };
}

/**
 * Retrieves verification session status and remaining cooldown.
 */
export async function getVerificationStatus(
  token?: string,
  fallbackEmail?: string,
  fallbackPurpose?: string,
) {
  let email: string | undefined;
  let purpose = 'email_verification';
  const sessionToken = token;

  if (token) {
    const sessionData = await redis.get(`email_verification_pending:${token}`);
    if (sessionData) {
      const parsed = JSON.parse(sessionData) as { email: string; purpose: string };
      email = parsed.email;
      purpose = parsed.purpose;
    }
  }

  if (!email && fallbackEmail) {
    email = fallbackEmail.trim().toLowerCase();
    if (fallbackPurpose) {
      purpose = fallbackPurpose;
    }
  }

  if (!email) {
    throw new AppError(401, 'NO_PENDING_VERIFICATION', 'No pending verification found.');
  }

  const cooldownKey = getCooldownKey(purpose, email);
  const ttl = await redis.ttl(cooldownKey);
  const remainingCooldown = Math.max(0, ttl);

  return {
    email,
    maskedEmail: maskEmail(email),
    purpose,
    remainingCooldown,
    sessionToken,
  };
}

/**
 * Verifies an OTP against stored hash with brute-force lockout and PostgreSQL user existence check.
 */
export async function verifyOtp(input: Partial<VerifyOtpInput>, pendingToken?: string) {
  let email = input.email;
  let purpose = input.purpose;

  if ((!email || !purpose) && pendingToken) {
    const sessionData = await redis.get(`email_verification_pending:${pendingToken}`);
    if (sessionData) {
      const parsed = JSON.parse(sessionData) as {
        email: string;
        purpose: VerifyOtpInput['purpose'];
      };
      email = email || parsed.email;
      purpose = purpose || parsed.purpose;
    }
  }

  const validatedData = verifyOtpSchema.parse({
    ...input,
    ...(email ? { email } : {}),
    ...(purpose ? { purpose } : {}),
  });

  const normalizedEmail = validatedData.email.trim().toLowerCase();
  const otpKey = getOtpKey(validatedData.purpose, normalizedEmail);

  const storedData = await redis.get(otpKey);
  if (!storedData) {
    throw new AppError(400, 'OTP_EXPIRED_OR_INVALID', 'OTP has expired or is invalid.');
  }

  const { otpHash, attempts } = JSON.parse(storedData) as {
    otpHash: string;
    attempts: number;
  };

  const inputHash = hashOtp(validatedData.otp);

  const isMatch =
    Buffer.byteLength(inputHash) === Buffer.byteLength(otpHash) &&
    timingSafeEqual(Buffer.from(inputHash), Buffer.from(otpHash));

  if (!isMatch) {
    const newAttempts = attempts + 1;

    if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
      // Invalidate OTP after reaching max allowed attempts
      await redis.del(otpKey);
      throw new AppError(
        400,
        'MAX_ATTEMPTS_EXCEEDED',
        'Too many failed attempts. This OTP has been invalidated. Please request a new code.',
      );
    }

    // Persist attempt counter preserving remaining TTL
    const remainingTtl = await redis.ttl(otpKey);
    if (remainingTtl > 0) {
      const updatedPayload = JSON.stringify({ otpHash, attempts: newAttempts });
      await redis.set(otpKey, updatedPayload, 'EX', remainingTtl);
    }

    const remainingAttempts = MAX_VERIFY_ATTEMPTS - newAttempts;
    throw new AppError(
      400,
      'INVALID_OTP',
      `Incorrect OTP code. You have ${remainingAttempts} attempt(s) remaining.`,
    );
  }

  // Consume OTP upon successful verification to prevent replay attacks
  await redis.del(otpKey);

  // Clear pending verification session if present
  if (pendingToken) {
    await redis.del(`email_verification_pending:${pendingToken}`);
  }

  // Check user existence in PostgreSQL
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'No account exists with this email address.');
  }

  if (validatedData.purpose === 'email_verification') {
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.email, normalizedEmail));

    return {
      message: 'Email verified successfully.',
      verified: true,
    };
  }

  if (validatedData.purpose === 'password_reset') {
    const resetToken = randomBytes(24).toString('hex');
    await redis.set(`password_reset_token:${resetToken}`, normalizedEmail, 'EX', 600);
    return {
      message: 'OTP verified successfully.',
      verified: true,
      resetToken,
    };
  }

  return {
    message: 'OTP verified successfully.',
    verified: true,
  };
}
