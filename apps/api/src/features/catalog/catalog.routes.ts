import { Router } from 'express';

import {
  getCatalogFacets,
  getCatalogProductBySlug,
  listCatalogProducts,
} from './catalog.controller.js';

export const catalogRouter = Router();

// Public customer routes (no auth required)
catalogRouter.get('/', listCatalogProducts);
catalogRouter.get('/facets', getCatalogFacets);
catalogRouter.get('/:slug', getCatalogProductBySlug);
