"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type RadialBarVariant = "default" | "gradient" | "rounded" | "thin";

export function RadialBarChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: RadialBarVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const cx = 130, cy = 130, baseR = 110, gap = variant === "thin" ? 10 : 16;
  const strokeW = variant === "thin" ? 6 : 12;

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="0 0 260 260" className="w-full max-w-[260px] shrink-0" preserveAspectRatio="xMidYMid meet">
          <AnimStyle />
          {data.map((d, i) => {
            const r = baseR - i * gap;
            const pct = d.value / max;
            const color = MULTI_COLORS[i % MULTI_COLORS.length];
            const isH = hovered === i;
            const circumference = 2 * Math.PI * r;
            return (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeW}
                  strokeLinecap={variant === "rounded" ? "round" : "butt"} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
                  strokeWidth={isH ? strokeW + 3 : strokeW}
                  strokeLinecap={variant === "rounded" || variant === "gradient" ? "round" : "butt"}
                  strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
                  strokeDashoffset={circumference * 0.25}
                  className="transition-all duration-500"
                  style={{ filter: isH ? `drop-shadow(0 0 8px ${color})` : "none" }} />
              </g>
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="text-[14px] fill-foreground font-bold">
            {hovered !== null ? data[hovered].value : data.reduce((s, d) => s + d.value, 0)}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="text-[9px] fill-muted-foreground">
            {hovered !== null ? data[hovered].label : "Total"}
          </text>
        </svg>
        <div className="space-y-1.5 flex-1 min-w-0 w-full">
          {data.map((d, i) => (
            <div key={i} className={cn("flex items-center gap-2 text-xs cursor-pointer rounded-md px-2 py-1 transition-all duration-200",
              hovered === i ? "bg-muted" : "hover:bg-muted/50")}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: MULTI_COLORS[i % MULTI_COLORS.length] }} />
              <span className="text-muted-foreground truncate">{d.label}</span>
              <span className="ms-auto font-medium text-foreground tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}
