'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  Loader2,
  PackageCheck,
  Trash2,
} from 'lucide-react';
import * as React from 'react';

import type { BulkImportState } from '../../types/bulk-import.types';

interface BulkUploadSummaryProps {
  state: BulkImportState;
  onStartImport: () => void;
  onCancelImport: () => void;
  onDownloadErrors: () => void;
  isStarting?: boolean;
  isCancelling?: boolean;
  isDownloadingErrors?: boolean;
}

export function BulkUploadSummary({
  state,
  onStartImport,
  onCancelImport,
  onDownloadErrors,
  isStarting = false,
  isCancelling = false,
  isDownloadingErrors = false,
}: BulkUploadSummaryProps) {
  const hasErrors = state.needsAttentionRows > 0;
  const canImport = state.readyRows > 0;
  const total = Math.max(1, state.totalRows);
  const passRate = ((state.readyRows / total) * 100).toFixed(1);
  const isXlsx = state.filename?.toLowerCase().endsWith('.xlsx');

  return (
    <div className="space-y-6">
      {/* File & Validation Ingestion Header Card */}
      <div className="p-6 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-surface-raised border border-border-default flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary tracking-tight truncate max-w-xs sm:max-w-md">
                  {state.filename}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised border border-border-default text-text-tertiary font-mono uppercase">
                  {isXlsx ? 'Excel' : 'CSV'}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Processed{' '}
                <strong className="text-text-primary">{state.totalRows.toLocaleString()}</strong>{' '}
                total rows • Validation completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                hasErrors
                  ? 'bg-warning-subtle text-warning border border-warning/30'
                  : 'bg-success-subtle text-success border border-success/30'
              }`}
            >
              {hasErrors ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>{passRate}% Ready for Import</span>
            </span>
          </div>
        </div>

        {/* Segmented Readiness Meter */}
        <div className="space-y-2 pt-2 border-t border-border-default/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Dataset Validation Breakdown</span>
            <span className="text-text-tertiary">
              {state.readyRows.toLocaleString()} of {state.totalRows.toLocaleString()} rows verified
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-surface-raised border border-border-default flex overflow-hidden p-0.5 gap-0.5">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${(state.readyRows / total) * 100}%` }}
              title={`${state.readyRows} rows ready`}
            />
            {hasErrors && (
              <div
                className="h-full rounded-full bg-warning transition-all duration-500"
                style={{ width: `${(state.needsAttentionRows / total) * 100}%` }}
                title={`${state.needsAttentionRows} rows flagged`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Review Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Ready to Import Card */}
        <div className="p-6 rounded-2xl border border-success/30 bg-success-subtle/30 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success">
                <PackageCheck className="h-4 w-4" />
                <span>Ready for Ingestion</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-subtle text-success border border-success/30">
                {state.readyRows.toLocaleString()} items
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tight text-text-primary">
                {state.readyRows.toLocaleString()}
                <span className="text-sm font-normal text-text-secondary ml-2">Valid Products</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                These products met all schema constraints, pricing decimals, and taxonomy category
                assignments.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-text-secondary pt-2 border-t border-success/20">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>
                  Will be saved as <strong className="text-text-primary">Draft</strong> in your
                  catalog
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>Automatically mapped to store categories & breadcrumbs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>Inventory stock counts configured immediately</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-surface-raised border border-border-default/60 text-[11px] text-text-tertiary flex items-center gap-2">
            <Layers className="h-4 w-4 text-text-tertiary shrink-0" />
            <span>Ready to proceed whenever you confirm below.</span>
          </div>
        </div>

        {/* Needs Attention / Flagged Card */}
        {hasErrors ? (
          <div className="p-6 rounded-2xl border border-warning/30 bg-warning-subtle/30 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Skipped Due to Errors</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning-subtle text-warning border border-warning/30">
                  {state.needsAttentionRows.toLocaleString()}{' '}
                  {state.needsAttentionRows === 1 ? 'row' : 'rows'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-text-primary">
                  {state.needsAttentionRows.toLocaleString()}
                  <span className="text-sm font-normal text-text-secondary ml-2">
                    {state.needsAttentionRows === 1 ? 'Row Flagged' : 'Rows Flagged'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  These rows failed required field or category validation checks and will not be
                  imported during this run.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border-default space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text-primary block">
                    Download Annotated Error Log
                  </span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Get a pre-filtered spreadsheet containing only the flagged rows and exact error
                    descriptions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onDownloadErrors}
                  disabled={isDownloadingErrors}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface border border-warning/40 text-text-primary hover:border-warning hover:bg-surface-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingErrors ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-warning" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-warning" />
                  )}
                  <span>{isDownloadingErrors ? 'Preparing Report...' : 'Download Errors CSV'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-text-tertiary">
              Tip: You can import the valid {state.readyRows} products now, and upload the fixed
              errors separately later.
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs flex flex-col justify-center items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-success-subtle text-success flex items-center justify-center border border-success/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="text-base font-bold text-text-primary">100% Clean Validation</h4>
              <p className="text-xs text-text-secondary">
                All {state.totalRows.toLocaleString()} rows in your file passed validation with zero
                errors.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Structured Confirmation Action Bar */}
      <div className="p-5 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-text-primary block">
            Ready to proceed with import?
          </span>
          <p className="text-xs text-text-secondary">
            {canImport
              ? `Creating ${state.readyRows.toLocaleString()} products in your vendor store.`
              : 'No valid products found to import.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancelImport}
            disabled={isCancelling || isStarting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-danger transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isCancelling ? 'Cancelling...' : 'Discard & Start Over'}</span>
          </button>

          <button
            type="button"
            onClick={onStartImport}
            disabled={!canImport || isStarting || isCancelling}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-on-accent" />
                <span>Starting Import...</span>
              </>
            ) : (
              <>
                <span>Import {state.readyRows.toLocaleString()} Products</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
