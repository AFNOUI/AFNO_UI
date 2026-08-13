"use client";

import { useState, useRef } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { files, data } from "@/registry/infinite-field/infinite-field-combobox";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { getInfiniteSourceByName, INFINITE_SOURCES, SEARCH_DEBOUNCE_MS, useInfiniteOptions } from "./shared";

export function InfiniteFieldCombobox() {
  const [source, setSource] = useState(getInfiniteSourceByName(data.defaultSource));
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

  const { options: allOptions, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteOptions(
    source.baseUrl,
    source.labelKey,
    source.valueKey,
    debouncedSearch
  );

  const snippet = `import { InfiniteComboboxField } from "@/forms/react-hook-form";

<InfiniteComboboxField
  config={{
    type: "infinitecombobox",
    name: "item",
    apiConfig: {
      url: "${source.baseUrl}",
      searchParam: "q",
      pageParam: "skip",
      pageSizeParam: "limit",
      pageSize: 10,
      offsetBased: true,
      responseMapping: { labelKey: "${source.labelKey}", valueKey: "${source.valueKey}", dataPath: "${source.dataPath}" },
    },
  }}
/>`;

  return (
    <ComponentInstall
      category="infinite-field"
      variant="infinite-field-combobox"
      title={data.title}
      code={snippet}
      files={files}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {INFINITE_SOURCES.map((s) => (
            <Button key={s.name} size="sm" variant={source.name === s.name ? "default" : "outline"} onClick={() => setSource(s)}>
              {s.name}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {data.fieldLabel} — {source.name}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {value ? allOptions.find((o) => o.value === value)?.label || value : "Search & select..."}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder={data.searchPlaceholder} value={search} onValueChange={handleSearch} />
                <CommandList>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : allOptions.length === 0 ? (
                    <CommandEmpty>{data.emptyMessage}</CommandEmpty>
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
    </ComponentInstall>
  );
}
