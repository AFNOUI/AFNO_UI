/**
 * Contracts for the builder insights system.
 *
 * Types only — no values, no JSX. Each builder contributes a pure
 * `get*Insights()` function returning this shape; the shared panel renders it.
 */

/** Severity of a detected problem. */
export type BuilderIssueLevel = "error" | "warning" | "info";

/** One detected problem with the current build. */
export interface BuilderIssue {
  /** Stable key for React and for de-duplication. */
  id: string;
  level: BuilderIssueLevel;
  /** One short line naming the problem. */
  title: string;
  /** Where it lives, e.g. `Column "email"` or `Section 2 · Field 3`. */
  location?: string;
  /** Why it matters — what breaks downstream if shipped as-is. */
  detail?: string;
  /** The concrete corrective action. */
  fix?: string;
}

/** A single headline number about the current build. */
export interface BuilderStat {
  label: string;
  value: string | number;
  /** Optional tooltip explaining what is being counted. */
  hint?: string;
}

/** What every builder's insights function returns. */
export interface BuilderInsights {
  stats: BuilderStat[];
  issues: BuilderIssue[];
}

/** Issue counts by level, derived by `summarizeIssues()`. */
export interface BuilderIssueSummary {
  errors: number;
  warnings: number;
  infos: number;
  total: number;
}
