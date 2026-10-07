import '../config/env.js';
import { Queue, type ConnectionOptions } from 'bullmq';

export const BULK_IMPORT_QUEUE_NAME = 'bulk-imports';

export function getRedisConnectionOptions(): ConnectionOptions {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: Number(url.port) || 6379,
        password: url.password || undefined,
        username: url.username || undefined,
        maxRetriesPerRequest: null,
      };
    } catch {
      // Fallback
    }
  }

  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
  };
}

export interface ValidateImportJobData {
  importId: string;
  vendorId: string;
  objectKey: string;
}

export interface ImportProductsJobData {
  importId: string;
  vendorId: string;
  objectKey: string;
}

export type BulkImportJobData = ValidateImportJobData | ImportProductsJobData;

export const bulkImportQueue = new Queue<BulkImportJobData>(BULK_IMPORT_QUEUE_NAME, {
  connection: getRedisConnectionOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
