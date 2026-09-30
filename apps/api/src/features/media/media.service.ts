import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { getDb } from '@repo/db';
import { mediaLibrary, productMedia, products } from '@repo/db/schema';
import { and, count, desc, eq, ilike, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { storageService } from '../../shared/storage/storage.service.js';

import { processImage, processVideo } from './media.processor.js';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  type BulkMediaActionInput,
  type ListMediaQuery,
} from './media.schema.js';

export interface FormattedMediaItem {
  mediaId: string;
  type: 'image' | 'video';
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  durationSeconds?: number | null;
  status: 'active' | 'disabled';
  original: string;
  variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  poster?: string;
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date | null;
}

// single serializer formatting DB row into contract representation with resolved URLs
export function formatMediaResponse(row: typeof mediaLibrary.$inferSelect): FormattedMediaItem {
  const dirPrefix = `vendors/${row.vendorId}/media/${row.mediaId}`;
  const originalUrl = storageService.resolveUrl(row.originalStorageKey);

  const base: FormattedMediaItem = {
    mediaId: row.mediaId,
    type: row.mediaType,
    originalFileName: row.originalFileName,
    mimeType: row.mimeType,
    fileSizeBytes: Number(row.fileSizeBytes),
    width: row.width,
    height: row.height,
    status: row.status,
    original: originalUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    disabledAt: row.disabledAt,
  };

  if (row.mediaType === 'image') {
    base.variants = {
      thumbnail: storageService.resolveUrl(`${dirPrefix}/thumbnail.webp`),
      medium: storageService.resolveUrl(`${dirPrefix}/medium.webp`),
      large: storageService.resolveUrl(`${dirPrefix}/large.webp`),
    };
  } else {
    base.durationSeconds = row.durationSeconds;
    base.poster = storageService.resolveUrl(`${dirPrefix}/poster.webp`);
    base.variants = {
      thumbnail: storageService.resolveUrl(`${dirPrefix}/poster.webp`),
      medium: storageService.resolveUrl(`${dirPrefix}/poster.webp`),
      large: storageService.resolveUrl(`${dirPrefix}/poster.webp`),
    };
  }

  return base;
}

/**
 * Validates, saves, processes, and persists a newly uploaded media asset.
 */
export async function uploadMedia(
  vendorId: string,
  userId: string,
  file: Express.Multer.File,
): Promise<FormattedMediaItem> {
  const mimeType = file.mimetype;
  const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mimeType);
  const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(mimeType);

  if (!isImage && !isVideo) {
    throw new AppError(400, 'UNSUPPORTED_MEDIA_TYPE', `Unsupported MIME type: ${mimeType}`);
  }

  const mediaType: 'image' | 'video' = isImage ? 'image' : 'video';
  const maxSize = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;

  if (file.size > maxSize) {
    const limitMb = Math.round(maxSize / (1024 * 1024));
    throw new AppError(400, 'FILE_TOO_LARGE', `File size exceeds the ${limitMb}MB limit.`);
  }

  const mediaId = randomUUID();
  const rawExt = extname(file.originalname) || (isImage ? '.jpg' : '.mp4');
  const safeExt = rawExt.startsWith('.') ? rawExt.toLowerCase() : `.${rawExt.toLowerCase()}`;
  const dirPrefix = `vendors/${vendorId}/media/${mediaId}`;
  const originalStorageKey = `${dirPrefix}/original${safeExt}`;

  // 1. Save original file to storage
  await storageService.save(originalStorageKey, file.buffer);

  let width: number | null;
  let height: number | null;
  let durationSeconds: number | null = null;

  try {
    // 2. Generate variants or poster
    if (mediaType === 'image') {
      const imgRes = await processImage(file.buffer, dirPrefix);
      width = imgRes.width;
      height = imgRes.height;
    } else {
      const originalDiskPath = storageService.getAbsolutePath(originalStorageKey);
      const vidRes = await processVideo(originalDiskPath, dirPrefix);
      width = vidRes.width;
      height = vidRes.height;
      durationSeconds = vidRes.durationSeconds;
    }

    // 3. Persist MediaLibrary DB record
    const db = getDb();
    const [inserted] = await db
      .insert(mediaLibrary)
      .values({
        mediaId,
        vendorId,
        createdBy: userId,
        mediaType,
        originalFileName: file.originalname,
        mimeType,
        fileSizeBytes: file.size,
        width,
        height,
        durationSeconds,
        originalStorageKey,
        status: 'active',
      })
      .returning();

    return formatMediaResponse(inserted);
  } catch (err) {
    // Cleanup generated files on failure to avoid orphans per section 13
    await storageService.deleteDirectory(dirPrefix);
    throw err;
  }
}

