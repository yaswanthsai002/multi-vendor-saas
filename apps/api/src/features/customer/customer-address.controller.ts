import { AppError } from '../../shared/errors/AppError.js';

import {
  createCustomerAddressSchema,
  customerAddressParamsSchema,
  updateCustomerAddressSchema,
} from './customer-address.schema.js';
import * as service from './customer-address.service.js';
import { assertPostalCodeExists } from './postal-code.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

function getUserId(req: AuthenticatedRequest) {
  if (!req.user?.sub) throw new AppError(401, 'UNAUTHORIZED', 'Invalid session payload.');
  return req.user.sub;
}

export async function listCustomerAddresses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.listCustomerAddresses(getUserId(req)));
  } catch (error) {
    return next(error);
  }
}

export async function createCustomerAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createCustomerAddressSchema.parse(req.body);
    await assertPostalCodeExists(input.postalCode);
    return res.status(201).json(await service.createCustomerAddress(getUserId(req), input));
  } catch (error) {
    return next(error);
  }
}

export async function updateCustomerAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { addressId } = customerAddressParamsSchema.parse(req.params);
    const input = updateCustomerAddressSchema.parse(req.body);
    if (input.postalCode) await assertPostalCodeExists(input.postalCode);
    return res.json(await service.updateCustomerAddress(getUserId(req), addressId, input));
  } catch (error) {
    return next(error);
  }
}

export async function deleteCustomerAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { addressId } = customerAddressParamsSchema.parse(req.params);
    await service.deleteCustomerAddress(getUserId(req), addressId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
