"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, parseChartData, MULTI_COLORS } from "../chart-primitives";

export type DonutProgressVariant = "default" | "gradient" | "thick" | "thin";

export function DonutProgressChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: DonutProgressVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  const maxEntry = data.find(d => d.label.toLowerCase() === "max");
  const maxVal = maxEntry?.value || 100;
  const items = data.filter(d => d.label.toLowerCase() !== "max");
  const cx = 100, cy = 100, r = 80;
  const strokeW = variant === "thick" ? 20 : variant === "thin" ? 6 : 12;
  const circumference = 2 * Math.PI * r;

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="0 0 200 200" className="w-full max-w-[200px] shrink-0" preserveAspectRatio="xMidYMid meet">
          <AnimStyle />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeW} />
          {items.map((d, i) => {
            const pct = Math.min(d.value / maxVal, 1);
            const color = MULTI_COLORS[i % MULTI_COLORS.length];
            const isH = hovered === i;
            const offset = items.slice(0, i).reduce((s, it) => s + (it.value / maxVal), 0);
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color}
                strokeWidth={isH ? strokeW + 4 : strokeW}
                strokeLinecap="round"
                strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
                strokeDashoffset={-circumference * offset + circumference * 0.25}
                className="transition-all duration-500 cursor-pointer"
                style={{ filter: isH ? `drop-shadow(0 0 6px ${color})` : "none" }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="text-[16px] fill-foreground font-bold">
            {hovered !== null ? `${items[hovered].value}%` : `${items.reduce((s, d) => s + d.value, 0)}`}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="text-[8px] fill-muted-foreground">
            {hovered !== null ? items[hovered].label : "Total"}
          </text>
        </svg>
        <div className="space-y-1.5 flex-1 min-w-0 w-full">
          {items.map((d, i) => (
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
