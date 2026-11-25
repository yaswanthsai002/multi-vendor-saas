import { AppError } from '../../shared/errors/AppError.js';

import {
  bulkMediaActionSchema,
  completeMediaUploadSchema,
  initiateMediaUploadSchema,
  listMediaQuerySchema,
  mediaIdParamSchema,
} from './media.schema.js';
import * as mediaService from './media.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

export async function listAdminMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    res.json(await mediaService.listMedia(null, listMediaQuerySchema.parse(req.query)));
  } catch (error) {
    next(error);
  }
}

export async function getAdminMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    res.json({ media: await mediaService.getMediaById(null, mediaId) });
  } catch (error) {
    next(error);
  }
}

export async function initiateAdminUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await mediaService.initiateMediaUpload(
      null,
      initiateMediaUploadSchema.parse(req.body),
    );
    res.status(201).json({ success: true, items });
  } catch (error) {
    next(error);
  }
}

export async function completeAdminUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.sub;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const items = await mediaService.completeMediaUpload(
      null,
      userId,
      completeMediaUploadSchema.parse(req.body),
    );
    res.status(201).json({
      message: `${items.length} media files uploaded successfully.`,
      media: items[0],
      items,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeAdminMedia(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    const media = req.path.endsWith('/disable')
      ? await mediaService.disableMedia(null, mediaId)
      : await mediaService.enableMedia(null, mediaId);
    res.json({ media });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminMedia(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { mediaId } = mediaIdParamSchema.parse(req.params);
    await mediaService.deleteMedia(null, mediaId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function bulkAdminMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    res.json(await mediaService.bulkAction(null, bulkMediaActionSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
}
