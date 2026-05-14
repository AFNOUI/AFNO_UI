"use client";

import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface CandleDataPoint {
  low: number;
  open: number;
  high: number;
  label: string;
  close: number;
}

export type DataInput = string | ChartDataPoint[];
export type CandleDataInput = string | CandleDataPoint[];

export function parseChartData(input: DataInput): ChartDataPoint[] {
  if (Array.isArray(input)) return input;
  const lines = input.split("\n").filter(Boolean);
  const points: ChartDataPoint[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    points.push({ label: lines[i], value: Number(lines[i + 1]) || 0 });
  }
  return points;
}

export function parseCandleData(input: CandleDataInput): CandleDataPoint[] {
  if (Array.isArray(input)) return input as CandleDataPoint[];
  const lines = input.split("\n").filter(Boolean);
  const candles: CandleDataPoint[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    const nums = (lines[i + 1] || "").split(",").map(Number);
    if (nums.length >= 4) candles.push({ label: lines[i], open: nums[0], close: nums[1], high: nums[2], low: nums[3] });
  }
  return candles;
}

export const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.3)",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
];

export const MULTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(262 83% 58%)",
  "hsl(190 80% 45%)",
  "hsl(340 75% 55%)",
  "hsl(25 95% 53%)",
];

// Shared Tooltip
export function ChartTooltip({ label, value, x, y, visible, extra }: { label: string; value: number | string; x: number; y: number; visible: boolean; extra?: string }) {
  if (!visible) return null;
  const lines = extra ? 3 : 2;
  const h = lines * 12 + 10;
  return (
    <g className="pointer-events-none">
      <rect x={x - 48} y={y - h - 4} width={96} height={h} rx={6}
        fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={1}
        className="drop-shadow-lg" />
      <text x={x} y={y - h + 14} textAnchor="middle" className="text-[9px] fill-muted-foreground font-medium">{label}</text>
      <text x={x} y={y - h + 26} textAnchor="middle" className="text-[11px] fill-foreground font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</text>
      {extra && <text x={x} y={y - h + 38} textAnchor="middle" className="text-[8px] fill-muted-foreground">{extra}</text>}
    </g>
  );
}

// Shared wrapper for consistent sizing
export function ChartWrapper({ title, children, className, direction = "ltr", compact }: {
  title?: string; children: React.ReactNode; className?: string; direction?: "ltr" | "rtl"; compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2 w-full", className)} dir={direction}>
      {/* dir="auto" lets mixed-direction titles (e.g. Arabic with English numerals) render
          per the Unicode Bidi algorithm without overriding the chart's explicit direction. */}
      {title && (
        <h4
          dir="auto"
          className={cn(
            "font-semibold text-foreground text-center",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

// CSS keyframe style tag for animations
export function AnimStyle() {
  return (
    <style>{`
      @keyframes chartFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes chartGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      @keyframes chartDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
      @keyframes chartPop { 0% { transform: scale(0); } 80% { transform: scale(1.1); } 100% { transform: scale(1); } }
      .chart-fade { animation: chartFadeIn 0.5s ease-out both; }
      .chart-draw { stroke-dasharray: 1000; animation: chartDraw 1.2s ease-out both; }
    `}</style>
  );
}

export interface BaseChartProps {
  title?: string;
  className?: string;
  direction?: "ltr" | "rtl";
}
