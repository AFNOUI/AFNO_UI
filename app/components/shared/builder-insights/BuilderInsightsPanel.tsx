"use client";

import * as React from "react";
import { Stethoscope, ChevronUp, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BuilderIssueList } from "./controls/BuilderIssueList";
import { BuilderStatsStrip } from "./controls/BuilderStatsStrip";
import { IssueCountChip } from "./primitives/IssueCountChip";
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
 * Collapsed by default on a clean build so a healthy builder stays quiet, and
 * auto-expanded when there is something to act on.
 */
export function BuilderInsightsPanel({
  insights,
  title = "Build health",
  emptyMessage,
  defaultOpen,
  className,
}: BuilderInsightsPanelProps) {
  const { sorted, stats, summary } = insights;
  const shouldOpen = defaultOpen ?? summary.total > 0;
  const [open, setOpen] = React.useState(shouldOpen);

  // Follow the build: opening on the first problem, and closing again once the
  // user has cleared them, without fighting a manual toggle in between.
  const hasIssues = summary.total > 0;
  const prevHasIssues = React.useRef(hasIssues);
  React.useEffect(() => {
    if (prevHasIssues.current !== hasIssues) {
      prevHasIssues.current = hasIssues;
      setOpen(hasIssues);
    }
  }, [hasIssues]);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="px-4 pb-0 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
            <CardTitle className="text-sm">{title}</CardTitle>
            <IssueCountChip level="error" count={summary.errors} />
            <IssueCountChip level="warning" count={summary.warnings} />
            <IssueCountChip level="info" count={summary.infos} />
          </div>

          <div className="flex items-center gap-2">
            <BuilderStatsStrip stats={stats} className="hidden sm:flex" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-expanded={open}
              aria-label={open ? "Collapse build health" : "Expand build health"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {open ? (
        <CardContent className="space-y-3 px-4 pb-4 pt-3">
          <BuilderStatsStrip stats={stats} className="sm:hidden" />
          <BuilderIssueList issues={sorted} emptyMessage={emptyMessage} />
        </CardContent>
      ) : null}
    </Card>
  );
}
