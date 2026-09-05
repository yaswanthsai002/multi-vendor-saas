import { Router } from 'express';

import {
  resetPasswordLimiter,
  signInLimiter,
  signUpLimiter,
} from '../../shared/middleware/rateLimiter.js';
import { verifyToken } from '../../shared/middleware/verifyToken.js';

import { me, resetPassword, signin, signout, signup } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpLimiter, signup);
authRouter.post('/signin', signInLimiter, signin);
authRouter.post('/signout', signout);
authRouter.get('/me', verifyToken, me);
authRouter.post('/reset-password', resetPasswordLimiter, resetPassword);
