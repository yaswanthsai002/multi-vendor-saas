import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
} from './customer-address.controller.js';

export const customerRouter = Router();
customerRouter.use(verifyToken);
customerRouter.get('/addresses', listCustomerAddresses);
customerRouter.post('/addresses', createCustomerAddress);
customerRouter.patch('/addresses/:addressId', updateCustomerAddress);
customerRouter.delete('/addresses/:addressId', deleteCustomerAddress);
