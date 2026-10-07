export type BulkImportStatus =
  'UPLOADING' | 'VALIDATING' | 'NEEDS_REVIEW' | 'IMPORTING' | 'COMPLETED' | 'FAILED';

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

export interface CsvProductRow {
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
}

export interface ValidatedRowResult {
  rowNumber: number;
  isValid: boolean;
  data: CsvProductRow;
  categoryId?: string;
  errors: string[];
}
