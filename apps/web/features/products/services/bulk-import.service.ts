import type { BulkImportState, InitiateBulkImportResponse } from '../types/bulk-import.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export const bulkImportService = {
  /**
   * Downloads the pre-formatted 2-sheet Excel (.xlsx) template with category dropdowns.
   */
  async downloadTemplate(): Promise<void> {
    const blob = await makeApiRequest<Blob>({
      url: API_ENDPOINTS.vendor.bulkImports.template,
      method: 'GET',
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Initiates a bulk import session and retrieves a presigned R2 upload URL.
   */
  async initiate(filename: string): Promise<InitiateBulkImportResponse> {
    const res = await makeApiRequest<{ success: boolean; data: InitiateBulkImportResponse }>({
      url: API_ENDPOINTS.vendor.bulkImports.initiate,
      method: 'POST',
      data: { filename },
    });
    return res.data;
  },

  /**
   * Uploads the Excel / CSV file directly to Cloudflare R2 via HTTP PUT.
   */
  async uploadToR2(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
      xhr.setRequestHeader(
        'Content-Type',
        file.type ||
          (isXlsx
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'),
      );

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Failed to upload file to storage (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading file to storage.'));
      };

      xhr.send(file);
    });
  },

  /**
   * Confirms to the backend API that the file has been uploaded to R2 and triggers validation.
   */
  async confirmUploaded(importId: string): Promise<BulkImportState> {
    const res = await makeApiRequest<{ success: boolean; data: BulkImportState }>({
      url: API_ENDPOINTS.vendor.bulkImports.uploaded(importId),
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Fetches the current active bulk import session for the authenticated vendor, if any.
   */
  async getActiveImport(): Promise<BulkImportState | null> {
    const res = await makeApiRequest<{ success: boolean; data: BulkImportState | null }>({
      url: API_ENDPOINTS.vendor.bulkImports.active,
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Retrieves a presigned download URL for the generated errors CSV report.
   */
  async getErrorsUrl(importId: string): Promise<{ url: string; expiresIn: number }> {
    const res = await makeApiRequest<{
      success: boolean;
      data: { url: string; expiresIn: number };
    }>({
      url: API_ENDPOINTS.vendor.bulkImports.errors(importId),
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Initiates the batch product insertion for all valid rows.
   */
  async startImport(importId: string): Promise<BulkImportState> {
    const res = await makeApiRequest<{ success: boolean; data: BulkImportState }>({
      url: API_ENDPOINTS.vendor.bulkImports.start(importId),
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Cancels the active bulk import session and cleans up resources.
   */
  async cancel(importId: string): Promise<{ success: boolean }> {
    const res = await makeApiRequest<{ success: boolean; data: { success: boolean } }>({
      url: API_ENDPOINTS.vendor.bulkImports.cancel(importId),
      method: 'DELETE',
    });
    return res.data;
  },
};
