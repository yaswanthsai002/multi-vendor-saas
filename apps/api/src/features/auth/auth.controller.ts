import {
  resetPasswordSchema,
  sendOtpSchema,
  signInSchema,
  signupSchema,
  verifyOtpSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';
import * as otpService from './otp.service.js';

import type { Request, Response, NextFunction } from 'express';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body synchronously. Throws ZodError on failure,
    // which is caught by the global error handler middleware.
    const validatedData = signupSchema.parse(req.body);
    const result = await authService.signup(validatedData);

    return res.status(201).json(result);
  } catch (error) {
    // Propagate all errors (Zod validation, DB constraints, etc.) to the central error handler
    return next(error);
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body synchronously. Throws ZodError on failure,
    // which is caught by the global error handler middleware.
    const validatedData = signInSchema.parse(req.body);
    const { token, user } = await authService.signin(validatedData);

    return res
      .status(200)
      .cookie('auth_token', token, {
        maxAge: 2 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      })
      .json({ user });
  } catch (error) {
    // Propagate all errors (Zod validation, DB constraints, etc.) to the central error handler
    return next(error);
  }
}

export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = sendOtpSchema.parse(req.body);
    const result = await otpService.sendOtp(validatedData);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);
    const result = await otpService.verifyOtp(validatedData);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(validatedData);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
