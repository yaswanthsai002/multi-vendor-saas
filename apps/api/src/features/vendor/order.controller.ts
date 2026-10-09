import { AppError } from '../../shared/errors/AppError.js';

import {
  listVendorOrdersQuerySchema,
  updateVendorOrderStatusSchema,
  vendorOrderIdParamSchema,
} from './order.schema.js';
import {
  getVendorOrderDetail,
  listVendorOrders,
  updateVendorOrderStatus,
} from './order.service.js';

import type { VendorRequest } from './vendor.middleware.js';
import type { NextFunction, Response } from 'express';

/**
 * GET /api/vendor/orders
 * Returns vendor-scoped paginated orders with live status tab counts.
 */
export async function getVendorOrders(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor?.vendorId;
    if (!vendorId) {
      throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    }

    const query = listVendorOrdersQuerySchema.parse(req.query);
    const result = await listVendorOrders(vendorId, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/vendor/orders/:vendorOrderId
 * Returns full details for a single vendor order.
 */
export async function getVendorOrderById(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor?.vendorId;
    if (!vendorId) {
      throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    }

    const { vendorOrderId } = vendorOrderIdParamSchema.parse(req.params);
    const orderDetail = await getVendorOrderDetail(vendorId, vendorOrderId);

    res.status(200).json({
      success: true,
      data: orderDetail,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/vendor/orders/:vendorOrderId/status
 * Updates vendor order status and recalculates parent order status atomically.
 */
export async function updateVendorOrderStatusById(
  req: VendorRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const vendorId = req.vendor?.vendorId;
    if (!vendorId) {
      throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    }

    const { vendorOrderId } = vendorOrderIdParamSchema.parse(req.params);
    const input = updateVendorOrderStatusSchema.parse(req.body);

    const updatedDetail = await updateVendorOrderStatus(vendorId, vendorOrderId, input);

    res.status(200).json({
      success: true,
      data: updatedDetail,
    });
  } catch (error) {
    next(error);
  }
}
