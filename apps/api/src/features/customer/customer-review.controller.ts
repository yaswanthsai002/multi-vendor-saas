import { AppError } from '../../shared/errors/AppError.js';

import {
  customerReviewParamsSchema,
  deleteCustomerReviewSchema,
  saveCustomerReviewSchema,
} from './customer-review.schema.js';
import * as service from './customer-review.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

export async function saveReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const { orderId, orderItemId } = customerReviewParamsSchema.parse(req.params);
    res.json(
      await service.saveCustomerReview(
        req.user.sub,
        orderId,
        orderItemId,
        saveCustomerReviewSchema.parse(req.body),
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const { orderId, orderItemId } = customerReviewParamsSchema.parse(req.params);
    const { expectedVersion } = deleteCustomerReviewSchema.parse(req.body);
    res.json(
      await service.deleteCustomerReview(req.user.sub, orderId, orderItemId, expectedVersion),
    );
  } catch (error) {
    next(error);
  }
}
