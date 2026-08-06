"use client";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

import type { BuilderBadgeTone } from "../types";
import { BADGE_TONE_CLASSES } from "../constants";

export interface BuilderBadgeProps {
  children: React.ReactNode;
  tone?: BuilderBadgeTone;
  className?: string;
}

/**
 * PRIMITIVE — the tiny tone-coded pill used for template complexity and header
 * meta.
 *
 * Replaces the `complexityColors` record that was duplicated in the table and
 * kanban builder pages; pair it with `complexityTone()` from `../utils`.
 */
export function BuilderBadge({ children, tone = "neutral", className }: BuilderBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-4 shrink-0 border px-1 text-[9px] font-medium capitalize leading-none",
        BADGE_TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
