"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BuilderDiffSummaryProps {
  count: number;
  templateName?: string;
  className?: string;
}

/**
 * CONTROL — the verdict beside the panel title.
 *
 * Always renders something, matching `<BuilderHealthStatus />`: a green "Matches
 * template" when nothing has moved, or the count. The template name is repeated
 * here because "Changed 6 settings" is only useful if you know from what.
 */
export function BuilderDiffSummary({
  count,
  templateName,
  className,
}: BuilderDiffSummaryProps) {
  if (count === 0) {
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
        Unchanged
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-(--radius) border border-blue-500/30",
        "bg-blue-500/5 px-1.5 py-0.5 text-[11px] font-medium leading-none",
        "text-blue-600 dark:text-blue-400",
        className,
      )}
    >
      {count === 1 ? "1 setting changed" : `${count} settings changed`}
      {templateName ? (
        <span className="font-normal opacity-80">· from {templateName}</span>
      ) : null}
    </span>
  );
}
