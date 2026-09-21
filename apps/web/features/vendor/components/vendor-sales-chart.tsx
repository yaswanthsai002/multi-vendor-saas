'use client';

import * as React from 'react';

import type { ChartDataPoint, TimeframePeriod } from '../types/vendor-dashboard.types';

interface VendorSalesChartProps {
  data?: ChartDataPoint[];
  period: TimeframePeriod;
  onPeriodChange: (period: TimeframePeriod) => void;
  isLoading?: boolean;
}

export function VendorSalesChart({
  data = [],
  period,
  onPeriodChange,
  isLoading,
}: VendorSalesChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // SVG Chart coordinate calculation
  const width = 750;
  const height = 260;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value calculation for Y-axis (scale up to nice round step)
  const maxSales = Math.max(...data.map((d) => d.sales), 2500);
  const yTicks = [2500, 2000, 1500, 1000, 500, 0];
  const maxY = Math.max(maxSales, 2500);

  // Map data to coordinates
  const points = data.map((d, i) => {
    const x =
      data.length > 1
        ? paddingLeft + (i / (data.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - (d.sales / maxY) * chartHeight;
    return { ...d, x, y };
  });

  // Generate SVG path strings
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0]?.x} ${points[0]?.y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i]?.x} ${points[i]?.y}`;
    }

    const first = points[0];
    const last = points[points.length - 1];
    areaD = `${pathD} L ${last?.x} ${paddingTop + chartHeight} L ${first?.x} ${
      paddingTop + chartHeight
    } Z`;
  }

  const periods: Array<{ key: TimeframePeriod; label: string }> = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
  ];

  return (
    <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-xl p-6 transition-colors duration-200">
      {/* Header with Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Sales Overview</h2>
          <p className="text-xs sm:text-sm text-text-tertiary max-w-2xl mt-0.5">
            Track your sales performance over time. This chart shows the total sales value for
            the selected period, helping you identify trends and plan ahead.
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg shrink-0 self-start sm:self-auto">
          {periods.map((p) => {
            const isActive = period === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onPeriodChange(p.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-secondary-accent text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="mt-6 relative w-full overflow-hidden">
        {isLoading ? (
          <div className="h-64 w-full bg-surface-subtle/50 animate-pulse rounded-lg flex items-center justify-center text-text-tertiary text-sm">
            Loading chart data...
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-64 select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary-accent, #367B9D)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-secondary-accent, #367B9D)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines and Y-axis Labels */}
              {yTicks.map((tick) => {
                const y = paddingTop + chartHeight - (tick / maxY) * chartHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-border-subtle"
                      strokeDasharray={tick === 0 ? undefined : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-text-tertiary text-[11px] font-mono"
                    >
                      {tick === 0 ? '₹ 0' : `₹ ${tick.toLocaleString('en-IN')}`}
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient Fill */}
              {areaD && <path d={areaD} fill="url(#salesGradient)" />}

              {/* Line Stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--color-secondary-accent, #367B9D)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points and X-axis Labels */}
              {points.map((pt, i) => (
                <g key={pt.date + i}>
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 5.5 : 3.5}
                    className="cursor-pointer transition-all duration-150"
                    fill="var(--color-secondary-accent, #367B9D)"
                    stroke="var(--color-surface-raised, #FFFFFF)"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* X-axis Label */}
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 20}
                    textAnchor="middle"
                    className="fill-text-tertiary text-[12px] font-medium"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-text-primary text-text-inverse px-2.5 py-1 rounded-md text-xs font-semibold shadow-md transition-all duration-75"
                style={{
                  left: `${(points[hoveredIndex]!.x / width) * 100}%`,
                  top: `${(points[hoveredIndex]!.y / height) * 100}%`,
                  marginTop: '-10px',
                }}
              >
                <div className="text-[10px] opacity-80">{points[hoveredIndex]?.date}</div>
                <div>₹ {points[hoveredIndex]?.sales.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
