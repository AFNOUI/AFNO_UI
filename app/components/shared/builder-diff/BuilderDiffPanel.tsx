"use client";

import * as React from "react";
import { ChevronDown, GitCompare, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { BuilderDiffList } from "./controls/BuilderDiffList";
import { BuilderDiffSummary } from "./controls/BuilderDiffSummary";
import type { BuilderDiffEntry, BuilderDiffResult } from "./types";

export interface BuilderDiffPanelProps {
  /** Return value of `useBuilderDiff()`. */
  diff: BuilderDiffResult;
  /** Panel heading. Defaults to "Changes from template". */
  title?: string;
  /** Omit to render read-only. */
  onReset?: (entry: BuilderDiffEntry) => void;
  /** Omit to hide the "Reset all" action. */
  onResetAll?: (entries: BuilderDiffEntry[]) => void;
  /** Start expanded. Defaults to collapsed. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * PANEL — "what have I changed since I loaded this template?"
 *
 * The companion to `<BuilderInsightsPanel />`: that one asks whether the build
 * is sound, this one asks how far it has drifted. Both live in the Preview tab,
 * in the space the read-only JSON dumps used to occupy, and both follow the
 * same shape — the whole header row is the toggle, and the verdict sits beside
 * the title rather than behind a chevron at the far edge.
 *
 * Renders nothing without a template. A build that came from a JSON import has
 * nothing to have drifted *from*, and diffing it against an arbitrary default
 * would invent differences the user never made.
 *
 * Collapsed by default, unlike the health panel: drift is information, not a
 * problem. Nothing here needs fixing unless the user says it does.
 */
export function BuilderDiffPanel({
  diff,
  title = "Changes from template",
  onReset,
  onResetAll,
  defaultOpen = false,
  className,
}: BuilderDiffPanelProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = React.useId();

  if (!diff.hasTemplate) return null;

  const { entries, count, templateName } = diff;

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
        <GitCompare className="h-4 w-4 shrink-0 text-primary" />
        <span className="shrink-0 text-sm font-semibold">{title}</span>

        <BuilderDiffSummary count={count} templateName={templateName} className="min-w-0" />

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <CardContent id={contentId} className="space-y-2 border-t border-border/60 px-4 py-3">
          <BuilderDiffList
            entries={entries}
            templateName={templateName}
            onReset={onReset}
          />

          {/* Only offered when there is something to undo, and placed after the
              list so it cannot be hit before the user has read what it wipes. */}
          {onResetAll && count > 0 ? (
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => onResetAll(entries)}
              >
                <Undo2 className="h-3.5 w-3.5" />
                Reset all {count}
              </Button>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
