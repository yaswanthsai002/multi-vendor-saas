'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  bulkMediaAction,
  deleteMediaAsset,
  disableMediaAsset,
  enableMediaAsset,
  fetchMediaList,
  uploadMediaAsset,
} from '../services/media.service';

import type { ListMediaFilters } from '../types/media.types';

import { queryKeys } from '@/lib/query-keys';

export function useMediaList(filters: ListMediaFilters = {}) {
  return useQuery({
    queryKey: queryKeys.media.list(filters),
    queryFn: () => fetchMediaList(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File | File[]) => uploadMediaAsset(files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success(data.message || 'Media uploaded successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload media.');
    },
  });
}

export function useDisableMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => disableMediaAsset(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success('Media disabled and unlinked from products.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to disable media.');
    },
  });
}

export function useEnableMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => enableMediaAsset(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success('Media enabled and ready for product assignment.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to enable media.');
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => deleteMediaAsset(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success('Media permanently deleted.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete media.');
    },
  });
}

export function useBulkMediaAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      mediaIds,
    }: {
      action: 'enable' | 'disable' | 'delete';
      mediaIds: string[];
    }) => bulkMediaAction(action, mediaIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success(data.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk action failed.');
    },
  });
}
