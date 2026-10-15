'use client';

import { useQuery } from '@tanstack/react-query';

import {
  fetchVendorDashboard,
  fetchVendorDashboardMetrics,
  fetchVendorDashboardPerformance,
  fetchVendorDashboardRecentOrders,
  fetchVendorDashboardTopProducts,
} from '../services/vendor-dashboard.service';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

export const vendorDashboardQueryKeys = {
  all: ['vendor'] as const,
  dashboard: (period: TimeframePeriod) => ['vendor', 'dashboard', period] as const,
  metrics: (period: TimeframePeriod) => ['vendor', 'dashboard', 'metrics', period] as const,
  performance: (period: TimeframePeriod) => ['vendor', 'dashboard', 'performance', period] as const,
  recentOrders: () => ['vendor', 'dashboard', 'recent-orders'] as const,
  topProducts: () => ['vendor', 'dashboard', 'top-products'] as const,
};

export function useVendorDashboard(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.dashboard(period),
    queryFn: ({ signal }) => fetchVendorDashboard({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardMetrics(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.metrics(period),
    queryFn: ({ signal }) => fetchVendorDashboardMetrics({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardPerformance(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.performance(period),
    queryFn: ({ signal }) => fetchVendorDashboardPerformance({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardRecentOrders() {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.recentOrders(),
    queryFn: ({ signal }) => fetchVendorDashboardRecentOrders({ signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardTopProducts() {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.topProducts(),
    queryFn: ({ signal }) => fetchVendorDashboardTopProducts({ signal }),
    staleTime: 60 * 1000,
  });
}
