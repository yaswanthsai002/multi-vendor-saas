'use client';

import * as React from 'react';

import type { PerformanceDay } from '../services/admin.service';

import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';

interface PerformanceChartProps {
  data: PerformanceDay[];
  days: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

const PERIODS = [
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
];

// Helper: Generates a smooth cubic Bézier spline through given coordinates
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

export function PerformanceChart({
  data,
  days,
  onDaysChange,
  isLoading = false,
}: PerformanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  // Use real data provided by API
  const chartData = React.useMemo(() => data || [], [data]);

  // Dimensions for high-res responsive viewBox
  const width = 800;
  const height = 280;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 35;
  const paddingBottom = 40;
  const baseY = height - paddingBottom;
  const chartHeight = baseY - paddingTop;

  // Dual Normalized Max Calculations
  const maxOrders = Math.max(...chartData.map((d) => d.orders || 0), 1) * 1.15;
  const maxGmv = Math.max(...chartData.map((d) => d.gmv || 0), 10) * 1.15;

  const getX = (index: number) => {
    const step = (width - paddingLeft - paddingRight) / Math.max(chartData.length - 1, 1);
    return paddingLeft + index * step;
  };

  // Orders curve mapping (Ember)
  const getYOrders = (orders: number) => {
    const clamped = Math.min(Math.max(orders, 0), maxOrders);
    return baseY - (clamped / maxOrders) * chartHeight;
  };

  // GMV curve mapping (Atmospheric Blue) with gentle offset so curves never collide
  const getYGmv = (gmv: number) => {
    const clamped = Math.min(Math.max(gmv, 0), maxGmv);
    return baseY - (clamped / maxGmv) * (chartHeight * 0.92);
  };

  const ordersPoints = chartData.map((d, i) => ({ x: getX(i), y: getYOrders(d.orders) }));
  const gmvPoints = chartData.map((d, i) => ({ x: getX(i), y: getYGmv(d.gmv) }));

  const ordersPath = getSmoothSvgPath(ordersPoints);
  const ordersArea = getSmoothSvgArea(ordersPoints, baseY);

  const gmvPath = getSmoothSvgPath(gmvPoints);
  const gmvArea = getSmoothSvgArea(gmvPoints, baseY);

  // 4 reference horizontal grid steps
  const gridTicks = [0, 0.33, 0.66, 1.0];

  return (
    <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-2xl p-6 flex flex-col justify-between transition-colors duration-200 shadow-none h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            Marketplace Performance
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            Orders and Gross Merchandise Value over time
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Shared Timeframe Tabs */}
          <Tabs
            value={String(days)}
            onValueChange={(val) => {
              if (val) onDaysChange(Number(val));
            }}
          >
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTab key={p.days} value={String(p.days)}>
                  {p.label}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>

          {/* Interactive Legend with Color Swatches */}
          <div className="flex items-center gap-4 text-xs select-none">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E66A45] ring-2 ring-[#E66A45]/20" />
              Orders
            </span>
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4A90B2] ring-2 ring-[#4A90B2]/20" />
              GMV
            </span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Graphic Area */}
      {chartData.length === 0 ? (
        <div className="w-full flex-1 min-h-60 flex items-center justify-center text-xs text-text-tertiary">
          No performance data recorded for this period.
        </div>
      ) : (
        <div className="w-full flex-1 relative min-h-60 sm:min-h-70">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-64 sm:h-72 select-none overflow-visible"
          >
            <defs>
              {/* Orders Gradient: Ember (#E66A45) */}
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E66A45" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#E66A45" stopOpacity="0.0" />
              </linearGradient>

              {/* GMV Gradient: Atmospheric Blue (#4A90B2) */}
              <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A90B2" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#4A90B2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Axis labels */}
            {gridTicks.map((ratio) => {
              const y = baseY - ratio * chartHeight;
              const ordersTickVal = Math.round(ratio * maxOrders);
              const gmvTickVal = Math.round(ratio * maxGmv);

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
                  {/* Left tick: Orders */}
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] fill-text-tertiary font-mono"
                  >
                    {ordersTickVal}
                  </text>
                  {/* Right tick: GMV */}
                  <text
                    x={width - paddingRight + 10}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[11px] fill-text-tertiary font-mono"
                  >
                    {gmvTickVal >= 1000 ? `₹${Math.round(gmvTickVal / 1000)}k` : `₹${gmvTickVal}`}
                  </text>
                </g>
              );
            })}

            {/* Area Fill: GMV */}
            <path d={gmvArea} fill="url(#gmvGradient)" />

            {/* Area Fill: Orders */}
            <path d={ordersArea} fill="url(#ordersGradient)" />

            {/* Line Stroke: GMV (Atmospheric Blue #4A90B2) */}
            <path
              d={gmvPath}
              fill="none"
              stroke="#4A90B2"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line Stroke: Orders (Ember #E66A45) */}
            <path
              d={ordersPath}
              fill="none"
              stroke="#E66A45"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Guides & Data Points */}
            {chartData.map((d, i) => {
              const x = getX(i);
              const yOrders = getYOrders(d.orders);
              const yGmv = getYGmv(d.gmv);
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={d.day + i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Invisible wide hover target for effortless interactions */}
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

                  {/* GMV dot with outer glow when hovered */}
                  {isHovered && (
                    <circle cx={x} cy={yGmv} r={9} className="fill-[#4A90B2] opacity-25" />
                  )}
                  {(chartData.length <= 14 || isHovered) && (
                    <circle
                      cx={x}
                      cy={yGmv}
                      r={isHovered ? 5.5 : 3.5}
                      className="fill-[#4A90B2] stroke-surface stroke-2 transition-all duration-150"
                    />
                  )}

                  {/* Orders dot with outer glow when hovered */}
                  {isHovered && (
                    <circle cx={x} cy={yOrders} r={9} className="fill-[#E66A45] opacity-25" />
                  )}
                  {(chartData.length <= 14 || isHovered) && (
                    <circle
                      cx={x}
                      cy={yOrders}
                      r={isHovered ? 5.5 : 3.5}
                      className="fill-[#E66A45] stroke-surface stroke-2 transition-all duration-150"
                    />
                  )}

                  {/* X-axis Day Label (spaced for multi-day periods) */}
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
                      {d.day}
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

          {/* Floating Interactive Snapshot Tooltip */}
          {hoveredIdx !== null && chartData[hoveredIdx] && (
            <div
              className="absolute z-20 pointer-events-none bg-surface-raised dark:bg-[#191E2A] border border-border-default shadow-xl rounded-xl p-3 text-xs flex flex-col gap-2 -translate-x-1/2 -translate-y-full transition-all duration-75"
              style={{
                left: `${(getX(hoveredIdx) / width) * 100}%`,
                top: `${Math.max(10, (Math.min(getYOrders(chartData[hoveredIdx].orders), getYGmv(chartData[hoveredIdx].gmv)) / height) * 100 - 16)}%`,
              }}
            >
              <div className="font-semibold text-text-primary border-b border-border-subtle pb-1.5 flex items-center justify-between gap-4">
                <span>{chartData[hoveredIdx].day} Performance</span>
                <span className="text-[10px] text-text-tertiary font-mono">Live</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-[#E66A45]" />
                  Orders:
                </span>
                <span className="font-bold text-text-primary tabular-nums">
                  {chartData[hoveredIdx].orders.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-[#4A90B2]" />
                  GMV:
                </span>
                <span className="font-bold text-[#4A90B2] tabular-nums">
                  ₹{chartData[hoveredIdx].gmv.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
