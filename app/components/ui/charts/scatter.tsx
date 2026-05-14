"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartTooltip, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type ScatterVariant = "default" | "bubble" | "colored" | "line-connected" | "clustered" | "glow";

export function ScatterChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: ScatterVariant } & BaseChartProps) {
  const rawData = parseChartData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;
  const w = 400, h = 220, padX = 40, padY = 20;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const pts = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * (w - 2 * padX),
    y: padY + (1 - d.value / maxVal) * (h - 2 * padY),
    size: variant === "bubble" ? 5 + (d.value / maxVal) * 16 : 5,
  }));

  const linePath = variant === "line-connected"
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") : "";

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${h + 25}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yy = padY + (1 - pct) * (h - 2 * padY);
          return (
            <g key={i}>
              <line x1={padX} x2={w - 10} y1={yy} y2={yy} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
              <text x={direction === "rtl" ? w - padX + 6 : padX - 6} y={yy + 3} textAnchor={direction === "rtl" ? "start" : "end"} className="text-[8px] fill-muted-foreground">{Math.round(maxVal * pct)}</text>
            </g>
          );
        })}
        {linePath && <path d={linePath} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth={1.5} strokeDasharray="6 4" className="chart-draw" />}
        {pts.map((p, i) => {
          const color = (variant === "colored" || variant === "clustered") ? MULTI_COLORS[i % MULTI_COLORS.length] : "hsl(var(--primary))";
          const isH = hovered === i;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" className="cursor-pointer" />
              <circle cx={p.x} cy={p.y} r={isH ? p.size + 3 : p.size}
                fill={color} opacity={variant === "bubble" ? 0.7 : 1}
                stroke="hsl(var(--background))" strokeWidth={2}
                className="transition-all duration-200 drop-shadow-sm"
                style={{
                  filter: (isH || variant === "glow") ? `drop-shadow(0 0 8px ${color})` : "none",
                  animation: `chartPop 0.4s ease-out ${i * 0.06}s both`,
                }} />
            </g>
          );
        })}
        {data.map((d, i) => (
          <text key={i} x={pts[i].x} y={h + 14} textAnchor="middle"
            className={cn("text-[8px]", hovered === i ? "fill-foreground font-medium" : "fill-muted-foreground")}>{d.label}</text>
        ))}
        {hovered !== null && (
          <ChartTooltip label={data[hovered].label} value={data[hovered].value} x={pts[hovered].x} y={pts[hovered].y} visible />
        )}
      </svg>
    </ChartWrapper>
  );
}
