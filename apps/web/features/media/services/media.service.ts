import type { ListMediaFilters, MediaItem, MediaListResponse } from '../types/media.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { putFileToStorage } from '@/lib/direct-upload';

export async function fetchMediaList(
  filters: ListMediaFilters = {},
  scope: 'vendor' | 'catalog' = 'vendor',
): Promise<MediaListResponse> {
  return makeApiRequest<MediaListResponse>({
    url: scope === 'catalog' ? API_ENDPOINTS.admin.media.catalog : API_ENDPOINTS.vendor.media,
    method: 'GET',
    params: filters,
  });
}

export async function uploadMediaAsset(
  files: File[] | File,
  onProgress?: (percent: number) => void,
): Promise<{ message: string; media: MediaItem; items?: MediaItem[] }> {
  const fileList = Array.isArray(files) ? files : [files];

  // 1. Send metadata only to API to obtain presigned direct-to-storage upload URLs
  const filePayload = fileList.map((f) => ({
    fileName: f.name,
    fileSizeBytes: f.size,
    mimeType: f.type || 'application/octet-stream',
  }));

  const initiateRes = await makeApiRequest<{
    success: boolean;
    items: Array<{
      mediaId: string;
      uploadUrl: string;
      originalStorageKey: string;
      fileName: string;
      fileSizeBytes: number;
      mimeType: string;
    }>;
  }>({
    url: API_ENDPOINTS.vendor.mediaInitiate,
    method: 'POST',
    data: { files: filePayload },
  });

  // 2. Upload raw file binary directly to storage (zero binary bytes routed through API server)
  const uploadedBytes = fileList.map(() => 0);
  const totalBytes = fileList.reduce((total, file) => total + file.size, 0);
  let lastPercent = -1;
  const reportProgress = () => {
    if (totalBytes > 0) {
      const loadedBytes = uploadedBytes.reduce((total, bytes) => total + bytes, 0);
      const percent = Math.round((loadedBytes / totalBytes) * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        onProgress?.(percent);
      }
    }
  };
  await Promise.all(
    fileList.map((file, idx) => {
      const item = initiateRes.items[idx];
      return putFileToStorage(item.uploadUrl, file, (loaded) => {
        uploadedBytes[idx] = loaded;
        reportProgress();
      });
    }),
  );

  // 3. Send metadata only to complete processing and persist MediaLibrary record
  return makeApiRequest<{ message: string; media: MediaItem; items?: MediaItem[] }>({
    url: API_ENDPOINTS.vendor.mediaComplete,
    method: 'POST',
    data: {
      items: initiateRes.items.map((item) => ({
        mediaId: item.mediaId,
        originalStorageKey: item.originalStorageKey,
        fileName: item.fileName,
        fileSizeBytes: item.fileSizeBytes,
        mimeType: item.mimeType,
      })),
    },
    timeout: 120000,
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
