"use client";

/**
 * The engine's built-in query adapter — plain React state, zero dependencies.
 *
 * It reproduces the caching semantics the option hooks have always had
 * (5-minute stale window, 10-minute retention, in-flight de-duplication) so
 * dropping `@tanstack/react-query` from the default install is not a
 * behavioural regression. Projects that already run a QueryClient supply a
 * react-query adapter from their variant's `hooks.ts` instead.
 *
 * See AI_AGENT_RULES § R-53 / § R-54.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FieldOption } from "../types/types";
import type {
  AsyncQueryState,
  InfiniteQueryState,
  OptionsPage,
  OptionsQueryAdapter,
} from "./types";

const STALE_TIME_MS = 5 * 60 * 1000;
const GC_TIME_MS = 10 * 60 * 1000;

interface CacheRecord {
  value: unknown;
  storedAt: number;
  inFlight?: Promise<unknown>;
}

const cache = new Map<string, CacheRecord>();

function serializeKey(key: readonly unknown[]): string {
  return JSON.stringify(key);
}

function sweep(now: number): void {
  for (const [key, record] of cache) {
    if (!record.inFlight && now - record.storedAt > GC_TIME_MS) cache.delete(key);
  }
}

/**
 * Resolves from cache when fresh, joins the in-flight promise when one is
 * already running for the same key, otherwise starts a new request.
 */
function loadCached<T>(cacheKey: string, run: () => Promise<T>): Promise<T> {
  const now = Date.now();
  sweep(now);

  const record = cache.get(cacheKey);
  if (record?.inFlight) return record.inFlight as Promise<T>;
  if (record && now - record.storedAt < STALE_TIME_MS) {
    return Promise.resolve(record.value as T);
  }

  const inFlight = run()
    .then((value) => {
      cache.set(cacheKey, { value, storedAt: Date.now() });
      return value;
    })
    .catch((error: unknown) => {
      cache.delete(cacheKey);
      throw error;
    });

  cache.set(cacheKey, { value: record?.value, storedAt: record?.storedAt ?? 0, inFlight });
  return inFlight as Promise<T>;
}

/** Drops every cached option page. Exposed for tests and manual invalidation. */
export function clearOptionsCache(): void {
  cache.clear();
}

function useAsyncQuery({
  key,
  enabled,
  run,
}: {
  key: readonly unknown[];
  enabled: boolean;
  run: (signal?: AbortSignal) => Promise<FieldOption[]>;
}): AsyncQueryState {
  const cacheKey = serializeKey(key);
  const [state, setState] = useState<AsyncQueryState>({
    data: undefined,
    isLoading: enabled,
    error: null,
  });

  // `run` is rebuilt every render by callers; keep it out of the effect deps
  // and read the latest one when the effect actually fires.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: undefined, isLoading: false, error: null });
      return;
    }

    const controller = new AbortController();
    let active = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    loadCached(cacheKey, () => runRef.current(controller.signal))
      .then((data) => {
        if (active) setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setState({
          data: undefined,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [cacheKey, enabled]);

  return state;
}

function useInfiniteQuery({
  key,
  enabled,
  run,
}: {
  key: readonly unknown[];
  enabled: boolean;
  run: (page: number, signal?: AbortSignal) => Promise<OptionsPage>;
}): InfiniteQueryState {
  const cacheKey = serializeKey(key);
  const [pages, setPages] = useState<OptionsPage[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  // Every mounted effect run registers its controller here so `fetchNextPage`
  // (which lives outside the effect) can be cancelled by the same teardown.
  const controllerRef = useRef<AbortController | null>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setPages([]);
      setHasNextPage(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    pageRef.current = 1;
    loadingRef.current = true;
    let active = true;

    setPages([]);
    setIsLoading(true);

    loadCached(`${cacheKey}::1`, () => runRef.current(1, controller.signal))
      .then((page) => {
        if (!active) return;
        setPages([page]);
        setHasNextPage(page.hasMore);
      })
      .catch(() => {
        if (active) setHasNextPage(false);
      })
      .finally(() => {
        if (!active) return;
        loadingRef.current = false;
        setIsLoading(false);
      });

    return () => {
      active = false;
      loadingRef.current = false;
      controller.abort();
    };
  }, [cacheKey, enabled]);

  const fetchNextPage = useCallback(() => {
    if (!enabled || loadingRef.current || !hasNextPage) return;

    const next = pageRef.current + 1;
    loadingRef.current = true;
    setIsFetchingNextPage(true);

    loadCached(`${cacheKey}::${next}`, () =>
      runRef.current(next, controllerRef.current?.signal),
    )
      .then((page) => {
        pageRef.current = next;
        setPages((prev) => [...prev, page]);
        setHasNextPage(page.hasMore);
      })
      .catch(() => {
        setHasNextPage(false);
      })
      .finally(() => {
        loadingRef.current = false;
        setIsFetchingNextPage(false);
      });
  }, [cacheKey, enabled, hasNextPage]);

  return useMemo(
    () => ({ pages, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage }),
    [pages, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );
}

/**
 * Module-level constant — required, because its members are called as hooks.
 * Never rebuild this object inside a component body.
 */
export const localStateQueryAdapter: OptionsQueryAdapter = {
  useAsyncQuery,
  useInfiniteQuery,
};
