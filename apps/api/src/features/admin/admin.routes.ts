import { Router } from 'express';

import {
  getAdminOrderDetail,
  getAdminProductDetail,
  getDashboardMetrics,
  getDashboardPerformance,
  getDashboardRecentOrders,
  getDashboardTopProducts,
  getMerchandisingOverview,
  getVendorDetail,
  listAdminOrders,
  listAdminProducts,
  listAdminVendors,
  listUsers,
  onboardVendor,
  toggleProductFeatured,
  toggleVendorFeatured,
  updateProductModeration,
  updateUserStatus,
  updateVendorStatus,
} from './admin.controller.js';

export const adminRouter = Router();

// Dashboard & Analytics
adminRouter.get('/dashboard/metrics', getDashboardMetrics);
adminRouter.get('/dashboard/performance', getDashboardPerformance);
adminRouter.get('/dashboard/top-products', getDashboardTopProducts);
adminRouter.get('/dashboard/recent-orders', getDashboardRecentOrders);

// Users & Vendors Management
adminRouter.get('/users', listUsers);
adminRouter.patch('/users/:userId/status', updateUserStatus);
adminRouter.get('/vendors', listAdminVendors);
adminRouter.post('/vendors', onboardVendor);
adminRouter.get('/vendors/:vendorId', getVendorDetail);
adminRouter.patch('/vendors/:vendorId/status', updateVendorStatus);
adminRouter.patch('/vendors/:vendorId/feature', toggleVendorFeatured);

// Products & Moderation
adminRouter.get('/products', listAdminProducts);
adminRouter.get('/products/:productId', getAdminProductDetail);
adminRouter.patch('/products/:productId/moderation', updateProductModeration);
adminRouter.patch('/products/:productId/feature', toggleProductFeatured);

// Orders Oversight
adminRouter.get('/orders', listAdminOrders);
adminRouter.get('/orders/:orderId', getAdminOrderDetail);

// Merchandising
adminRouter.get('/merchandising/overview', getMerchandisingOverview);
