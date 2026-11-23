import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { getDb } from '@repo/db';
import { campaigns, categories, mediaLibrary, productMedia, products } from '@repo/db/schema';
import { and, count, desc, eq, ilike, isNull, sql } from 'drizzle-orm';
import sharp from 'sharp';

import { AppError } from '../../shared/errors/AppError.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import { processImage, processVideo } from './media.processor.js';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  type BulkMediaActionInput,
  type CompleteMediaUploadInput,
  type InitiateMediaUploadInput,
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
  status: 'active' | 'disabled' | 'deleting';
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
  const bucket = STORAGE_BUCKETS.productMedia;
  const dirPrefix = mediaPrefix(row.vendorId, row.mediaId);
  const originalUrl = storageService.resolveUrl(row.originalStorageKey, bucket);

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
      thumbnail: storageService.resolveUrl(`${dirPrefix}/thumbnail.webp`, bucket),
      medium: storageService.resolveUrl(`${dirPrefix}/medium.webp`, bucket),
      large: storageService.resolveUrl(`${dirPrefix}/large.webp`, bucket),
    };
  } else {
    base.durationSeconds = row.durationSeconds;
    base.poster = storageService.resolveUrl(`${dirPrefix}/poster.webp`, bucket);
    base.variants = {
      thumbnail: storageService.resolveUrl(`${dirPrefix}/poster.webp`, bucket),
      medium: storageService.resolveUrl(`${dirPrefix}/poster.webp`, bucket),
      large: storageService.resolveUrl(`${dirPrefix}/poster.webp`, bucket),
    };
  }

  return base;
}

function mediaPrefix(vendorId: string | null, mediaId: string) {
  return vendorId ? `vendors/${vendorId}/media/${mediaId}` : `admin/media/${mediaId}`;
}

function ownerFilter(vendorId: string | null) {
  return vendorId ? eq(mediaLibrary.vendorId, vendorId) : isNull(mediaLibrary.vendorId);
}

async function downloadVerifiedMedia(key: string, maxBytes: number) {
  const filePath = join(tmpdir(), `media-${randomUUID()}`);
  let bytes = 0;
  try {
    await pipeline(
      await storageService.getObjectStream(key, STORAGE_BUCKETS.productMedia),
      new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          bytes += chunk.length;
          callback(
            bytes > maxBytes
              ? new AppError(400, 'FILE_TOO_LARGE', 'File exceeds its size limit.')
              : null,
            chunk,
          );
        },
      }),
      createWriteStream(filePath, { flags: 'wx' }),
    );
    return { filePath, bytes };
  } catch (error) {
    await unlink(filePath).catch(() => {});
    throw error;
  }
}

/**
 * Validates, saves, processes, and persists a newly uploaded media asset.
 */
export async function uploadMedia(
  vendorId: string,
  userId: string,
  file: Express.Multer.File,
): Promise<FormattedMediaItem> {
  const bucket = STORAGE_BUCKETS.productMedia;
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

  // 1. Save original file to R2 storage
  await storageService.putObject(originalStorageKey, file.buffer, mimeType, bucket);

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
      const tempVideoPath = join(tmpdir(), `upload-${randomUUID()}${safeExt}`);
      try {
        await writeFile(tempVideoPath, file.buffer);
        const vidRes = await processVideo(tempVideoPath, dirPrefix);
        width = vidRes.width;
        height = vidRes.height;
        durationSeconds = vidRes.durationSeconds;
      } finally {
        await unlink(tempVideoPath).catch(() => {});
      }
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
    await storageService.deletePrefix(dirPrefix, bucket);
    throw err;
  }
}

/**
 * Lists media items scoped to the authenticated vendor with status, type, search, and pagination.
 */
