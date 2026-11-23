'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/query-keys';

import {
  bulkMediaAction,
  deleteMediaAsset,
  disableMediaAsset,
  enableMediaAsset,
  fetchMediaList,
  uploadMediaAsset,
  type MediaScope,
} from '../services/media.service';

import type { ListMediaFilters } from '../types/media.types';

export function useMediaList(
  filters: ListMediaFilters = {},
  scope: MediaScope | 'catalog' = 'vendor',
) {
  return useQuery({
    queryKey:
      scope === 'catalog'
        ? queryKeys.admin.media.catalog(filters)
        : scope === 'admin'
          ? queryKeys.admin.media.list(filters)
          : queryKeys.media.list(filters),
    queryFn: () => fetchMediaList(filters, scope),
    placeholderData: keepPreviousData,
  });
}

export function useUploadMedia(scope: MediaScope = 'vendor') {
  const queryClient = useQueryClient();
  const [progress, setProgress] = React.useState(0);

  const mutation = useMutation({
    mutationFn: (files: File | File[]) => uploadMediaAsset(files, setProgress, scope),
    onMutate: () => setProgress(0),
    onSuccess: async (data) => {
      setProgress(100);
      await queryClient.invalidateQueries({
        queryKey: scope === 'admin' ? queryKeys.admin.media.all() : queryKeys.media.all(),
      });
      toast.success(data.message || 'Media uploaded successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload media.');
    },
  });
  return { ...mutation, progress };
}

export function useDisableMedia(scope: MediaScope = 'vendor') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => disableMediaAsset(mediaId, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scope === 'admin' ? queryKeys.admin.media.all() : queryKeys.media.all(),
      });
      toast.success(
        scope === 'admin' ? 'Media disabled.' : 'Media disabled and unlinked from products.',
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to disable media.');
    },
  });
}

export function useEnableMedia(scope: MediaScope = 'vendor') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => enableMediaAsset(mediaId, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scope === 'admin' ? queryKeys.admin.media.all() : queryKeys.media.all(),
      });
      toast.success(
        scope === 'admin' ? 'Media enabled.' : 'Media enabled and ready for product assignment.',
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to enable media.');
    },
  });
}

export function useDeleteMedia(scope: MediaScope = 'vendor') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => deleteMediaAsset(mediaId, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scope === 'admin' ? queryKeys.admin.media.all() : queryKeys.media.all(),
      });
      toast.success('Media permanently deleted.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete media.');
    },
  });
}

export function useBulkMediaAction(scope: MediaScope = 'vendor') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      mediaIds,
    }: {
      action: 'enable' | 'disable' | 'delete';
      mediaIds: string[];
    }) => bulkMediaAction(action, mediaIds, scope),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: scope === 'admin' ? queryKeys.admin.media.all() : queryKeys.media.all(),
      });
      if (data.failedCount) toast.error(`${data.failedCount} assets could not be changed.`);
      else toast.success(data.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk action failed.');
    },
  });
}
