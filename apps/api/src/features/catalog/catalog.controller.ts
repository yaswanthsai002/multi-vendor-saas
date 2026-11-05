import {
  catalogProductParamsSchema,
  listCatalogProductsQuerySchema,
  productReviewsQuerySchema,
} from './catalog.schema.js';
import * as catalogService from './catalog.service.js';

import type { NextFunction, Request, Response } from 'express';

export async function listCatalogProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listCatalogProductsQuerySchema.parse(req.query);
    const result = await catalogService.listCatalogProducts(query);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getCatalogProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = catalogProductParamsSchema.parse(req.params);
    const product = await catalogService.getCatalogProductBySlug(slug);
    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
}

export async function getCatalogFacets(_req: Request, res: Response, next: NextFunction) {
  try {
    const facets = await catalogService.getCatalogFacets();
    return res.status(200).json(facets);
  } catch (error) {
    return next(error);
  }
}

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = catalogProductParamsSchema.parse(req.params);
    const query = productReviewsQuerySchema.parse(req.query);
    return res.status(200).json(await catalogService.getProductReviews(slug, query));
  } catch (error) {
    return next(error);
  }
}
