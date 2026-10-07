import { parseRowsFromR2 } from '../features/bulk-import/bulk-import.parser.js';
import { csvRowSchema } from '../features/bulk-import/bulk-import.schema.js';
import {
  BULK_IMPORT_TTL_REVIEW_SECONDS,
  bulkImportService,
} from '../features/bulk-import/bulk-import.service.js';
import { getCategoryTaxonomy } from '../features/category/category.cache.js';
import { redis } from '../shared/redis/redis.client.js';
import { r2Service } from '../shared/storage/r2.client.js';

import type { BulkImportState } from '../features/bulk-import/bulk-import.types.js';
import type { ValidateImportJobData } from '../shared/queue/queues.js';
import type { Job } from 'bullmq';

interface InvalidRowRecord {
  rowNumber: number;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  errors: string;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function processValidateImport(job: Job<ValidateImportJobData>): Promise<void> {
  const { importId, vendorId, objectKey } = job.data;

  try {
    const taxonomy = await getCategoryTaxonomy();

    await bulkImportService.publishEvent(importId, {
      importId,
      status: 'VALIDATING',
      stage: 'streaming',
      statusText: 'Downloading and parsing spreadsheet...',
      totalRows: 0,
      processedRows: 0,
      readyRows: 0,
      needsAttentionRows: 0,
      importedRows: 0,
      percent: 5,
    });

    const parsedRows = await parseRowsFromR2(objectKey);

    let readyRows = 0;
    let needsAttentionRows = 0;
    const invalidRows: InvalidRowRecord[] = [];

    let lastPublishTime = Date.now();

    for (const { rowNumber, raw: rawRow } of parsedRows) {
      const parsed = csvRowSchema.safeParse({
        name: rawRow.name,
        description: rawRow.description,
        price: rawRow.price,
        stock: rawRow.stock,
        category: rawRow.category,
      });

      const errors: string[] = [];

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push(issue.message);
        }
      } else {
        const categoryLookup = taxonomy.lookup(parsed.data.category);
        if (!categoryLookup) {
          errors.push(
            `Category '${parsed.data.category}' does not match any valid category in the catalog. Please select a valid category from the template dropdown.`,
          );
        }
      }

      if (errors.length > 0) {
        needsAttentionRows++;
        invalidRows.push({
          rowNumber,
          name: rawRow.name || '',
          description: rawRow.description || '',
          price: rawRow.price || '',
          stock: rawRow.stock || '',
          category: rawRow.category || '',
          errors: errors.join(' | '),
        });
      } else {
        readyRows++;
      }

      const processedRows = readyRows + needsAttentionRows;
      const now = Date.now();

      // Throttle event publishes to at most once every 250ms
      if (now - lastPublishTime > 250 || processedRows % 250 === 0) {
        lastPublishTime = now;
        bulkImportService
          .publishEvent(importId, {
            importId,
            status: 'VALIDATING',
            stage: 'validating',
            statusText: `Validated ${processedRows} rows (${readyRows} ready, ${needsAttentionRows} need attention)...`,
            totalRows: parsedRows.length,
            processedRows,
            readyRows,
            needsAttentionRows,
            importedRows: 0,
            percent: Math.min(
              99,
              Math.round((processedRows / Math.max(1, parsedRows.length)) * 100),
            ),
          })
          .catch(() => {});
      }
    }

    const totalRows = readyRows + needsAttentionRows;
    let errorsKey: string | undefined;

    // If there are invalid rows, generate errors.csv and upload to R2
    if (invalidRows.length > 0) {
      const csvHeader = 'row,name,description,price,stock,category,errors\n';
      const csvLines = invalidRows.map((inv) =>
        [
          inv.rowNumber,
          escapeCsvCell(inv.name),
          escapeCsvCell(inv.description),
          escapeCsvCell(inv.price),
          escapeCsvCell(inv.stock),
          escapeCsvCell(inv.category),
          escapeCsvCell(inv.errors),
        ].join(','),
      );

      const errorCsvContent = csvHeader + csvLines.join('\n');
      errorsKey = `bulk-imports/${vendorId}/${importId}/errors.csv`;

      await r2Service.putObject(errorsKey, errorCsvContent, 'text/csv');
    }

    // Update Redis state with 24-hour review TTL
    const rawState = await redis.get(`bulk-import:${importId}`);
    const existingState: BulkImportState = rawState
      ? JSON.parse(rawState)
      : {
          importId,
          vendorId,
          status: 'VALIDATING',
          filename: 'import.csv',
          objectKey,
          totalRows: 0,
          processedRows: 0,
          readyRows: 0,
          needsAttentionRows: 0,
          importedRows: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const updatedState: BulkImportState = {
      ...existingState,
      status: 'NEEDS_REVIEW',
      totalRows,
      processedRows: totalRows,
      readyRows,
      needsAttentionRows,
      errorsKey,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(
      `bulk-import:${importId}`,
      JSON.stringify(updatedState),
      'EX',
      BULK_IMPORT_TTL_REVIEW_SECONDS,
    );

    // Extend vendor lock to 24 hours as well
    await redis.set(
      `vendor:${vendorId}:active-import`,
      importId,
      'EX',
      BULK_IMPORT_TTL_REVIEW_SECONDS,
    );

    let errorsUrl: string | undefined;
    if (errorsKey) {
      try {
        errorsUrl = await r2Service.generatePresignedGetUrl(errorsKey, 3600);
      } catch {
        // Non-fatal
      }
    }

    await bulkImportService.publishEvent(importId, {
      importId,
      status: 'NEEDS_REVIEW',
      stage: 'ready_for_review',
      statusText: `Validation complete. ${readyRows} products ready to import, ${needsAttentionRows} rows need attention.`,
      totalRows,
      processedRows: totalRows,
      readyRows,
      needsAttentionRows,
      importedRows: 0,
      percent: 100,
      errorsUrl,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

    const rawState = await redis.get(`bulk-import:${importId}`);
    if (rawState) {
      const state = JSON.parse(rawState) as BulkImportState;
      state.status = 'FAILED';
      state.error = errorMessage;
      state.updatedAt = new Date().toISOString();
      await redis.set(`bulk-import:${importId}`, JSON.stringify(state), 'EX', 3600);
    }

    await bulkImportService.publishEvent(importId, {
      importId,
      status: 'FAILED',
      stage: 'error',
      statusText: `Validation failed: ${errorMessage}`,
      totalRows: 0,
      processedRows: 0,
      readyRows: 0,
      needsAttentionRows: 0,
      importedRows: 0,
      percent: 0,
    });

    throw error;
  }
}
