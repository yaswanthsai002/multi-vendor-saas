'use client';

import * as React from 'react';

import type { ChartDataPoint, TimeframePeriod } from '../types/vendor-dashboard.types';

import {
  TimeSeriesChart,
  type TimeSeriesPeriod,
} from '@/shared/components/charts/time-series-chart';

interface VendorSalesChartProps {
  data?: ChartDataPoint[];
  period: TimeframePeriod;
  onPeriodChange: (period: TimeframePeriod) => void;
  isLoading?: boolean;
}

const PERIODS: TimeSeriesPeriod[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

// ponytail: thin feature wrapper reusing shared TimeSeriesChart
export function VendorSalesChart({
  data = [],
  period,
  onPeriodChange,
  isLoading = false,
}: VendorSalesChartProps) {
  const chartData = React.useMemo(
    () =>
      (data || []).map((d) => ({
        label: d.label,
        date: d.date,
        primaryValue: d.orders || 0,
        secondaryValue: d.sales || 0,
      })),
    [data],
  );

  return (
    <TimeSeriesChart
      title="Sales Performance"
      subtitle="Orders and sales revenue over time"
      data={chartData}
      period={period}
      periods={PERIODS}
      onPeriodChange={(val) => onPeriodChange(val as TimeframePeriod)}
      primaryLabel="Orders"
      primaryColor="#E66A45"
      secondaryLabel="Sales"
      secondaryColor="#4A90B2"
      isLoading={isLoading}
    />
  );
}
