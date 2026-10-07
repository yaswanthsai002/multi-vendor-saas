'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

import type { BulkImportStatus } from '../../types/bulk-import.types';

interface BulkUploadProgressProps {
  status: BulkImportStatus | 'UPLOADING';
  percent: number;
  statusText?: string;
  error?: string;
  totalRows?: number;
  processedRows?: number;
  readyRows?: number;
  needsAttentionRows?: number;
  importedRows?: number;
  onCancel?: () => void;
  onReset?: () => void;
  isCancelling?: boolean;
}

export function BulkUploadProgress({
  status,
  percent,
  statusText,
  error,
  totalRows = 0,
  processedRows = 0,
  readyRows = 0,
  needsAttentionRows = 0,
  importedRows = 0,
  onCancel,
  onReset,
  isCancelling = false,
}: BulkUploadProgressProps) {
  const getStageInfo = () => {
    switch (status) {
      case 'UPLOADING':
      case 'UPLOAD_PENDING':
        return {
          title: 'Uploading Spreadsheet to Storage',
          description: statusText || 'Directly uploading file bytes...',
          step: 1,
        };
      case 'VALIDATING':
        return {
          title: 'Validating Product Data & Categories',
          description:
            statusText ||
            `Validated ${processedRows} rows (${readyRows} ready, ${needsAttentionRows} need attention)...`,
          step: 2,
        };
      case 'IMPORTING':
        return {
          title: 'Importing Products into Catalog',
          description:
            statusText || `Creating products in database (${importedRows} of ${readyRows})...`,
          step: 3,
        };
      case 'FAILED':
        return {
          title: 'Import Failed',
          description: error || statusText || 'An unexpected error occurred during processing.',
          step: 0,
        };
      default:
        return {
          title: 'Processing bulk import...',
          description: statusText || 'Please wait while we process your request.',
          step: 2,
        };
    }
  };

  const stage = getStageInfo();
  const isFailed = status === 'FAILED';

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs space-y-6">
      {/* Pipeline Steps */}
      <div className="grid grid-cols-3 gap-2 pb-4 border-b border-border-default text-xs sm:text-sm font-medium">
        <div
          className={`flex items-center gap-2 ${
            stage.step >= 1 ? 'text-accent font-semibold' : 'text-text-tertiary'
          }`}
        >
          {stage.step > 1 ? (
            <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
          ) : stage.step === 1 ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-accent" />
          ) : (
            <div className="h-4 w-4 rounded-full border border-border-strong flex items-center justify-center text-[10px]">
              1
            </div>
          )}
          <span className="truncate">1. Storage Upload</span>
        </div>

        <div
          className={`flex items-center gap-2 ${
            stage.step >= 2 ? 'text-accent font-semibold' : 'text-text-tertiary'
          }`}
        >
          {stage.step > 2 ? (
            <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
          ) : stage.step === 2 ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-accent" />
          ) : (
            <div className="h-4 w-4 rounded-full border border-border-strong flex items-center justify-center text-[10px]">
              2
            </div>
          )}
          <span className="truncate">2. Validation</span>
        </div>

        <div
          className={`flex items-center gap-2 ${
            stage.step >= 3 ? 'text-accent font-semibold' : 'text-text-tertiary'
          }`}
        >
          {stage.step > 3 ? (
            <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
          ) : stage.step === 3 ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-accent" />
          ) : (
            <div className="h-4 w-4 rounded-full border border-border-strong flex items-center justify-center text-[10px]">
              3
            </div>
          )}
          <span className="truncate">3. Insertion</span>
        </div>
      </div>

      {/* Main Status Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            {!isFailed && <Loader2 className="h-5 w-5 animate-spin text-accent shrink-0" />}
            {isFailed && <XCircle className="h-5 w-5 text-danger-500 shrink-0" />}
            <span>{stage.title}</span>
          </h3>
          <p className="text-sm text-text-secondary">{stage.description}</p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-2xl font-black tracking-tight text-text-primary">
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-surface-raised overflow-hidden border border-border-default">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isFailed ? 'bg-danger-500' : 'bg-accent'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {/* Real-time stats row if validating or importing */}
      {totalRows > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-raised border border-border-default text-xs">
          <div>
            <span className="text-text-tertiary block">Total Rows</span>
            <span className="text-sm font-bold text-text-primary">
              {totalRows.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary block">Processed</span>
            <span className="text-sm font-bold text-text-primary">
              {processedRows.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary block">Ready</span>
            <span className="text-sm font-bold text-success-500">{readyRows.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-text-tertiary block">Needs Attention</span>
            <span className="text-sm font-bold text-warning-500">
              {needsAttentionRows.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isFailed ? (
        <div className="flex items-center justify-between pt-2 border-t border-border-default/60">
          <p className="text-xs text-text-tertiary">
            Please check your file formatting and storage configuration, then try again.
          </p>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Upload New File
            </button>
          )}
        </div>
      ) : onCancel && status !== 'COMPLETED' ? (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-danger-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Import'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
