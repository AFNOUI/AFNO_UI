import {
  buildFieldVariantFiles,
  buildFieldVariantPreview,
} from "../fieldVariantBundle";

export const data = {
  title: "Infinite Field Select",
  description: "Paginated select with debounced search and infinite scroll loading.",
  fieldLabel: "Infinite select",
  defaultSource: "Products",
  searchPlaceholder: "Search...",
  emptyMessage: "No results",
};

export const componentName = "InfiniteFieldSelect";

/**
 * Renders only — it reaches the network through `./hooks`, never `./services`
 * (AI_AGENT_RULES § R-55). Emitted unchanged for every transport combination,
 * which is what lets the registry ship per-flag overrides instead of duplicate
 * bundles (§ R-56).
 */
export const componentCode = `"use client";

import { useState, useRef } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { INFINITE_SOURCES, SEARCH_DEBOUNCE_MS, getInfiniteSourceByName } from "./constants";
import { useInfiniteOptions } from "./hooks";

export function InfiniteFieldSelect() {
  const [source, setSource] = useState(getInfiniteSourceByName(${JSON.stringify(data.defaultSource)}));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [value, setValue] = useState("");
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
                  {hasNextPage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : null}
                      Load more
                    </Button>
                  )}
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

/** The full bundle, for the variant gallery's single code block. */
export const code = buildFieldVariantPreview(
  buildFieldVariantFiles("infinite-field", "infinite-field-select", {
    data,
    componentName,
    componentCode,
  }),
);
