"use client";

import { useState } from "react";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, parseChartData } from "../chart-primitives";

export type HeatmapVariant = "default" | "rounded" | "gradient" | "labeled";

export function HeatmapChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: HeatmapVariant } & BaseChartProps) {
  const rawData = parseChartData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const cols = Math.ceil(Math.sqrt(data.length * 1.5));
  const rows = Math.ceil(data.length / cols);
  const cellW = 50, cellH = 40, gap = 3;
  const W = cols * (cellW + gap), H = rows * (cellH + gap);

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {data.map((d, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const x = col * (cellW + gap), y = row * (cellH + gap);
          const intensity = d.value / max;
          const isH = hovered === i;
          const rx = variant === "rounded" ? 8 : 3;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer"
              style={{ animation: `chartFadeIn 0.3s ease-out ${i * 0.04}s both` }}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={rx}
                fill={`hsl(var(--primary) / ${0.1 + intensity * 0.9})`}
                className="transition-all duration-300"
                style={{ filter: isH ? "brightness(1.3)" : "none", transform: isH ? "scale(1.05)" : "scale(1)", transformOrigin: `${x + cellW / 2}px ${y + cellH / 2}px` }} />
              {(variant === "labeled" || isH) && (
                <>
                  <text x={x + cellW / 2} y={y + cellH / 2 - 4} textAnchor="middle"
                    className="text-[8px] fill-foreground font-medium">{d.label}</text>
                  <text x={x + cellW / 2} y={y + cellH / 2 + 8} textAnchor="middle"
                    className="text-[9px] fill-foreground font-bold">{d.value}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
