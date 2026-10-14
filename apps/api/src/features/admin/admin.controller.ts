import {
  getDashboardPerformanceQuerySchema,
  listAdminOrdersQuerySchema,
  listAdminProductsQuerySchema,
  listAdminVendorsQuerySchema,
  listUsersQuerySchema,
  toggleFeatureSchema,
  updateProductModerationSchema,
  updateUserStatusSchema,
  updateVendorStatusSchema,
} from './admin.schema.js';
import { adminService } from './admin.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Request, Response } from 'express';

export async function getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboardMetrics();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getDashboardPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getDashboardPerformanceQuerySchema.parse(req.query);
    const data = await adminService.getDashboardPerformance(query.days);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getDashboardTopProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboardTopProducts();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getDashboardRecentOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboardRecentOrders();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const data = await adminService.listUsers(query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function updateUserStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorId = req.user?.sub as string;
    const userId = req.params.userId as string;
    const body = updateUserStatusSchema.parse(req.body);
    const data = await adminService.updateUserStatus(actorId, userId, body);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function listAdminVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAdminVendorsQuerySchema.parse(req.query);
    const data = await adminService.listVendors(query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getVendorDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = req.params.vendorId as string;
    const data = await adminService.getVendorDetail(vendorId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function updateVendorStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorId = req.user?.sub as string;
    const vendorId = req.params.vendorId as string;
    const body = updateVendorStatusSchema.parse(req.body);
    const data = await adminService.updateVendorStatus(actorId, vendorId, body);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function toggleVendorFeatured(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorId = req.user?.sub as string;
    const vendorId = req.params.vendorId as string;
    const { isFeatured } = toggleFeatureSchema.parse(req.body);
    const data = await adminService.toggleVendorFeatured(actorId, vendorId, isFeatured);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function listAdminProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAdminProductsQuerySchema.parse(req.query);
    const data = await adminService.listProducts(query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminProductDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const data = await adminService.getProductDetail(productId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function updateProductModeration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorId = req.user?.sub as string;
    const productId = req.params.productId as string;
    const body = updateProductModerationSchema.parse(req.body);
    const data = await adminService.updateProductModeration(actorId, productId, body);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function toggleProductFeatured(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorId = req.user?.sub as string;
    const productId = req.params.productId as string;
    const { isFeatured } = toggleFeatureSchema.parse(req.body);
    const data = await adminService.toggleProductFeatured(actorId, productId, isFeatured);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function listAdminOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAdminOrdersQuerySchema.parse(req.query);
    const data = await adminService.listOrders(query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminOrderDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.orderId as string;
    const data = await adminService.getOrderDetail(orderId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getMerchandisingOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getMerchandisingOverview();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}
