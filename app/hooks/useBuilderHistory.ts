import { useCallback, useState } from "react";

type HistorySlice<T> = {
  past: T[];
  present: T;
  future: T[];
};

const MAX_HISTORY = 80;

/**
 * Deep snapshot for undo stacks. JSON is faster than `structuredClone` for the plain
 * config trees the builders use; the fallback handles any non-JSON-serializable value
 * (e.g. a future config shape that adds a Map/Set/Date).
 */
function snapshot<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return structuredClone(value);
  }
}

/**
 * Generic undo/redo hook shared by the form-builder and table-builder pages.
 *
 * - One consolidated state object so React renders once per mutation.
 * - Past / present / future are stored as isolated snapshots, so shallow updaters
 *   cannot retroactively corrupt history.
 * - Past is capped at `MAX_HISTORY` entries; oldest are dropped first.
 */
export function useBuilderHistory<T>(initial: T) {
  const [history, setHistory] = useState<HistorySlice<T>>(() => ({
    past: [],
    future: [],
    present: snapshot(initial),
  }));

  const set = useCallback((newStateOrUpdater: T | ((prev: T) => T)) => {
    setHistory((h) => {
      const prevDraft = snapshot(h.present);
      const newState =
        typeof newStateOrUpdater === "function"
          ? (newStateOrUpdater as (prev: T) => T)(prevDraft)
          : newStateOrUpdater;
      const nextPast = [...h.past, snapshot(h.present)];
      if (nextPast.length > MAX_HISTORY) {
        nextPast.splice(0, nextPast.length - MAX_HISTORY);
      }
      return {
        past: nextPast,
        present: snapshot(newState),
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1]!;
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [snapshot(h.present), ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0]!;
      const nextPast = [...h.past, snapshot(h.present)];
      if (nextPast.length > MAX_HISTORY) {
        nextPast.splice(0, nextPast.length - MAX_HISTORY);
      }
      return {
        past: nextPast,
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({ past: [], present: snapshot(newState), future: [] });
  }, []);

  return {
    set,
    undo,
    redo,
    reset,
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
