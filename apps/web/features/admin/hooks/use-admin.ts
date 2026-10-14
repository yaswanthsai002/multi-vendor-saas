'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminService } from '../services/admin.service';

import { queryKeys } from '@/lib/query-keys';

export function useAdminDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.metrics(),
    queryFn: ({ signal }) => adminService.getDashboardMetrics(signal),
  });
}

export function useAdminDashboardPerformance(days: number = 7) {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.performance(days),
    queryFn: ({ signal }) => adminService.getDashboardPerformance(days, signal),
  });
}

export function useAdminDashboardTopProducts() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.topProducts(),
    queryFn: ({ signal }) => adminService.getDashboardTopProducts(signal),
  });
}

export function useAdminDashboardRecentOrders() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.recentOrders(),
    queryFn: ({ signal }) => adminService.getDashboardRecentOrders(signal),
  });
}

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: ({ signal }) => adminService.getUsers(params, signal),
  });
}

export function useAdminVendors(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  isFeatured?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.vendors.list(params),
    queryFn: ({ signal }) => adminService.getVendors(params, signal),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: 'active' | 'suspended';
      reason?: string;
    }) => adminService.updateUserStatus(userId, { status, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    },
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      vendorId,
      status,
      reason,
    }: {
      vendorId: string;
      status: 'pending' | 'active' | 'suspended' | 'rejected';
      reason?: string;
    }) => adminService.updateVendorStatus(vendorId, { status, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.metrics() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update vendor status');
    },
  });
}

export function useToggleVendorFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, isFeatured }: { vendorId: string; isFeatured: boolean }) =>
      adminService.toggleVendorFeature(vendorId, isFeatured),
    onSuccess: () => {
      toast.success('Vendor featured status updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.overview() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update vendor featured status');
    },
  });
}

export function useAdminProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  moderationStatus?: string;
  isFeatured?: string;
  published?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.products.list(params),
    queryFn: ({ signal }) => adminService.getProducts(params, signal),
  });
}

export function useUpdateProductModeration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      status,
      reason,
    }: {
      productId: string;
      status: 'approved' | 'hidden' | 'rejected';
      reason?: string;
    }) => adminService.updateProductModeration(productId, { status, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.metrics() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update product moderation');
    },
  });
}

export function useToggleProductFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, isFeatured }: { productId: string; isFeatured: boolean }) =>
      adminService.toggleProductFeature(productId, isFeatured),
    onSuccess: () => {
      toast.success('Product featured status updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.overview() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle product featured status');
    },
  });
}

export function useAdminOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.orders.list(params),
    queryFn: ({ signal }) => adminService.getOrders(params, signal),
  });
}

export function useMerchandisingOverview() {
  return useQuery({
    queryKey: queryKeys.admin.merchandising.overview(),
    queryFn: ({ signal }) => adminService.getMerchandisingOverview(signal),
  });
}
