'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import {
  fetchVendorDashboard,
  fetchVendorDashboardMetrics,
  fetchVendorDashboardPerformance,
  fetchVendorDashboardRecentOrders,
  fetchVendorDashboardTopProducts,
} from '../services/vendor-dashboard.service';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

export function useVendorDashboard(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: queryKeys.vendorDashboard.dashboard(period),
    queryFn: ({ signal }) => fetchVendorDashboard({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardMetrics(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: queryKeys.vendorDashboard.metrics(period),
    queryFn: ({ signal }) => fetchVendorDashboardMetrics({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardPerformance(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: queryKeys.vendorDashboard.performance(period),
    queryFn: ({ signal }) => fetchVendorDashboardPerformance({ period, signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardRecentOrders() {
  return useQuery({
    queryKey: queryKeys.vendorDashboard.recentOrders(),
    queryFn: ({ signal }) => fetchVendorDashboardRecentOrders({ signal }),
    staleTime: 60 * 1000,
  });
}

export function useVendorDashboardTopProducts() {
  return useQuery({
    queryKey: queryKeys.vendorDashboard.topProducts(),
    queryFn: ({ signal }) => fetchVendorDashboardTopProducts({ signal }),
    staleTime: 60 * 1000,
  });
}
