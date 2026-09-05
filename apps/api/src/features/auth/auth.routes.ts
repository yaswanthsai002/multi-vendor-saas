import { Router } from 'express';

import { otpLimiter, signInLimiter, signUpLimiter } from '../../shared/middleware/rateLimiter.js';

import { sendOtp, signin, signup, verifyOtp } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpLimiter, signup);
authRouter.post('/signin', signInLimiter, signin);
authRouter.post('/send-otp', otpLimiter, sendOtp);
authRouter.post('/verify-otp', otpLimiter, verifyOtp);
