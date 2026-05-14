"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, parseChartData, MULTI_COLORS } from "../chart-primitives";

export type SankeyVariant = "default" | "curved" | "gradient";

export function SankeyChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: SankeyVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) return <div className="text-sm text-muted-foreground p-4">Need at least 2 data points</div>;

  const w = 400, h = 200, padX = 20, padY = 10;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const nodeW = 16;
  const leftX = padX, rightX = w - padX - nodeW;
  const usableH = h - 2 * padY;

  // Left: all items stacked. Right: all items stacked (shuffled order by value desc)
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const leftNodes = data.reduce<Array<{ label: string; value: number; x: number; y: number; h: number }>>((acc, d) => {
    const y = acc.length === 0 ? padY : acc[acc.length - 1].y + acc[acc.length - 1].h + 2;
    const nh = (d.value / total) * usableH;
    acc.push({ label: d.label, value: d.value, x: leftX, y, h: nh });
    return acc;
  }, []);
  const rightNodes = sorted.reduce<Array<{ label: string; value: number; x: number; y: number; h: number }>>((acc, d) => {
    const y = acc.length === 0 ? padY : acc[acc.length - 1].y + acc[acc.length - 1].h + 2;
    const nh = (d.value / total) * usableH;
    acc.push({ label: d.label, value: d.value, x: rightX, y, h: nh });
    return acc;
  }, []);

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {leftNodes.map((ln, i) => {
          const rn = rightNodes.find(r => r.label === ln.label)!;
          const color = MULTI_COLORS[i % MULTI_COLORS.length];
          const isH = hovered === i;
          const pathD = variant === "curved"
            ? `M ${ln.x + nodeW} ${ln.y} C ${w / 2} ${ln.y}, ${w / 2} ${rn.y}, ${rn.x} ${rn.y} L ${rn.x} ${rn.y + rn.h} C ${w / 2} ${rn.y + rn.h}, ${w / 2} ${ln.y + ln.h}, ${ln.x + nodeW} ${ln.y + ln.h} Z`
            : `M ${ln.x + nodeW} ${ln.y} L ${rn.x} ${rn.y} L ${rn.x} ${rn.y + rn.h} L ${ln.x + nodeW} ${ln.y + ln.h} Z`;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <path d={pathD} fill={color} opacity={isH ? 0.5 : 0.2}
                className="transition-all duration-300"
                style={{ animation: `chartFadeIn 0.5s ease-out ${i * 0.08}s both` }} />
              <rect x={ln.x} y={ln.y} width={nodeW} height={ln.h} rx={3} fill={color}
                opacity={isH ? 1 : 0.85} className="transition-all duration-200" />
              <rect x={rn.x} y={rn.y} width={nodeW} height={rn.h} rx={3} fill={color}
                opacity={isH ? 1 : 0.85} className="transition-all duration-200" />
              <text x={ln.x + nodeW + 6} y={ln.y + ln.h / 2 + 3} textAnchor="start"
                className={cn("text-[8px]", isH ? "fill-foreground font-bold" : "fill-muted-foreground")}>{ln.label} ({ln.value})</text>
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
