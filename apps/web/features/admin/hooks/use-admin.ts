'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/query-keys';

import {
  adminService,
  type AdminPromotionDraftPayload,
  type OnboardVendorInput,
} from '../services/admin.service';

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

export function useAdminVendors(
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    isFeatured?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.admin.vendors.list(params),
    queryFn: ({ signal }) => adminService.getVendors(params, signal),
    enabled,
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

export function useOnboardVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OnboardVendorInput) => adminService.onboardVendor(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.metrics() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to onboard vendor');
    },
  });
}

export function useAdminProducts(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    moderationStatus?: string;
    isFeatured?: string;
    published?: string;
    sortBy?: string;
    sortOrder?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.admin.products.list(params),
    queryFn: ({ signal }) => adminService.getProducts(params, signal),
    enabled,
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

export function useAdminCampaigns() {
  return useQuery({
    queryKey: queryKeys.admin.merchandising.campaigns(),
    queryFn: ({ signal }) => adminService.getCampaigns(signal),
  });
}

export function useAdminPromotionDrafts() {
  return useQuery({
    queryKey: queryKeys.admin.merchandising.campaigns(),
    queryFn: ({ signal }) => adminService.getCampaigns(signal),
    select: ({ drafts }) => ({ items: drafts }),
  });
}

export function useAdminPromotionDraft(draftId: string) {
  return useQuery({
    queryKey: queryKeys.admin.merchandising.draft(draftId),
    queryFn: ({ signal }) => adminService.getPromotionDraft(draftId, signal),
    enabled: Boolean(draftId),
  });
}

export function useCreateAdminPromotionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId?: string) => adminService.createPromotionDraft(campaignId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.campaigns() }),
  });
}

export function useSaveAdminPromotionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, data }: { draftId: string; data: AdminPromotionDraftPayload }) =>
      adminService.savePromotionDraft(draftId, data),
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.admin.merchandising.draft(response.draft.draftId),
        response,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.campaigns() });
    },
  });
}

export function useDiscardAdminPromotionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => adminService.discardPromotionDraft(draftId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.campaigns() }),
  });
}

export function usePublishAdminPromotionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => adminService.publishPromotionDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.merchandising.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.merchandising.homepage() });
    },
  });
}
