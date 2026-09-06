import { sendOtpSchema } from './auth.schema.js';
import * as otpService from './otp.service.js';

import type { Request, Response, NextFunction } from 'express';

export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = sendOtpSchema.parse(req.body);
    const result = await otpService.sendOtp(validatedData);

    if (result.verificationPendingToken) {
      res.cookie('email_verification_pending_token', result.verificationPendingToken, {
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      });
    }

    // Expose only required contract fields — never leak security tokens in JSON
    return res.status(200).json({
      message: result.message,
      expiresIn: result.expiresIn,
      resendCooldown: result.resendCooldown,
      ...(result.otp ? { otp: result.otp } : {}),
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const pendingToken =
      req.cookies.email_verification_pending_token ||
      (req.headers['x-verification-token'] as string | undefined);

    const result = await otpService.verifyOtp(req.body, pendingToken);

    // Clear verification pending token cookie
    res.clearCookie('email_verification_pending_token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    if (result.resetToken) {
      // Attach HttpOnly cookie for password reset — never expose in JSON
      res.cookie('reset_password_token', result.resetToken, {
        maxAge: 10 * 60 * 1000, // 10 minutes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      });
    }

    // Expose only contract fields — never leak resetToken or internal metadata
    return res.status(200).json({
      message: result.message,
      verified: result.verified,
    });
  } catch (error) {
    return next(error);
  }
}
