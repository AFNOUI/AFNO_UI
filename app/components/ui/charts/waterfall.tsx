"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, parseChartData } from "../chart-primitives";

export type WaterfallVariant = "default" | "colored" | "stacked" | "bridge";

export function WaterfallChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: WaterfallVariant } & BaseChartProps) {
  const rawData = parseChartData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  const bars: { label: string; value: number; start: number; end: number; isPositive: boolean }[] = [];
  let cumulative = 0;
  data.forEach(d => {
    bars.push({ label: d.label, value: d.value, start: cumulative, end: cumulative + d.value, isPositive: d.value >= 0 });
    cumulative += d.value;
  });

  const allValues = bars.flatMap(b => [b.start, b.end]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues, 1);
  const w = 400, h = 200, padX = 40, padY = 20;
  const barW = Math.max(14, (w - 2 * padX) / bars.length - 8);
  const yScale = (v: number) => padY + (1 - (v - minVal) / (maxVal - minVal)) * (h - 2 * padY);

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {[0, 0.5, 1].map((pct, i) => (
          <line key={i} x1={padX} x2={w - 10}
            y1={padY + pct * (h - 2 * padY)} y2={padY + pct * (h - 2 * padY)}
            stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
        ))}
        <line x1={padX} x2={w - 10} y1={yScale(0)} y2={yScale(0)} stroke="hsl(var(--border))" strokeWidth={1} />
        {bars.map((b, i) => {
          const cx = padX + (i + 0.5) / bars.length * (w - 2 * padX);
          const top = yScale(Math.max(b.start, b.end));
          const bottom = yScale(Math.min(b.start, b.end));
          const barH = Math.max(bottom - top, 2);
          const isH = hovered === i;
          const color = b.isPositive ? "hsl(142 76% 36%)" : "hsl(var(--destructive))";
          const lastBar = i === bars.length - 1;
          const totalColor = "hsl(var(--primary))";

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer"
              style={{ animation: `chartFadeIn 0.4s ease-out ${i * 0.06}s both` }}>
              {i > 0 && variant === "bridge" && (
                <line x1={padX + (i - 0.5) / bars.length * (w - 2 * padX) + barW / 2}
                  x2={cx - barW / 2} y1={yScale(b.start)} y2={yScale(b.start)}
                  stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} strokeDasharray="3 3" />
              )}
              <rect x={cx - barW / 2} y={top} width={barW} height={barH} rx={3}
                fill={lastBar && variant !== "colored" ? totalColor : color}
                opacity={isH ? 1 : 0.85}
                className="transition-all duration-300"
                style={{ filter: isH ? `brightness(1.2) drop-shadow(0 2px 8px ${color})` : "none" }} />
              <text x={cx} y={top - 5} textAnchor="middle"
                className={cn("text-[8px] font-medium", isH ? "fill-foreground" : "fill-muted-foreground")}>
                {b.value >= 0 ? "+" : ""}{b.value}
              </text>
              <text x={cx} y={h + 14} textAnchor="middle"
                className={cn("text-[8px]", isH ? "fill-foreground font-medium" : "fill-muted-foreground")}>{b.label}</text>
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
