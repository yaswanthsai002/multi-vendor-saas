import { sendOtpSchema, verifyOtpSchema } from './auth.schema.js';
import * as otpService from './otp.service.js';

import type { Request, Response, NextFunction } from 'express';

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
