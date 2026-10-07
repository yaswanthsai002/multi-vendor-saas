import crypto from 'node:crypto';

import { getDb } from '@repo/db';
import { productCategories, products } from '@repo/db/schema';

import { parseRowsFromR2 } from '../features/bulk-import/bulk-import.parser.js';
import { csvRowSchema } from '../features/bulk-import/bulk-import.schema.js';
import { bulkImportService } from '../features/bulk-import/bulk-import.service.js';
import { getCategoryTaxonomy } from '../features/category/category.cache.js';
import { slugify } from '../features/vendor/vendor.service.js';
import { redis } from '../shared/redis/redis.client.js';

import type { BulkImportState } from '../features/bulk-import/bulk-import.types.js';
import type { ImportProductsJobData } from '../shared/queue/queues.js';
import type { Job } from 'bullmq';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '500', 10);

interface ValidProductItem {
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
}

export async function processImportProducts(job: Job<ImportProductsJobData>): Promise<void> {
  const { importId, vendorId, objectKey } = job.data;

  try {
    const taxonomy = await getCategoryTaxonomy();

    const rawState = await redis.get(`bulk-import:${importId}`);
    const state: BulkImportState = rawState
      ? JSON.parse(rawState)
      : {
          importId,
          vendorId,
          status: 'IMPORTING',
          filename: 'import.xlsx',
          objectKey,
          totalRows: 0,
          processedRows: 0,
          readyRows: 0,
          needsAttentionRows: 0,
          importedRows: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    await bulkImportService.publishEvent(importId, {
      importId,
      status: 'IMPORTING',
      stage: 'streaming',
      statusText: 'Reading validated products...',
      totalRows: state.readyRows || 0,
      processedRows: 0,
      readyRows: state.readyRows || 0,
      needsAttentionRows: state.needsAttentionRows || 0,
      importedRows: 0,
      percent: 5,
    });

    const parsedRows = await parseRowsFromR2(objectKey);
    const validItems: ValidProductItem[] = [];

    for (const { raw: rawRow } of parsedRows) {
      const parsed = csvRowSchema.safeParse({
        name: rawRow.name,
        description: rawRow.description,
        price: rawRow.price,
        stock: rawRow.stock,
        category: rawRow.category,
      });

      if (parsed.success) {
        const cat = taxonomy.lookup(parsed.data.category);
        if (cat) {
          validItems.push({
            name: parsed.data.name,
            description: parsed.data.description,
            price: parsed.data.price,
            stock: parsed.data.stock,
            categoryId: cat.categoryId,
          });
        }
      }
    }

    const totalToImport = validItems.length;
    let importedRows = 0;
    const db = getDb();

    // Process valid products in transaction chunks
    for (let i = 0; i < validItems.length; i += CHUNK_SIZE) {
      const chunk = validItems.slice(i, i + CHUNK_SIZE);

      await db.transaction(async (tx) => {
        const productValues = chunk.map((item) => ({
          vendorId,
          name: item.name,
          slug: `${slugify(item.name)}-${crypto.randomBytes(3).toString('hex')}`,
          description: item.description,
          price: item.price,
          stock: item.stock,
          published: false,
          isSoftDeleted: false,
        }));

        const insertedProducts = await tx
          .insert(products)
          .values(productValues)
          .returning({ productId: products.productId });

        const categoryValues = insertedProducts.map((p, idx) => ({
          productId: p.productId,
          categoryId: chunk[idx].categoryId,
        }));

        if (categoryValues.length > 0) {
          await tx.insert(productCategories).values(categoryValues);
        }
      });

      importedRows += chunk.length;
      const percent = Math.min(99, Math.round((importedRows / totalToImport) * 100));

      await bulkImportService.publishEvent(importId, {
        importId,
        status: 'IMPORTING',
        stage: 'importing',
        statusText: `Imported ${importedRows} of ${totalToImport} products...`,
        totalRows: totalToImport,
        processedRows: importedRows,
        readyRows: totalToImport,
        needsAttentionRows: state.needsAttentionRows,
        importedRows,
        percent,
      });

      // Update state in Redis
      state.importedRows = importedRows;
      state.updatedAt = new Date().toISOString();
      await redis.set(`bulk-import:${importId}`, JSON.stringify(state), 'EX', 86400);
    }

    // Finalize state to COMPLETED (retain active session so vendor views summary)
    state.status = 'COMPLETED';
    state.importedRows = importedRows;
    state.updatedAt = new Date().toISOString();
    await redis.set(`bulk-import:${importId}`, JSON.stringify(state), 'EX', 86400);
    await redis.set(`vendor:${vendorId}:active-import`, importId, 'EX', 86400);

    await bulkImportService.publishEvent(importId, {
      importId,
      status: 'COMPLETED',
      stage: 'complete',
      statusText: `Successfully imported ${importedRows} products!`,
      totalRows: totalToImport,
      processedRows: totalToImport,
      readyRows: totalToImport,
      needsAttentionRows: state.needsAttentionRows,
      importedRows,
      percent: 100,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown import error';

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
      statusText: `Import failed: ${errorMessage}`,
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
