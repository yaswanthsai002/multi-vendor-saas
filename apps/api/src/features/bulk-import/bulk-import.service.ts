import crypto from 'node:crypto';

import ExcelJS from 'exceljs';

import { AppError } from '../../shared/errors/AppError.js';
import { bulkImportQueue } from '../../shared/queue/queues.js';
import { redis } from '../../shared/redis/redis.client.js';
import { storageService } from '../../shared/storage/storage.service.js';
import { getCategoryTaxonomy } from '../category/category.cache.js';

import type { InitiateBulkImportInput } from './bulk-import.schema.js';
import type { BulkImportEvent, BulkImportState } from './bulk-import.types.js';

export const BULK_IMPORT_TTL_UPLOAD_SECONDS = 15 * 60; // 15 minutes during upload
export const BULK_IMPORT_TTL_REVIEW_SECONDS = 24 * 60 * 60; // 24 hours once in review

/**
 * Service orchestrating the bulk product import lifecycle, Redis state, R2 presigned URLs, and queue dispatching.
 */
export class BulkImportService {
  /**
   * Generates a 2-sheet Excel template (.xlsx) with embedded category Data Validation dropdown.
   * Sheet 1: Products
   * Sheet 2: Categories (Reference)
   */
  async generateExcelTemplate(): Promise<Buffer> {
    const taxonomy = await getCategoryTaxonomy();
    const leafCategories = taxonomy.leafList.length > 0 ? taxonomy.leafList : taxonomy.list;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Perigee Multi-Vendor';
    workbook.created = new Date();

    // 1. Sheet 1: Products
    const productsSheet = workbook.addWorksheet('Products', {
      views: [{ showGridLines: true }],
    });

    productsSheet.columns = [
      { header: 'name', key: 'name', width: 32 },
      { header: 'description', key: 'description', width: 55 },
      { header: 'price', key: 'price', width: 15 },
      { header: 'stock', key: 'stock', width: 12 },
      { header: 'category', key: 'category', width: 45 },
    ];

    // Style Header Row
    const headerRow = productsSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FF1F2937' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    headerRow.height = 24;
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Add sample rows
    const sampleCat1 = leafCategories[0]?.path || 'Electronics > Audio > Headphones';
    const sampleCat2 = leafCategories[1]?.path || sampleCat1;

    productsSheet.addRow({
      name: 'Sony WH-1000XM5',
      description: 'Premium wireless noise-canceling headphones with 30-hour battery',
      price: '24999.00',
      stock: 15,
      category: sampleCat1,
    });

    productsSheet.addRow({
      name: 'Organic Cotton Crewneck',
      description: '100% certified organic cotton everyday crewneck t-shirt',
      price: '799.00',
      stock: 40,
      category: sampleCat2,
    });

    // 2. Sheet 2: Categories (Reference)
    const categoriesSheet = workbook.addWorksheet('Categories', {
      views: [{ showGridLines: true }],
    });

    categoriesSheet.columns = [
      { header: 'Category Path (Select this in Products sheet)', key: 'path', width: 55 },
    ];

    const catHeaderRow = categoriesSheet.getRow(1);
    catHeaderRow.font = { bold: true, color: { argb: 'FF1F2937' }, size: 11 };
    catHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    catHeaderRow.height = 24;
    catHeaderRow.alignment = { vertical: 'middle', horizontal: 'left' };

    if (leafCategories.length > 0) {
      for (const item of leafCategories) {
        categoriesSheet.addRow({
          path: item.path,
        });
      }

      // Add Data Validation on Products sheet column E (E2 to E5000)
      const maxRow = leafCategories.length + 1;
      (
        productsSheet as unknown as {
          dataValidations: { add: (range: string, rule: Record<string, unknown>) => void };
        }
      ).dataValidations.add('E2:E5000', {
        type: 'list',
        allowBlank: true,
        formulae: [`Categories!$A$2:$A$${maxRow}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Category',
        error: 'Please select a valid category from the dropdown list.',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Initiates a new bulk product import session.
   * Acquires the vendor single-active-import lock.
   */
  async initiateBulkImport(
    vendorId: string,
    input: InitiateBulkImportInput,
  ): Promise<{
    importId: string;
    uploadUrl: string;
    objectKey: string;
    expiresIn: number;
  }> {
    const activeLockKey = `vendor:${vendorId}:active-import`;
    const existingImportId = await redis.get(activeLockKey);

    if (existingImportId) {
      // Check if the import state actually exists or if it's a stale lock
      const existingState = await redis.get(`bulk-import:${existingImportId}`);
      if (existingState) {
        throw new AppError(
          409,
          'IMPORT_ALREADY_IN_PROGRESS',
          'You already have an active bulk import session. Complete or cancel it before starting a new one.',
        );
      }
      // Stale key, clean up
      await redis.del(activeLockKey);
    }

    const importId = crypto.randomUUID();
    const isXlsx = input.filename.toLowerCase().endsWith('.xlsx');
    const ext = isXlsx ? 'xlsx' : 'csv';
    const objectKey = `bulk-imports/${vendorId}/${importId}/source.${ext}`;

    const state: BulkImportState = {
      importId,
      vendorId,
      status: 'UPLOADING',
      filename: input.filename,
      objectKey,
      totalRows: 0,
      processedRows: 0,
      readyRows: 0,
      needsAttentionRows: 0,
      importedRows: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Set lock and state atomically with 15-minute TTL
    await redis.set(activeLockKey, importId, 'EX', BULK_IMPORT_TTL_UPLOAD_SECONDS);
    await redis.set(
      `bulk-import:${importId}`,
      JSON.stringify(state),
      'EX',
      BULK_IMPORT_TTL_UPLOAD_SECONDS,
    );

    const uploadUrl = await storageService.generatePresignedPutUrl(
      objectKey,
      undefined,
      BULK_IMPORT_TTL_UPLOAD_SECONDS,
    );

    return {
      importId,
      uploadUrl,
      objectKey,
      expiresIn: BULK_IMPORT_TTL_UPLOAD_SECONDS,
    };
  }

  /**
   * Confirms that the client finished uploading directly to R2.
   * Dispatches validation job to the worker queue.
   */
  async confirmUploaded(vendorId: string, importId: string): Promise<BulkImportState> {
    const state = await this.getImportState(importId, vendorId);

    if (state.status !== 'UPLOADING') {
      return state;
    }

    state.status = 'VALIDATING';
    state.updatedAt = new Date().toISOString();

    await redis.set(
      `bulk-import:${importId}`,
      JSON.stringify(state),
      'EX',
      BULK_IMPORT_TTL_UPLOAD_SECONDS,
    );

    await bulkImportQueue.add('validate-import', {
      importId,
      vendorId,
      objectKey: state.objectKey,
    });

    await this.publishEvent(importId, {
      importId,
      status: 'VALIDATING',
      stage: 'queued',
      statusText: 'Validation job enqueued...',
      totalRows: 0,
      processedRows: 0,
      readyRows: 0,
      needsAttentionRows: 0,
      importedRows: 0,
      percent: 0,
    });

    return state;
  }

  /**
   * Returns the current active bulk import session for a vendor, if any.
   */
  async getActiveImport(
    vendorId: string,
  ): Promise<(BulkImportState & { errorsUrl?: string }) | null> {
    const activeLockKey = `vendor:${vendorId}:active-import`;
    const importId = await redis.get(activeLockKey);
    if (!importId) return null;

    const raw = await redis.get(`bulk-import:${importId}`);
    if (!raw) {
      await redis.del(activeLockKey);
      return null;
    }

    const state = JSON.parse(raw) as BulkImportState;
    if (state.vendorId !== vendorId) {
      await redis.del(activeLockKey);
      return null;
    }

    let errorsUrl: string | undefined;
    if (state.errorsKey) {
      try {
        errorsUrl = await storageService.generatePresignedGetUrl(state.errorsKey, 3600);
      } catch {
        // Non-fatal
      }
    }

    return { ...state, errorsUrl };
  }

  /**
   * Generates a presigned download URL for the generated error report CSV.
   */
  async getErrorsDownloadUrl(
    vendorId: string,
    importId: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const state = await this.getImportState(importId, vendorId);

    if (!state.errorsKey) {
      throw new AppError(404, 'NOT_FOUND', 'No errors report found for this import session.');
    }

    const url = await storageService.generatePresignedGetUrl(state.errorsKey, 3600);
    return { url, expiresIn: 3600 };
  }

  /**
   * Starts inserting valid rows into the database asynchronously via the worker queue.
   */
  async startImport(vendorId: string, importId: string): Promise<BulkImportState> {
    const state = await this.getImportState(importId, vendorId);

    if (state.status !== 'NEEDS_REVIEW') {
      throw new AppError(
        400,
        'INVALID_STATE',
        `Import cannot be started while in state '${state.status}'. Validation must complete first.`,
      );
    }

    if (state.readyRows === 0) {
      throw new AppError(
        400,
        'NO_VALID_ROWS',
        'Cannot proceed with import because there are 0 valid rows in the file.',
      );
    }

    state.status = 'IMPORTING';
    state.updatedAt = new Date().toISOString();

    await redis.set(
      `bulk-import:${importId}`,
      JSON.stringify(state),
      'EX',
      BULK_IMPORT_TTL_REVIEW_SECONDS,
    );

    await bulkImportQueue.add('import-products', {
      importId,
      vendorId,
      objectKey: state.objectKey,
    });

    await this.publishEvent(importId, {
      importId,
      status: 'IMPORTING',
      stage: 'queued',
      statusText: 'Product creation enqueued...',
      totalRows: state.readyRows,
      processedRows: 0,
      readyRows: state.readyRows,
      needsAttentionRows: state.needsAttentionRows,
      importedRows: 0,
      percent: 0,
    });

    return state;
  }

  /**
   * Cancels the bulk import session and cleans up Redis keys and R2 objects.
   */
  async cancelImport(vendorId: string, importId: string): Promise<{ success: boolean }> {
    const state = await this.getImportState(importId, vendorId);

    const activeLockKey = `vendor:${vendorId}:active-import`;
    await redis.del(activeLockKey);
    await redis.del(`bulk-import:${importId}`);

    // Clean up files in R2 storage
    await storageService.deletePrefix(`bulk-imports/${vendorId}/${importId}/`);

    await this.publishEvent(importId, {
      importId,
      status: 'FAILED',
      stage: 'cancelled',
      statusText: 'Import session cancelled by user.',
      totalRows: state.totalRows,
      processedRows: state.processedRows,
      readyRows: state.readyRows,
      needsAttentionRows: state.needsAttentionRows,
      importedRows: state.importedRows,
      percent: 0,
    });

    return { success: true };
  }

  /**
   * Helper to retrieve and verify import state ownership.
   */
  async getImportState(importId: string, vendorId: string): Promise<BulkImportState> {
    const raw = await redis.get(`bulk-import:${importId}`);
    if (!raw) {
      throw new AppError(404, 'NOT_FOUND', 'Bulk import session not found or has expired.');
    }

    const state = JSON.parse(raw) as BulkImportState;
    if (state.vendorId !== vendorId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied to this import session.');
    }

    return state;
  }

  /**
   * Publishes progress/state events over Redis Pub/Sub for Server-Sent Events subscribers.
   */
  async publishEvent(importId: string, event: BulkImportEvent): Promise<void> {
    try {
      await redis.publish(`bulk-import:${importId}:events`, JSON.stringify(event));
    } catch {
      // Non-fatal
    }
  }
}

export const bulkImportService = new BulkImportService();
