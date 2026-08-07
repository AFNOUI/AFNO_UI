"use client";

import { cn } from "@/lib/utils";

import { IssueLevelIcon } from "./IssueLevelIcon";
import type { BuilderIssue } from "../types";
import { ISSUE_LEVEL_CLASSES } from "../constants";

export interface IssueRowProps {
  issue: BuilderIssue;
  className?: string;
}

/**
 * PRIMITIVE — one detected problem.
 *
 * Deliberately shows *what*, *where*, *why* and *how to fix* as four distinct
 * lines. An issue the user cannot act on is just noise.
 */
export function IssueRow({ issue, className }: IssueRowProps) {
  return (
    <li
      className={cn(
        "flex gap-2.5 rounded-(--radius) border border-s-2 p-2.5",
        ISSUE_LEVEL_CLASSES[issue.level],
        className,
      )}
    >
      <IssueLevelIcon level={issue.level} className="mt-0.5" />
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-medium leading-snug text-foreground">
          {issue.title}
          {issue.location ? (
            <span className="ms-1.5 font-mono text-[10px] font-normal text-muted-foreground">
              {issue.location}
            </span>
          ) : null}
        </p>
        {issue.detail ? (
          <p className="text-[11px] leading-snug text-muted-foreground">{issue.detail}</p>
        ) : null}
        {issue.fix ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            <span className="font-medium text-foreground/80">Fix: </span>
            {issue.fix}
          </p>
        ) : null}
      </div>
    </li>
  );
}
