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
 * Reuses the header's `ToolbarTip` so a hint reads identically to a toolbar
 * tooltip rather than inventing a second tooltip treatment.
 */
export function StatChip({ label, value, hint, className }: StatChipProps) {
  return (
    <ToolbarTip tip={hint}>
      <span
        className={cn(
          "inline-flex items-baseline gap-1.5 rounded-(--radius) border border-border/60",
          "bg-muted/40 px-2 py-1 text-xs",
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
