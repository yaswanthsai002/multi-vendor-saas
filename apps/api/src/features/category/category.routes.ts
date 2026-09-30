import { Router } from 'express';

import { requireAdmin } from '../../shared/middleware/requireAdmin.js';
import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from './category.controller.js';

export const categoryRouter = Router();

// Public reads
categoryRouter.get('/', listCategories);
categoryRouter.get('/:categoryId', getCategoryById);

// Admin-only mutations
categoryRouter.post('/', verifyToken, requireAdmin, createCategory);
categoryRouter.patch('/:categoryId', verifyToken, requireAdmin, updateCategory);
categoryRouter.delete('/:categoryId', verifyToken, requireAdmin, deleteCategory);
