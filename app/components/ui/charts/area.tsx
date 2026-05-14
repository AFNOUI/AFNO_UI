"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartTooltip, ChartWrapper, DataInput, parseChartData } from "../chart-primitives";

export type AreaVariant = "default" | "gradient" | "stacked" | "stepped" | "sparkline" | "range" | "glow";

export function AreaChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: AreaVariant } & BaseChartProps) {
  const rawData = parseChartData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const isSpark = variant === "sparkline";
  const w = 400, h = isSpark ? 80 : 200, padX = isSpark ? 4 : 35, padY = isSpark ? 4 : 20;

  const points = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * (w - 2 * padX),
    y: padY + (1 - d.value / max) * (h - 2 * padY),
  }));

  let linePath: string;
  if (variant === "stepped") {
    linePath = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = points[i - 1];
      return `${acc} L ${p.x},${prev.y} L ${p.x},${p.y}`;
    }, "");
  } else {
    linePath = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
    }, "");
  }
  const areaPath = `${linePath} L ${points[points.length - 1].x},${h - padY} L ${points[0].x},${h - padY} Z`;

  return (
    <ChartWrapper title={title} className={className} direction={direction} compact={isSpark}>
      <svg viewBox={`0 0 ${w} ${isSpark ? h : h + 25}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        <defs>
          <linearGradient id={`ag-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={variant === "gradient" || variant === "glow" ? "0.5" : "0.25"} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
          {variant === "glow" && <filter id={`aglow-${uid}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>}
        </defs>
        {!isSpark && [0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yy = padY + (1 - pct) * (h - 2 * padY);
          return (
            <g key={i}>
              <line x1={padX} x2={w - 10} y1={yy} y2={yy} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={direction === "rtl" ? w - padX + 6 : padX - 6} y={yy + 3} textAnchor={direction === "rtl" ? "start" : "end"} className="text-[8px] fill-muted-foreground">{Math.round(max * pct)}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#ag-${uid})`} className="chart-fade" />
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          filter={variant === "glow" ? `url(#aglow-${uid})` : undefined} className="chart-draw" />
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={p.x} cy={p.y} r="14" fill="transparent" className="cursor-pointer" />
            <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 2.5}
              fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2}
              className="transition-all duration-200" />
          </g>
        ))}
        {hovered !== null && !isSpark && (
          <>
            <line x1={points[hovered].x} x2={points[hovered].x} y1={padY} y2={h - padY}
              stroke="hsl(var(--primary) / 0.3)" strokeWidth={1} strokeDasharray="3 3" />
            <ChartTooltip label={data[hovered].label} value={data[hovered].value} x={points[hovered].x} y={points[hovered].y} visible />
          </>
        )}
        {!isSpark && data.map((d, i) => (
          <text key={i} x={points[i].x} y={h + 14} textAnchor="middle"
            className={cn("text-[8px]", hovered === i ? "fill-foreground font-medium" : "fill-muted-foreground")}>{d.label}</text>
        ))}
      </svg>
    </ChartWrapper>
  );
}
