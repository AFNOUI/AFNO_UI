"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { IssueCountChip } from "../primitives/IssueCountChip";
import type { BuilderIssueSummary } from "../types";

export interface BuilderHealthStatusProps {
  summary: BuilderIssueSummary;
  className?: string;
}

/**
 * CONTROL — the verdict shown beside the panel title.
 *
 * Always renders something, so the header never reads as an empty label: a
 * green "All clear" when the build is sound, or one chip per severity present.
 */
export function BuilderHealthStatus({ summary, className }: BuilderHealthStatusProps) {
  if (summary.total === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-(--radius) border border-emerald-500/30",
          "bg-emerald-500/5 px-1.5 py-0.5 text-[11px] font-medium leading-none",
          "text-emerald-600 dark:text-emerald-400",
          className,
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        All clear
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <IssueCountChip level="error" count={summary.errors} />
      <IssueCountChip level="warning" count={summary.warnings} />
      <IssueCountChip level="info" count={summary.infos} />
    </span>
  );
}
