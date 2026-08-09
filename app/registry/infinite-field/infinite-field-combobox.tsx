import {
  buildFieldVariantFiles,
  buildFieldVariantPreview,
} from "../fieldVariantBundle";

export const data = {
  title: "Infinite Field Combobox",
  description: "Paginated combobox with debounced search via Command + infinite query.",
  fieldLabel: "Infinite combobox",
  defaultSource: "Products",
  searchPlaceholder: "Search...",
  emptyMessage: "No results found.",
};

export const componentName = "InfiniteFieldCombobox";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { INFINITE_SOURCES, SEARCH_DEBOUNCE_MS, getInfiniteSourceByName } from "./constants";
import { useInfiniteOptions } from "./hooks";

export function InfiniteFieldCombobox() {
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
                      <CommandItem onSelect={() => fetchNextPage()} disabled={isFetchingNextPage} className="justify-center">
                        {isFetchingNextPage ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : null}
                        Load more...
                      </CommandItem>
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

/** The full bundle, for the variant gallery's single code block. */
export const code = buildFieldVariantPreview(
  buildFieldVariantFiles("infinite-field", "infinite-field-combobox", {
    data,
    componentName,
    componentCode,
  }),
);
