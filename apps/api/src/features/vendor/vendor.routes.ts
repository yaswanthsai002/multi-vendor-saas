import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';
import { bulkImportRouter } from '../bulk-import/bulk-import.routes.js';

import {
  archiveVendorProduct,
  bulkProductAction,
  createVendorProducts,
  deleteVendorProductById,
  getVendorDashboard,
  getVendorProductById,
  getVendorProducts,
  restoreVendorProduct,
  updateVendorProductById,
} from './vendor.controller.js';
import { requireActiveVendor } from './vendor.middleware.js';

export const vendorRouter = Router();

// Enforce authentication and active vendor profile ownership on all /vendor routes
vendorRouter.use(verifyToken, requireActiveVendor);

vendorRouter.use('/products/bulk-imports', bulkImportRouter);
vendorRouter.get('/dashboard', getVendorDashboard);
vendorRouter.post('/products', createVendorProducts);
vendorRouter.get('/products', getVendorProducts);
vendorRouter.post('/products/bulk', bulkProductAction);
vendorRouter.get('/products/:productId', getVendorProductById);
vendorRouter.patch('/products/:productId', updateVendorProductById);
vendorRouter.patch('/products/:productId/archive', archiveVendorProduct);
vendorRouter.patch('/products/:productId/restore', restoreVendorProduct);
vendorRouter.delete('/products/:productId', deleteVendorProductById);
