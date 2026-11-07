import { Router } from 'express';

import { postalLookupLimiter } from '../../shared/middleware/rateLimiter.js';

import { getPostalCode } from './postal-code.controller.js';

export const postalCodeRouter = Router();
postalCodeRouter.get('/pincodes/:postalCode', postalLookupLimiter, getPostalCode);
