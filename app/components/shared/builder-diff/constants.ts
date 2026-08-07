/**
 * Tokens and tuning for the builder template-diff system.
 */

import type { BuilderDiffKind } from "./types";

/** Kind → styling for the value pill. */
export const DIFF_KIND_CLASSES: Record<BuilderDiffKind, string> = {
  changed: "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5",
  added: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  removed: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5",
};

/** Kind → the verb shown in the row's screen-reader label. */
export const DIFF_KIND_LABELS: Record<BuilderDiffKind, string> = {
  changed: "changed",
  added: "added",
  removed: "cleared",
};

/** How deep the walker descends before treating a subtree as one value. */
export const DIFF_MAX_DEPTH = 3;

/** Formatted values longer than this are truncated in the pill. */
export const DIFF_VALUE_MAX_CHARS = 48;
