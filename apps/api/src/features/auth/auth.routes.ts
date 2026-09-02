import { Router } from 'express';

import { authLimiter } from '../../shared/middleware/rateLimiter.js';

import { signup } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', authLimiter, signup);