export async function listMedia(vendorId: string | null, query: ListMediaQuery) {
  const db = getDb();
  const { status, mediaType, search, page, limit } = query;
  const offset = (page - 1) * limit;

  const conditions = [ownerFilter(vendorId)];

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
      .where(ownerFilter(vendorId)),
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

export async function listCampaignMediaAssets(query: ListMediaQuery) {
  const db = getDb();
  const { search, page, limit } = query;
  const conditions = [
    isNull(mediaLibrary.vendorId),
    eq(mediaLibrary.status, 'active'),
    eq(mediaLibrary.mediaType, 'image'),
  ];
  if (search) conditions.push(ilike(mediaLibrary.originalFileName, `%${search}%`));

  const [[{ count: totalCount }], rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(mediaLibrary)
      .where(and(...conditions)),
    db
      .select()
      .from(mediaLibrary)
      .where(and(...conditions))
      .orderBy(desc(mediaLibrary.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);
  const total = Number(totalCount);

  return {
    items: rows.map(formatMediaResponse),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

/**
 * Retrieves a single media item owned by the vendor.
 */
export async function getMediaById(
  vendorId: string | null,
  mediaId: string,
): Promise<FormattedMediaItem> {
  const db = getDb();

  const row = await db.query.mediaLibrary.findFirst({
    where: and(eq(mediaLibrary.mediaId, mediaId), ownerFilter(vendorId)),
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
export async function disableMedia(
  vendorId: string | null,
  mediaId: string,
): Promise<FormattedMediaItem> {
  const db = getDb();

  return await db.transaction(async (tx) => {
    const [media] = await tx
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.mediaId, mediaId), ownerFilter(vendorId)))
      .for('update')
      .limit(1);

    if (!media) {
      throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
    }

    if (media.status === 'disabled') {
      throw new AppError(400, 'MEDIA_ALREADY_DISABLED', 'Media asset is already disabled.');
    }
    if (media.status === 'deleting') {
      throw new AppError(409, 'MEDIA_DELETING', 'Media asset is being deleted.');
    }

    if (vendorId) {
      await tx.delete(productMedia).where(eq(productMedia.mediaId, mediaId));
      await tx
        .update(products)
        .set({ productImageId: null })
        .where(and(eq(products.vendorId, vendorId), eq(products.productImageId, mediaId)));
    } else {
      const [categoryUse] = await tx
        .select({ name: categories.name })
        .from(categories)
        .where(eq(categories.imageMediaId, mediaId))
        .limit(1);
      const [publishedUse] = await tx
        .select({ title: campaigns.title })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.status, 'published'),
            sql`(${campaigns.desktopMediaId} = ${mediaId} OR ${campaigns.mobileMediaId} = ${mediaId})`,
          ),
        )
        .limit(1);
      if (categoryUse || publishedUse) {
        const name = categoryUse?.name ?? publishedUse?.title ?? 'a published campaign';
        throw new AppError(
          409,
          'MEDIA_IN_USE',
          `Replace this image in ${name} before disabling it.`,
        );
      }
      await tx
        .update(campaigns)
        .set({ draftDesktopMediaId: null, updatedAt: new Date() })
        .where(and(eq(campaigns.status, 'draft'), eq(campaigns.draftDesktopMediaId, mediaId)));
      await tx
        .update(campaigns)
        .set({ draftMobileMediaId: null, updatedAt: new Date() })
        .where(and(eq(campaigns.status, 'draft'), eq(campaigns.draftMobileMediaId, mediaId)));
    }

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
export async function deleteMedia(vendorId: string | null, mediaId: string): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [media] = await tx
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.mediaId, mediaId), ownerFilter(vendorId)))
      .for('update')
      .limit(1);
    if (!media) throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
    if (media.status === 'active') {
      throw new AppError(400, 'MEDIA_NOT_DISABLED', 'Disable this asset before deleting it.');
    }
    const [productUse] = await tx
      .select({ mediaId: productMedia.mediaId })
      .from(productMedia)
      .where(eq(productMedia.mediaId, mediaId))
      .limit(1);
    if (productUse) throw new AppError(409, 'MEDIA_IN_USE', 'Media asset is in use.');
    if (!vendorId) {
      const [categoryUse] = await tx
        .select({ categoryId: categories.categoryId })
        .from(categories)
        .where(eq(categories.imageMediaId, mediaId))
        .limit(1);
      const [campaignUse] = await tx
        .select({ campaignId: campaigns.campaignId })
        .from(campaigns)
        .where(
          sql`(${campaigns.desktopMediaId} = ${mediaId} OR ${campaigns.mobileMediaId} = ${mediaId} OR ${campaigns.draftDesktopMediaId} = ${mediaId} OR ${campaigns.draftMobileMediaId} = ${mediaId})`,
        )
        .limit(1);
      if (categoryUse || campaignUse)
        throw new AppError(409, 'MEDIA_IN_USE', 'Media asset is in use.');
    }
    await tx
      .update(mediaLibrary)
      .set({ status: 'deleting', updatedAt: new Date() })
      .where(eq(mediaLibrary.mediaId, mediaId));
  });
  await finishMediaDeletion(mediaId, vendorId);
}

