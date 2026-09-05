import { Router } from 'express';

import { authRouter } from './features/auth/auth.routes.js';
import { otpRouter } from './features/auth/otp.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/auth', otpRouter);
