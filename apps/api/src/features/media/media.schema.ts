import { z } from 'zod';

export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export const mediaIdParamSchema = z.object({
  mediaId: z.string().uuid('Invalid mediaId UUID format.'),
});

export const listMediaQuerySchema = z.object({
  status: z.enum(['active', 'disabled', 'all']).default('active'),
  mediaType: z.enum(['image', 'video']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const bulkMediaActionSchema = z.object({
  action: z.enum(['enable', 'disable', 'delete']),
  mediaIds: z
    .array(z.string().uuid('Invalid mediaId format.'))
    .min(1, 'At least one media ID is required.')
    .max(100, 'Cannot perform bulk action on more than 100 media assets at once.'),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type MediaIdParams = z.infer<typeof mediaIdParamSchema>;
export type BulkMediaActionInput = z.infer<typeof bulkMediaActionSchema>;
