import { Router } from 'express';

import {
  getCatalogFacets,
  getCatalogProductBySlug,
  getProductReviews,
  listCatalogProducts,
} from './catalog.controller.js';

export const catalogRouter = Router();

// Public customer routes (no auth required)
catalogRouter.get('/', listCatalogProducts);
catalogRouter.get('/facets', getCatalogFacets);
catalogRouter.get('/:slug/reviews', getProductReviews);
catalogRouter.get('/:slug', getCatalogProductBySlug);
