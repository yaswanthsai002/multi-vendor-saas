import { Router } from 'express';

import { signUpLimiter, signInLimiter } from '../../shared/middleware/rateLimiter.js';

import { signup, signin } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpLimiter, signup);
authRouter.post('/signin', signInLimiter, signin);
