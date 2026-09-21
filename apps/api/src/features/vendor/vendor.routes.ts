import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  createVendorProducts,
  deleteVendorProductById,
  getVendorDashboard,
  getVendorProductById,
  getVendorProducts,
  updateVendorProductById,
} from './vendor.controller.js';
import { requireActiveVendor } from './vendor.middleware.js';

export const vendorRouter = Router();

// Enforce authentication and active vendor profile ownership on all /vendor routes
vendorRouter.use(verifyToken, requireActiveVendor);

vendorRouter.get('/dashboard', getVendorDashboard);
vendorRouter.post('/products', createVendorProducts);
vendorRouter.get('/products', getVendorProducts);
vendorRouter.get('/products/:productId', getVendorProductById);
vendorRouter.patch('/products/:productId', updateVendorProductById);
vendorRouter.delete('/products/:productId', deleteVendorProductById);
