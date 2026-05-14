"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface Option {
  label: string;
  value: string;
}

export interface InfiniteSourcePreset {
  name: string;
  baseUrl: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

export const INFINITE_SOURCES: InfiniteSourcePreset[] = [
  {
    name: "Products",
    baseUrl: "https://dummyjson.com/products/search",
    labelKey: "title",
    valueKey: "id",
    dataPath: "products",
  },
  {
    name: "Users",
    baseUrl: "https://dummyjson.com/users/search",
    labelKey: "firstName",
    valueKey: "id",
    dataPath: "users",
  },
  {
    name: "Recipes",
    baseUrl: "https://dummyjson.com/recipes/search",
    labelKey: "name",
    valueKey: "id",
    dataPath: "recipes",
  },
];

export function getInfiniteSourceByName(name: string | undefined): InfiniteSourcePreset {
  if (!name) return INFINITE_SOURCES[0];
  return INFINITE_SOURCES.find((s) => s.name === name) ?? INFINITE_SOURCES[0];
}

function createInfiniteQueryOptions(queryKeyPrefix: string, baseUrl: string, labelKey: string, valueKey: string, search: string) {
  const pageSize = 10;
  return {
    queryKey: [queryKeyPrefix, baseUrl, search] as const,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const offset = pageParam as number;
      const url = new URL(baseUrl);
      url.searchParams.set("limit", String(pageSize));
      url.searchParams.set("skip", String(offset));
      if (search) url.searchParams.set("q", search);

      const { data } = await axios.get(url.toString());
      const raw = data as Record<string, unknown>;
      const items = Array.isArray(data)
        ? (data as unknown[])
        : ([raw.products, raw.users, raw.posts, raw.recipes].find((v) => Array.isArray(v)) as unknown[] | undefined) ?? [];
      const total = typeof raw.total === "number" ? raw.total : items.length;

      return {
        options: items.map((item: unknown) => {
          const rec = item as Record<string, unknown>;
          return {
            label: String(rec[labelKey] ?? rec.title ?? rec.name ?? ""),
            value: String(rec[valueKey] ?? rec.id ?? ""),
          };
        }) as Option[],
        nextOffset: offset + pageSize,
        hasMore: offset + pageSize < total,
      };
    },
    getNextPageParam: (lastPage: { hasMore: boolean; nextOffset: number }) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  };
}

/** Load-more button demos; query key prefix `infinite-preview`. */
export function useInfiniteOptions(baseUrl: string, labelKey: string, valueKey: string, search: string) {
  return useInfiniteQuery(createInfiniteQueryOptions("infinite-preview", baseUrl, labelKey, valueKey, search));
}

/** Sentinel / auto-scroll demos; query key prefix `infinite-auto-scroll` (matches installable variant code). */
export function useInfiniteOptionsAutoScroll(baseUrl: string, labelKey: string, valueKey: string, search: string) {
  return useInfiniteQuery(createInfiniteQueryOptions("infinite-auto-scroll", baseUrl, labelKey, valueKey, search));
}

/** Sentinel that triggers fetchNextPage when visible (auto-scroll / infinite scroll). */
export function ScrollSentinel({ onVisible, loading }: { onVisible: () => void; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) onVisible();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, loading]);

  return (
    <div ref={ref} className="flex items-center justify-center py-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
