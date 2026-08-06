"use client";

import { cn } from "@/lib/utils";

import { StatChip } from "../primitives/StatChip";
import type { BuilderStat } from "../types";

export interface BuilderStatsStripProps {
  stats: BuilderStat[];
  className?: string;
}

/** CONTROL — the row of headline counts for the current build. */
export function BuilderStatsStrip({ stats, className }: BuilderStatsStripProps) {
  if (stats.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {stats.map((stat) => (
        <StatChip key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
      ))}
    </div>
  );
}
