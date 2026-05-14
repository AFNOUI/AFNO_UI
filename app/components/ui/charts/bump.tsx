"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, parseChartData, MULTI_COLORS } from "../chart-primitives";

export type BumpVariant = "default" | "smooth" | "dots" | "thick";

export function BumpChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: BumpVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) return <div className="text-sm text-muted-foreground p-4">Need at least 2 data points</div>;

  const w = 400, h = 200, padX = 50, padY = 30;
  const n = data.length;
  const maxRank = n;

  const sorted = [...data].map((d, i) => ({ ...d, origIdx: i })).sort((a, b) => b.value - a.value);
  const ranks = new Array(n);
  sorted.forEach((d, rank) => { ranks[d.origIdx] = rank + 1; });

  const cols = 3;
  const colW = (w - 2 * padX) / (cols - 1);

  // For RTL, reverse column positions
  const getColX = (col: number) => {
    const x = padX + col * colW;
    return direction === "rtl" ? w - x : x;
  };

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {data.map((d, i) => {
          const startRank = i + 1;
          const endRank = ranks[i];
          const midRank = (startRank + endRank) / 2;
          const color = MULTI_COLORS[i % MULTI_COLORS.length];
          const isH = hovered === i;
          const yStart = padY + ((startRank - 1) / (maxRank - 1)) * (h - 2 * padY);
          const yMid = padY + ((midRank - 1) / (maxRank - 1)) * (h - 2 * padY);
          const yEnd = padY + ((endRank - 1) / (maxRank - 1)) * (h - 2 * padY);
          const x0 = getColX(0), x1 = getColX(1), x2 = getColX(2);

          const path = variant === "smooth"
            ? `M ${x0},${yStart} C ${(x0 + x1) / 2},${yStart} ${(x0 + x1) / 2},${yMid} ${x1},${yMid} C ${(x1 + x2) / 2},${yMid} ${(x1 + x2) / 2},${yEnd} ${x2},${yEnd}`
            : `M ${x0},${yStart} L ${x1},${yMid} L ${x2},${yEnd}`;

          const labelStartX = direction === "rtl" ? x0 + 8 : x0 - 8;
          const labelEndX = direction === "rtl" ? x2 - 8 : x2 + 8;
          const labelStartAnchor = direction === "rtl" ? "start" : "end";
          const labelEndAnchor = direction === "rtl" ? "end" : "start";

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <path d={path} fill="none" stroke={color}
                strokeWidth={isH ? (variant === "thick" ? 6 : 4) : (variant === "thick" ? 4 : 2.5)}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={hovered !== null && !isH ? 0.2 : 1}
                className="transition-all duration-300" />
              {[{ x: x0, y: yStart }, { x: x1, y: yMid }, { x: x2, y: yEnd }].map((p, pi) => (
                <circle key={pi} cx={p.x} cy={p.y} r={isH ? 6 : (variant === "dots" ? 5 : 4)}
                  fill={color} stroke="hsl(var(--background))" strokeWidth={2}
                  opacity={hovered !== null && !isH ? 0.2 : 1}
                  className="transition-all duration-200" />
              ))}
              <text x={labelStartX} y={yStart + 4} textAnchor={labelStartAnchor}
                className={cn("text-[9px]", isH ? "fill-foreground font-bold" : "fill-muted-foreground")}>{d.label}</text>
              <text x={labelEndX} y={yEnd + 4} textAnchor={labelEndAnchor}
                className={cn("text-[9px]", isH ? "fill-foreground font-bold" : "fill-muted-foreground")}>{d.value}</text>
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
