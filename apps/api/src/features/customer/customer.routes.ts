import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
} from './customer-address.controller.js';
import * as customerOrders from './customer-order.controller.js';

export const customerRouter = Router();
customerRouter.use(verifyToken);
customerRouter.get('/checkout/review', customerOrders.reviewCheckout);
customerRouter.post('/orders', customerOrders.placeOrder);
customerRouter.get('/orders', customerOrders.listOrders);
customerRouter.get('/orders/:orderId', customerOrders.getOrder);
customerRouter.post('/orders/:orderId/cancel', customerOrders.cancelOrder);
customerRouter.get('/addresses', listCustomerAddresses);
customerRouter.post('/addresses', createCustomerAddress);
customerRouter.patch('/addresses/:addressId', updateCustomerAddress);
customerRouter.delete('/addresses/:addressId', deleteCustomerAddress);
