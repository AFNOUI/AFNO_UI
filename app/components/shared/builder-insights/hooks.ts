"use client";

/**
 * Stateful logic for the builder insights system.
 */

import { useMemo } from "react";

import { sortIssues, summarizeIssues } from "./utils";
import type { BuilderInsights, BuilderIssue, BuilderIssueSummary } from "./types";

export interface UseBuilderInsightsResult extends BuilderInsights {
  /** Issues ordered errors → warnings → notes. */
  sorted: BuilderIssue[];
  summary: BuilderIssueSummary;
}

/**
 * Runs a builder's rules and derives display order + counts.
 *
 * `compute` is called on every render of the owning component, so each
 * builder's `get*Insights()` must stay pure and cheap — they walk the config,
 * not the data (the table rules sample rows rather than scanning 1,000 of them).
 * Memoized on `deps` so a 1k-row table does not re-run the rules on each
 * unrelated keystroke.
 */
export function useBuilderInsights(
  compute: () => BuilderInsights,
  deps: readonly unknown[],
): UseBuilderInsightsResult {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller by design
  const insights = useMemo(compute, deps);

  return useMemo(
    () => ({
      ...insights,
      sorted: sortIssues(insights.issues),
      summary: summarizeIssues(insights.issues),
    }),
    [insights],
  );
}
