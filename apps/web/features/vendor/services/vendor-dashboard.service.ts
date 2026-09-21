import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

import type {
  TimeframePeriod,
  VendorDashboardData,
} from '../types/vendor-dashboard.types';

export interface FetchVendorDashboardParams {
  period?: TimeframePeriod;
  signal?: AbortSignal;
}

export function fetchVendorDashboard({
  period = '7d',
  signal,
}: FetchVendorDashboardParams = {}) {
  return makeApiRequest<VendorDashboardData>({
    url: API_ENDPOINTS.vendor.dashboard,
    method: 'GET',
    params: { period },
    signal,
  });
}
