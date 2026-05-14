"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AnimStyle, BaseChartProps, ChartTooltip, ChartWrapper, CandleDataInput, parseCandleData } from "../chart-primitives";

export type CandlestickVariant = "default" | "hollow" | "colored" | "minimal" | "heikin-ashi";

export function CandlestickChart({
  data: dataInput, variant = "default", title, className, direction = "ltr",
}: { data: CandleDataInput; variant?: CandlestickVariant } & BaseChartProps) {
  const rawData = parseCandleData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return <div className="text-sm text-muted-foreground p-4">No candle data</div>;

  const w = 400, h = 200, padX = 35, padY = 20;
  const allVals = data.flatMap(c => [c.open, c.close, c.high, c.low]);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const candleW = Math.min(24, (w - 2 * padX) / data.length - 6);
  const yScale = (v: number) => padY + (1 - (v - minV) / range) * (h - 2 * padY);

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg viewBox={`0 0 ${w} ${h + 25}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <AnimStyle />
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yPos = padY + pct * (h - 2 * padY);
          const val = maxV - pct * range;
          return (
            <g key={i}>
              <line x1={padX} x2={w - 10} y1={yPos} y2={yPos} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
              <text x={direction === "rtl" ? w - padX + 4 : padX - 4} y={yPos + 3} textAnchor={direction === "rtl" ? "start" : "end"} className="text-[7px] fill-muted-foreground">{val.toFixed(0)}</text>
            </g>
          );
        })}
        {data.map((c, i) => {
          const cx = padX + (i + 0.5) / data.length * (w - 2 * padX);
          const bullish = c.close >= c.open;
          const bodyTop = yScale(Math.max(c.open, c.close));
          const bodyBottom = yScale(Math.min(c.open, c.close));
          const bodyH = Math.max(bodyBottom - bodyTop, 2);
          const isH = hovered === i;
          const bullColor = "hsl(142 76% 36%)";
          const bearColor = "hsl(var(--destructive))";
          const color = bullish ? bullColor : bearColor;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer"
              style={{ animation: `chartFadeIn 0.4s ease-out ${i * 0.06}s both` }}>
              <line x1={cx} x2={cx} y1={yScale(c.high)} y2={yScale(c.low)}
                stroke={variant === "minimal" ? "hsl(var(--muted-foreground))" : color} strokeWidth={1.5} />
              <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyH} rx={2}
                fill={variant === "hollow" && bullish ? "transparent" : color}
                stroke={color} strokeWidth={variant === "hollow" ? 2 : 0}
                opacity={isH ? 1 : 0.85}
                className="transition-all duration-200"
                style={{ filter: isH ? `brightness(1.2) drop-shadow(0 2px 6px ${color})` : "none" }} />
              <text x={cx} y={h + 14} textAnchor="middle"
                className={cn("text-[8px]", isH ? "fill-foreground font-medium" : "fill-muted-foreground")}>{c.label}</text>
            </g>
          );
        })}
        {hovered !== null && (() => {
          const c = data[hovered];
          const cx = padX + (hovered + 0.5) / data.length * (w - 2 * padX);
          return (
            <ChartTooltip label={c.label} value={`O:${c.open} C:${c.close}`}
              x={cx} y={yScale(c.high)} visible extra={`H:${c.high} L:${c.low}`} />
          );
        })()}
      </svg>
    </ChartWrapper>
  );
}
