import { addSchema, itemParamsSchema, quantitySchema } from './cart.schema.js';
import * as service from './cart.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

const userId = (req: AuthenticatedRequest) => {
  if (!req.user?.sub) throw new Error('Authenticated session is missing its subject');
  return req.user.sub;
};

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    return res.json(await service.getCart(userId(req)));
  } catch (error) {
    return next(error);
  }
}
export async function addCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = addSchema.parse(req.body);
    return res.status(200).json(await service.addItem(userId(req), data));
  } catch (error) {
    return next(error);
  }
}
export async function setCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { productId } = itemParamsSchema.parse(req.params);
    const { quantity } = quantitySchema.parse(req.body);
    return res.json(await service.setItem(userId(req), productId, quantity));
  } catch (error) {
    return next(error);
  }
}
export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { productId } = itemParamsSchema.parse(req.params);
    await service.removeItem(userId(req), productId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
