'use client';

import { BarChart2, Package, ShoppingCart, Wallet } from 'lucide-react';
import * as React from 'react';

import type { VendorDashboardMetrics } from '../types/vendor-dashboard.types';

interface VendorKpiCardsProps {
  metrics?: VendorDashboardMetrics;
  isLoading?: boolean;
}

export function VendorKpiCards({ metrics, isLoading }: VendorKpiCardsProps) {
  const cards = [
    {
      title: 'Sales',
      value: metrics ? `₹ ${metrics.sales.value.toLocaleString('en-IN')}` : '₹ —',
      icon: Wallet,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Orders',
      value: metrics ? metrics.orders.value.toLocaleString('en-IN') : '—',
      icon: ShoppingCart,
      iconBg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    },
    {
      title: 'Units Sold',
      value: metrics ? metrics.unitsSold.value.toLocaleString('en-IN') : '—',
      icon: Package,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Avg. Order Value',
      value: metrics ? `₹ ${metrics.avgOrderValue.value.toLocaleString('en-IN')}` : '₹ —',
      icon: BarChart2,
      iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-surface-raised dark:bg-surface border border-border-default rounded-xl p-5 sm:p-6 shadow-none flex flex-col justify-between transition-colors duration-200"
          >
            {/* Top row: Icon Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {/* Middle / Bottom: Title and Metric Value */}
            <div className="mt-4">
              <p className="text-sm font-medium text-text-secondary">{card.title}</p>
              {isLoading ? (
                <div className="h-8 w-28 bg-surface-subtle animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                  {card.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
