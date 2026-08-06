/**
 * Pure helpers shared by every builder's insights rules.
 *
 * Keeping the common checks here means "what counts as a bad identifier" has
 * one answer across the form, table, kanban and tree builders.
 */

import { ISSUE_LEVEL_ORDER } from "./constants";
import type { BuilderIssue, BuilderIssueSummary } from "./types";

/** Count issues by level. */
export function summarizeIssues(issues: BuilderIssue[]): BuilderIssueSummary {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const issue of issues) {
    if (issue.level === "error") errors += 1;
    else if (issue.level === "warning") warnings += 1;
    else infos += 1;
  }
  return { errors, warnings, infos, total: issues.length };
}

/** Errors first, then warnings, then notes; stable within a level. */
export function sortIssues(issues: BuilderIssue[]): BuilderIssue[] {
  return [...issues].sort(
    (a, b) => ISSUE_LEVEL_ORDER.indexOf(a.level) - ISSUE_LEVEL_ORDER.indexOf(b.level),
  );
}

/**
 * Find values that appear more than once.
 * Used for duplicate field names, column ids, card ids, node ids …
 */
export function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    else seen.add(value);
  }
  return [...dupes];
}

/**
 * True when a string is unusable as a generated identifier.
 *
 * The code generators emit these straight into TypeScript object keys and
 * variable positions, so a name with a space or a leading digit produces code
 * that will not compile in the consumer's project.
 */
export function isUnsafeIdentifier(name: string): boolean {
  return !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** Human list: `"a", "b" and "c"`, truncated past `max`. */
export function formatList(values: string[], max = 4): string {
  const quoted = values.slice(0, max).map((v) => `"${v}"`);
  const rest = values.length - quoted.length;
  const joined =
    quoted.length > 1
      ? `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`
      : quoted[0] ?? "";
  return rest > 0 ? `${joined} (+${rest} more)` : joined;
}
