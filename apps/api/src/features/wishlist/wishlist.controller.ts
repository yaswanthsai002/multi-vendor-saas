import { productIdSchema } from './wishlist.schema.js';
import * as service from './wishlist.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

const userId = (req: AuthenticatedRequest) => {
  if (!req.user?.sub) throw new Error('Authenticated session is missing its subject');
  return req.user.sub;
};

export async function getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    return res.json(await service.getWishlist(userId(req)));
  } catch (error) {
    return next(error);
  }
}

export async function addWishlistItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { productId } = productIdSchema.parse(req.body);
    await service.addWishlistItem(userId(req), productId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function removeWishlistItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { productId } = productIdSchema.parse(req.params);
    await service.removeWishlistItem(userId(req), productId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
