import {
  createProductSchema,
  getVendorDashboardQuerySchema,
  getVendorProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from './vendor.schema.js';
import * as vendorService from './vendor.service.js';

import type { VendorRequest } from './vendor.middleware.js';
import type { NextFunction, Response } from 'express';

export async function createVendorProducts(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const validatedData = createProductSchema.parse(req.body);
    const product = await vendorService.createProduct(vendorId, validatedData);

    return res.status(201).json({
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getVendorProducts(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const query = getVendorProductsQuerySchema.parse(req.query);
    const result = await vendorService.getVendorProducts(vendorId, query);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getVendorProductById(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { productId } = productIdParamSchema.parse(req.params);
    const product = await vendorService.getVendorProductById(vendorId, productId);

    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
}

export async function updateVendorProductById(
  req: VendorRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { productId } = productIdParamSchema.parse(req.params);
    const validatedData = updateProductSchema.parse(req.body);
    const product = await vendorService.updateVendorProductById(vendorId, productId, validatedData);

    return res.status(200).json({
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteVendorProductById(
  req: VendorRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { productId } = productIdParamSchema.parse(req.params);
    const result = await vendorService.deleteVendorProductById(vendorId, productId);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getVendorDashboard(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const query = getVendorDashboardQuerySchema.parse(req.query);
    const result = await vendorService.getVendorDashboardData(vendorId, query);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
