export const data = {
  title: "Infinite Field Select (auto-scroll)",
  description: "Paginated select; next page loads when the list sentinel scrolls into view.",
  fieldLabel: "Infinite select",
  defaultSource: "Products",
  searchPlaceholder: "Search...",
  emptyMessage: "No results",
};

export const code = `"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  { name: "Products", baseUrl: "https://dummyjson.com/products/search", labelKey: "title", valueKey: "id", dataPath: "products" },
  { name: "Users", baseUrl: "https://dummyjson.com/users/search", labelKey: "firstName", valueKey: "id", dataPath: "users" },
  { name: "Recipes", baseUrl: "https://dummyjson.com/recipes/search", labelKey: "name", valueKey: "id", dataPath: "recipes" },
];

export function getInfiniteSourceByName(name: string | undefined): InfiniteSourcePreset {
  if (!name) return INFINITE_SOURCES[0];
  return INFINITE_SOURCES.find((s) => s.name === name) ?? INFINITE_SOURCES[0];
}

function useInfiniteOptions(baseUrl: string, labelKey: string, valueKey: string, search: string) {
  const pageSize = 10;
  return useInfiniteQuery({
    queryKey: ["infinite-auto-scroll", baseUrl, search],
    queryFn: async ({ pageParam }) => {
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
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

function ScrollSentinel({ onVisible, loading }: { onVisible: () => void; loading: boolean }) {
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

export function InfiniteFieldAutoSelect() {
  const [source, setSource] = useState(getInfiniteSourceByName(${JSON.stringify(data.defaultSource)}));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(v), 300);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteOptions(
    source.baseUrl,
    source.labelKey,
    source.valueKey,
    debouncedSearch
  );
  const allOptions = data?.pages.flatMap((p) => p.options) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {INFINITE_SOURCES.map((s) => (
          <Button key={s.name} size="sm" variant={source.name === s.name ? "default" : "outline"} onClick={() => setSource(s)}>
            {s.name}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">${data.fieldLabel} — {source.name}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {value ? allOptions.find((o) => o.value === value)?.label || value : "Select..."}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <div className="p-2 border-b">
              <Input
                placeholder={${JSON.stringify(data.searchPlaceholder)}}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : allOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">${data.emptyMessage}</p>
              ) : (
                <div className="p-1">
                  {allOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={cn(
                        "w-full text-start px-2 py-1.5 text-sm rounded-sm hover:bg-accent flex items-center gap-2",
                        value === o.value && "bg-accent"
                      )}
                      onClick={() => setValue(o.value)}
                    >
                      <Check className={cn("h-4 w-4 shrink-0", value === o.value ? "opacity-100" : "opacity-0")} />
                      {o.label}
                    </button>
                  ))}
                  {hasNextPage && <ScrollSentinel onVisible={loadMore} loading={isFetchingNextPage} />}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
`;
