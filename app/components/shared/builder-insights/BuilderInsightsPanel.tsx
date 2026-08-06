"use client";

import * as React from "react";
import { Stethoscope, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

import { BuilderIssueList } from "./controls/BuilderIssueList";
import { BuilderStatsStrip } from "./controls/BuilderStatsStrip";
import { BuilderHealthStatus } from "./controls/BuilderHealthStatus";
import type { UseBuilderInsightsResult } from "./hooks";

export interface BuilderInsightsPanelProps {
  /** Return value of `useBuilderInsights()`. */
  insights: UseBuilderInsightsResult;
  /** Panel heading. Defaults to "Build health". */
  title?: string;
  /** All-clear copy, e.g. "No issues — this form is ready to export." */
  emptyMessage?: string;
  /** Start expanded. Defaults to expanding only when something is wrong. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * PANEL — the shared "is this build sound?" surface for all four builders.
 *
 * Replaces the read-only "JSON Configuration" dumps that used to occupy this
 * space. A dump showed the user what they already had; this tells them what is
 * wrong with it, where, and what to do — the checks are the ones that would
 * otherwise surface as broken generated code in a consumer project.
 *
 * The whole header is the toggle. An earlier version put a lone chevron button
 * at the far right of a very wide bar, which left a large dead gap and gave the
 * user a tiny target; now the row reads title → verdict → stats and every part
 * of it is clickable.
 */
export function BuilderInsightsPanel({
  insights,
  title = "Build health",
  emptyMessage,
  defaultOpen,
  className,
}: BuilderInsightsPanelProps) {
  const { sorted, stats, summary } = insights;

  // Only errors and warnings are worth interrupting for. Notes ("no rows
  // loaded yet", "the form has no fields yet") describe an expected starting
  // state, so expanding for them would greet every new build with an open
  // panel. The count chip in the header still advertises them.
  const needsAttention = summary.errors + summary.warnings > 0;
  const [open, setOpen] = React.useState(defaultOpen ?? needsAttention);
  const contentId = React.useId();

  // Follow the build: opening on the first real problem, and closing again once
  // the user has cleared them, without fighting a manual toggle in between.
  const prevNeedsAttention = React.useRef(needsAttention);
  React.useEffect(() => {
    if (prevNeedsAttention.current !== needsAttention) {
      prevNeedsAttention.current = needsAttention;
      setOpen(needsAttention);
    }
  }, [needsAttention]);

  return (
    <Card className={cn("overflow-hidden border-border py-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-x-3 gap-y-2 px-4 py-3 text-start",
          "transition-colors hover:bg-muted/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
      >
        <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
        <span className="shrink-0 text-sm font-semibold">{title}</span>

        <BuilderHealthStatus summary={summary} className="shrink-0" />

        {/* Pushed to the right, but as a quiet caption rather than a control
            cluster — it is reference information, not something to click. */}
        <BuilderStatsStrip stats={stats} className="ms-auto hidden justify-end sm:flex" />

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform sm:ms-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <CardContent id={contentId} className="space-y-3 border-t border-border/60 px-4 py-3">
          <BuilderStatsStrip stats={stats} className="sm:hidden" />
          <BuilderIssueList issues={sorted} emptyMessage={emptyMessage} />
        </CardContent>
      ) : null}
    </Card>
  );
}
