'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchVendorDashboard } from '../services/vendor-dashboard.service';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

export const vendorDashboardQueryKeys = {
  all: ['vendor'] as const,
  dashboard: (period: TimeframePeriod) => ['vendor', 'dashboard', period] as const,
};

export function useVendorDashboard(period: TimeframePeriod = '7d') {
  return useQuery({
    queryKey: vendorDashboardQueryKeys.dashboard(period),
    queryFn: ({ signal }) => fetchVendorDashboard({ period, signal }),
    staleTime: 60 * 1000,
  });
}