/**
 * Lists media items scoped to the authenticated vendor with status, type, search, and pagination.
 */
export async function listMedia(vendorId: string, query: ListMediaQuery) {
  const db = getDb();
  const { status, mediaType, search, page, limit } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(mediaLibrary.vendorId, vendorId)];

  if (status !== 'all') {
    conditions.push(eq(mediaLibrary.status, status));
  }

  if (mediaType) {
    conditions.push(eq(mediaLibrary.mediaType, mediaType));
  }

  if (search) {
    conditions.push(ilike(mediaLibrary.originalFileName, `%${search}%`));
  }

  // ponytail: execute count, all-tab counts summary, and page rows concurrently
  const [[{ count: totalCount }], [countsRow], rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(mediaLibrary)
      .where(and(...conditions)),
    db
      .select({
        all: sql<number>`count(*)`,
        image: sql<number>`count(*) filter (where ${mediaLibrary.status} = 'active' and ${mediaLibrary.mediaType} = 'image')`,
        video: sql<number>`count(*) filter (where ${mediaLibrary.status} = 'active' and ${mediaLibrary.mediaType} = 'video')`,
        disabled: sql<number>`count(*) filter (where ${mediaLibrary.status} = 'disabled')`,
      })
      .from(mediaLibrary)
      .where(eq(mediaLibrary.vendorId, vendorId)),
    db
      .select()
      .from(mediaLibrary)
      .where(and(...conditions))
      .orderBy(desc(mediaLibrary.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalCount);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: rows.map(formatMediaResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    counts: {
      all: Number(countsRow?.all ?? 0),
      image: Number(countsRow?.image ?? 0),
      video: Number(countsRow?.video ?? 0),
      disabled: Number(countsRow?.disabled ?? 0),
    },
  };
}

/**
 * Retrieves a single media item owned by the vendor.
 */
export async function getMediaById(vendorId: string, mediaId: string): Promise<FormattedMediaItem> {
  const db = getDb();

  const row = await db.query.mediaLibrary.findFirst({
    where: and(eq(mediaLibrary.mediaId, mediaId), eq(mediaLibrary.vendorId, vendorId)),
  });

  if (!row) {
    throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
  }

  return formatMediaResponse(row);
}

/**
 * Disables a media item inside a database transaction:
 * - verifies active state and ownership
 * - removes all productMedia relationships
 * - unlinks from any products using it as primary image (productImageId = null)
 * - marks status = 'disabled' and disabledAt = now()
 */
export async function disableMedia(vendorId: string, mediaId: string): Promise<FormattedMediaItem> {
  const db = getDb();

  return await db.transaction(async (tx) => {
    // 1. Verify media exists and belongs to current vendor
    const media = await tx.query.mediaLibrary.findFirst({
      where: and(eq(mediaLibrary.mediaId, mediaId), eq(mediaLibrary.vendorId, vendorId)),
    });

    if (!media) {
      throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
    }

    if (media.status === 'disabled') {
      throw new AppError(400, 'MEDIA_ALREADY_DISABLED', 'Media asset is already disabled.');
    }

    // 2. Remove all productMedia references
    await tx.delete(productMedia).where(eq(productMedia.mediaId, mediaId));

    // 3. Nullify productImageId for any products pointing to this media
    await tx
      .update(products)
      .set({ productImageId: null })
      .where(and(eq(products.vendorId, vendorId), eq(products.productImageId, mediaId)));

    // 4. Update status to disabled
    const [updated] = await tx
      .update(mediaLibrary)
      .set({
        status: 'disabled',
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mediaLibrary.mediaId, mediaId))
      .returning();

    return formatMediaResponse(updated);
  });
}

/**
 * Hard deletes a media item:
 * - verifies ownership
 * - verifies status === 'disabled'
 * - verifies no productMedia references exist
 * - deletes DB row and physical files
 */
export async function deleteMedia(vendorId: string, mediaId: string): Promise<void> {
  const db = getDb();

  const media = await db.query.mediaLibrary.findFirst({
    where: and(eq(mediaLibrary.mediaId, mediaId), eq(mediaLibrary.vendorId, vendorId)),
  });

  if (!media) {
    throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
  }

  if (media.status !== 'disabled') {
    throw new AppError(400, 'MEDIA_NOT_DISABLED', 'Only disabled media assets can be deleted.');
  }

  const existingRef = await db.query.productMedia.findFirst({
    where: eq(productMedia.mediaId, mediaId),
  });

  if (existingRef) {
    throw new AppError(409, 'MEDIA_IN_USE', 'Cannot delete media asset that is still referenced.');
  }

  const dirPrefix = `vendors/${vendorId}/media/${mediaId}`;

  // Delete DB row first
  await db.delete(mediaLibrary).where(eq(mediaLibrary.mediaId, mediaId));

  // Clean up physical directory
  await storageService.deleteDirectory(dirPrefix);
}

/**
 * Enables / re-activates a previously disabled media item:
 * - verifies ownership
 * - verifies status === 'disabled'
 * - updates status = 'active', disabledAt = null
 */
export async function enableMedia(vendorId: string, mediaId: string): Promise<FormattedMediaItem> {
  const db = getDb();

  const media = await db.query.mediaLibrary.findFirst({
    where: and(eq(mediaLibrary.mediaId, mediaId), eq(mediaLibrary.vendorId, vendorId)),
  });

  if (!media) {
    throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
  }

  if (media.status === 'active') {
    throw new AppError(400, 'MEDIA_ALREADY_ACTIVE', 'Media asset is already active.');
  }

  const [updated] = await db
    .update(mediaLibrary)
    .set({
      status: 'active',
      disabledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(mediaLibrary.mediaId, mediaId))
    .returning();

  return formatMediaResponse(updated);
}

/**
 * Performs bulk actions (enable, disable, delete) on a list of vendor-owned media IDs.
 */
export async function bulkAction(vendorId: string, input: BulkMediaActionInput) {
  const { action, mediaIds } = input;
  const uniqueIds = Array.from(new Set(mediaIds));

  let processed = 0;
  const failed: { mediaId: string; reason: string }[] = [];

  for (const id of uniqueIds) {
    try {
      if (action === 'enable') {
        try {
          await enableMedia(vendorId, id);
        } catch (err: unknown) {
          if (err instanceof AppError && err.code === 'MEDIA_ALREADY_ACTIVE') {
            // No-op: already active
          } else {
            throw err;
          }
        }
      } else if (action === 'disable') {
        try {
          await disableMedia(vendorId, id);
        } catch (err: unknown) {
          if (err instanceof AppError && err.code === 'MEDIA_ALREADY_DISABLED') {
            // No-op: already disabled
          } else {
            throw err;
          }
        }
      } else if (action === 'delete') {
        await deleteMedia(vendorId, id);
      }
      processed++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      failed.push({ mediaId: id, reason: message });
    }
  }

  return {
    action,
    total: uniqueIds.length,
    processed,
    failedCount: failed.length,
    failed,
    message: `Bulk ${action} completed: ${processed} succeeded, ${failed.length} failed.`,
  };
}
