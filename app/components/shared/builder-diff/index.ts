/**
 * Builder template-diff system — public API.
 *
 * Same layering as `builder-header/` and `builder-insights/`:
 *   primitives/  — value pill, diff row
 *   controls/    — the changed-settings list, the verdict chip
 *   BuilderDiffPanel — the assembled panel each builder renders
 *
 * Supporting files: `types.ts` (contracts), `constants.ts` (tokens),
 * `utils.ts` (the walker, path read/write, value formatting), `hooks.ts`
 * (memoized diffing).
 *
 * The walker is domain-blind: it compares two plain-JSON config trees and knows
 * nothing about columns, fields, cards or nodes. Each builder supplies its own
 * `atomic` / `ignore` paths to say which of *its* subtrees are one concept.
 */

// ── Panel ─────────────────────────────────────────────────────────────────
export { BuilderDiffPanel, type BuilderDiffPanelProps } from "./BuilderDiffPanel";

// ── Controls ──────────────────────────────────────────────────────────────
export { BuilderDiffList, type BuilderDiffListProps } from "./controls/BuilderDiffList";
export {
  BuilderDiffSummary,
  type BuilderDiffSummaryProps,
} from "./controls/BuilderDiffSummary";

// ── Primitives ────────────────────────────────────────────────────────────
export { DiffRow, type DiffRowProps } from "./primitives/DiffRow";
export { DiffValuePill, type DiffValuePillProps } from "./primitives/DiffValuePill";

// ── Logic & contracts ─────────────────────────────────────────────────────
export { useBuilderDiff, type UseBuilderDiffArgs } from "./hooks";
export {
  getAtPath,
  setAtPath,
  diffConfigs,
  deleteAtPath,
  humanizePath,
  formatDiffValue,
  resetDiffEntry,
  resetAllDiffEntries,
} from "./utils";
export { DIFF_MAX_DEPTH, DIFF_KIND_LABELS, DIFF_KIND_CLASSES } from "./constants";
export type {
  BuilderDiffKind,
  BuilderDiffEntry,
  BuilderDiffResult,
  BuilderDiffOptions,
} from "./types";
