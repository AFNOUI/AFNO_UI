"use client";

import { useState, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { code, data } from "@/registry/infinite-field/infinite-field-multi-select-auto";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  INFINITE_SOURCES,
  ScrollSentinel,
  getInfiniteSourceByName,
  useInfiniteOptionsAutoScroll,
} from "./shared";

export function InfiniteFieldAutoMultiSelect() {
  const [source, setSource] = useState(getInfiniteSourceByName(data.defaultSource));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(v), 300);
  };

  const { data: qData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteOptionsAutoScroll(
    source.baseUrl,
    source.labelKey,
    source.valueKey,
    debouncedSearch
  );
  const allOptions = qData?.pages.flatMap((p) => p.options) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const toggle = (val: string) =>
    setSelected((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  const snippet = `// Auto-fetches when the list sentinel scrolls into view
import { InfiniteMultiSelectField } from "@/forms/react-hook-form";

<InfiniteMultiSelectField
  config={{
    type: "infinitemultiselect",
    name: "items",
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
      variant="infinite-field-multi-select-auto"
      title={data.title}
      code={snippet}
      fullCode={code}
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
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1 text-xs">
                  {allOptions.find((o) => o.value === v)?.label || v}
                  <button type="button" onClick={() => toggle(v)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selected.length > 0 ? `${selected.length} selected` : "Select multiple..."}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <div className="p-2 border-b">
                <Input
                  placeholder={data.searchPlaceholder}
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
                  <p className="text-sm text-muted-foreground text-center py-4">{data.emptyMessage}</p>
                ) : (
                  <div className="p-1">
                    {allOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={cn(
                          "w-full text-start px-2 py-1.5 text-sm rounded-sm hover:bg-accent flex items-center gap-2"
                        )}
                        onClick={() => toggle(o.value)}
                      >
                        <Check className={cn("h-4 w-4 shrink-0", selected.includes(o.value) ? "opacity-100" : "opacity-0")} />
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
    </ComponentInstall>
  );
}
