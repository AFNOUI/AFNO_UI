"use client";

import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { StatChip } from "../primitives/StatChip";
import type { BuilderStat } from "../types";

export interface BuilderStatsStripProps {
  stats: BuilderStat[];
  className?: string;
}

/**
 * CONTROL — the headline counts for the current build, as one dot-separated
 * caption rather than a row of boxes.
 */
export function BuilderStatsStrip({ stats, className }: BuilderStatsStripProps) {
  if (stats.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 ? (
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
          ) : null}
          <StatChip label={stat.label} value={stat.value} hint={stat.hint} />
        </Fragment>
      ))}
    </div>
  );
}
