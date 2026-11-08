import sharp from 'sharp';

import { STORAGE_BUCKETS, storageService } from '../storage/storage.service.js';

export interface ImageProcessingResult {
  width: number | null;
  height: number | null;
}

export async function processImage(
  buffer: Buffer,
  storagePrefix: string,
): Promise<ImageProcessingResult> {
  const bucket = STORAGE_BUCKETS.productMedia;
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;
  const thumbnailBuffer = await sharp(buffer)
    .resize(150, 150, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();
  await storageService.putObject(
    `${storagePrefix}/thumbnail.webp`,
    thumbnailBuffer,
    'image/webp',
    bucket,
  );
  const mediumBuffer = await sharp(buffer)
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  await storageService.putObject(
    `${storagePrefix}/medium.webp`,
    mediumBuffer,
    'image/webp',
    bucket,
  );
  const largeBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  await storageService.putObject(`${storagePrefix}/large.webp`, largeBuffer, 'image/webp', bucket);
  return { width, height };
}
