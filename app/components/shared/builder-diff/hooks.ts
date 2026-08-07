"use client";

/**
 * Stateful logic for the builder template-diff system.
 */

import { useMemo } from "react";

import { diffConfigs } from "./utils";
import type { BuilderDiffOptions, BuilderDiffResult } from "./types";

export interface UseBuilderDiffArgs<T> {
  /** The config on screen. */
  current: T;
  /**
   * The config the build started from, or `null` when there is no template —
   * a JSON import, or a form built from scratch. The panel then reports
   * nothing rather than diffing against an arbitrary default.
   */
  template: T | null | undefined;
  /** Display name of the template, for "Changed 6 settings from Sprint Board". */
  templateName?: string;
  options?: BuilderDiffOptions;
}

/**
 * Diffs the working config against its template.
 *
 * Memoized on config identity, which is exactly what the undo store already
 * gives us — `useBuilderHistory` produces a new object per mutation and reuses
 * it otherwise, so the walk runs once per edit rather than once per render.
 * `options` are keyed by value because callers pass an object literal.
 */
export function useBuilderDiff<T>({
  current,
  template,
  templateName,
  options,
}: UseBuilderDiffArgs<T>): BuilderDiffResult {
  const optionsKey = JSON.stringify(options ?? {});

  return useMemo(() => {
    if (!template) return { hasTemplate: false, entries: [], count: 0 };
    const entries = diffConfigs(current, template, JSON.parse(optionsKey));
    return { hasTemplate: true, templateName, entries, count: entries.length };
  }, [current, template, templateName, optionsKey]);
}
