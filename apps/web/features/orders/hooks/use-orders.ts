'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { notifyNotificationTabs } from '@/lib/vendor-notification-sync';

import {
  markVendorOrderNotificationsRead,
  fetchVendorOrderDetail,
  fetchVendorOrders,
  updateVendorOrderStatus,
} from '../services/order.service';

import type {
  UpdateOrderStatusInput,
  VendorOrdersFilters,
  VendorOrderStatus,
} from '../types/order.types';

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
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      toast.error(err.message || 'Failed to update order status.');
    },
  });
}

export function useReadOpenedOrderNotifications(
  vendorOrderId: string,
  status: VendorOrderStatus | undefined,
) {
  const { mutate } = useMutation({
    mutationFn: markVendorOrderNotificationsRead,
    retry: (attempt, error) =>
      attempt < 2 && error instanceof ApiError && (error.status === 0 || error.status >= 500),
    onSuccess: ({ vendorId, changed }) => {
      if (changed) notifyNotificationTabs(vendorId);
    },
    onError: () => toast.error('Order opened, but notification read status could not be saved.'),
  });
  useEffect(() => {
    if (status) mutate({ vendorOrderId, status });
  }, [vendorOrderId, status, mutate]);
}
