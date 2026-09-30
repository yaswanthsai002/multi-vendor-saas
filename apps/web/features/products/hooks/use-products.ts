'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  archiveVendorProduct,
  bulkProductAction,
  deleteVendorProduct,
  fetchVendorProducts,
  restoreVendorProduct,
  updateVendorProduct,
} from '../services/product.service';

import type { BulkProductAction, ProductListFilters } from '../types/product.types';

import { queryKeys } from '@/lib/query-keys';

export function useVendorProducts(filters: ProductListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => fetchVendorProducts(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: {
        name?: string;
        description?: string;
        price?: string;
        stock?: number;
        published?: boolean;
        productImageId?: string | null;
      };
    }) => updateVendorProduct(productId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      toast.success(res.message || 'Product updated.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update product.');
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => archiveVendorProduct(productId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      toast.success(res.message || 'Product archived.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive product.');
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => restoreVendorProduct(productId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      toast.success(res.message || 'Product restored.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restore product.');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteVendorProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      toast.success('Product deleted permanently.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete product.');
    },
  });
}

export function useBulkProductAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, productIds }: { action: BulkProductAction; productIds: string[] }) =>
      bulkProductAction(action, productIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      if (data.failedCount > 0 && data.processed > 0) {
        toast.warning(data.message);
      } else if (data.failedCount > 0 && data.processed === 0) {
        toast.error(data.failed[0]?.reason || data.message);
      } else {
        toast.success(data.message);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk product action failed.');
    },
  });
}
