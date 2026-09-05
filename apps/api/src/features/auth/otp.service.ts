import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';

import type { SendOtpInput, VerifyOtpInput } from './auth.schema.js';

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 300; // 5 minutes validity
const COOLDOWN_SECONDS = 60; // 60 seconds resend cooldown
const MAX_VERIFY_ATTEMPTS = 3; // Maximum failed attempts before OTP invalidation

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

  // Store hashed OTP with TTL in seconds
  const payload = JSON.stringify({ otpHash, attempts: 0 });
  await redis.set(otpKey, payload, 'EX', OTP_TTL_SECONDS);

  // Set cooldown key to prevent rapid re-sending
  await redis.set(cooldownKey, '1', 'EX', COOLDOWN_SECONDS);

  // NOTE: For POC, the OTP is returned directly in the response payload.
  // In production, dispatch an email or SMS task (e.g. via BullMQ or notification service).
  return {
    message: 'OTP sent successfully',
    email,
    purpose: input.purpose,
    expiresIn: OTP_TTL_SECONDS,
    resendCooldown: COOLDOWN_SECONDS,
    otp,
  };
}

/**
 * Verifies an OTP against stored hash with brute-force lockout.
 */
export async function verifyOtp(input: VerifyOtpInput) {
  const email = input.email.trim().toLowerCase();
  const otpKey = getOtpKey(input.purpose, email);

  const storedData = await redis.get(otpKey);
  if (!storedData) {
    throw new AppError(400, 'OTP_EXPIRED_OR_INVALID', 'OTP has expired or is invalid.');
  }

  const { otpHash, attempts } = JSON.parse(storedData) as {
    otpHash: string;
    attempts: number;
  };

  const inputHash = hashOtp(input.otp);

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

  return {
    message: 'OTP verified successfully',
    verified: true,
    email,
    purpose: input.purpose,
  };
}
