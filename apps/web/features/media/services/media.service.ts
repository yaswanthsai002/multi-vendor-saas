import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { putFileToStorage } from '@/lib/direct-upload';

import type { ListMediaFilters, MediaItem, MediaListResponse } from '../types/media.types';

export type MediaScope = 'vendor' | 'admin';
const mediaEndpoint = (scope: MediaScope) =>
  scope === 'admin' ? API_ENDPOINTS.admin.media.library : API_ENDPOINTS.vendor.media;

export async function fetchMediaList(
  filters: ListMediaFilters = {},
  scope: MediaScope | 'catalog' = 'vendor',
): Promise<MediaListResponse> {
  return makeApiRequest<MediaListResponse>({
    url: scope === 'catalog' ? API_ENDPOINTS.admin.media.catalog : mediaEndpoint(scope),
    method: 'GET',
    params: filters,
  });
}

export async function uploadMediaAsset(
  files: File[] | File,
  onProgress?: (percent: number) => void,
  scope: MediaScope = 'vendor',
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
    url: `${mediaEndpoint(scope)}/initiate`,
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
    url: `${mediaEndpoint(scope)}/complete`,
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
  scope: MediaScope = 'vendor',
): Promise<{ message: string; media: MediaItem }> {
  return makeApiRequest<{ message: string; media: MediaItem }>({
    url: `${mediaEndpoint(scope)}/${mediaId}/disable`,
    method: 'PATCH',
  });
}

export async function enableMediaAsset(
  mediaId: string,
  scope: MediaScope = 'vendor',
): Promise<{ message: string; media: MediaItem }> {
  return makeApiRequest<{ message: string; media: MediaItem }>({
    url: `${mediaEndpoint(scope)}/${mediaId}/enable`,
    method: 'PATCH',
  });
}

export async function deleteMediaAsset(
  mediaId: string,
  scope: MediaScope = 'vendor',
): Promise<void> {
  return makeApiRequest<void>({
    url: `${mediaEndpoint(scope)}/${mediaId}`,
    method: 'DELETE',
  });
}

export async function bulkMediaAction(
  action: 'enable' | 'disable' | 'delete',
  mediaIds: string[],
  scope: MediaScope = 'vendor',
): Promise<{
  action: string;
  total: number;
  processed: number;
  failedCount: number;
  failed: Array<{ mediaId: string; reason: string }>;
  message: string;
}> {
  return makeApiRequest({
    url: `${mediaEndpoint(scope)}/bulk`,
    method: 'POST',
    data: { action, mediaIds },
  });
}
