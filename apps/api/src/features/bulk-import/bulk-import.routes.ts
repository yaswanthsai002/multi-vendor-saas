import { Router } from 'express';

import { verifyToken } from '../../shared/middleware/verifyToken.js';
import { requireActiveVendor } from '../vendor/vendor.middleware.js';

import {
  cancelImport,
  confirmUploaded,
  getActiveImport,
  getErrorsDownloadUrl,
  getTemplate,
  initiateBulkImport,
  startImport,
  streamImportEvents,
} from './bulk-import.controller.js';

export const bulkImportRouter = Router();

// Enforce authentication and active vendor profile ownership on all bulk-import endpoints
bulkImportRouter.use(verifyToken, requireActiveVendor);

bulkImportRouter.get('/template', getTemplate);
bulkImportRouter.post('/initiate', initiateBulkImport);
bulkImportRouter.get('/active', getActiveImport);
bulkImportRouter.post('/:importId/uploaded', confirmUploaded);
bulkImportRouter.get('/:importId/errors', getErrorsDownloadUrl);
bulkImportRouter.post('/:importId/start', startImport);
bulkImportRouter.delete('/:importId', cancelImport);
bulkImportRouter.get('/:importId/events', streamImportEvents);
