"use client";

import { useMemo, useState } from "react";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type TreemapVariant = "default" | "rounded" | "gradient" | "bordered" | "labeled";

export function TreemapChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: TreemapVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const W = 400, H = 200;

  const rects = useMemo(() => {
    const result: { x: number; y: number; w: number; h: number; label: string; value: number; origIdx: number }[] = [];
    let x = 0, y = 0, remW = W, remH = H;
    const items = sorted.map((d) => ({ ...d, origIdx: data.indexOf(d) }));
    for (let i = 0; i < items.length; i++) {
      const remaining = items.slice(i).reduce((s, d) => s + d.value, 0);
      const frac = items[i].value / remaining;
      if (remW >= remH) {
        const w = remW * frac;
        result.push({ x, y, w: Math.min(w, remW), h: remH, label: items[i].label, value: items[i].value, origIdx: items[i].origIdx });
        x += Math.min(w, remW);
        remW -= Math.min(w, remW);
      } else {
        const h = remH * frac;
        result.push({ x, y, w: remW, h: Math.min(h, remH), label: items[i].label, value: items[i].value, origIdx: items[i].origIdx });
        y += Math.min(h, remH);
        remH -= Math.min(h, remH);
      }
    }
    return result;
  }, [data, sorted]);

  const rx = variant === "rounded" ? 10 : variant === "bordered" ? 3 : 0;

  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {rects.map((r, i) => {
          const isH = hovered === i;
          const color = MULTI_COLORS[r.origIdx % MULTI_COLORS.length];
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <rect x={r.x + 1.5} y={r.y + 1.5} width={Math.max(r.w - 3, 0)} height={Math.max(r.h - 3, 0)} rx={rx}
                fill={color}
                stroke={variant === "bordered" ? "hsl(var(--background))" : "none"} strokeWidth={variant === "bordered" ? 2.5 : 0}
                opacity={isH ? 1 : 0.8}
                className="transition-all duration-300"
                style={{
                  filter: isH ? `brightness(1.2) drop-shadow(0 2px 8px ${color})` : "none",
                  animation: `chartFadeIn 0.4s ease-out ${i * 0.08}s both`,
                }} />
              {r.w > 40 && r.h > 28 && (
                <>
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 4} textAnchor="middle"
                    className="text-[10px] fill-white font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{r.label}</text>
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 10} textAnchor="middle"
                    className="text-[9px] fill-white/80" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{r.value}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </ChartWrapper>
  );
}
