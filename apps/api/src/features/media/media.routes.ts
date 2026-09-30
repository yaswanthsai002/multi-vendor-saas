import { Router } from 'express';
import multer from 'multer';

import { verifyToken } from '../../shared/middleware/verifyToken.js';
import { requireActiveVendor } from '../vendor/vendor.middleware.js';

import {
  bulkAction,
  deleteMedia,
  disableMedia,
  enableMedia,
  getMediaById,
  listMedia,
  uploadMedia,
} from './media.controller.js';
import { MAX_VIDEO_SIZE_BYTES } from './media.schema.js';

export const mediaRouter = Router();

// ponytail: use in-memory buffer storage so Sharp and storage service operate directly without duplicate disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_SIZE_BYTES, // 100MB absolute outer boundary
  },
});

// Enforce authentication and active vendor profile ownership on all /vendor/media routes
mediaRouter.use(verifyToken, requireActiveVendor);

mediaRouter.post('/', upload.any(), uploadMedia);
mediaRouter.post('/bulk', bulkAction);
mediaRouter.get('/', listMedia);
mediaRouter.get('/:mediaId', getMediaById);
mediaRouter.patch('/:mediaId/enable', enableMedia);
mediaRouter.patch('/:mediaId/disable', disableMedia);
mediaRouter.delete('/:mediaId', deleteMedia);
