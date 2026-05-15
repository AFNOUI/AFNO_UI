"use client";

import { cn } from "@/lib/utils";

/**
 * "Make-room" target indicator used by every DnD variant that resolves an
 * insertion point on the y-axis (sortable list, multi-list, trash source,
 * tree branch). Honours `prefers-reduced-motion` via the `animated` flag.
 */
export function SortableDropShadow({
  height,
  animated,
}: {
  height: number;
  animated: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md border border-primary/60 bg-primary/10 shadow-lg ring-1 ring-primary/20",
        animated && "animate-in fade-in zoom-in-95 duration-150",
      )}
      style={{ height: Math.max(height, 42) }}
    />
  );
}
