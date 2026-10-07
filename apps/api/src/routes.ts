import { Router } from 'express';

import { swaggerRouter } from './docs/swagger.routes.js';
import { authRouter } from './features/auth/auth.routes.js';
import { otpRouter } from './features/auth/otp.routes.js';
import { categoryRouter } from './features/category/category.routes.js';
import healthRouter from './features/health/health.routes.js';
import { mediaRouter } from './features/media/media.routes.js';
import { vendorRouter } from './features/vendor/vendor.routes.js';

export const apiRouter = Router();

apiRouter.use(swaggerRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/auth', otpRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/vendor', vendorRouter);
apiRouter.use('/vendor/media', mediaRouter);
