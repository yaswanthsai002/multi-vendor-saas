'use client';

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import * as React from 'react';

import { bulkImportService } from '../../services/bulk-import.service';

interface BulkUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

const TEMPLATE_COLUMNS = [
  {
    key: 'name',
    name: 'Product Name',
    required: true,
    type: 'Text',
    example: 'Wireless Noise Cancelling Headphones',
    description: 'Unique product title (2–255 characters).',
  },
  {
    key: 'category',
    name: 'Category',
    required: true,
    type: 'Dropdown / Text',
    example: 'Electronics > Audio > Headphones',
    description: 'Select directly from the in-cell dropdown (Sheet 1) or taxonomy path (Sheet 2).',
  },
  {
    key: 'price',
    name: 'Price',
    required: true,
    type: 'Decimal',
    example: '199.99',
    description: 'Non-negative selling price without currency symbols.',
  },
  {
    key: 'stock',
    name: 'Stock Quantity',
    required: true,
    type: 'Integer',
    example: '50',
    description: 'Initial available inventory count (0 or greater).',
  },
  {
    key: 'description',
    name: 'Description',
    required: true,
    type: 'Text',
    example: 'Premium wireless over-ear headphones with 30hr battery life...',
    description: 'Detailed product summary (minimum 10 characters).',
  },
];

export function BulkUploadDropzone({ onFileSelect, isUploading = false }: BulkUploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragError, setDragError] = React.useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloadingTemplate(true);
      await bulkImportService.downloadTemplate();
    } catch {
      setDragError('Failed to download Excel template. Please try again.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const validateAndSelect = (file: File) => {
    setDragError(null);
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
      setDragError('Please select a valid Excel (.xlsx) or CSV (.csv) file.');
      return;
    }
    if (file.size === 0) {
      setDragError('The selected file is empty.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1 & 2 Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Step 1: Download Template Card */}
        <div className="md:col-span-5 p-6 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Step 1: Download Template
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-accent shrink-0" />
                <span>Pre-formatted Excel Template</span>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Includes category dropdowns directly in Column E, plus an active category reference
                sheet so your uploads never fail validation.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-text-secondary pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                <span>2-Sheet Excel workbook (`.xlsx`)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                <span>Live category dropdowns & path validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                <span>Sample data row included for guidance</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={isDownloadingTemplate || isUploading}
            onClick={handleDownloadTemplate}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-surface-raised border border-border-strong hover:border-accent hover:text-accent text-text-primary shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDownloadingTemplate ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <Download className="h-4 w-4 text-accent" />
            )}
            <span>
              {isDownloadingTemplate ? 'Generating Template...' : 'Download Excel Template (.xlsx)'}
            </span>
          </button>
        </div>

        {/* Step 2: Upload Dropzone Card */}
        <div className="md:col-span-7 flex flex-col">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative flex-1 flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
              isDragging
                ? 'border-accent bg-accent/5 scale-[1.01] shadow-md'
                : 'border-border-default hover:border-accent/60 bg-surface dark:bg-surface-subtle hover:bg-surface-hover shadow-xs'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Upload Excel or CSV file"
            />

            <div className="flex items-center gap-2.5 mb-3 self-start">
              <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Step 2: Upload Populated File
              </span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-surface-raised flex items-center justify-center shadow-xs mb-3 border border-border-default group-hover:border-accent/30 transition-colors">
              <UploadCloud className="h-7 w-7 text-accent" />
            </div>

            <h3 className="text-base font-bold text-text-primary mb-1">
              Drag and drop your spreadsheet here
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed">
              Upload your completed <strong className="text-text-primary">.xlsx</strong> or{' '}
              <strong className="text-text-primary">.csv</strong> file to validate and import your
              products.
            </p>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active shadow-xs transition-colors cursor-pointer"
            >
              Browse Files
            </button>

            <div className="flex items-center gap-3 text-[11px] text-text-tertiary mt-4">
              <span>Accepted: .XLSX, .CSV</span>
              <span>•</span>
              <span>Max file size: 50MB</span>
            </div>
          </div>
        </div>
      </div>

      {dragError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-danger/30 bg-danger-subtle text-danger text-xs font-medium animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{dragError}</span>
        </div>
      )}

      {/* Spreadsheet Columns Reference Table */}
      <div className="rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span>Spreadsheet Field Specifications</span>
          </div>
          <span className="text-xs text-text-tertiary">5 Required Columns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-default bg-surface-subtle/50 text-text-secondary font-semibold">
                <th className="py-3 px-4 sm:px-5">Column Name</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4 sm:px-5">Guidelines & Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60">
              {TEMPLATE_COLUMNS.map((col) => (
                <tr
                  key={col.key}
                  className="hover:bg-surface-hover/50 transition-colors text-text-secondary"
                >
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default font-mono text-text-primary font-semibold text-[11px]">
                        {col.key}
                      </code>
                      <span className="font-medium text-text-primary">{col.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-subtle text-accent border border-accent/20">
                      Required
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-tertiary font-mono text-[11px]">
                    {col.type}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <p className="text-text-secondary">{col.description}</p>
                    <p className="text-text-tertiary text-[11px] mt-0.5 font-mono">
                      Example: {col.example}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
