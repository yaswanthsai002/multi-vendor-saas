'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface KpiCardProps {
  title: string;
  value?: string | number | null;
  change?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  valueClassName?: string;
  className?: string;
  isLoading?: boolean;
}

// ponytail: unified compact KPI card inspired by admin products metrics
export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
  valueClassName,
  className,
  isLoading,
}: KpiCardProps) {
  const isPositive = !change?.includes('▼') && !change?.includes('-');
  const hasBgBadge = iconBg && iconBg.includes('bg-');

  return (
    <div
      className={cn(
        'bg-surface-raised dark:bg-surface border border-border-default hover:border-border-strong rounded-xl p-4 transition-all flex flex-col justify-between group shadow-none',
        className,
      )}
    >
      {/* Top row: Label uppercase & Icon / Trend */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider truncate">
          {title}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                isPositive
                  ? 'bg-success/15 text-emerald-700 dark:text-emerald-400 border-success/30'
                  : 'bg-danger/15 text-danger border-danger/30',
              )}
            >
              {change.startsWith('▲') || change.startsWith('▼')
                ? change
                : `▲ ${change.replace(/^↑\s*/, '')}`}
            </span>
          )}

          {Icon &&
            (hasBgBadge ? (
              <div
                className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                  iconBg,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            ) : (
              <Icon
                className={cn(
                  'h-4 w-4 transition-transform duration-200 group-hover:scale-105',
                  iconColor || iconBg || 'text-text-tertiary',
                )}
              />
            ))}
        </div>
      </div>

      {/* Bottom row: Large formatted metric */}
      {isLoading ? (
        <div className="h-8 w-28 bg-surface-subtle animate-pulse rounded mt-2" />
      ) : (
        <p
          className={cn(
            'text-2xl font-bold tracking-tight mt-2 tabular-nums font-mono text-text-primary',
            valueClassName,
          )}
        >
          {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
        </p>
      )}
    </div>
  );
}
