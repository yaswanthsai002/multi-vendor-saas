'use client';

import { AlertCircle, CheckCircle2, Clock, PackageCheck } from 'lucide-react';
import * as React from 'react';

import type { VendorOrderStatusCounts } from '../types/order.types';

interface OrdersStatCardsProps {
  counts?: VendorOrderStatusCounts;
  isLoading?: boolean;
}

export function OrdersStatCards({ counts, isLoading }: OrdersStatCardsProps) {
  const cards = [
    {
      title: 'Total Orders',
      value: counts?.all ?? 0,
      icon: PackageCheck,
      iconColor: 'text-text-primary dark:text-text-primary',
      bgGradient: 'bg-surface-raised dark:bg-surface-raised',
      borderColor: 'border-border-default',
    },
    {
      title: 'Pending Review',
      value: counts?.pending ?? 0,
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]',
      borderColor: 'border-amber-200/70 dark:border-amber-900/40',
    },
    {
      title: 'In Processing',
      value: counts?.processing ?? 0,
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'bg-blue-500/[0.04] dark:bg-blue-500/[0.06]',
      borderColor: 'border-blue-200/70 dark:border-blue-900/40',
    },
    {
      title: 'Completed',
      value: counts?.completed ?? 0,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]',
      borderColor: 'border-emerald-200/70 dark:border-emerald-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-2xl border ${card.borderColor} ${card.bgGradient} shadow-xs flex flex-col justify-between transition-all`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-text-secondary">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/50">
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <div className="h-7 w-16 bg-surface-subtle animate-pulse rounded-md" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  {card.value.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
