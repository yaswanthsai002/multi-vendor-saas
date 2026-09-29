'use client';

import { Select } from '@base-ui-components/react/select';
import { Calendar, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useVendorDashboard } from '../hooks/use-vendor-dashboard';

import { VendorKpiCards } from './vendor-kpi-cards';
import { VendorRecentOrders } from './vendor-recent-orders';
import { VendorSalesChart } from './vendor-sales-chart';
import { VendorTopProducts } from './vendor-top-products';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

export function VendorDashboardOverview() {
  const [period, setPeriod] = useState<TimeframePeriod>('7d');
  const { data, isLoading } = useVendorDashboard(period);

  const storeName = data?.vendor.name ?? 'Store';

  const dateOptions: Array<{ key: TimeframePeriod; label: string }> = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isLoading ? 'Loading store metrics...' : `Welcome back, ${storeName} 👋`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Base UI Date Range Select */}
          <Select.Root
            value={period}
            onValueChange={(val) => {
              if (val) setPeriod(val as TimeframePeriod);
            }}
          >
            <Select.Trigger className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-surface-raised dark:bg-surface border border-border-default rounded-lg text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary ml-1" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner
                alignItemWithTrigger={false}
                side="bottom"
                sideOffset={8}
                align="end"
                className="z-50"
              >
                <Select.Popup className="w-44 rounded-xl bg-surface-raised border border-border-default shadow-lg py-1 outline-none animate-in fade-in-0 zoom-in-95 duration-100">
                  {dateOptions.map((opt) => (
                    <Select.Item
                      key={opt.key}
                      value={opt.key}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover data-highlighted:bg-surface-hover data-selected:font-semibold data-selected:text-accent data-selected:bg-accent-subtle/50 transition-colors cursor-pointer outline-none"
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>

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
      <VendorKpiCards metrics={data?.metrics} isLoading={isLoading} />

      {/* Sales Overview Area Chart */}
      <VendorSalesChart
        data={data?.chart}
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isLoading}
      />

      {/* Bottom 2-Column Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <VendorRecentOrders orders={data?.recentOrders} isLoading={isLoading} />
        <VendorTopProducts products={data?.topProducts} isLoading={isLoading} />
      </div>
    </div>
  );
}
