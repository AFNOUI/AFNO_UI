/**
 * Contracts for the builder template-diff system.
 *
 * Types only — no values, no JSX. Runtime helpers live in `utils.ts`, tokens in
 * `constants.ts`, stateful logic in `hooks.ts`.
 */

/** How a setting differs from the template it came from. */
export type BuilderDiffKind =
  /** Present in both, with different values. */
  | "changed"
  /** Set in the current build, absent from the template. */
  | "added"
  /** Set by the template, cleared in the current build. */
  | "removed";

/** One setting that no longer matches the template. */
export interface BuilderDiffEntry {
  /** Dotted path into the config, e.g. `"pagination.pageSize"`. */
  path: string;
  /** Humanized path, e.g. `"Pagination · Page size"`. */
  label: string;
  kind: BuilderDiffKind;
  /** Raw values, kept so a reset can restore the template's exactly. */
  current: unknown;
  template: unknown;
  /** Display strings — `"On"`, `"24"`, `"6 items"`, `"not set"`. */
  currentLabel: string;
  templateLabel: string;
}

export interface BuilderDiffOptions {
  /**
   * Paths never compared. Use for builder-only chrome that happens to live in
   * the config and would report as a difference the user cannot act on.
   */
  ignore?: string[];
  /**
   * Paths compared whole rather than walked into.
   *
   * This is what keeps the panel readable. Walking a table's `columns` array
   * turns one meaningful "you changed the columns" into forty rows of
   * `columns.3.width`, and a per-row reset on any of them would be nonsense.
   */
  atomic?: string[];
  /** Stop walking below this depth, treating what is left as atomic. */
  maxDepth?: number;
}

/** What `useBuilderDiff()` returns. */
export interface BuilderDiffResult {
  /** False when no template is selected — the build came from an import. */
  hasTemplate: boolean;
  /** Human name of the template being compared against. */
  templateName?: string;
  entries: BuilderDiffEntry[];
  count: number;
}
