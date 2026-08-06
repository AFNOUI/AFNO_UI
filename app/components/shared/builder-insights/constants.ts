/**
 * Presentation tokens for the builder insights panel.
 */

import type { BuilderIssueLevel } from "./types";

/** Level → styling for the issue row's icon well and left rule. */
export const ISSUE_LEVEL_CLASSES: Record<BuilderIssueLevel, string> = {
  error: "text-destructive border-destructive/30 bg-destructive/5",
  warning: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5",
  info: "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5",
};

/** Level → human label used in the summary chips. */
export const ISSUE_LEVEL_LABELS: Record<BuilderIssueLevel, { one: string; many: string }> = {
  error: { one: "error", many: "errors" },
  warning: { one: "warning", many: "warnings" },
  info: { one: "note", many: "notes" },
};

/** Render order — errors first, always. */
export const ISSUE_LEVEL_ORDER: BuilderIssueLevel[] = ["error", "warning", "info"];
