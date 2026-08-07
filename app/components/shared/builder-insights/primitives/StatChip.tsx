"use client";

import { cn } from "@/lib/utils";

import { ToolbarTip } from "@/components/shared/builder-header";

export interface StatChipProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

/**
 * PRIMITIVE — one `value label` pair in the stats strip.
 *
 * Deliberately borderless. Four bordered chips floating in a wide header read
 * as four competing controls; as plain text separated by dots they read as one
 * quiet caption, which is all a stat line should be.
 *
 * Reuses the header's `ToolbarTip` so a hint behaves like a toolbar tooltip
 * rather than inventing a second treatment.
 */
export function StatChip({ label, value, hint, className }: StatChipProps) {
  return (
    <ToolbarTip tip={hint}>
      <span
        className={cn(
          "inline-flex items-baseline gap-1 whitespace-nowrap text-xs",
          hint && "cursor-help",
          className,
        )}
      >
        <span className="font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-muted-foreground">{label}</span>
      </span>
    </ToolbarTip>
  );
}
