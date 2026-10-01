import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from './category.schema.js';
import * as categoryService from './category.service.js';

import type { NextFunction, Request, Response } from 'express';

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listCategoriesQuerySchema.parse(req.query);
    const categories = await categoryService.listCategories(query.parentCategoryId, query.search);

    return res.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = categoryIdParamSchema.parse(req.params);
    const category = await categoryService.getCategoryById(categoryId);

    return res.status(200).json(category);
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(input);

    return res.status(201).json({
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = categoryIdParamSchema.parse(req.params);
    const input = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(categoryId, input);

    return res.status(200).json({
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = categoryIdParamSchema.parse(req.params);
    const result = await categoryService.deleteCategory(categoryId);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
