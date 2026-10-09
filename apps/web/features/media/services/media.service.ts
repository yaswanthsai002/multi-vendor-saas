import type { ListMediaFilters, MediaItem, MediaListResponse } from '../types/media.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export async function fetchMediaList(filters: ListMediaFilters = {}): Promise<MediaListResponse> {
  return makeApiRequest<MediaListResponse>({
    url: API_ENDPOINTS.vendor.media,
    method: 'GET',
    params: filters,
  });
}

export async function uploadMediaAsset(
  files: File[] | File,
): Promise<{ message: string; media: MediaItem; items?: MediaItem[] }> {
  const fileList = Array.isArray(files) ? files : [files];
  const formData = new FormData();
  for (const f of fileList) {
    formData.append('files', f);
  }

  return makeApiRequest<{ message: string; media: MediaItem; items?: MediaItem[] }>({
    url: API_ENDPOINTS.vendor.media,
    method: 'POST',
    data: formData,
    timeout: 120000, // 2 minutes for uploading & processing.
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function disableMediaAsset(
  mediaId: string,
): Promise<{ message: string; media: MediaItem }> {
  return makeApiRequest<{ message: string; media: MediaItem }>({
    url: `${API_ENDPOINTS.vendor.media}/${mediaId}/disable`,
    method: 'PATCH',
  });
}

export async function enableMediaAsset(
  mediaId: string,
): Promise<{ message: string; media: MediaItem }> {
  return makeApiRequest<{ message: string; media: MediaItem }>({
    url: `${API_ENDPOINTS.vendor.media}/${mediaId}/enable`,
    method: 'PATCH',
  });
}

export async function deleteMediaAsset(mediaId: string): Promise<void> {
  return makeApiRequest<void>({
    url: `${API_ENDPOINTS.vendor.media}/${mediaId}`,
    method: 'DELETE',
  });
}

export async function bulkMediaAction(
  action: 'enable' | 'disable' | 'delete',
  mediaIds: string[],
): Promise<{
  action: string;
  total: number;
  processed: number;
  failedCount: number;
  message: string;
}> {
  return makeApiRequest({
    url: `${API_ENDPOINTS.vendor.media}/bulk`,
    method: 'POST',
    data: { action, mediaIds },
  });
}
