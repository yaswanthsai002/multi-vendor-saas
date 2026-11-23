import './shared/config/env.js';

import { Worker, type Job } from 'bullmq';

import { retryDeletingMedia } from './features/media/media.service.js';
import {
  BULK_IMPORT_QUEUE_NAME,
  getRedisConnectionOptions,
  type BulkImportJobData,
  type ImportProductsJobData,
  type ValidateImportJobData,
} from './shared/queue/queues.js';
import { processImportProducts } from './worker/import-products.processor.js';
import { processValidateImport } from './worker/validate-import.processor.js';

console.log('[Worker] Starting BullMQ bulk-import worker...');

export const bulkImportWorker = new Worker<BulkImportJobData>(
  BULK_IMPORT_QUEUE_NAME,
  async (job) => {
    console.log(
      `[Worker] Received job ${job.name} (id: ${job.id}) for import: ${job.data.importId}`,
    );

    if (job.name === 'validate-import') {
      await processValidateImport(job as Job<ValidateImportJobData>);
    } else if (job.name === 'import-products') {
      await processImportProducts(job as Job<ImportProductsJobData>);
    } else {
      console.warn(`[Worker] Unhandled job name: ${job.name}`);
    }
  },
  {
    connection: getRedisConnectionOptions(),
    concurrency: 5,
  },
);

bulkImportWorker.on('ready', () => {
  console.log('[Worker] Ready to process bulk import jobs.');
});

bulkImportWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

const mediaCleanupTimer = setInterval(() => {
  void retryDeletingMedia().catch((error: unknown) => {
    console.error('[Worker] Media cleanup pass failed:', error);
  });
}, 60_000);
mediaCleanupTimer.unref();

process.on('SIGTERM', async () => {
  clearInterval(mediaCleanupTimer);
  console.log('[Worker] SIGTERM received. Closing worker...');
  await bulkImportWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  clearInterval(mediaCleanupTimer);
  console.log('[Worker] SIGINT received. Closing worker...');
  await bulkImportWorker.close();
  process.exit(0);
});
