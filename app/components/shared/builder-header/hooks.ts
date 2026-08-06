"use client";

/**
 * Stateful logic for the builder header system.
 *
 * `useBuilderHistory` moved here from `app/hooks/` — it is the undo/redo engine
 * behind `<BuilderHistoryControls />`, so it belongs next to the UI it feeds.
 */

import { useMemo, useState, useCallback } from "react";

import { MAX_HISTORY } from "./constants";
import { snapshot, toTemplateOptions } from "./utils";
import type {
  BuilderHistoryApi,
  BuilderTemplateLike,
  BuilderHistorySlice,
  BuilderTemplateOption,
} from "./types";

/** Shared empty stack — avoids allocating a new `[]` on every push. */
const EMPTY: readonly never[] = [];

/** Appends `entry` to `past`, dropping the oldest entries past `MAX_HISTORY`. */
function pushPast<T>(past: T[], entry: T): T[] {
  const next = [...past, entry];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

/**
 * Generic undo/redo store shared by the form, table and kanban builders.
 *
 * - One consolidated state object, so React renders once per mutation.
 * - Function updaters receive a **private deep clone**. Builders that mutate
 *   their draft in place (the form builder does) therefore cannot retroactively
 *   corrupt an entry already sitting on the undo stack.
 * - Because every stored entry is already isolated, pushing `present` onto
 *   `past`/`future` needs no further cloning: one clone per mutation instead of
 *   the three the previous implementation took. That is the difference between
 *   a snappy and a laggy 1,000-row table config.
 * - Identity no-ops (`set(sameObject)`) do not create an undo step.
 * - `past` is capped at `MAX_HISTORY`; oldest entries are dropped first.
 */
export function useBuilderHistory<T>(initial: T): BuilderHistoryApi<T> {
  const [slice, setSlice] = useState<BuilderHistorySlice<T>>(() => ({
    past: [],
    future: [],
    present: snapshot(initial),
  }));

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setSlice((h) => {
      const value =
        typeof next === "function"
          ? // The updater gets a throwaway clone it is free to mutate.
            (next as (prev: T) => T)(snapshot(h.present))
          : // A raw value may still be referenced by the caller — isolate it.
            snapshot(next);

      if (Object.is(value, h.present)) return h;

      return {
        past: pushPast(h.past, h.present),
        present: value,
        future: EMPTY as unknown as T[],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setSlice((h) => {
      if (h.past.length === 0) return h;
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1]!,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setSlice((h) => {
      if (h.future.length === 0) return h;
      return {
        past: pushPast(h.past, h.present),
        present: h.future[0]!,
        future: h.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setSlice({ past: [], present: snapshot(next), future: EMPTY as unknown as T[] });
  }, []);

  const canUndo = slice.past.length > 0;
  const canRedo = slice.future.length > 0;

  // Stable identity while the flags hold, so `<BuilderHeader history={…} />`
  // does not get a fresh object on every unrelated render.
  const history = useMemo(
    () => ({ undo, redo, canUndo, canRedo }),
    [undo, redo, canUndo, canRedo],
  );

  return { state: slice.present, set, reset, undo, redo, canUndo, canRedo, history };
}

/**
 * Memoized adapter from a builder's template catalogue to picker options.
 * Template records are module constants, so this recomputes essentially never.
 */
export function useTemplateOptions<T extends BuilderTemplateLike>(
  templates: Record<string, T>,
): BuilderTemplateOption[] {
  return useMemo(() => toTemplateOptions(templates), [templates]);
}
