"use client";

/**
 * The variant-picker strip every gallery page (tables/kanban/tree/forms) puts
 * right under its header — pick which of N variants is on show.
 *
 * Was three near-duplicate implementations that had drifted: tables/kanban
 * wrapped their chips in `flex-wrap` *inside* a `ScrollArea` (which fights
 * the scroll area's own scroll behavior) and had uneven complexity-badge
 * widths that read as messy; tree had no desktop strip at all, only the
 * mobile dropdown; forms had a strip but no complexity badges (it has no
 * complexity data).
 *
 * One shared component now owns the layout for all four: a plain wrapping
 * chip grid on desktop — everything is visible at a glance, no horizontal
 * scrolling required even for the 26-variant tables gallery — and the same
 * list as a dropdown on mobile. `complexity` is optional per item — omit it
 * (as forms does) and the badge simply doesn't render, rather than being a
 * fifth bespoke variant of this control.
 */

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface VariantPickerOption {
  key: string;
  label: string;
  /** Omit when the family has no complexity data (e.g. forms) — the badge just won't render. */
  complexity?: string;
}

/** Shared basic/intermediate/advanced/expert palette — override per page only if a family needs different tiers. */
export const DEFAULT_COMPLEXITY_COLORS: Record<string, string> = {
  basic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  advanced: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  expert: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const COMPLEXITY_RANK: Record<string, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
  expert: 3,
};

/**
 * Basic → intermediate → advanced → expert, regardless of how the source
 * data array is ordered. `Array.sort` is stable, so items sharing a rank (or
 * with no `complexity` at all, e.g. forms) keep their original relative
 * order instead of being shuffled.
 */
function sortByComplexity(options: VariantPickerOption[]): VariantPickerOption[] {
  return [...options].sort((a, b) => {
    const rankA = a.complexity ? COMPLEXITY_RANK[a.complexity] ?? 99 : 99;
    const rankB = b.complexity ? COMPLEXITY_RANK[b.complexity] ?? 99 : 99;
    return rankA - rankB;
  });
}

function ComplexityBadge({
  complexity,
  colors,
  active,
}: {
  complexity: string;
  colors: Record<string, string>;
  active: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] h-4 px-1.5 capitalize border shrink-0",
        colors[complexity],
        active && "bg-background/20 text-primary-foreground border-primary-foreground/30",
      )}
    >
      {complexity}
    </Badge>
  );
}

export interface VariantPickerProps {
  variants: VariantPickerOption[];
  activeKey: string;
  onSelect: (key: string) => void;
  complexityColors?: Record<string, string>;
  className?: string;
}

export function VariantPicker({
  variants,
  activeKey,
  onSelect,
  complexityColors = DEFAULT_COMPLEXITY_COLORS,
  className,
}: VariantPickerProps) {
  const sorted = sortByComplexity(variants);
  const active = sorted.find((v) => v.key === activeKey) ?? sorted[0];

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: a plain wrapping grid — everything visible, nothing to scroll through. */}
      <div className="hidden md:block rounded-xl border border-border bg-muted/50 p-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {sorted.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => onSelect(v.key)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2",
                activeKey === v.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {v.label}
              {v.complexity && (
                <ComplexityBadge
                  complexity={v.complexity}
                  colors={complexityColors}
                  active={activeKey === v.key}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: same list, as a dropdown. */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2 truncate">
                {active?.label}
                {active?.complexity && (
                  <ComplexityBadge complexity={active.complexity} colors={complexityColors} active={false} />
                )}
              </span>
              <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md max-h-[60vh] overflow-y-auto">
            {sorted.map((v) => (
              <DropdownMenuItem
                key={v.key}
                onClick={() => onSelect(v.key)}
                className={cn(
                  "text-xs",
                  activeKey === v.key && "bg-primary/10 text-primary font-medium",
                )}
              >
                <span className="flex-1 truncate">{v.label}</span>
                {v.complexity && (
                  <ComplexityBadge complexity={v.complexity} colors={complexityColors} active={false} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
