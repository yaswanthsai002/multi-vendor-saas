import type {
  ChartDataPoint,
  RecentOrder,
  TimeframePeriod,
  TopProduct,
  VendorDashboardData,
  VendorDashboardMetrics,
} from '../types/vendor-dashboard.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface FetchVendorDashboardParams {
  period?: TimeframePeriod;
  signal?: AbortSignal;
}

export function fetchVendorDashboard({ period = '7d', signal }: FetchVendorDashboardParams = {}) {
  return makeApiRequest<VendorDashboardData>({
    url: API_ENDPOINTS.vendor.dashboard,
    method: 'GET',
    params: { period },
    signal,
  });
}

export async function fetchVendorDashboardMetrics({
  period = '7d',
  signal,
}: FetchVendorDashboardParams = {}) {
  const res = await makeApiRequest<{ metrics: VendorDashboardMetrics }>({
    url: API_ENDPOINTS.vendor.dashboardMetrics,
    method: 'GET',
    params: { period },
    signal,
  });
  return res.metrics;
}

export async function fetchVendorDashboardPerformance({
  period = '7d',
  signal,
}: FetchVendorDashboardParams = {}) {
  const res = await makeApiRequest<{ chart: ChartDataPoint[] }>({
    url: API_ENDPOINTS.vendor.dashboardPerformance,
    method: 'GET',
    params: { period },
    signal,
  });
  return res.chart;
}

export async function fetchVendorDashboardRecentOrders({ signal }: { signal?: AbortSignal } = {}) {
  const res = await makeApiRequest<{ recentOrders: RecentOrder[] }>({
    url: API_ENDPOINTS.vendor.dashboardRecentOrders,
    method: 'GET',
    signal,
  });
  return res.recentOrders;
}

export async function fetchVendorDashboardTopProducts({ signal }: { signal?: AbortSignal } = {}) {
  const res = await makeApiRequest<{ topProducts: TopProduct[] }>({
    url: API_ENDPOINTS.vendor.dashboardTopProducts,
    method: 'GET',
    signal,
  });
  return res.topProducts;
}
