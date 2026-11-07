import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';

import { getCart, addCartItem, setCartItem, removeCartItem } from './cart.controller.js';

export const cartRouter = Router();
cartRouter.use(verifyToken);
cartRouter.get('/', getCart);
cartRouter.post('/items', addCartItem);
cartRouter.put('/items/:productId', setCartItem);
cartRouter.delete('/items/:productId', removeCartItem);
