"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartWrapper, DataInput, MULTI_COLORS, parseChartData } from "../chart-primitives";

export type GaugeVariant = "default" | "gradient" | "segmented" | "mini" | "multi-ring" | "speedometer";

export function GaugeChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: DataInput; variant?: GaugeVariant } & BaseChartProps) {
  const data = parseChartData(dataInput);
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No chart data</div>;

  const maxEntry = data.find(d => d.label.toLowerCase() === "max");
  const maxVal = maxEntry?.value || 100;
  const valueEntries = data.filter(d => d.label.toLowerCase() !== "max");

  const firstVal = valueEntries[0]?.value || 0;
  const pct = Math.min(Math.max(firstVal / maxVal, 0), 1);

  const polarToCart = (cx: number, cy: number, angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const describeArc = (cx: number, cy: number, startA: number, endA: number, radius: number) => {
    const start = polarToCart(cx, cy, endA, radius);
    const end = polarToCart(cx, cy, startA, radius);
    const largeArc = endA - startA > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  if (variant === "mini") {
    return (
      <ChartWrapper title={title} className={className} direction={direction} compact>
        <svg viewBox="0 0 100 60" className="w-full max-w-[120px] mx-auto">
          <path d={describeArc(50, 45, -180, 0, 35)} fill="none" stroke="hsl(var(--muted))" strokeWidth={7} strokeLinecap="round" />
          <path d={describeArc(50, 45, -180, -180 + pct * 180, 35)} fill="none" stroke="hsl(var(--primary))" strokeWidth={7} strokeLinecap="round"
            className="transition-all duration-700" />
          <text x={50} y={50} textAnchor="middle" className="text-[12px] fill-foreground font-bold">{Math.round(pct * 100)}%</text>
        </svg>
      </ChartWrapper>
    );
  }

  if (variant === "multi-ring") {
    const ringCx = 150, ringCy = 120, baseRadius = 85, ringGap = 18;
    const startA = -210, endA = 30, totalA = endA - startA;
    return (
      <ChartWrapper title={title} className={className} direction={direction}>
        <svg viewBox="0 0 300 180" className="w-full max-w-[360px] mx-auto" preserveAspectRatio="xMidYMid meet">
          <AnimStyle />
          {valueEntries.slice(0, 4).map((d, i) => {
            const ringR = baseRadius - i * ringGap;
            const ringPct = Math.min(d.value / maxVal, 1);
            const isH = hovered === i;
            const color = MULTI_COLORS[i % MULTI_COLORS.length];
            return (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                <path d={describeArc(ringCx, ringCy, startA, endA, ringR)} fill="none"
                  stroke="hsl(var(--muted))" strokeWidth={isH ? 12 : 10} strokeLinecap="round" />
                <path d={describeArc(ringCx, ringCy, startA, startA + ringPct * totalA, ringR)} fill="none"
                  stroke={color} strokeWidth={isH ? 14 : 10} strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{ filter: isH ? `drop-shadow(0 0 8px ${color})` : "none" }} />
              </g>
            );
          })}
          {valueEntries.slice(0, 4).map((d, i) => (
            <g key={`leg-${i}`} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <rect x={220} y={20 + i * 24} width={12} height={12} rx={3} fill={MULTI_COLORS[i % MULTI_COLORS.length]} />
              <text x={238} y={30 + i * 24}
                className={cn("text-[10px]", hovered === i ? "fill-foreground font-bold" : "fill-muted-foreground")}>
                {d.label}: {d.value}
              </text>
            </g>
          ))}
        </svg>
      </ChartWrapper>
    );
  }

  const svgCx = 150, svgCy = 120, gaugeR = 90, strokeW = 14;
  const startAngle = -210, endAngle = 30, totalAngle = endAngle - startAngle;

  if (variant === "segmented") {
    const segments = 24;
    const segAngle = totalAngle / segments;
    const filledSegs = Math.round(pct * segments);
    return (
      <ChartWrapper title={title} className={className} direction={direction}>
        <svg viewBox="0 0 300 170" className="w-full max-w-[320px] mx-auto" preserveAspectRatio="xMidYMid meet">
          {Array.from({ length: segments }, (_, i) => {
            const sA = startAngle + i * segAngle + 1;
            const eA = startAngle + (i + 1) * segAngle - 1;
            const filled = i < filledSegs;
            return (
              <path key={i} d={describeArc(svgCx, svgCy, sA, eA, gaugeR)} fill="none"
                stroke={filled ? (i / segments < 0.4 ? "hsl(142 76% 36%)" : i / segments < 0.7 ? "hsl(38 92% 50%)" : "hsl(var(--destructive))") : "hsl(var(--muted))"}
                strokeWidth={strokeW} strokeLinecap="butt"
                className="transition-all duration-300"
                style={{ animation: filled ? `chartFadeIn 0.3s ease-out ${i * 0.03}s both` : "none" }} />
            );
          })}
          <text x={svgCx} y={svgCy + 8} textAnchor="middle" className="text-[22px] fill-foreground font-bold">{firstVal}</text>
          <text x={svgCx} y={svgCy + 24} textAnchor="middle" className="text-[10px] fill-muted-foreground">{valueEntries[0]?.label}</text>
        </svg>
      </ChartWrapper>
    );
  }

  if (variant === "speedometer") {
    const needleAngle = startAngle + pct * totalAngle;
    const np = polarToCart(svgCx, svgCy, needleAngle, gaugeR - 20);
    return (
      <ChartWrapper title={title} className={className} direction={direction}>
        <svg viewBox="0 0 300 180" className="w-full max-w-[320px] mx-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`spd-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(142 76% 36%)" />
              <stop offset="50%" stopColor="hsl(38 92% 50%)" />
              <stop offset="100%" stopColor="hsl(var(--destructive))" />
            </linearGradient>
          </defs>
          <path d={describeArc(svgCx, svgCy, startAngle, endAngle, gaugeR)} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeW} strokeLinecap="round" />
          <path d={describeArc(svgCx, svgCy, startAngle, startAngle + pct * totalAngle, gaugeR)} fill="none"
            stroke={`url(#spd-${uid})`} strokeWidth={strokeW} strokeLinecap="round" className="transition-all duration-700" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = startAngle + (i / 10) * totalAngle;
            const p1 = polarToCart(svgCx, svgCy, a, gaugeR + 10);
            const p2 = polarToCart(svgCx, svgCy, a, gaugeR + 16);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />;
          })}
          <line x1={svgCx} y1={svgCy} x2={np.x} y2={np.y} stroke="hsl(var(--foreground))" strokeWidth={2.5} strokeLinecap="round"
            className="transition-all duration-700 drop-shadow-md" />
          <circle cx={svgCx} cy={svgCy} r={6} fill="hsl(var(--foreground))" className="drop-shadow-md" />
          <text x={svgCx} y={svgCy + 28} textAnchor="middle" className="text-[22px] fill-foreground font-bold">{firstVal}</text>
          <text x={svgCx} y={svgCy + 42} textAnchor="middle" className="text-[10px] fill-muted-foreground">of {maxVal}</text>
        </svg>
      </ChartWrapper>
    );
  }

  // Default & gradient gauge
  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox="0 0 300 180" className="w-full max-w-[320px] mx-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`gg-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(142 76% 36%)" />
            <stop offset="50%" stopColor="hsl(38 92% 50%)" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" />
          </linearGradient>
        </defs>
        <path d={describeArc(svgCx, svgCy, startAngle, endAngle, gaugeR)} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeW} strokeLinecap="round" />
        <path d={describeArc(svgCx, svgCy, startAngle, startAngle + pct * totalAngle, gaugeR)} fill="none"
          stroke={variant === "gradient" ? `url(#gg-${uid})` : "hsl(var(--primary))"}
          strokeWidth={strokeW} strokeLinecap="round" className="transition-all duration-700" />
        {(() => {
          const needleAngle = startAngle + pct * totalAngle;
          const np = polarToCart(svgCx, svgCy, needleAngle, gaugeR);
          return <circle cx={np.x} cy={np.y} r={5} fill="hsl(var(--foreground))" className="drop-shadow-md transition-all duration-700" />;
        })()}
        <text x={svgCx} y={svgCy + 10} textAnchor="middle" className="text-[24px] fill-foreground font-bold">{firstVal}</text>
        <text x={svgCx} y={svgCy + 28} textAnchor="middle" className="text-[10px] fill-muted-foreground">of {maxVal} — {valueEntries[0]?.label}</text>
        <text x={svgCx - gaugeR + 10} y={svgCy + 40} textAnchor="start" className="text-[8px] fill-muted-foreground">0</text>
        <text x={svgCx + gaugeR - 10} y={svgCy + 40} textAnchor="end" className="text-[8px] fill-muted-foreground">{maxVal}</text>
      </svg>
    </ChartWrapper>
  );
}