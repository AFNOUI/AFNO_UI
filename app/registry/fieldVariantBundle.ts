/**
 * Bundle builders for the `async-field` and `infinite-field` variant families.
 *
 * These two families used to ship as a single self-contained `.tsx` snippet
 * that imported axios + `@tanstack/react-query` outright, so a default
 * `afnoui add async-field/<slug>` pulled both in with no flag — contradicting
 * AI_AGENT_RULES § R-56 ("a default install has zero transport dependencies").
 *
 * They now ship as an R-55 bundle, exactly like forms / tables / kanban / tree:
 *
 *     <Component>.tsx   renders. Never imports services.ts.
 *          ↓
 *     hooks.ts          React state (or the react-query adapter). Only caller of services.
 *          ↓
 *     services.ts       the only file that talks to the network.
 *
 *     constants.ts      every tunable + the API presets (§ R-57).
 *
 * The two transport axes are ORTHOGONAL and each is confined to one file, so
 * the registry ships overrides rather than duplicate bundles (§ R-56):
 *
 *     --axios           → services.ts
 *     --tanstack-query  → hooks.ts + constants.ts
 *
 * `<Component>.tsx` is byte-identical across all four combinations, which is
 * the property that keeps this cheap — the hook's name, arguments and return
 * shape never change between the local-state and react-query implementations.
 *
 * Lives at the top level of `app/registry/` on purpose: the variant walker in
 * `scripts/build-variants-registry.ts` treats `<category>/<file>` paths as
 * variants and skips top-level facade modules like this one.
 */

/** Which HTTP client sends the request, and which layer holds the result. */
export type TransportChoice = {
  http: "fetch" | "axios";
  query: "local" | "tanstack";
};

export const DEFAULT_TRANSPORT_CHOICE: TransportChoice = {
  http: "fetch",
  query: "local",
};

export interface FieldBundleFile {
  path: string;
  content: string;
}

/** Everything a snippet module must declare to be built into a bundle. */
export interface FieldVariantModule {
  /** Display metadata, also used for the gallery card. */
  data: {
    title: string;
    description: string;
    fieldLabel: string;
    [key: string]: unknown;
  };
  /** Exported React component name, e.g. `AsyncFieldSelect`. */
  componentName: string;
  /** The component file's source — imports `./constants` and `./hooks` only. */
  componentCode: string;
}

/* ------------------------------------------------------------------ */
/* shared pieces                                                       */
/* ------------------------------------------------------------------ */

const OPTION_TYPE = `export interface Option {
  label: string;
  value: string;
}`;

/**
 * The request helper is the ONLY thing that differs between fetch and axios —
 * every exported service function below it is byte-identical across both.
 */
function requestHelper(http: TransportChoice["http"]): string {
  if (http === "axios") {
    return `// TODO(cli-gated): emitted by \`afnoui add ... --axios\`. The default build
// uses \`fetch\` and has no transport dependency at all.
async function request(url: string, signal?: AbortSignal): Promise<unknown> {
  const { data } = await axios.get(url, { signal });
  return data;
}`;
  }
  return `async function request(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Request failed with status " + response.status);
  return response.json();
}`;
}

function requestImport(http: TransportChoice["http"]): string {
  return http === "axios" ? `import axios from "axios";\n\n` : "";
}

/* ------------------------------------------------------------------ */
/* async-field                                                         */
/* ------------------------------------------------------------------ */

