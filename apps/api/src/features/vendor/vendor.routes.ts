import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';
import { bulkImportRouter } from '../bulk-import/bulk-import.routes.js';

import {
  getVendorOrderById,
  getVendorOrders,
  updateVendorOrderStatusById,
} from './order.controller.js';
import {
  archiveVendorProduct,
  bulkProductAction,
  createVendorProducts,
  deleteVendorProductById,
  getVendorDashboard,
  getVendorProductById,
  getVendorProducts,
  getVendorProfile,
  restoreVendorProduct,
  updateVendorProductById,
  updateVendorProfile,
} from './vendor.controller.js';
import { requireActiveVendor, requireVendorProfile } from './vendor.middleware.js';

export const vendorRouter = Router();

// Base middleware: must be authenticated and own a vendor profile
vendorRouter.use(verifyToken, requireVendorProfile);

// Profile management routes
vendorRouter.get('/profile', requireActiveVendor, getVendorProfile);
vendorRouter.patch('/profile', requireActiveVendor, updateVendorProfile);

vendorRouter.use('/products/bulk-imports', requireActiveVendor, bulkImportRouter);
vendorRouter.get('/dashboard', requireActiveVendor, getVendorDashboard);

// Order management routes (permitted even if vendor is suspended so existing commitments can be fulfilled)
vendorRouter.get('/orders', getVendorOrders);
vendorRouter.get('/orders/:vendorOrderId', getVendorOrderById);
vendorRouter.post('/orders/:vendorOrderId/status', updateVendorOrderStatusById);

// Product routes (require active vendor status)
vendorRouter.post('/products', requireActiveVendor, createVendorProducts);
vendorRouter.get('/products', requireActiveVendor, getVendorProducts);
vendorRouter.post('/products/bulk', requireActiveVendor, bulkProductAction);
vendorRouter.get('/products/:productId', requireActiveVendor, getVendorProductById);
vendorRouter.patch('/products/:productId', requireActiveVendor, updateVendorProductById);
vendorRouter.patch('/products/:productId/archive', requireActiveVendor, archiveVendorProduct);
vendorRouter.patch('/products/:productId/restore', requireActiveVendor, restoreVendorProduct);
vendorRouter.delete('/products/:productId', requireActiveVendor, deleteVendorProductById);
