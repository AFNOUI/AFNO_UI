"use client";

import { cn } from "@/lib/utils";

import { DiffRow } from "../primitives/DiffRow";
import type { BuilderDiffEntry } from "../types";

export interface BuilderDiffListProps {
  entries: BuilderDiffEntry[];
  templateName?: string;
  onReset?: (entry: BuilderDiffEntry) => void;
  className?: string;
}

/**
 * CONTROL — the list of changed settings, or the all-matching message.
 */
export function BuilderDiffList({
  entries,
  templateName,
  onReset,
  className,
}: BuilderDiffListProps) {
  if (entries.length === 0) {
    return (
      <p className={cn("px-2 py-1 text-xs text-muted-foreground", className)}>
        {templateName
          ? `Every setting still matches ${templateName}.`
          : "Every setting still matches the template."}
      </p>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {entries.map((entry) => (
        <DiffRow key={entry.path} entry={entry} onReset={onReset} />
      ))}
    </div>
  );
}
