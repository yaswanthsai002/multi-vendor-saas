import { z } from 'zod';

import { AppError } from '../../shared/errors/AppError.js';

import {
  checkoutReviewQuerySchema,
  customerOrderPaginationSchema,
  customerOrderParamsSchema,
  idempotencyKeySchema,
  placeCustomerOrderSchema,
} from './customer-order.schema.js';
import * as service from './customer-order.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

function userId(req: AuthenticatedRequest) {
  if (!req.user?.sub) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  return req.user.sub;
}

export async function reviewCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = checkoutReviewQuerySchema.parse(req.query);
    res.json(await service.reviewCheckout(userId(req), query.addressId));
  } catch (error) {
    next(error);
  }
}
export async function placeOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const key = idempotencyKeySchema.parse(req.get('Idempotency-Key'));
    res
      .status(201)
      .json(
        await service.placeCustomerOrder(
          userId(req),
          key,
          placeCustomerOrderSchema.parse(req.body),
        ),
      );
  } catch (error) {
    next(error);
  }
}
export async function listOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    res.json(
      await service.listCustomerOrders(userId(req), customerOrderPaginationSchema.parse(req.query)),
    );
  } catch (error) {
    next(error);
  }
}
export async function getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { orderId } = customerOrderParamsSchema.parse(req.params);
    res.json(await service.getCustomerOrder(userId(req), orderId));
  } catch (error) {
    next(error);
  }
}
export async function cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { orderId } = customerOrderParamsSchema.parse(req.params);
    z.strictObject({}).parse(req.body ?? {});
    res.json(await service.cancelCustomerOrder(userId(req), orderId));
  } catch (error) {
    next(error);
  }
}