async function finishMediaDeletion(mediaId: string, vendorId: string | null) {
  await storageService.deletePrefix(
    `${mediaPrefix(vendorId, mediaId)}/`,
    STORAGE_BUCKETS.productMedia,
  );
  await getDb()
    .delete(mediaLibrary)
    .where(
      and(
        eq(mediaLibrary.mediaId, mediaId),
        ownerFilter(vendorId),
        eq(mediaLibrary.status, 'deleting'),
      ),
    );
}

export async function retryDeletingMedia() {
  const rows = await getDb()
    .select({ mediaId: mediaLibrary.mediaId, vendorId: mediaLibrary.vendorId })
    .from(mediaLibrary)
    .where(eq(mediaLibrary.status, 'deleting'))
    .limit(20);
  let failures = 0;
  for (const row of rows) {
    try {
      await finishMediaDeletion(row.mediaId, row.vendorId);
    } catch {
      failures++;
    }
  }
  if (failures)
    throw new Error(`Media cleanup failed for ${failures} assets; rows kept for retry.`);
}

/**
 * Enables / re-activates a previously disabled media item:
 * - verifies ownership
 * - verifies status === 'disabled'
 * - updates status = 'active', disabledAt = null
 */
export async function enableMedia(
  vendorId: string | null,
  mediaId: string,
): Promise<FormattedMediaItem> {
  const db = getDb();

  const media = await db.query.mediaLibrary.findFirst({
    where: and(eq(mediaLibrary.mediaId, mediaId), ownerFilter(vendorId)),
  });

  if (!media) {
    throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.');
  }

  if (media.status === 'active') {
    throw new AppError(400, 'MEDIA_ALREADY_ACTIVE', 'Media asset is already active.');
  }
  if (media.status === 'deleting')
    throw new AppError(409, 'MEDIA_DELETING', 'Media asset is being deleted.');

  const [updated] = await db
    .update(mediaLibrary)
    .set({
      status: 'active',
      disabledAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(mediaLibrary.mediaId, mediaId),
        ownerFilter(vendorId),
        eq(mediaLibrary.status, 'disabled'),
      ),
    )
    .returning();

  if (!updated)
    throw new AppError(409, 'MEDIA_STATE_CHANGED', 'Media asset changed. Refresh and try again.');
  return formatMediaResponse(updated);
}

/**
 * Performs bulk actions (enable, disable, delete) on a list of vendor-owned media IDs.
 */
