'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { bulkImportService } from '../services/bulk-import.service';

import type { BulkImportEvent } from '../types/bulk-import.types';

import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { env } from '@/lib/env';
import { queryKeys } from '@/lib/query-keys';

export function useActiveBulkImport() {
  return useQuery({
    queryKey: queryKeys.bulkImports.active(),
    queryFn: () => bulkImportService.getActiveImport(),
    staleTime: 5000,
  });
}

export function useInitiateBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => bulkImportService.initiate(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bulkImports.active() });
    },
  });
}

export function useConfirmBulkUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) => bulkImportService.confirmUploaded(importId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bulkImports.active(), data);
    },
  });
}

export function useStartBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) => bulkImportService.startImport(importId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bulkImports.active(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    },
  });
}

export function useCancelBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) => bulkImportService.cancel(importId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.bulkImports.active(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.bulkImports.active() });
    },
  });
}

/**
 * Hook to subscribe to real-time Server-Sent Events (SSE) for a given bulk import session.
 */
export function useBulkImportSSE(
  importId: string | null | undefined,
  onEvent: (event: BulkImportEvent) => void,
) {
  const onEventRef = React.useRef(onEvent);

  React.useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  React.useEffect(() => {
    if (!importId) return;

    const baseUrl = env.NEXT_PUBLIC_API_URL;
    const sseUrl = `${baseUrl}${API_ENDPOINTS.vendor.bulkImports.events(importId)}`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as BulkImportEvent;
        onEventRef.current(parsed);
      } catch {
        // Ignore heartbeat or non-JSON messages
      }
    };

    return () => {
      eventSource.close();
    };
  }, [importId]);
}
