import { Router } from 'express';

import { swaggerRouter } from './docs/swagger.routes.js';
import { authRouter } from './features/auth/auth.routes.js';
import { otpRouter } from './features/auth/otp.routes.js';
import { vendorRouter } from './features/vendor/vendor.routes.js';

export const apiRouter = Router();

apiRouter.use(swaggerRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/auth', otpRouter);
apiRouter.use('/vendor', vendorRouter);
