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
