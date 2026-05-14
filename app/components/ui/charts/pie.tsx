"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AnimStyle, BaseChartProps, DataInput, MULTI_COLORS, ChartWrapper, parseChartData } from "../chart-primitives";

export type PieVariant = "default" | "donut" | "half" | "labeled" | "nested" | "exploded" | "rose";

export function PieChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: PieVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const max = Math.max(...data.map(d => d.value), 1);
  const cx = 110, cy = 110, baseR = 85;
  const innerR = variant === "donut" || variant === "nested" ? 50 : 0;

  const initialStartAngle = variant === "half" ? -Math.PI : -Math.PI / 2;
  const maxAngle = variant === "half" ? Math.PI : Math.PI * 2;

  const slices = data.reduce<{
    cursor: number;
    items: Array<{
      pathD: string;
      color: string;
      label: string;
      value: number;
      pct: number;
      labelX: number;
      labelY: number;
      midAngle: number;
    }>;
  }>((acc, d, i) => {
    const angle = (d.value / total) * maxAngle;
    const startAngle = acc.cursor;
    const r = variant === "rose" ? 40 + (d.value / max) * 50 : baseR;
    const endAngle = startAngle + angle;
    const midAngle = startAngle + angle / 2;
    const explodeOffset = variant === "exploded" ? 8 : 0;
    const hoverExtra = hovered === i ? 6 : 0;
    const totalOff = explodeOffset + hoverExtra;
    const ox = totalOff * Math.cos(midAngle);
    const oy = totalOff * Math.sin(midAngle);
    const x1 = cx + ox + r * Math.cos(startAngle);
    const y1 = cy + oy + r * Math.sin(startAngle);
    const x2 = cx + ox + r * Math.cos(endAngle);
    const y2 = cy + oy + r * Math.sin(endAngle);
    const ix1 = cx + ox + innerR * Math.cos(startAngle);
    const iy1 = cy + oy + innerR * Math.sin(startAngle);
    const ix2 = cx + ox + innerR * Math.cos(endAngle);
    const iy2 = cy + oy + innerR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = innerR > 0
      ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
      : `M ${cx + ox} ${cy + oy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const labelX = cx + (r + 16) * Math.cos(midAngle);
    const labelY = cy + (r + 16) * Math.sin(midAngle);
    acc.items.push({
      pathD,
      color: MULTI_COLORS[i % MULTI_COLORS.length],
      label: d.label,
      value: d.value,
      pct: Math.round((d.value / total) * 100),
      labelX,
      labelY,
      midAngle,
    });
    acc.cursor = endAngle;
    return acc;
  }, { cursor: initialStartAngle, items: [] }).items;

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="0 0 220 220" className="w-full max-w-[220px] shrink-0" preserveAspectRatio="xMidYMid meet">
          <AnimStyle />
          {slices.map((s, i) => (
            <path key={i} d={s.pathD} fill={s.color} stroke="hsl(var(--background))" strokeWidth="2"
              className="transition-all duration-300 cursor-pointer"
              style={{
                filter: hovered === i ? `brightness(1.2) drop-shadow(0 4px 12px ${s.color})` : "none",
                animation: `chartPop 0.5s ease-out ${i * 0.1}s both`,
              }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
          {(variant === "donut" || variant === "nested") && (
            <g className="pointer-events-none">
              <text x={cx} y={cy - 6} textAnchor="middle" className="text-[14px] fill-foreground font-bold">
                {hovered !== null ? `${slices[hovered].pct}%` : total.toLocaleString()}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" className="text-[9px] fill-muted-foreground">
                {hovered !== null ? slices[hovered].label : "Total"}
              </text>
            </g>
          )}
        </svg>
        <div className="space-y-1.5 flex-1 min-w-0 w-full">
          {slices.map((s, i) => (
            <div key={i}
              className={cn("flex items-center gap-2 text-xs cursor-pointer rounded-md px-2 py-1 transition-all duration-200",
                hovered === i ? "bg-muted scale-[1.02]" : "hover:bg-muted/50")}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="w-3 h-3 rounded-sm shrink-0 transition-transform duration-200" 
                style={{ background: s.color, transform: hovered === i ? "scale(1.3)" : "scale(1)" }} />
              <span className="text-muted-foreground truncate">{s.label}</span>
              <span className="ms-auto font-medium text-foreground tabular-nums">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}