import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';

import { addWishlistItem, getWishlist, removeWishlistItem } from './wishlist.controller.js';

export const wishlistRouter = Router();
wishlistRouter.use(verifyToken);
wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/items', addWishlistItem);
wishlistRouter.delete('/items/:productId', removeWishlistItem);
