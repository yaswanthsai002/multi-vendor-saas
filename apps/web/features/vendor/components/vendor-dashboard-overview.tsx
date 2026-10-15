'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  useVendorDashboardMetrics,
  useVendorDashboardPerformance,
  useVendorDashboardRecentOrders,
  useVendorDashboardTopProducts,
} from '../hooks/use-vendor-dashboard';

import { VendorKpiCards } from './vendor-kpi-cards';
import { VendorRecentOrders } from './vendor-recent-orders';
import { VendorSalesChart } from './vendor-sales-chart';
import { VendorTopProducts } from './vendor-top-products';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function VendorDashboardOverview() {
  const [period, setPeriod] = useState<TimeframePeriod>('7d');
  const { data: userResp } = useCurrentUser();
  const userName = userResp?.user?.fullName ?? 'Vendor';

  const { data: metrics, isLoading: isMetricsLoading } = useVendorDashboardMetrics(period);
  const { data: chart = [], isLoading: isChartLoading } = useVendorDashboardPerformance(period);
  const { data: recentOrders = [], isLoading: isOrdersLoading } = useVendorDashboardRecentOrders();
  const { data: topProducts = [], isLoading: isTopProdLoading } = useVendorDashboardTopProducts();

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">Welcome back, {userName} 👋</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Primary Action Button: Add Product */}
          <Link
            href="/vendor/products/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-on-accent hover:bg-accent-hover transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <VendorKpiCards metrics={metrics} isLoading={isMetricsLoading} />

      {/* Sales Overview Area Chart */}
      <VendorSalesChart
        data={chart}
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isChartLoading}
      />

      {/* Bottom 2-Column Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <VendorRecentOrders orders={recentOrders} isLoading={isOrdersLoading} />
        <VendorTopProducts products={topProducts} isLoading={isTopProdLoading} />
      </div>
    </div>
  );
}
