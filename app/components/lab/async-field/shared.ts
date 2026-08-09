"use client";

/**
 * The live demo's copy of the `async-field` bundle's runtime.
 *
 * It deliberately mirrors what `afnoui add async-field/<slug>` now installs
 * (see `app/registry/fieldVariantBundle.ts`): plain `fetch` plus React state,
 * zero transport dependencies. Keep the two in step — the lab page renders
 * this code *and* displays the generated bundle beside it, so a divergence
 * here shows a user one thing and runs another.
 *
 * axios / react-query are the CLI-gated opt-ins (§ R-56), not the default.
 */
import { useEffect, useState } from "react";

export interface Option {
  label: string;
  value: string;
}

export interface AsyncApiPreset {
  url: string;
  name: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

/** How long a fetched option list is reused before it is refetched. */
export const STALE_TIME_MS = 5 * 60 * 1000;

export const ASYNC_API_PRESETS: AsyncApiPreset[] = [
  { name: "Users", url: "https://jsonplaceholder.typicode.com/users", labelKey: "name", valueKey: "id", dataPath: "" },
  { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts", labelKey: "title", valueKey: "id", dataPath: "" },
  { name: "Todos", url: "https://jsonplaceholder.typicode.com/todos", labelKey: "title", valueKey: "id", dataPath: "" },
];

export function getPresetByName(name: string | undefined): AsyncApiPreset {
  if (!name) return ASYNC_API_PRESETS[0];
  return ASYNC_API_PRESETS.find((p) => p.name === name) ?? ASYNC_API_PRESETS[0];
}

async function request(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Request failed with status " + response.status);
  return response.json();
}

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

interface CacheRecord {
  options: Option[];
  storedAt: number;
}

/**
 * Module-level, so every field pointing at the same preset shares one result
 * for the stale window instead of refetching per mount.
 */
const optionsCache = new Map<string, CacheRecord>();

export function useAsyncOptions(url: string, labelKey: string, valueKey: string, dataPath: string) {
  const cacheKey = JSON.stringify([url, labelKey, valueKey, dataPath]);

  const [data, setData] = useState<Option[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // The cache is read inside the effect, never during render: `Date.now()` is
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
