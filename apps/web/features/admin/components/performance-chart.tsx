'use client';

import * as React from 'react';

import type { PerformanceDay } from '../services/admin.service';

import {
  TimeSeriesChart,
  type TimeSeriesPeriod,
} from '@/shared/components/charts/time-series-chart';

interface PerformanceChartProps {
  data: PerformanceDay[];
  days: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

const PERIODS: TimeSeriesPeriod[] = [
  { key: '7', label: '7D' },
  { key: '30', label: '30D' },
  { key: '90', label: '90D' },
];

// ponytail: thin feature wrapper reusing shared TimeSeriesChart
export function PerformanceChart({
  data,
  days,
  onDaysChange,
  isLoading = false,
}: PerformanceChartProps) {
  const chartData = React.useMemo(
    () =>
      (data || []).map((d) => ({
        label: d.day,
        date: d.date,
        primaryValue: d.orders || 0,
        secondaryValue: d.gmv || 0,
      })),
    [data],
  );

  return (
    <TimeSeriesChart
      title="Marketplace Performance"
      subtitle="Orders and Gross Merchandise Value over time"
      data={chartData}
      period={String(days)}
      periods={PERIODS}
      onPeriodChange={(val) => onDaysChange(Number(val))}
      primaryLabel="Orders"
      primaryColor="#E66A45"
      secondaryLabel="GMV"
      secondaryColor="#4A90B2"
      isLoading={isLoading}
    />
  );
}
