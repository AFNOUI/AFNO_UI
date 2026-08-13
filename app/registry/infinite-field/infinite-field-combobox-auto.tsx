import { buildFieldVariantFiles } from "../fieldVariantBundle";

export const data = {
  title: "Infinite Field Combobox (auto-scroll)",
  description: "Paginated combobox; next page loads when the sentinel enters view.",
  fieldLabel: "Infinite combobox",
  defaultSource: "Products",
  searchPlaceholder: "Search...",
  emptyMessage: "No results found.",
};

export const componentName = "InfiniteFieldAutoCombobox";

/**
 * Renders only — it reaches the network through `./hooks`, never `./services`
 * (AI_AGENT_RULES § R-55). Emitted unchanged for every transport combination,
 * which is what lets the registry ship per-flag overrides instead of duplicate
 * bundles (§ R-56).
 */
export const componentCode = `"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { INFINITE_SOURCES, SEARCH_DEBOUNCE_MS, getInfiniteSourceByName } from "./constants";
import { useInfiniteOptions } from "./hooks";

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

export function InfiniteFieldAutoCombobox() {
  const [source, setSource] = useState(getInfiniteSourceByName(${JSON.stringify(data.defaultSource)}));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(v), SEARCH_DEBOUNCE_MS);
  };

  const {
    options: allOptions,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOptions(source.baseUrl, source.labelKey, source.valueKey, debouncedSearch);

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {value ? allOptions.find((o) => o.value === value)?.label || value : "Search & select..."}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandInput placeholder={${JSON.stringify(data.searchPlaceholder)}} value={search} onValueChange={handleSearch} />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : allOptions.length === 0 ? (
                  <CommandEmpty>${data.emptyMessage}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {allOptions.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        onSelect={() => {
                          setValue(o.value);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn("me-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                        {o.label}
                      </CommandItem>
                    ))}
                    {hasNextPage && (
                      <div className="px-2">
                        <ScrollSentinel onVisible={loadMore} loading={isFetchingNextPage} />
                      </div>
                    )}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
`;

/**
 * The installed bundle, one entry per file, for the gallery's Component tab.
 * Shown as real per-file tabs — concatenating them hid the
 * component -> hooks -> services layering the bundle exists to teach.
 */
export const files = buildFieldVariantFiles("infinite-field", "infinite-field-combobox-auto", {
    data,
    componentName,
    componentCode,
  }).map((f) => ({
  name: f.path.split("/").pop() as string,
  code: f.content,
}));
