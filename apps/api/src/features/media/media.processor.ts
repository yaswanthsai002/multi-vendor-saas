import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';

import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';
export { processImage } from '../../shared/media/image-processor.js';
export type { ImageProcessingResult } from '../../shared/media/image-processor.js';

// register static cross-platform ffmpeg & ffprobe binaries if available
if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller && ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

export interface VideoProcessingResult {
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
}

/**
 * Probes video metadata (width, height, duration) and generates a representative poster frame as WebP.
 */
export async function processVideo(
  videoFilePath: string,
  storagePrefix: string,
): Promise<VideoProcessingResult> {
  const bucket = STORAGE_BUCKETS.productMedia;

  // 1. Probe video metadata
  const metadata = await new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
    ffmpeg.ffprobe(videoFilePath, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });

  const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
  const width = videoStream?.width ?? null;
  const height = videoStream?.height ?? null;
  const rawDuration = metadata.format.duration;
  const durationSeconds = rawDuration ? Math.round(Number(rawDuration)) : null;

  // 2. Generate poster frame at 1s (or 0s if video is shorter than 1s)
  const seekTime = durationSeconds && durationSeconds > 1 ? 1 : 0;
  const tempPosterPath = join(tmpdir(), `poster-${randomUUID()}.png`);

  // extract single frame with seekInput and output directly avoiding fluent-ffmpeg path joining bugs
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoFilePath)
      .seekInput(seekTime)
      .frames(1)
      .output(tempPosterPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  try {
    // 3. Convert extracted poster frame to webp via sharp and save to R2
    const posterWebpBuffer = await sharp(tempPosterPath).webp({ quality: 85 }).toBuffer();
    await storageService.putObject(
      `${storagePrefix}/poster.webp`,
      posterWebpBuffer,
      'image/webp',
      bucket,
    );
  } finally {
    // Clean up temporary screenshot
    await unlink(tempPosterPath).catch(() => {});
  }

  return { width, height, durationSeconds };
}
