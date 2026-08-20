"use client";

/**
 * The live demo's copy of the `infinite-field` bundle's runtime.
 *
 * It deliberately mirrors what `afnoui add infinite-field/<slug>` now installs
 * (see `app/registry/fieldVariantBundle.ts`): plain `fetch` plus React state,
 * zero transport dependencies. Keep the two in step — the lab page renders
 * this code *and* displays the generated bundle beside it, so a divergence
 * here shows a user one thing and runs another.
 *
 * axios / react-query are the CLI-gated opt-ins (§ R-56), not the default.
 *
 * There used to be a second hook, `useInfiniteOptionsAutoScroll`, that existed
 * only to give the sentinel demos a distinct react-query cache key. Without
 * react-query each hook instance owns its own state, so the two are the same
 * hook and only `useInfiniteOptions` remains.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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

/** Rows requested per page. */
export const PAGE_SIZE = 10;

/** How long typing settles before a new search request is issued. */
export const SEARCH_DEBOUNCE_MS = 300;

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

export interface OptionsPage {
  options: Option[];
  hasMore: boolean;
}

async function request(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Request failed with status " + response.status);
  return response.json();
}

export async function fetchOptionsPage(
  baseUrl: string,
  labelKey: string,
  valueKey: string,
  search: string,
  offset: number,
  signal?: AbortSignal
): Promise<OptionsPage> {
  const url = new URL(baseUrl);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("skip", String(offset));
  if (search) url.searchParams.set("q", search);

  const payload = await request(url.toString(), signal);
  const raw = payload as Record<string, unknown>;
  const items = Array.isArray(payload)
    ? (payload as unknown[])
    : ([raw.products, raw.users, raw.posts, raw.recipes].find((v) => Array.isArray(v)) as unknown[] | undefined) ?? [];
  const total = typeof raw.total === "number" ? raw.total : items.length;

  return {
    options: items.map((item: unknown) => {
      const rec = item as Record<string, unknown>;
      return {
        label: String(rec[labelKey] ?? rec.title ?? rec.name ?? ""),
        value: String(rec[valueKey] ?? rec.id ?? ""),
      };
    }),
    hasMore: offset + PAGE_SIZE < total,
  };
}

export function useInfiniteOptions(baseUrl: string, labelKey: string, valueKey: string, search: string) {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  // Any change of source or search term restarts pagination from page one.
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    offsetRef.current = 0;
    loadingRef.current = true;
    let active = true;

    setOptions([]);
    setIsLoading(true);

    fetchOptionsPage(baseUrl, labelKey, valueKey, search, 0, controller.signal)
      .then((page) => {
        if (!active) return;
        setOptions(page.options);
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
  }, [baseUrl, labelKey, valueKey, search]);

  const fetchNextPage = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;

    const nextOffset = offsetRef.current + PAGE_SIZE;
    loadingRef.current = true;
    setIsFetchingNextPage(true);

    fetchOptionsPage(baseUrl, labelKey, valueKey, search, nextOffset, controllerRef.current?.signal)
      .then((page) => {
        offsetRef.current = nextOffset;
        setOptions((prev) => [...prev, ...page.options]);
        setHasNextPage(page.hasMore);
      })
      .catch(() => {
        setHasNextPage(false);
      })
      .finally(() => {
        loadingRef.current = false;
        setIsFetchingNextPage(false);
      });
  }, [baseUrl, labelKey, valueKey, search, hasNextPage]);

  return { options, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage };
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
