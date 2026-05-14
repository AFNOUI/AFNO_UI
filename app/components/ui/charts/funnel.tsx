"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type FunnelVariant = "default" | "smooth" | "striped" | "gradient" | "flat" | "pyramid";

export function FunnelChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: FunnelVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  const max = Math.max(...data.map(d => d.value), 1);
  const w = 360, totalH = 220;
  const segH = totalH / data.length;
  const cx = w / 2;
  const maxW = 300;
  const isPyramid = variant === "pyramid";

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${totalH + 10}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {data.map((d, i) => {
          const w1 = isPyramid ? ((data.length - i) / data.length) * maxW : (d.value / max) * maxW;
          const w2 = isPyramid
            ? ((data.length - i - 1) / data.length) * maxW
            : (i < data.length - 1 ? (data[i + 1].value / max) * maxW : w1 * 0.5);
          const y1 = i * segH;
          const y2 = y1 + segH;
          const isH = hovered === i;
          const color = MULTI_COLORS[i % MULTI_COLORS.length];

          const pathD = variant === "smooth"
            ? `M ${cx - w1 / 2} ${y1} C ${cx - w1 / 2} ${y1 + segH * 0.5}, ${cx - w2 / 2} ${y2 - segH * 0.3}, ${cx - w2 / 2} ${y2} L ${cx + w2 / 2} ${y2} C ${cx + w2 / 2} ${y2 - segH * 0.3}, ${cx + w1 / 2} ${y1 + segH * 0.5}, ${cx + w1 / 2} ${y1} Z`
            : variant === "flat"
              ? `M ${cx - w1 / 2} ${y1} L ${cx + w1 / 2} ${y1} L ${cx + w1 / 2} ${y2} L ${cx - w1 / 2} ${y2} Z`
              : `M ${cx - w1 / 2} ${y1} L ${cx + w1 / 2} ${y1} L ${cx + w2 / 2} ${y2} L ${cx - w2 / 2} ${y2} Z`;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <path d={pathD} fill={color} stroke="hsl(var(--background))" strokeWidth={1.5}
                opacity={isH ? 1 : 0.85}
                className="transition-all duration-300"
                style={{
                  filter: isH ? `brightness(1.2) drop-shadow(0 2px 8px ${color})` : "none",
                  animation: `chartFadeIn 0.4s ease-out ${i * 0.08}s both`,
                }} />
              <text x={cx} y={y1 + segH / 2 - 5} textAnchor="middle"
                className={cn("text-[10px] font-semibold", isH ? "fill-foreground" : "fill-foreground/80")}>{d.label}</text>
              <text x={cx} y={y1 + segH / 2 + 9} textAnchor="middle"
                className="text-[9px] fill-foreground/60">{d.value.toLocaleString()}</text>
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