export async function bulkAction(vendorId: string | null, input: BulkMediaActionInput) {
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
      const message =
        err instanceof AppError ? err.message : 'Could not update this asset. Try again.';
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

export interface PresignedUploadItem {
  mediaId: string;
  uploadUrl: string;
  originalStorageKey: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

/**
 * Initiates direct-to-storage media uploads by generating presigned PUT URLs based on file metadata.
 */
export async function initiateMediaUpload(
  vendorId: string | null,
  input: InitiateMediaUploadInput,
): Promise<PresignedUploadItem[]> {
  const bucket = STORAGE_BUCKETS.productMedia;
  const results: PresignedUploadItem[] = [];

  for (const file of input.files) {
    const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(file.mimeType);
    const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(file.mimeType);

    if (!isImage && !isVideo) {
      throw new AppError(400, 'UNSUPPORTED_MEDIA_TYPE', `Unsupported MIME type: ${file.mimeType}`);
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
    if (file.fileSizeBytes > maxSize) {
      const limitMb = Math.round(maxSize / (1024 * 1024));
      throw new AppError(400, 'FILE_TOO_LARGE', `File size exceeds the ${limitMb}MB limit.`);
    }

    const mediaId = randomUUID();
    const rawExt = extname(file.fileName) || (isImage ? '.jpg' : '.mp4');
    const safeExt = rawExt.startsWith('.') ? rawExt.toLowerCase() : `.${rawExt.toLowerCase()}`;
    const dirPrefix = mediaPrefix(vendorId, mediaId);
    const originalStorageKey = `${dirPrefix}/original${safeExt}`;

    const uploadUrl = await storageService.generatePresignedPutUrl(
      originalStorageKey,
      file.mimeType,
      900,
      bucket,
    );

    results.push({
      mediaId,
      uploadUrl,
      originalStorageKey,
      fileName: file.fileName,
      fileSizeBytes: file.fileSizeBytes,
      mimeType: file.mimeType,
    });
  }

  return results;
}

/**
 * Completes direct-to-storage media upload: verifies files in storage, processes WebP/poster variants, and records in database.
 */
export async function completeMediaUpload(
  vendorId: string | null,
  userId: string,
  input: CompleteMediaUploadInput,
): Promise<FormattedMediaItem[]> {
  const bucket = STORAGE_BUCKETS.productMedia;
  const completedItems: FormattedMediaItem[] = [];

  for (const item of input.items) {
    const expectedPrefix = `${mediaPrefix(vendorId, item.mediaId)}/`;
    if (!item.originalStorageKey.startsWith(expectedPrefix)) {
      throw new AppError(403, 'FORBIDDEN', 'Invalid storage key ownership.');
    }
    const existing = await getDb().query.mediaLibrary.findFirst({
      where: eq(mediaLibrary.mediaId, item.mediaId),
    });
    if (existing) {
      if (
        existing.vendorId !== vendorId ||
        existing.originalStorageKey !== item.originalStorageKey
      ) {
        throw new AppError(409, 'MEDIA_ALREADY_EXISTS', 'This media ID is already in use.');
      }
      completedItems.push(formatMediaResponse(existing));
      continue;
    }

    const head = await storageService.headObject(item.originalStorageKey, bucket);
    if (!head) {
      throw new AppError(
        404,
        'STORAGE_OBJECT_NOT_FOUND',
        `File ${item.fileName} was not found in storage.`,
      );
    }

    const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(item.mimeType);
    const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(item.mimeType);

    if (!isImage && !isVideo) {
      throw new AppError(400, 'UNSUPPORTED_MEDIA_TYPE', `Unsupported MIME type: ${item.mimeType}`);
    }

    const mediaType: 'image' | 'video' = isImage ? 'image' : 'video';
    const maxBytes = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
    if (!head.contentLength || head.contentLength > maxBytes) {
      throw new AppError(400, 'FILE_TOO_LARGE', 'Uploaded file exceeds its size limit.');
    }
    if (head.contentType !== item.mimeType) {
      throw new AppError(400, 'UPLOAD_METADATA_MISMATCH', 'Uploaded file type does not match.');
    }
    const dirPrefix = mediaPrefix(vendorId, item.mediaId);
    const { filePath, bytes } = await downloadVerifiedMedia(item.originalStorageKey, maxBytes);

    let width: number | null;
    let height: number | null;
    let durationSeconds: number | null = null;

    try {
      if (bytes !== head.contentLength) {
        throw new AppError(400, 'UPLOAD_METADATA_MISMATCH', 'Uploaded file size changed.');
      }
      if (mediaType === 'image') {
        const metadata = await sharp(filePath).metadata();
        const expectedFormat =
          item.mimeType === 'image/jpeg' ? 'jpeg' : item.mimeType.split('/')[1];
        if (metadata.format !== expectedFormat) {
          throw new AppError(
            400,
            'UPLOAD_METADATA_MISMATCH',
            'Uploaded image type does not match.',
          );
        }
        const imgRes = await processImage(filePath, dirPrefix);
        width = imgRes.width;
        height = imgRes.height;
      } else {
        const vidRes = await processVideo(filePath, dirPrefix);
        width = vidRes.width;
        height = vidRes.height;
        durationSeconds = vidRes.durationSeconds;
      }

      const db = getDb();
      const [inserted] = await db
        .insert(mediaLibrary)
        .values({
          mediaId: item.mediaId,
          vendorId,
          createdBy: userId,
          mediaType,
          originalFileName: item.fileName,
          mimeType: head.contentType,
          fileSizeBytes: bytes,
          width,
          height,
          durationSeconds,
          originalStorageKey: item.originalStorageKey,
          status: 'active',
        })
        .returning();

      completedItems.push(formatMediaResponse(inserted));
    } finally {
      await unlink(filePath).catch(() => {});
    }
  }

  return completedItems;
}
