"use client";

import { cn } from "@/lib/utils";

import { IssueLevelIcon } from "./IssueLevelIcon";
import type { BuilderIssueLevel } from "../types";
import { ISSUE_LEVEL_CLASSES, ISSUE_LEVEL_LABELS } from "../constants";

export interface IssueCountChipProps {
  level: BuilderIssueLevel;
  count: number;
  className?: string;
}

/**
 * PRIMITIVE — `2 errors` style chip for the panel header.
 * Renders nothing at zero, so a clean build shows no noise.
 */
export function IssueCountChip({ level, count, className }: IssueCountChipProps) {
  if (count === 0) return null;
  const label = ISSUE_LEVEL_LABELS[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-(--radius) border px-1.5 py-0.5",
        "text-[11px] font-medium leading-none",
        ISSUE_LEVEL_CLASSES[level],
        className,
      )}
    >
      <IssueLevelIcon level={level} className="h-3 w-3" />
      {count} {count === 1 ? label.one : label.many}
    </span>
  );
}
