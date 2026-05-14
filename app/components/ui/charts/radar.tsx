"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartTooltip, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type RadarVariant = "default" | "filled" | "dots" | "multi" | "rounded" | "glow";

export function RadarChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: RadarVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  if (data.length < 3) return <div className="text-sm text-muted-foreground p-4">Need at least 3 data points</div>;

  const cx = 150, cy = 150, r = 100;
  const max = Math.max(...data.map(d => d.value), 1);
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  const getPoint = (i: number, val: number) => ({
    x: cx + (val / max) * r * Math.cos(angleStep * i - Math.PI / 2),
    y: cy + (val / max) * r * Math.sin(angleStep * i - Math.PI / 2),
  });

  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        <defs>
          <linearGradient id={`rg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
          {variant === "glow" && <filter id={`rglow-${uid}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>}
        </defs>
        {[0.2, 0.4, 0.6, 0.8, 1].map((pct, ri) => (
          <polygon key={ri}
            points={Array.from({ length: n }, (_, i) => { const p = getPoint(i, max * pct); return `${p.x},${p.y}`; }).join(" ")}
            fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray={ri < 4 ? "3 3" : "none"} />
        ))}
        {data.map((_, i) => {
          const ep = getPoint(i, max);
          return <line key={i} x1={cx} y1={cy} x2={ep.x} y2={ep.y} stroke="hsl(var(--border))" strokeWidth={0.5} />;
        })}
        <polygon points={polygon}
          fill={variant === "filled" || variant === "rounded" || variant === "glow" ? `url(#rg-${uid})` : "hsl(var(--primary) / 0.1)"}
          stroke="hsl(var(--primary))" strokeWidth={2.5}
          strokeLinejoin={variant === "rounded" ? "round" : "miter"}
          filter={variant === "glow" ? `url(#rglow-${uid})` : undefined}
          className="transition-all duration-300 chart-fade" />
        {dataPoints.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" className="cursor-pointer" />
            <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : (variant === "dots" ? 5 : 3.5)}
              fill={hovered === i ? "hsl(var(--primary))" : MULTI_COLORS[i % MULTI_COLORS.length]}
              stroke="hsl(var(--background))" strokeWidth={2}
              className="transition-all duration-200 drop-shadow-sm" />
          </g>
        ))}
        {data.map((d, i) => {
          const lp = getPoint(i, max * 1.2);
          return (
            <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
              className={cn("text-[9px] transition-colors", hovered === i ? "fill-foreground font-bold" : "fill-muted-foreground")}>{d.label}</text>
          );
        })}
        {hovered !== null && (
          <ChartTooltip label={data[hovered].label} value={data[hovered].value}
            x={dataPoints[hovered].x} y={dataPoints[hovered].y - 12} visible />
        )}
      </svg>
    </ChartWrapper>
  );
}
