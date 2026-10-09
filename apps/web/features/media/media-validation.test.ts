import { describe, expect, it } from 'vitest';

import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, validateMediaFiles } from './types/media.types';

describe('validateMediaFiles', () => {
  it('accepts valid images within size limit', () => {
    const validImage = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const { valid, errors } = validateMediaFiles([validImage]);

    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(valid[0]?.name).toBe('photo.png');
  });

  it('accepts valid videos within size limit', () => {
    const validVideo = new File(['video-bytes'], 'sample.mp4', { type: 'video/mp4' });
    const { valid, errors } = validateMediaFiles([validVideo]);

    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });

  it('rejects unsupported file formats', () => {
    const pdfFile = new File(['pdf-bytes'], 'doc.pdf', { type: 'application/pdf' });
    const { valid, errors } = validateMediaFiles([pdfFile]);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Unsupported type');
  });

  it('rejects oversized image files (>10MB)', () => {
    const bigImage = new File(['x'.repeat(100)], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigImage, 'size', { value: MAX_IMAGE_SIZE + 1024 });

    const { valid, errors } = validateMediaFiles([bigImage]);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Exceeds 10MB limit');
  });

  it('rejects oversized video files (>100MB)', () => {
    const bigVideo = new File(['x'.repeat(100)], 'huge.mp4', { type: 'video/mp4' });
    Object.defineProperty(bigVideo, 'size', { value: MAX_VIDEO_SIZE + 1024 });

    const { valid, errors } = validateMediaFiles([bigVideo]);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Exceeds 100MB limit');
  });

  it('processes multiple files partitioning valid and invalid', () => {
    const validImage = new File(['img'], 'photo.webp', { type: 'image/webp' });
    const invalidDoc = new File(['doc'], 'notes.txt', { type: 'text/plain' });

    const { valid, errors } = validateMediaFiles([validImage, invalidDoc]);

    expect(valid).toHaveLength(1);
    expect(valid[0]?.name).toBe('photo.webp');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('notes.txt');
  });
});
