export type BulkImportStatus =
  'UPLOAD_PENDING' | 'VALIDATING' | 'NEEDS_REVIEW' | 'IMPORTING' | 'COMPLETED' | 'FAILED';

export interface BulkImportState {
  importId: string;
  vendorId: string;
  status: BulkImportStatus;
  filename: string;
  objectKey: string;
  totalRows: number;
  processedRows: number;
  readyRows: number;
  needsAttentionRows: number;
  importedRows: number;
  errorsKey?: string;
  errorsUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkImportEvent {
  importId: string;
  status: BulkImportStatus;
  stage?: string;
  statusText?: string;
  totalRows: number;
  processedRows: number;
  readyRows: number;
  needsAttentionRows: number;
  importedRows: number;
  percent: number;
  errorsUrl?: string;
}

export interface InitiateBulkImportResponse {
  importId: string;
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}
