'use client';

import { BarChart2 } from 'lucide-react';
import * as React from 'react';

import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TimeSeriesDataPoint {
  label: string;
  date?: string;
  primaryValue: number; // e.g. Orders
  secondaryValue: number; // e.g. Sales or GMV
}

export interface TimeSeriesPeriod {
  key: string;
  label: string;
}

export interface TimeSeriesChartProps {
  title: string;
  subtitle?: string;
  data: TimeSeriesDataPoint[];
  period: string;
  periods: TimeSeriesPeriod[];
  onPeriodChange: (period: string) => void;
  primaryLabel?: string;
  primaryColor?: string;
  secondaryLabel?: string;
  secondaryColor?: string;
  secondaryFormatter?: (val: number) => string;
  isLoading?: boolean;
  className?: string;
}

// Helper: Generates a smooth cubic Bézier spline through coordinates
function getSmoothSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Helper: Generates closed area polygon for gradient fill under the curve
function getSmoothSvgArea(points: { x: number; y: number }[], baseY: number): string {
  if (points.length < 2) return '';
  const linePath = getSmoothSvgPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint.x.toFixed(1)} ${baseY} L ${firstPoint.x.toFixed(1)} ${baseY} Z`;
}

// ponytail: single shared time-series chart component for both admin and vendor dashboards
export function TimeSeriesChart({
  title,
  subtitle,
  data = [],
  period,
  periods,
  onPeriodChange,
  primaryLabel = 'Orders',
  primaryColor = '#E66A45',
  secondaryLabel = 'GMV',
  secondaryColor = '#4A90B2',
  secondaryFormatter = (val) =>
    val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val.toLocaleString('en-IN')}`,
  isLoading = false,
  className,
}: TimeSeriesChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const chartData = React.useMemo(() => data || [], [data]);
  const hasData = React.useMemo(
    () => chartData.some((d) => (d.primaryValue || 0) > 0 || (d.secondaryValue || 0) > 0),
    [chartData],
  );

  // High-res SVG dimensions
  const width = 800;
  const height = 280;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 35;
  const paddingBottom = 40;
  const baseY = height - paddingBottom;
  const chartHeight = baseY - paddingTop;

  // Max calculations
  const maxPrimary = Math.max(...chartData.map((d) => d.primaryValue || 0), 1) * 1.15;
  const maxSecondary = Math.max(...chartData.map((d) => d.secondaryValue || 0), 10) * 1.15;

  const getX = (index: number) => {
    const step = (width - paddingLeft - paddingRight) / Math.max(chartData.length - 1, 1);
    return paddingLeft + index * step;
  };

  const getYPrimary = (val: number) => {
    const clamped = Math.min(Math.max(val, 0), maxPrimary);
    return baseY - (clamped / maxPrimary) * chartHeight;
  };

  const getYSecondary = (val: number) => {
    const clamped = Math.min(Math.max(val, 0), maxSecondary);
    return baseY - (clamped / maxSecondary) * (chartHeight * 0.92);
  };

  const primaryPoints = chartData.map((d, i) => ({
    x: getX(i),
    y: getYPrimary(d.primaryValue || 0),
  }));
  const secondaryPoints = chartData.map((d, i) => ({
    x: getX(i),
    y: getYSecondary(d.secondaryValue || 0),
  }));

  const primaryPath = getSmoothSvgPath(primaryPoints);
  const primaryArea = getSmoothSvgArea(primaryPoints, baseY);

  const secondaryPath = getSmoothSvgPath(secondaryPoints);
  const secondaryArea = getSmoothSvgArea(secondaryPoints, baseY);

  const gridTicks = [0, 0.33, 0.66, 1.0];
  const gradientPrefix = React.useId().replace(/:/g, '');

  return (
    <div
      className={cn(
        'bg-surface-raised dark:bg-surface border border-border-default rounded-2xl p-6 flex flex-col justify-between transition-colors duration-200 shadow-none h-full',
        className,
      )}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Timeframe Selector Tabs */}
          <Tabs value={period} onValueChange={(val) => val && onPeriodChange(val)}>
            <TabsList>
              {periods.map((p) => (
                <TabsTab key={p.key} value={p.key}>
                  {p.label}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>

          {/* Interactive Legend */}
          <div className="flex items-center gap-4 text-xs select-none">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 0 2px ${primaryColor}33`,
                }}
              />
              {primaryLabel}
            </span>
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2"
                style={{
                  backgroundColor: secondaryColor,
                  boxShadow: `0 0 0 2px ${secondaryColor}33`,
                }}
              />
              {secondaryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Graphic Area or Empty State */}
      {!hasData ? (
        <div className="w-full flex-1 min-h-60 sm:min-h-70 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="h-12 w-12 rounded-2xl bg-surface-subtle dark:bg-surface-hover flex items-center justify-center text-text-tertiary mb-3 border border-border-subtle">
            <BarChart2 className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">
            No performance activity recorded
          </h4>
          <p className="text-xs text-text-tertiary max-w-sm mt-1">
            There are no completed orders or revenue recorded for the selected timeframe (
            {period.toUpperCase()}).
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 relative min-h-60 sm:min-h-70">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-64 sm:h-72 select-none overflow-visible"
          >
            <defs>
              <linearGradient id={`${gradientPrefix}-primaryGradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
              </linearGradient>

              <linearGradient
                id={`${gradientPrefix}-secondaryGradient`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.16" />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Axis labels */}
            {gridTicks.map((ratio) => {
              const y = baseY - ratio * chartHeight;
              const primaryTickVal = Math.round(ratio * maxPrimary);
              const secondaryTickVal = Math.round(ratio * maxSecondary);

              return (
                <g key={ratio}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-border-subtle opacity-70"
                  />
                  {/* Left tick: Primary (Orders) */}
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] fill-text-tertiary font-mono"
                  >
                    {primaryTickVal}
                  </text>
                  {/* Right tick: Secondary (GMV / Sales) */}
                  <text
                    x={width - paddingRight + 10}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[11px] fill-text-tertiary font-mono"
                  >
                    {secondaryFormatter(secondaryTickVal)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill: Secondary */}
            <path d={secondaryArea} fill={`url(#${gradientPrefix}-secondaryGradient)`} />

            {/* Area Fill: Primary */}
            <path d={primaryArea} fill={`url(#${gradientPrefix}-primaryGradient)`} />

            {/* Line Stroke: Secondary */}
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line Stroke: Primary */}
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Guides & Data Points */}
            {chartData.map((d, i) => {
              const x = getX(i);
              const yPrimary = getYPrimary(d.primaryValue || 0);
              const ySecondary = getYSecondary(d.secondaryValue || 0);
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={(d.date || d.label) + i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Hover target */}
                  <rect
                    x={x - 25}
                    y={paddingTop}
                    width={50}
                    height={chartHeight + 10}
                    fill="transparent"
                  />

                  {/* Vertical hover guide */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={baseY}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="text-text-tertiary opacity-80"
                    />
                  )}

                  {/* Secondary dot */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={ySecondary}
                      r={9}
                      fill={secondaryColor}
                      className="opacity-25"
                    />
                  )}
                  {(chartData.length <= 14 || isHovered) && (
                    <circle
                      cx={x}
                      cy={ySecondary}
                      r={isHovered ? 5.5 : 3.5}
                      fill={secondaryColor}
                      className="stroke-surface stroke-2 transition-all duration-150"
                    />
                  )}

                  {/* Primary dot */}
                  {isHovered && (
                    <circle cx={x} cy={yPrimary} r={9} fill={primaryColor} className="opacity-25" />
                  )}
                  {(chartData.length <= 14 || isHovered) && (
                    <circle
                      cx={x}
                      cy={yPrimary}
                      r={isHovered ? 5.5 : 3.5}
                      fill={primaryColor}
                      className="stroke-surface stroke-2 transition-all duration-150"
                    />
                  )}

                  {/* X-axis Day Label */}
                  {(chartData.length <= 7 ||
                    (chartData.length <= 31 &&
                      (i === 0 || i === chartData.length - 1 || i % 5 === 0)) ||
                    (chartData.length > 31 &&
                      (i === 0 || i === chartData.length - 1 || i % 15 === 0)) ||
                    isHovered) && (
                    <text
                      x={x}
                      y={height - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-mono transition-colors ${
                        isHovered ? 'fill-text-primary font-bold' : 'fill-text-tertiary'
                      }`}
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {isLoading && (
            <div className="absolute inset-0 bg-surface/40 backdrop-blur-2xs flex items-center justify-center rounded-xl pointer-events-none">
              <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Floating Snapshot Tooltip */}
          {hoveredIdx !== null && chartData[hoveredIdx] && (
            <div
              className="absolute z-20 pointer-events-none bg-surface-raised dark:bg-[#191E2A] border border-border-default shadow-xl rounded-xl p-3 text-xs flex flex-col gap-2 -translate-x-1/2 -translate-y-full transition-all duration-75"
              style={{
                left: `${(getX(hoveredIdx) / width) * 100}%`,
                top: `${Math.max(10, (Math.min(getYPrimary(chartData[hoveredIdx].primaryValue || 0), getYSecondary(chartData[hoveredIdx].secondaryValue || 0)) / height) * 100 - 16)}%`,
              }}
            >
              <div className="font-semibold text-text-primary border-b border-border-subtle pb-1.5 flex items-center justify-between gap-4">
                <span>{chartData[hoveredIdx].date || chartData[hoveredIdx].label}</span>
                <span className="text-[10px] text-text-tertiary font-mono">Live</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  {primaryLabel}:
                </span>
                <span className="font-bold text-text-primary tabular-nums">
                  {(chartData[hoveredIdx].primaryValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  {secondaryLabel}:
                </span>
                <span className="font-bold tabular-nums" style={{ color: secondaryColor }}>
                  {secondaryFormatter(chartData[hoveredIdx].secondaryValue || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
