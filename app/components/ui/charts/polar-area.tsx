"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type PolarAreaVariant = "default" | "outlined" | "gradient" | "spaced";

export function PolarAreaChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: PolarAreaVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  const cx = 140, cy = 140, maxR = 110;
  const max = Math.max(...data.map(d => d.value), 1);
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;
  const spacing = variant === "spaced" ? 0.06 : 0;

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="0 0 280 280" className="w-full max-w-[280px] shrink-0" preserveAspectRatio="xMidYMid meet">
          <AnimStyle />
          {[0.25, 0.5, 0.75, 1].map((pct, i) => (
            <circle key={i} cx={cx} cy={cy} r={maxR * pct} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
          ))}
          {data.map((d, i) => {
            const r = (d.value / max) * maxR;
            const startAngle = angleStep * i - Math.PI / 2 + spacing;
            const endAngle = angleStep * (i + 1) - Math.PI / 2 - spacing;
            const isH = hovered === i;
            const color = MULTI_COLORS[i % MULTI_COLORS.length];
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
            const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path key={i} d={pathD} fill={variant === "outlined" ? "transparent" : color}
                stroke={color} strokeWidth={variant === "outlined" ? 2.5 : 1.5}
                opacity={isH ? 1 : 0.75}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isH ? `brightness(1.2) drop-shadow(0 2px 10px ${color})` : "none",
                  animation: `chartPop 0.5s ease-out ${i * 0.08}s both`,
                }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            );
          })}
        </svg>
        <div className="space-y-1.5 flex-1 min-w-0 w-full">
          {data.map((d, i) => (
            <div key={i} className={cn("flex items-center gap-2 text-xs cursor-pointer rounded-md px-2 py-1 transition-all duration-200",
              hovered === i ? "bg-muted" : "hover:bg-muted/50")}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: MULTI_COLORS[i % MULTI_COLORS.length] }} />
              <span className="text-muted-foreground truncate">{d.label}</span>
              <span className="ms-auto font-medium text-foreground tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}
