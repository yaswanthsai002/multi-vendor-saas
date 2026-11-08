import { Router } from 'express';

import { swaggerRouter } from './docs/swagger.routes.js';
import { adminRouter } from './features/admin/admin.routes.js';
import { authRouter } from './features/auth/auth.routes.js';
import { otpRouter } from './features/auth/otp.routes.js';
import { cartRouter } from './features/cart/cart.routes.js';
import { brandsRouter, catalogRouter } from './features/catalog/catalog.routes.js';
import { categoryRouter } from './features/category/category.routes.js';
import { customerRouter } from './features/customer/customer.routes.js';
import { postalCodeRouter } from './features/customer/postal-code.routes.js';
import healthRouter from './features/health/health.routes.js';
import { adminMediaRouter, mediaRouter } from './features/media/media.routes.js';
import { merchandisingRouter } from './features/merchandising/merchandising.routes.js';
import { vendorRouter } from './features/vendor/vendor.routes.js';
import { wishlistRouter } from './features/wishlist/wishlist.routes.js';
import { requireAdmin } from './shared/middleware/requireAdmin.js';
import { verifyToken } from './shared/middleware/verifyToken.js';

export const apiRouter = Router();

apiRouter.use(swaggerRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/auth', otpRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', catalogRouter);
apiRouter.use('/brands', brandsRouter);
apiRouter.use('/customer', customerRouter);
apiRouter.use('/locations', postalCodeRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/vendor', vendorRouter);
apiRouter.use('/vendor/media', mediaRouter);
apiRouter.use('/admin/media', adminMediaRouter);
apiRouter.use(merchandisingRouter);
apiRouter.use('/admin', verifyToken, requireAdmin, adminRouter);
