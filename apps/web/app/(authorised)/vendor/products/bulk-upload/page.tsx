'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import type { BulkImportEvent, BulkImportState } from '@/features/products/types/bulk-import.types';

import { BulkUploadCompleted } from '@/features/products/components/bulk-upload/bulk-upload-completed';
import { BulkUploadDropzone } from '@/features/products/components/bulk-upload/bulk-upload-dropzone';
import { BulkUploadProgress } from '@/features/products/components/bulk-upload/bulk-upload-progress';
import { BulkUploadSummary } from '@/features/products/components/bulk-upload/bulk-upload-summary';
import {
  useActiveBulkImport,
  useBulkImportSSE,
  useCancelBulkImport,
  useConfirmBulkUpload,
  useInitiateBulkImport,
  useStartBulkImport,
} from '@/features/products/hooks/use-bulk-import';
import { bulkImportService } from '@/features/products/services/bulk-import.service';

export default function BulkUploadPage() {
  const { data: activeImport, isLoading, refetch } = useActiveBulkImport();

  const initiateMutation = useInitiateBulkImport();
  const confirmMutation = useConfirmBulkUpload();
  const startMutation = useStartBulkImport();
  const cancelMutation = useCancelBulkImport();

  // Local state for client upload progress & live events
  const [localUploadPercent, setLocalUploadPercent] = React.useState(0);
  const [isUploadingToR2, setIsUploadingToR2] = React.useState(false);
  const [liveEvent, setLiveEvent] = React.useState<BulkImportEvent | null>(null);
  const [isDownloadingErrors, setIsDownloadingErrors] = React.useState(false);

  // Sync state from query or live event
  const currentImportState: BulkImportState | null = React.useMemo(() => {
    if (!activeImport) return null;
    if (!liveEvent || liveEvent.importId !== activeImport.importId) {
      return activeImport;
    }
    return {
      ...activeImport,
      status: liveEvent.status,
      totalRows: liveEvent.totalRows ?? activeImport.totalRows,
      processedRows: liveEvent.processedRows ?? activeImport.processedRows,
      readyRows: liveEvent.readyRows ?? activeImport.readyRows,
      needsAttentionRows: liveEvent.needsAttentionRows ?? activeImport.needsAttentionRows,
      importedRows: liveEvent.importedRows ?? activeImport.importedRows,
      errorsUrl: liveEvent.errorsUrl ?? activeImport.errorsUrl,
    };
  }, [activeImport, liveEvent]);

  // Subscribe to live SSE updates for active import session
  useBulkImportSSE(activeImport?.importId, (event) => {
    setLiveEvent(event);
    if (
      event.status === 'NEEDS_REVIEW' ||
      event.status === 'COMPLETED' ||
      event.status === 'FAILED'
    ) {
      refetch();
    }
  });

  // Handle direct file selection & direct upload to R2
  const handleFileSelect = async (file: File) => {
    try {
      setIsUploadingToR2(true);
      setLocalUploadPercent(0);

      // 1. Initiate session on API and acquire lock
      const session = await initiateMutation.mutateAsync(file.name);

      // 2. Direct upload to R2 storage
      await bulkImportService.uploadToR2(session.uploadUrl, file, (percent) => {
        setLocalUploadPercent(percent);
      });

      // 3. Confirm upload to API to trigger background validation
      await confirmMutation.mutateAsync(session.importId);
      refetch();
    } catch {
      refetch();
    } finally {
      setIsUploadingToR2(false);
    }
  };

  const handleStartImport = async () => {
    if (!currentImportState) return;
    await startMutation.mutateAsync(currentImportState.importId);
  };

  const handleCancelImport = async () => {
    if (!currentImportState) return;
    await cancelMutation.mutateAsync(currentImportState.importId);
    setLiveEvent(null);
  };

  const handleDownloadErrors = async () => {
    if (!currentImportState) return;
    try {
      setIsDownloadingErrors(true);
      if (currentImportState.errorsUrl) {
        window.open(currentImportState.errorsUrl, '_blank');
      } else {
        const { url } = await bulkImportService.getErrorsUrl(currentImportState.importId);
        window.open(url, '_blank');
      }
    } catch {
      // Non-fatal
    } finally {
      setIsDownloadingErrors(false);
    }
  };

  const handleReset = async () => {
    if (currentImportState) {
      try {
        await cancelMutation.mutateAsync(currentImportState.importId);
      } catch {
        // Non-fatal
      }
    }
    setLiveEvent(null);
    setLocalUploadPercent(0);
    refetch();
  };

  const status = isUploadingToR2 ? 'UPLOADING' : (currentImportState?.status ?? 'UPLOAD_PENDING');

  const progressPercent = isUploadingToR2
    ? localUploadPercent
    : (liveEvent?.percent ?? (status === 'COMPLETED' ? 100 : 0));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/vendor/products"
          className="p-2.5 rounded-xl border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          aria-label="Back to products catalog"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Bulk Product Upload
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Quickly import products in bulk using our pre-formatted 2-sheet Excel template or CSV
            file.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-text-secondary text-sm">Loading import status...</div>
      ) : !currentImportState && !isUploadingToR2 ? (
        /* Dropzone view */
        <BulkUploadDropzone
          onFileSelect={handleFileSelect}
          isUploading={initiateMutation.isPending || isUploadingToR2}
        />
      ) : isUploadingToR2 ||
        status === 'VALIDATING' ||
        status === 'IMPORTING' ||
        status === 'FAILED' ? (
        /* Active progress view */
        <BulkUploadProgress
          status={status}
          percent={progressPercent}
          statusText={liveEvent?.statusText}
          error={currentImportState?.error}
          totalRows={currentImportState?.totalRows}
          processedRows={currentImportState?.processedRows}
          readyRows={currentImportState?.readyRows}
          needsAttentionRows={currentImportState?.needsAttentionRows}
          importedRows={currentImportState?.importedRows}
          onCancel={handleCancelImport}
          onReset={handleReset}
          isCancelling={cancelMutation.isPending}
        />
      ) : status === 'NEEDS_REVIEW' && currentImportState ? (
        /* Review and confirmation view */
        <BulkUploadSummary
          state={currentImportState}
          onStartImport={handleStartImport}
          onCancelImport={handleCancelImport}
          onDownloadErrors={handleDownloadErrors}
          isStarting={startMutation.isPending}
          isCancelling={cancelMutation.isPending}
          isDownloadingErrors={isDownloadingErrors}
        />
      ) : status === 'COMPLETED' && currentImportState ? (
        /* Completed view */
        <BulkUploadCompleted state={currentImportState} onReset={handleReset} />
      ) : null}
    </div>
  );
}
