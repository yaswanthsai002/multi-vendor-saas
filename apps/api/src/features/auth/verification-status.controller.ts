import * as otpService from './otp.service.js';

import type { Request, Response, NextFunction } from 'express';

export async function getVerificationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies.email_verification_pending_token ||
      (req.headers['x-verification-token'] as string | undefined) ||
      (req.query.token as string | undefined);

    const result = await otpService.getVerificationStatus(
      token,
      req.query.email as string | undefined,
      req.query.purpose as string | undefined,
    );

    if (result.sessionToken) {
      res.cookie('email_verification_pending_token', result.sessionToken, {
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      });
    }

    return res.status(200).json({
      email: result.email,
      maskedEmail: result.maskedEmail,
      purpose: result.purpose,
      remainingCooldown: result.remainingCooldown,
    });
  } catch (error) {
    return next(error);
  }
}