export interface AsyncFieldPreset {
  name: string;
  url: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

export const ASYNC_API_PRESETS: AsyncFieldPreset[] = [
  { name: "Users", url: "https://jsonplaceholder.typicode.com/users", labelKey: "name", valueKey: "id", dataPath: "" },
  { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts", labelKey: "title", valueKey: "id", dataPath: "" },
  { name: "Todos", url: "https://jsonplaceholder.typicode.com/todos", labelKey: "title", valueKey: "id", dataPath: "" },
];

function asyncConstants(choice: TransportChoice): string {
  const presets = ASYNC_API_PRESETS.map(
    (p) =>
      `  { name: ${JSON.stringify(p.name)}, url: ${JSON.stringify(p.url)}, labelKey: ${JSON.stringify(p.labelKey)}, valueKey: ${JSON.stringify(p.valueKey)}, dataPath: ${JSON.stringify(p.dataPath)} },`,
  ).join("\n");

  const gcTime =
    choice.query === "tanstack"
      ? `\n/** How long an unused entry is kept before react-query evicts it. */\nexport const GC_TIME_MS = 10 * 60 * 1000;\n`
      : "";

  return `/** Every tunable for this field lives here (AI_AGENT_RULES § R-57). */

${OPTION_TYPE}

export interface AsyncApiPreset {
  url: string;
  name: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

/** How long a fetched option list is reused before it is refetched. */
export const STALE_TIME_MS = 5 * 60 * 1000;
${gcTime}
export const ASYNC_API_PRESETS: AsyncApiPreset[] = [
${presets}
];

export function getPresetByName(name: string | undefined): AsyncApiPreset {
  if (!name) return ASYNC_API_PRESETS[0];
  return ASYNC_API_PRESETS.find((p) => p.name === name) ?? ASYNC_API_PRESETS[0];
}
`;
}

function asyncServices(choice: TransportChoice): string {
  return `/**
 * The only file in this bundle that talks to the network (§ R-55).
 * Swap the base URL, headers or client here — nothing else needs to change.
 */
${requestImport(choice.http)}import type { Option } from "./constants";

${requestHelper(choice.http)}

function readPath(source: unknown, path: string): unknown {
  if (!path) return source;
  return path.split(".").reduce((o: unknown, k: string) => (o as Record<string, unknown>)?.[k], source);
}

function toOptions(payload: unknown, labelKey: string, valueKey: string, dataPath: string): Option[] {
  const items = readPath(payload, dataPath);
  return (Array.isArray(items) ? items : []).map((item: unknown) => {
    const rec = item as Record<string, unknown>;
    return {
      label: String(rec[labelKey] || ""),
      value: String(rec[valueKey] || ""),
    };
  });
}

export async function fetchOptions(
  url: string,
  labelKey: string,
  valueKey: string,
  dataPath: string,
  signal?: AbortSignal
): Promise<Option[]> {
  return toOptions(await request(url, signal), labelKey, valueKey, dataPath);
}
`;
}

function asyncHooks(choice: TransportChoice): string {
  if (choice.query === "tanstack") {
    return `"use client";

// TODO(cli-gated): emitted by \`afnoui add ... --tanstack-query\`. The default
// build uses plain React state and has no transport dependency.
import { useQuery } from "@tanstack/react-query";

import { GC_TIME_MS, STALE_TIME_MS } from "./constants";
import { fetchOptions } from "./services";

/**
 * The ONLY caller of services.ts (§ R-55). Its name, arguments and return
 * shape match the local-state implementation exactly, so the component file
 * is byte-identical whichever transport was selected.
 */
export function useAsyncOptions(url: string, labelKey: string, valueKey: string, dataPath: string) {
  const query = useQuery({
    queryKey: ["async-options", url, labelKey, valueKey, dataPath],
    queryFn: ({ signal }) => fetchOptions(url, labelKey, valueKey, dataPath, signal),
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
  });

  return { data: query.data, isLoading: query.isLoading, error: query.error };
}
`;
  }

  return `"use client";

import { useEffect, useState } from "react";

import { STALE_TIME_MS, type Option } from "./constants";
import { fetchOptions } from "./services";

interface CacheRecord {
  options: Option[];
  storedAt: number;
}

/**
 * Module-level, so every field pointing at the same preset shares one result
 * for the stale window instead of refetching per mount.
 */
const optionsCache = new Map<string, CacheRecord>();

/** Drops every cached option list. Useful after a mutation. */
export function clearOptionsCache(): void {
  optionsCache.clear();
}

/**
 * The ONLY caller of services.ts (§ R-55). Its name, arguments and return
 * shape match the react-query implementation exactly, so the component file
 * is byte-identical whichever transport was selected.
 */
export function useAsyncOptions(url: string, labelKey: string, valueKey: string, dataPath: string) {
  const cacheKey = JSON.stringify([url, labelKey, valueKey, dataPath]);

  const [data, setData] = useState<Option[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // The cache is read inside the effect, never during render: \`Date.now()\` is
  // impure, and calling it while rendering trips react-hooks/purity under the
  // React Compiler. A warm cache resolves on the first commit instead.
  useEffect(() => {
    const cached = optionsCache.get(cacheKey);
    if (cached !== undefined && Date.now() - cached.storedAt < STALE_TIME_MS) {
      setData(cached.options);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setError(null);

    fetchOptions(url, labelKey, valueKey, dataPath, controller.signal)
      .then((options) => {
        optionsCache.set(cacheKey, { options, storedAt: Date.now() });
        if (!active) return;
        setData(options);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [cacheKey, url, labelKey, valueKey, dataPath]);

  return { data, isLoading, error };
}
`;
}

/* ------------------------------------------------------------------ */
/* infinite-field                                                      */
/* ------------------------------------------------------------------ */

export interface InfiniteFieldSource {
  name: string;
  baseUrl: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

export const INFINITE_SOURCES: InfiniteFieldSource[] = [
  { name: "Products", baseUrl: "https://dummyjson.com/products/search", labelKey: "title", valueKey: "id", dataPath: "products" },
  { name: "Users", baseUrl: "https://dummyjson.com/users/search", labelKey: "firstName", valueKey: "id", dataPath: "users" },
  { name: "Recipes", baseUrl: "https://dummyjson.com/recipes/search", labelKey: "name", valueKey: "id", dataPath: "recipes" },
];

function infiniteConstants(choice: TransportChoice): string {
  const sources = INFINITE_SOURCES.map(
    (s) =>
      `  { name: ${JSON.stringify(s.name)}, baseUrl: ${JSON.stringify(s.baseUrl)}, labelKey: ${JSON.stringify(s.labelKey)}, valueKey: ${JSON.stringify(s.valueKey)}, dataPath: ${JSON.stringify(s.dataPath)} },`,
  ).join("\n");

  const queryTunables =
    choice.query === "tanstack"
      ? `\n/** How long a fetched page is reused before it is refetched. */\nexport const STALE_TIME_MS = 5 * 60 * 1000;\n/** How long an unused entry is kept before react-query evicts it. */\nexport const GC_TIME_MS = 10 * 60 * 1000;\n`
      : "";

  return `/** Every tunable for this field lives here (AI_AGENT_RULES § R-57). */

${OPTION_TYPE}

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
${queryTunables}
export const INFINITE_SOURCES: InfiniteSourcePreset[] = [
${sources}
];

export function getInfiniteSourceByName(name: string | undefined): InfiniteSourcePreset {
  if (!name) return INFINITE_SOURCES[0];
  return INFINITE_SOURCES.find((s) => s.name === name) ?? INFINITE_SOURCES[0];
}
`;
}

function infiniteServices(choice: TransportChoice): string {
  return `/**
 * The only file in this bundle that talks to the network (§ R-55).
 * Swap the base URL, headers or client here — nothing else needs to change.
 */
${requestImport(choice.http)}import { PAGE_SIZE, type Option } from "./constants";

export interface OptionsPage {
  options: Option[];
  hasMore: boolean;
}

${requestHelper(choice.http)}

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
`;
}

function infiniteHooks(choice: TransportChoice): string {
  if (choice.query === "tanstack") {
    return `"use client";

// TODO(cli-gated): emitted by \`afnoui add ... --tanstack-query\`. The default
// build uses plain React state and has no transport dependency.
import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { GC_TIME_MS, PAGE_SIZE, STALE_TIME_MS } from "./constants";
import { fetchOptionsPage } from "./services";

/**
 * The ONLY caller of services.ts (§ R-55). It flattens react-query's pages so
 * its return shape matches the local-state implementation exactly, which is
 * what keeps the component file byte-identical across transports.
 */
export function useInfiniteOptions(baseUrl: string, labelKey: string, valueKey: string, search: string) {
  const query = useInfiniteQuery({
    queryKey: ["infinite-options", baseUrl, labelKey, valueKey, search],
    queryFn: ({ pageParam, signal }) =>
      fetchOptionsPage(baseUrl, labelKey, valueKey, search, pageParam as number, signal),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
  });

  const fetchNextPage = useCallback(() => {
    void query.fetchNextPage();
  }, [query]);

  return {
    options: query.data?.pages.flatMap((p) => p.options) ?? [],
    isLoading: query.isLoading,
    fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
`;
  }

  return `"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PAGE_SIZE, type Option } from "./constants";
import { fetchOptionsPage } from "./services";

/**
 * The ONLY caller of services.ts (§ R-55). Its name, arguments and return
 * shape match the react-query implementation exactly, so the component file
 * is byte-identical whichever transport was selected.
 */
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
`;
}

/* ------------------------------------------------------------------ */
/* public builders                                                     */
/* ------------------------------------------------------------------ */

export type FieldFamily = "async-field" | "infinite-field";

/**
 * Builds the four files a field variant installs. `<Component>.tsx` is emitted
 * unchanged for every choice — that is the invariant that lets the registry
 * ship per-flag overrides instead of whole duplicate bundles.
 */
export function buildFieldVariantFiles(
  family: FieldFamily,
  slug: string,
  mod: FieldVariantModule,
  choice: TransportChoice = DEFAULT_TRANSPORT_CHOICE,
): FieldBundleFile[] {
  // `ui-variants/` keeps these out of `components/ui`, which holds only the
  // managed primitives the CLI refreshes on every install (§ R-40).
  const dir = `ui-variants/${family}/${slug}`;
  const constants = family === "async-field" ? asyncConstants(choice) : infiniteConstants(choice);
  const services = family === "async-field" ? asyncServices(choice) : infiniteServices(choice);
  const hooks = family === "async-field" ? asyncHooks(choice) : infiniteHooks(choice);

  return [
    { path: `${dir}/constants.ts`, content: constants },
    { path: `${dir}/services.ts`, content: services },
    { path: `${dir}/hooks.ts`, content: hooks },
    { path: `${dir}/${mod.componentName}.tsx`, content: mod.componentCode },
  ];
}

/**
 * A single readable string for the variant gallery, which still renders one
 * code block per variant. Replaced by real per-file tabs when the export-tab
 * consistency pass lands (see `.ai-brain/TASK_QUEUE.md` item 3).
 */
export function buildFieldVariantPreview(files: FieldBundleFile[]): string {
  return files
    .map((f) => `// ${"─".repeat(4)} ${f.path.split("/").pop()} ${"─".repeat(40)}\n\n${f.content.trim()}`)
    .join("\n\n");
}
