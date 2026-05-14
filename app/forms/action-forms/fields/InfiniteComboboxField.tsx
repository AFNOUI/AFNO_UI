import axios from "axios";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";

import type {
  FieldOption,
  InfiniteComboboxFieldConfig,
} from "@/forms/types/types";
import { buildAxiosConfigForAsyncApi } from "@/forms/utils/dependentApiRequest";
import { mergeGhostOptionForSingle } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { useActionFormContext } from "../ActionFormContext";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function InfiniteComboboxField({
  config,
}: {
  config: InfiniteComboboxFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [options, setOptions] = useState<FieldOption[]>(config.options || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const v = values[config.name] as string;
  const watchValue = config.apiConfig?._watchValue;

  const optionsForSelect = useMemo(
    () => mergeGhostOptionForSingle(options, v),
    [options, v],
  );

  useEffect(() => {
    if (!v) {
      setSelectedLabel("");
      return;
    }
    const option = options.find((o) => o.value === v);
    setSelectedLabel(option?.label ?? String(v));
  }, [v, options]);

  const fetchPage = useCallback(
    async (p: number, q: string, reset = false) => {
      if (!config.apiConfig?.url) return;
      setLoading(true);
      try {
        const {
          responseMapping,
          searchParam = "search",
          pageParam = "page",
          pageSizeParam = "limit",
          pageSize = 20,
          hasMorePath,
          offsetBased,
        } = config.apiConfig;
        const params: Record<string, string | number> = {
          [pageSizeParam]: pageSize,
        };
        if (q) params[searchParam] = q;
        params[pageParam] = offsetBased ? p * pageSize : p + 1;
        const res = await axios(buildAxiosConfigForAsyncApi(config.apiConfig, params));
        const raw = responseMapping.dataPath
          .split(".")
          .reduce((o, k: string) => o?.[k], res.data);
        const items = Array.isArray(raw) ? raw : [];
        const mapped = items.map((item) => ({
          label: String(item[responseMapping.labelKey] || ""),
          value: String(item[responseMapping.valueKey] || ""),
        }));
        setOptions((prev) => (reset ? mapped : [...prev, ...mapped]));
        if (hasMorePath) {
          const more = hasMorePath
            .split(".")
            .reduce((o, k: string) => o?.[k], res.data);
          setHasMore(!!more);
        } else setHasMore(items.length >= pageSize);
      } catch {
        setHasMore(false);
      }
      setLoading(false);
    },
    [config.apiConfig],
  );

  useEffect(() => {
    if (!config.apiConfig?.url) {
      setOptions(config.options || []);
      setPage(0);
      setHasMore(false);
      return;
    }
    setPage(0);
    setHasMore(true);
    fetchPage(0, "", true);
  }, [config.apiConfig, config.options, fetchPage, watchValue]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchPage(0, search, true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchPage]);

  useEffect(() => {
    if (!sentinelRef.current || !open) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPage(next, search);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [open, hasMore, loading, page, search, fetchPage]);

  return (
    <div className={cn("flex flex-col space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !v && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            {v
              ? selectedLabel || String(v)
              : config.placeholder || "Select an option"}
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={config.searchPlaceholder || "Search..."}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading && optionsForSelect.length === 0 ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  config.emptyMessage || "No option found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {optionsForSelect.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => {
                      setValue(config.name, o.value);
                      setSelectedLabel(o.label);
                      const extras = getExtraKeyValues(config.name, o);
                      Object.entries(extras).forEach(([k, val]) => setValue(k, val));
                      setOpen(false);
                    }}
                    disabled={o.disabled}
                  >
                    <Check
                      className={cn(
                        "me-2 h-4 w-4",
                        v === o.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <div
                ref={sentinelRef}
                className="h-6 flex items-center justify-center"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
