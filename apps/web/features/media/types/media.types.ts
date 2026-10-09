export interface MediaItem {
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
  createdAt: string;
  updatedAt: string;
  disabledAt?: string | null;
}

export interface MediaListResponse {
  items: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: {
    all: number;
    image: number;
    video: number;
    disabled: number;
  };
}

export interface ListMediaFilters {
  status?: 'active' | 'disabled' | 'all';
  mediaType?: 'image' | 'video';
  search?: string;
  page?: number;
  limit?: number;
}

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export function validateMediaFiles(incoming: FileList | File[]): {
  valid: File[];
  errors: string[];
} {
  const valid: File[] = [];
  const errors: string[] = [];

  Array.from(incoming).forEach((f) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(f.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(f.type);

    if (!isImage && !isVideo) {
      errors.push(`${f.name}: Unsupported type (${f.type || 'unknown'})`);
      return;
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (f.size > maxSize) {
      const limitMb = Math.round(maxSize / (1024 * 1024));
      errors.push(`${f.name}: Exceeds ${limitMb}MB limit`);
      return;
    }

    valid.push(f);
  });

  return { valid, errors };
}
