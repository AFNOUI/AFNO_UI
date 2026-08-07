"use client";

import { ArrowRight, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { DIFF_KIND_LABELS } from "../constants";
import { DiffValuePill } from "./DiffValuePill";
import type { BuilderDiffEntry } from "../types";

export interface DiffRowProps {
  entry: BuilderDiffEntry;
  /** Omit to render the row read-only. */
  onReset?: (entry: BuilderDiffEntry) => void;
  className?: string;
}

/**
 * PRIMITIVE — one changed setting.
 *
 * Reads left to right as a sentence: name, template value, arrow, current
 * value, undo. The reset button is per-row because that is the whole point of
 * the panel — "I changed something I did not mean to" is a question about one
 * setting, and reloading the template to fix it would discard everything else.
 */
export function DiffRow({ entry, onReset, className }: DiffRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-(--radius) px-2 py-1.5",
        "transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-xs font-medium" title={entry.path}>
        {entry.label}
      </span>

      <span className="flex items-center gap-1.5">
        <DiffValuePill tone="template">{entry.templateLabel}</DiffValuePill>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        <DiffValuePill tone="current">{entry.currentLabel}</DiffValuePill>
      </span>

      {onReset ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onReset(entry)}
          aria-label={`Reset ${entry.label} — ${DIFF_KIND_LABELS[entry.kind]} from the template`}
          className="h-6 w-6 shrink-0 p-0 text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
