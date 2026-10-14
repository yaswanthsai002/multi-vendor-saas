'use client';

import { Boxes, ShoppingBag, Store, UsersRound } from 'lucide-react';
import * as React from 'react';

import { KpiCard } from '@/features/admin/components/kpi-card';
import { MerchandisingCard } from '@/features/admin/components/merchandising-card';
import { NeedsAttentionCard } from '@/features/admin/components/needs-attention-card';
import { PerformanceChart } from '@/features/admin/components/performance-chart';
import { RecentOrdersTable } from '@/features/admin/components/recent-orders-table';
import { TopProductsTable } from '@/features/admin/components/top-products-table';
import {
  useAdminDashboardMetrics,
  useAdminDashboardPerformance,
  useAdminDashboardRecentOrders,
  useAdminDashboardTopProducts,
} from '@/features/admin/hooks/use-admin';

export default function AdminDashboardPage() {
  const [timeframeDays, setTimeframeDays] = React.useState<number>(7);
  const { data: metrics, isLoading: isMetricsLoading } = useAdminDashboardMetrics();
  const { data: performance = [], isLoading: isPerfLoading } =
    useAdminDashboardPerformance(timeframeDays);
  const { data: topProducts = [], isLoading: isTopProdLoading } = useAdminDashboardTopProducts();
  const { data: recentOrders = [], isLoading: isOrdersLoading } = useAdminDashboardRecentOrders();

  const kpi = metrics?.kpi;
  const needsAttention = metrics?.needsAttention;
  const merchandising = metrics?.merchandising;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Good morning, Admin. Here&apos;s what&apos;s happening across Perigee.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={isMetricsLoading ? '...' : (kpi?.totalCustomers ?? 0)}
          icon={UsersRound}
          iconBg="bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          title="Active Vendors"
          value={isMetricsLoading ? '...' : (kpi?.activeVendors ?? 0)}
          icon={Store}
          iconBg="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          title="Marketplace Products"
          value={isMetricsLoading ? '...' : (kpi?.marketplaceProducts ?? 0)}
          icon={Boxes}
          iconBg="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="Total Orders"
          value={isMetricsLoading ? '...' : (kpi?.totalOrders ?? 0)}
          icon={ShoppingBag}
          iconBg="bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Mid Section: Performance Chart & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <PerformanceChart
            data={performance}
            days={timeframeDays}
            onDaysChange={setTimeframeDays}
            isLoading={isPerfLoading}
          />
        </div>
        <div>
          <NeedsAttentionCard pendingCount={needsAttention?.pendingVendors ?? 0} />
        </div>
      </div>

      {/* Lower Mid Section: Merchandising & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div>
          <MerchandisingCard
            featuredProducts={merchandising?.featuredProducts ?? 0}
            featuredBrands={merchandising?.featuredBrands ?? 0}
            activeDeals={merchandising?.activeDeals ?? 0}
          />
        </div>
        <div className="lg:col-span-2">
          {isTopProdLoading ? (
            <div className="h-72 rounded-xl bg-surface border border-border-default animate-pulse" />
          ) : (
            <TopProductsTable products={topProducts} />
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Orders */}
      <div>
        {isOrdersLoading ? (
          <div className="h-72 rounded-xl bg-surface border border-border-default animate-pulse" />
        ) : (
          <RecentOrdersTable orders={recentOrders} />
        )}
      </div>
    </div>
  );
}
