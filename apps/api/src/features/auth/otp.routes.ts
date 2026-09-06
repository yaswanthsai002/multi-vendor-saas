import { Router } from 'express';

import { otpLimiter } from '../../shared/middleware/rateLimiter.js';

import { sendOtp, verifyOtp } from './otp.controller.js';
import { getVerificationStatus } from './verification-status.controller.js';

export const otpRouter = Router();

otpRouter.post('/send-otp', otpLimiter, sendOtp);
otpRouter.post('/verify-otp', otpLimiter, verifyOtp);
otpRouter.get('/verification-status', getVerificationStatus);
