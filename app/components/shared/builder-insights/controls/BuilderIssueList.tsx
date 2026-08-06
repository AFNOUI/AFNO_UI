"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { IssueRow } from "../primitives/IssueRow";
import type { BuilderIssue } from "../types";

export interface BuilderIssueListProps {
  /** Already sorted by `sortIssues()`. */
  issues: BuilderIssue[];
  /** Shown when there is nothing to report. */
  emptyMessage?: string;
  className?: string;
}

/** CONTROL — the ordered list of issues, or the all-clear state. */
export function BuilderIssueList({
  issues,
  emptyMessage = "No issues found — this build is ready to export.",
  className,
}: BuilderIssueListProps) {
  if (issues.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-(--radius) border border-emerald-500/30",
          "bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400",
          className,
        )}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className={cn("space-y-1.5", className)}>
      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </ul>
  );
}
