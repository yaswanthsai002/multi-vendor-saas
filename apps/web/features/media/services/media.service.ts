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

async function uploadBinaryDirectly(uploadUrl: string, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage direct upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during storage upload.'));
    xhr.send(file);
  });
}

export async function uploadMediaAsset(
  files: File[] | File,
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
  await Promise.all(
    fileList.map((file, idx) => {
      const item = initiateRes.items[idx];
      return uploadBinaryDirectly(item.uploadUrl, file);
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
