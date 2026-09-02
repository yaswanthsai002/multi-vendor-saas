import { Router } from 'express';

import { authRouter } from './features/auth/auth.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
