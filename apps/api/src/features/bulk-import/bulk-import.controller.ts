import { redis } from '../../shared/redis/redis.client.js';

import { importIdParamSchema, initiateBulkImportSchema } from './bulk-import.schema.js';
import { bulkImportService } from './bulk-import.service.js';

import type { VendorRequest } from '../vendor/vendor.middleware.js';
import type { Response, NextFunction } from 'express';
import type { Redis } from 'ioredis';

export async function getTemplate(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const buffer = await bulkImportService.generateExcelTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="products_template.xlsx"');
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function initiateBulkImport(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const input = initiateBulkImportSchema.parse(req.body);
    const vendorId = req.vendor!.vendorId;

    const data = await bulkImportService.initiateBulkImport(vendorId, input);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmUploaded(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const { importId } = importIdParamSchema.parse(req.params);
    const vendorId = req.vendor!.vendorId;

    const state = await bulkImportService.confirmUploaded(vendorId, importId);

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActiveImport(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const vendorId = req.vendor!.vendorId;
    const state = await bulkImportService.getActiveImport(vendorId);

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
}

export async function getErrorsDownloadUrl(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const { importId } = importIdParamSchema.parse(req.params);
    const vendorId = req.vendor!.vendorId;

    const data = await bulkImportService.getErrorsDownloadUrl(vendorId, importId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function startImport(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const { importId } = importIdParamSchema.parse(req.params);
    const vendorId = req.vendor!.vendorId;

    const state = await bulkImportService.startImport(vendorId, importId);

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelImport(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    const { importId } = importIdParamSchema.parse(req.params);
    const vendorId = req.vendor!.vendorId;

    const result = await bulkImportService.cancelImport(vendorId, importId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function streamImportEvents(req: VendorRequest, res: Response, next: NextFunction) {
  let subscriber: Redis | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  try {
    const { importId } = importIdParamSchema.parse(req.params);
    const vendorId = req.vendor!.vendorId;

    // Verify session ownership
    const currentState = await bulkImportService.getImportState(importId, vendorId);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send initial snapshot
    const initialPercent =
      currentState.totalRows > 0
        ? Math.round((currentState.processedRows / currentState.totalRows) * 100)
        : 0;

    res.write(
      `data: ${JSON.stringify({
        importId: currentState.importId,
        status: currentState.status,
        totalRows: currentState.totalRows,
        processedRows: currentState.processedRows,
        readyRows: currentState.readyRows,
        needsAttentionRows: currentState.needsAttentionRows,
        importedRows: currentState.importedRows,
        percent: initialPercent,
      })}\n\n`,
    );

    // Subscribe to Redis pub/sub channel for live events
    subscriber = redis.duplicate();
    const channel = `bulk-import:${importId}:events`;

    subscriber.subscribe(channel, (err) => {
      if (err) {
        // Handled silently
      }
    });

    subscriber.on('message', (_ch, message) => {
      res.write(`data: ${message}\n\n`);
    });

    // 15-second heartbeat ping to prevent proxy connection timeout
    heartbeatTimer = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (subscriber) {
        subscriber.unsubscribe(channel).catch(() => {});
        subscriber.quit().catch(() => {});
      }
    });
  } catch (error) {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (subscriber) {
      subscriber.quit().catch(() => {});
    }
    next(error);
  }
}
