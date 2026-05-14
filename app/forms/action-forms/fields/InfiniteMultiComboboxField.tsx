import axios from "axios";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";

import type {
  FieldOption,
  InfiniteMultiComboboxFieldConfig,
} from "@/forms/types/types";
import { buildAxiosConfigForAsyncApi } from "@/forms/utils/dependentApiRequest";
import { mergeGhostOptionsForMultiValues } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function InfiniteMultiComboboxField({
  config,
}: {
  config: InfiniteMultiComboboxFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FieldOption[]>(config.options || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const selected: string[] = (values[config.name] as string[]) || [];
  const watchValue = config.apiConfig?._watchValue;
  const optionsForList = useMemo(
    () => mergeGhostOptionsForMultiValues(options, selected),
    [options, selected],
  );
  const applyExtrasFromValues = (nextValues: string[]) => {
    const selectedOptions = mergeGhostOptionsForMultiValues(options, nextValues).filter(
      (o) => nextValues.includes(o.value),
    );
    const extras = getExtraKeyValuesFromOptions(config.name, selectedOptions);
    const prefix = `${config.name}__`;
    Object.keys(values).forEach((k) => {
      if (k.startsWith(prefix) && !(k in extras)) setValue(k, "");
    });
    Object.entries(extras).forEach(([k, val]) => setValue(k, val));
  };

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

  const toggle = (v: string) => {
    const nv = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    if (config.maxItems && nv.length > config.maxItems) return;
    setValue(config.name, nv);
    applyExtrasFromValues(nv);
  };
  const remove = (v: string) => {
    const nv = selected.filter((x) => x !== v);
    setValue(config.name, nv);
    applyExtrasFromValues(nv);
  };

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
            className={cn(
              "w-full min-h-10 h-auto justify-between",
              !selected.length && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length > 0 ? (
                selected.map((v) => (
                  <Badge key={v} variant="secondary" className="me-1">
                    {optionsForList.find((o) => o.value === v)?.label || v}
                    <button
                      className="ms-1 rounded-full"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{config.placeholder || "Select options"}</span>
              )}
            </div>
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
                {loading && optionsForList.length === 0 ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  config.emptyMessage || "No option found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {optionsForList.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => toggle(o.value)}
                    disabled={o.disabled}
                  >
                    <Check
                      className={cn(
                        "me-2 h-4 w-4",
                        selected.includes(o.value)
                          ? "opacity-100"
                          : "opacity-0",
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
