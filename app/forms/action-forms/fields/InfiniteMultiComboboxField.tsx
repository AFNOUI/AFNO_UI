import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

import type { InfiniteMultiComboboxFieldConfig } from "@/forms/types/types";
import { mergeGhostOptionsForMultiValues } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import { useInfiniteOptions } from "../../hooks/useInfiniteOptions";
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
  const {
    options,
    isLoading: loading,
    isFetchingNextPage,
    searchTerm: search,
    setSearchTerm: setSearch,
    sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });
  const selected: string[] = (values[config.name] as string[]) || [];
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
                {isFetchingNextPage && (
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
