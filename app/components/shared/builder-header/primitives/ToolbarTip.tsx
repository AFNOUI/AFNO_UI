"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export interface ToolbarTipProps {
  /** When omitted the child is returned untouched — no wrapper, no provider. */
  tip?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}

/**
 * PRIMITIVE — optional tooltip wrapper for toolbar controls.
 *
 * Ships its own `TooltipProvider` so any control in this folder can be dropped
 * into a page that has no provider at the root (the tree builder, today).
 * Radix supports nested providers, so pages that already have one are fine.
 */
export function ToolbarTip({ tip, side = "bottom", children }: ToolbarTipProps) {
  if (!tip) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="text-xs">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
