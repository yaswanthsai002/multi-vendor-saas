import { AppError } from '../../shared/errors/AppError.js';

import { bulkMediaActionSchema, listMediaQuerySchema, mediaIdParamSchema } from './media.schema.js';
import * as mediaService from './media.service.js';

import type { VendorRequest } from '../vendor/vendor.middleware.js';
import type { NextFunction, Response } from 'express';

export async function uploadMedia(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const userId = req.user?.sub;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or missing authentication session.');
    }

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      throw new AppError(400, 'FILE_REQUIRED', 'At least one file must be provided.');
    }

    const uploadedItems = [];
    for (const file of files) {
      const media = await mediaService.uploadMedia(vendorId, userId, file);
      uploadedItems.push(media);
    }

    return res.status(201).json({
      message:
        uploadedItems.length > 1
          ? `${uploadedItems.length} media files uploaded successfully.`
          : 'Media uploaded successfully.',
      media: uploadedItems[0],
      items: uploadedItems,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listMedia(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const query = listMediaQuerySchema.parse(req.query);
    const result = await mediaService.listMedia(vendorId, query);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getMediaById(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    const media = await mediaService.getMediaById(vendorId, mediaId);

    return res.status(200).json({ media });
  } catch (error) {
    return next(error);
  }
}

export async function disableMedia(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    const media = await mediaService.disableMedia(vendorId, mediaId);

    return res.status(200).json({
      message: 'Media disabled successfully.',
      media,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMedia(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    await mediaService.deleteMedia(vendorId, mediaId);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function enableMedia(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    const media = await mediaService.enableMedia(vendorId, mediaId);

    return res.status(200).json({
      message: 'Media enabled successfully.',
      media,
    });
  } catch (error) {
    return next(error);
  }
}

export async function bulkAction(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const body = bulkMediaActionSchema.parse(req.body);
    const result = await mediaService.bulkAction(vendorId, body);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
