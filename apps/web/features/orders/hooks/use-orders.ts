'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  fetchVendorOrderDetail,
  fetchVendorOrders,
  updateVendorOrderStatus,
} from '../services/order.service';

import type { UpdateOrderStatusInput, VendorOrdersFilters } from '../types/order.types';

import { queryKeys } from '@/lib/query-keys';

export function useVendorOrders(filters: VendorOrdersFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => fetchVendorOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVendorOrderDetail(vendorOrderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(vendorOrderId),
    queryFn: () => fetchVendorOrderDetail(vendorOrderId),
    enabled: Boolean(vendorOrderId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorOrderId,
      data,
    }: {
      vendorOrderId: string;
      data: UpdateOrderStatusInput;
    }) => updateVendorOrderStatus(vendorOrderId, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.vendorOrderId) });
      const actionLabel =
        variables.data.status === 'processing'
          ? 'Order marked as in processing'
          : variables.data.status === 'completed'
            ? 'Order marked as completed'
            : 'Order cancelled';
      toast.success(actionLabel);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update order status.');
    },
  });
}
