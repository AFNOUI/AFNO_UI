import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";

import type { AsyncApiConfig, FieldOption } from "../types/types";
import { buildAxiosConfigForAsyncApi } from "../utils/dependentApiRequest";

// ─── Types ───

export type InfiniteOption = FieldOption;

export interface InfiniteOptionsResult {
  options: InfiniteOption[];
  hasMore: boolean;
  page: number;
}

/** Function signature for custom paginated fetch implementations */
export type FetchOptionsFunction = (
  searchTerm: string,
  page: number,
  pageSize: number
) => Promise<InfiniteOptionsResult>;

// ─── Helpers ───

/**
 * Safely retrieves a nested value from an object using a dot-separated path.
 * Returns the root object if path is empty.
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  if (!path || path.trim() === "") return obj;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Maps a raw API response to an array of { label, value } options.
 * If dataPath is empty, assumes the response itself is the array.
 */
function mapResponseToOptions(
  data: unknown,
  mapping: AsyncApiConfig["responseMapping"]
): InfiniteOption[] {
  const dataArray =
    !mapping.dataPath || mapping.dataPath.trim() === ""
      ? data
      : getByPath(data as Record<string, unknown>, mapping.dataPath);
  if (!Array.isArray(dataArray)) return [];
  return dataArray.map((item: Record<string, unknown>) => {
    const opt: InfiniteOption & { _raw?: Record<string, unknown> } = {
      label: String(item[mapping.labelKey] ?? ""),
      value: String(item[mapping.valueKey] ?? ""),
    };
    // Preserve extra keys for dependent field watchers
    if (mapping.extraKeys?.length) {
      const raw: Record<string, unknown> = {};
      for (const key of mapping.extraKeys) {
        raw[key] = item[key];
      }
      opt._raw = raw;
    }
    return opt;
  });
}

// ─── Async hook: one-time fetch on mount / when source changes ───

export interface UseAsyncOptionsProps {
  fetchOptions?: () => Promise<InfiniteOption[]>;
  apiConfig?: AsyncApiConfig;
  initialOptions?: InfiniteOption[];
}

/**
 * Fetches a flat list of options once when the component mounts (or when the source changes).
 */
export function useAsyncOptions({
  fetchOptions,
  apiConfig,
  initialOptions = [],
}: UseAsyncOptionsProps) {
  const watchValue = apiConfig?._watchValue;
  const queryKey = ["async-options", apiConfig?.url ?? "custom", watchValue ?? ""];

  const fetcher = useCallback(async (): Promise<InfiniteOption[]> => {
    if (fetchOptions) return fetchOptions();
    if (apiConfig?.url) {
      try {
        const res = await axios(buildAxiosConfigForAsyncApi(apiConfig));
        return mapResponseToOptions(res.data, apiConfig.responseMapping);
      } catch {
        return [];
      }
    }
    return [];
  }, [fetchOptions, apiConfig]);

  const hasSource = !!fetchOptions || !!apiConfig?.url;

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetcher,
    enabled: hasSource,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const options = useMemo(() => {
    if (!hasSource) return initialOptions;
    return [...initialOptions, ...(data ?? [])];
  }, [hasSource, initialOptions, data]);

  const filterOptions = useCallback(
    (term: string) => {
      if (!term) return options;
      const lower = term.toLowerCase();
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(lower) ||
          opt.value.toLowerCase().includes(lower)
      );
    },
    [options]
  );

  return {
    options,
    isLoading: hasSource ? isLoading : false,
    error: error as Error | null,
    filterOptions,
  };
}

// ─── Infinite hook: paginated fetch + IntersectionObserver ───

interface UseInfiniteOptionsProps {
  fetchOptions?: FetchOptionsFunction;
  apiConfig?: AsyncApiConfig;
  pageSize?: number;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Manages paginated, searchable option loading for infinite scroll fields.
 * Supports both page-based and offset-based pagination.
 */
export function useInfiniteOptions({
  fetchOptions,
  apiConfig,
  pageSize = 20,
  debounceMs = 300,
  enabled = true,
}: UseInfiniteOptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const effectivePageSize = apiConfig?.pageSize ?? pageSize;
  const isOffsetBased = !!(apiConfig as { offsetBased?: boolean })?.offsetBased;
  const watchValue = apiConfig?._watchValue;

  const resolvedFetch = useMemo((): FetchOptionsFunction | null => {
    if (fetchOptions) return fetchOptions;
    if (!apiConfig?.url) return null;

    return async (search: string, page: number, size: number) => {
      const params: Record<string, string | number> = {};
      if (apiConfig.searchParam && search) params[apiConfig.searchParam] = search;

      if (apiConfig.pageParam) {
        params[apiConfig.pageParam] = isOffsetBased ? (page - 1) * size : page;
      }
      if (apiConfig.pageSizeParam) params[apiConfig.pageSizeParam] = size;

      try {
        const res = await axios(buildAxiosConfigForAsyncApi(apiConfig, params));
        const options = mapResponseToOptions(res.data, apiConfig.responseMapping);

        let hasMore = false;
        if (apiConfig.hasMorePath) {
          const moreValue = getByPath(res.data as Record<string, unknown>, apiConfig.hasMorePath);
          if (typeof moreValue === "boolean") {
            hasMore = moreValue;
          } else if (typeof moreValue === "number") {
            const loadedSoFar = page * size;
            hasMore = loadedSoFar < moreValue;
          }
        } else {
          hasMore = options.length >= size;
        }

        return { options, hasMore, page };
      } catch {
        return { options: [], hasMore: false, page };
      }
    };
  }, [fetchOptions, apiConfig, isOffsetBased]);

  const cacheKey = debouncedTerm.toLowerCase() || "__all__";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [
      "infinite-options",
      apiConfig?.url ?? "custom",
      watchValue ?? "",
      cacheKey,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!resolvedFetch) return { options: [], hasMore: false, page: 1 };
      return resolvedFetch(debouncedTerm, pageParam as number, effectivePageSize);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: enabled && !!resolvedFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const options = useMemo<InfiniteOption[]>(() => {
    if (!data?.pages) return [];
    const all = data.pages.flatMap((p) => p.options);
    return Array.from(new Map(all.map((o) => [o.value, o])).values());
  }, [data]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return {
    options,
    isLoading: isLoading || isFetching,
    isFetchingNextPage,
    hasMore: !!hasNextPage,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  };
}
