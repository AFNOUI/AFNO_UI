/**
 * Builder insights system — public API.
 *
 * Same layering as `builder-header/`:
 *   primitives/  — issue icon, issue row, stat chip, count chip
 *   controls/    — stats strip, issue list
 *   BuilderInsightsPanel — the assembled panel each builder renders
 *
 * Supporting files: `types.ts` (contracts), `constants.ts` (tokens),
 * `utils.ts` (pure rule helpers), `hooks.ts` (memoized rules runner).
 *
 * Each builder contributes its own rules as a pure `get*Insights()` function
 * living beside that builder (e.g. `app/form-builder/utils/formInsights.ts`),
 * so the shared layer never learns what a column or a card is.
 */

// ── Panel ─────────────────────────────────────────────────────────────────
export {
  BuilderInsightsPanel,
  type BuilderInsightsPanelProps,
} from "./BuilderInsightsPanel";

// ── Controls ──────────────────────────────────────────────────────────────
export { BuilderIssueList, type BuilderIssueListProps } from "./controls/BuilderIssueList";
export { BuilderStatsStrip, type BuilderStatsStripProps } from "./controls/BuilderStatsStrip";
export {
  BuilderHealthStatus,
  type BuilderHealthStatusProps,
} from "./controls/BuilderHealthStatus";

// ── Primitives ────────────────────────────────────────────────────────────
export { IssueRow, type IssueRowProps } from "./primitives/IssueRow";
export { StatChip, type StatChipProps } from "./primitives/StatChip";
export { IssueLevelIcon, type IssueLevelIconProps } from "./primitives/IssueLevelIcon";
export { IssueCountChip, type IssueCountChipProps } from "./primitives/IssueCountChip";

// ── Logic & contracts ─────────────────────────────────────────────────────
export { useBuilderInsights, type UseBuilderInsightsResult } from "./hooks";
export {
  sortIssues,
  formatList,
  findDuplicates,
  summarizeIssues,
  isUnsafeIdentifier,
} from "./utils";
export { ISSUE_LEVEL_ORDER, ISSUE_LEVEL_LABELS, ISSUE_LEVEL_CLASSES } from "./constants";
export type {
  BuilderStat,
  BuilderIssue,
  BuilderInsights,
  BuilderIssueLevel,
  BuilderIssueSummary,
} from "./types";
