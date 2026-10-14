'use client';

import { BarChart2, Package, ShoppingCart, Wallet } from 'lucide-react';
import * as React from 'react';

import type { VendorDashboardMetrics } from '../types/vendor-dashboard.types';

import { KpiCard } from '@/shared/components/kpi-card';

interface VendorKpiCardsProps {
  metrics?: VendorDashboardMetrics;
  isLoading?: boolean;
}

// ponytail: unified vendor KPI cards using shared KpiCard component
export function VendorKpiCards({ metrics, isLoading }: VendorKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Sales"
        value={metrics ? `₹ ${metrics.sales.value.toLocaleString('en-IN')}` : '₹ —'}
        isLoading={isLoading}
        icon={Wallet}
        iconBg="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
      />
      <KpiCard
        title="Orders"
        value={metrics ? metrics.orders.value : '—'}
        isLoading={isLoading}
        icon={ShoppingCart}
        iconBg="bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"
      />
      <KpiCard
        title="Units Sold"
        value={metrics ? metrics.unitsSold.value : '—'}
        isLoading={isLoading}
        icon={Package}
        iconBg="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
      />
      <KpiCard
        title="Avg. Order Value"
        value={metrics ? `₹ ${metrics.avgOrderValue.value.toLocaleString('en-IN')}` : '₹ —'}
        isLoading={isLoading}
        icon={BarChart2}
        iconBg="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
      />
    </div>
  );
}
