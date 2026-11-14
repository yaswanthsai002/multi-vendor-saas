'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelCustomerOrder,
  fetchCheckoutReview,
  fetchCustomerOrder,
  fetchCustomerOrders,
  placeCustomerOrder,
} from '../services/customer-order.service';

import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';

import { broadcastCartChange } from '@/lib/cart-sync';
import { queryKeys } from '@/lib/query-keys';

export function useCheckoutReview(userId: string | number, addressId?: string) {
  return useQuery({
    queryKey: queryKeys.customerOrders.review(userId, addressId),
    queryFn: ({ signal }) => fetchCheckoutReview(addressId, signal),
    retry: false,
  });
}
export function useCustomerOrders(userId: string | number, query: CustomerOrderQuery) {
  return useQuery({
    queryKey: queryKeys.customerOrders.list(userId, query),
    queryFn: ({ signal }) => fetchCustomerOrders(query, signal),
    retry: false,
  });
}
export function useCustomerOrder(userId: string | number, orderId: string) {
  return useQuery({
    queryKey: queryKeys.customerOrders.detail(userId, orderId),
    queryFn: ({ signal }) => fetchCustomerOrder(orderId, signal),
    retry: false,
  });
}
export function usePlaceCustomerOrder(userId: string | number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: placeCustomerOrder,
    retry: false,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.customerOrders.all(userId) });
      void client.invalidateQueries({ queryKey: ['cart', userId] });
      broadcastCartChange();
    },
  });
}
export function useCancelCustomerOrder(userId: string | number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: cancelCustomerOrder,
    retry: false,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.customerOrders.all(userId) });
      void client.invalidateQueries({ queryKey: ['cart', userId] });
      void client.invalidateQueries({ queryKey: queryKeys.catalog.all() });
    },
  });
}
