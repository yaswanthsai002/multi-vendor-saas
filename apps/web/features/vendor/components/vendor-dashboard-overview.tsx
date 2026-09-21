'use client';

import { Calendar, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useVendorDashboard } from '../hooks/use-vendor-dashboard';
import { VendorKpiCards } from './vendor-kpi-cards';
import { VendorRecentOrders } from './vendor-recent-orders';
import { VendorSalesChart } from './vendor-sales-chart';
import { VendorTopProducts } from './vendor-top-products';

import type { TimeframePeriod } from '../types/vendor-dashboard.types';

export function VendorDashboardOverview() {
  const [period, setPeriod] = React.useState<TimeframePeriod>('7d');
  const { data, isLoading, error } = useVendorDashboard(period);

  const [dateMenuOpen, setDateMenuOpen] = React.useState(false);
  const dateMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) {
        setDateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const storeName = data?.vendor.name ?? 'Aura Boutique';

  const dateOptions: Array<{ key: TimeframePeriod; label: string }> = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
  ];

  const currentLabel = dateOptions.find((o) => o.key === period)?.label ?? 'Last 7 days';

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Overview</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back, {storeName} 👋
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Date range picker selector */}
          <div ref={dateMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-surface-raised dark:bg-surface border border-border-default rounded-lg text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-expanded={dateMenuOpen}
            >
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <span>{currentLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary ml-1" />
            </button>

            {dateMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-xl bg-surface-raised border border-border-default shadow-lg py-1 z-30 animate-in fade-in-0 zoom-in-95 duration-100"
              >
                {dateOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setPeriod(opt.key);
                      setDateMenuOpen(false);
                    }}
                    role="menuitem"
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                      period === opt.key
                        ? 'font-semibold text-accent bg-accent-subtle/50'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
