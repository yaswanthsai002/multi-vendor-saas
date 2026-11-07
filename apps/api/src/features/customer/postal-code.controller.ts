import { postalCodeParamsSchema } from './postal-code.schema.js';
import { lookupPostalCode } from './postal-code.service.js';

import type { NextFunction, Request, Response } from 'express';

export async function getPostalCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { postalCode } = postalCodeParamsSchema.parse(req.params);
    return res.json(await lookupPostalCode(postalCode));
  } catch (error) {
    return next(error);
  }
}
