"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import {
  AnimStyle,
  BaseChartProps,
  CHART_COLORS,
  ChartWrapper,
  DataInput,
  parseChartData,
} from "../chart-primitives";

export type BarVariant =
  | "neon"
  | "glass"
  | "default"
  | "striped"
  | "stacked"
  | "grouped"
  | "rounded"
  | "gradient"
  | "horizontal";

export function BarChart({
  data: dataInput,
  variant = "default",
  title,
  className,
  direction = "ltr",
}: { data: DataInput; variant?: BarVariant } & BaseChartProps) {
  const rawData = parseChartData(dataInput);
  const data = direction === "rtl" ? [...rawData].reverse() : rawData;
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  if (data.length === 0)
    return (
      <div className="text-sm text-muted-foreground p-4">No chart data</div>
    );
  const max = Math.max(...data.map((d) => d.value), 1);

  if (variant === "horizontal") {
    return (
      <ChartWrapper title={title} className={className} direction={direction}>
        <div className="space-y-3">
          {data.map((d, i) => (
            <div
              key={i}
              className="space-y-1 group cursor-default"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{d.label}</span>
                <span
                  className={cn(
                    "font-medium transition-colors",
                    hovered === i ? "text-primary" : "text-foreground",
                  )}
                >
                  {d.value}
                </span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    direction === "rtl" && "ms-auto",
                  )}
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                    transform: hovered === i ? "scaleY(1.2)" : "scaleY(1)",
                    transformOrigin: "center",
                    filter: hovered === i ? "brightness(1.2)" : "none",
                    boxShadow:
                      hovered === i
                        ? `0 0 12px ${CHART_COLORS[i % CHART_COLORS.length]}`
                        : "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartWrapper>
    );
  }

  const w = 400,
    h = 200,
    padX = 35,
    padY = 20,
    padBottom = 30;
  const barGap = 6;
  const barW = Math.max(
    12,
    (w - 2 * padX - barGap * data.length) / data.length,
  );

  return (
    <ChartWrapper title={title} className={className} direction={direction}>
      <svg
        viewBox={`0 0 ${w} ${h + padBottom}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <AnimStyle />
        <defs>
          {data.map((_, i) => (
            <linearGradient
              key={i}
              id={`bar-g-${uid}-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                stopOpacity="0.4"
              />
            </linearGradient>
          ))}
          {variant === "glass" && (
            <filter id={`glass-${uid}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          )}
        </defs>
        {/* Y-axis grid + labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yy = padY + (1 - pct) * (h - padY * 2);
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={w - 10}
                y1={yy}
                y2={yy}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
              <text
                x={direction === "rtl" ? w - padX + 6 : padX - 6}
                y={yy + 3}
                textAnchor={direction === "rtl" ? "start" : "end"}
                className="text-[8px] fill-muted-foreground"
              >
                {Math.round(max * pct)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = padX + i * (barW + barGap) + barGap / 2;
          const barH = (d.value / max) * (h - padY * 2);
          const y = padY + (h - padY * 2) - barH;
          const isH = hovered === i;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          const radius =
            variant === "rounded" || variant === "glass"
              ? Math.min(barW / 2, 8)
              : 3;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={radius}
                fill={
                  variant === "gradient" || variant === "glass"
                    ? `url(#bar-g-${uid}-${i})`
                    : color
                }
                opacity={variant === "glass" ? 0.7 : isH ? 1 : 0.85}
                filter={variant === "glass" ? `url(#glass-${uid})` : undefined}
                className="transition-all duration-300"
                style={{
                  transformOrigin: `${x + barW / 2}px ${h}px`,
                  animation: `chartGrow 0.6s ease-out ${i * 0.08}s both`,
                  filter: isH
                    ? `brightness(1.2) drop-shadow(0 -4px 12px ${color})`
                    : variant === "neon"
                      ? `drop-shadow(0 0 6px ${color})`
                      : "none",
                }}
              />
              {variant === "striped" && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={radius}
                  fill="url(#stripe-pattern)"
                  opacity={0.2}
                  className="pointer-events-none"
                />
              )}
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                className={cn(
                  "text-[9px] font-medium transition-all duration-200",
                  isH ? "fill-primary" : "fill-foreground",
                )}
                style={{ opacity: isH ? 1 : 0.7 }}
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={h + 14}
                textAnchor="middle"
                className={cn(
                  "text-[8px] transition-colors",
                  isH ? "fill-foreground font-medium" : "fill-muted-foreground",
                )}
              >
                {d.label}
              </text>
            </g>
          );
        })}
        {variant === "striped" && (
          <defs>
            <pattern
              id="stripe-pattern"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="white"
                strokeWidth="3"
              />
            </pattern>
          </defs>
        )}
      </svg>
    </ChartWrapper>
  );
}
