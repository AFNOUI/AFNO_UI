"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InfiniteMultiComboboxFieldConfig } from "../../types/types";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import { mergeGhostOptionsForMultiValues } from "../../utils/watchPopulate";
import { useInfiniteOptions, type InfiniteOption } from "../../hooks/useInfiniteOptions";
  
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfiniteMultiComboboxFieldProps {
  config: InfiniteMultiComboboxFieldConfig;
}

export function InfiniteMultiComboboxField({ config }: InfiniteMultiComboboxFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(new Map());

  const {
    options, isLoading, isFetchingNextPage, hasMore, searchTerm, setSearchTerm, sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });

  const currentSelection = (form.watch(config.name) as string[]) || [];
  const optionsForList = useMemo(
    () => mergeGhostOptionsForMultiValues(options, currentSelection),
    [options, currentSelection],
  );

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const selectedValues = (field.value as string[]) || [];
        const applyExtrasFromValues = (values: string[]) => {
          const selectedOptions = mergeGhostOptionsForMultiValues(options, values).filter(
            (o) => values.includes(o.value),
          );
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOptions);
          const current = form.getValues() as Record<string, unknown>;
          const prefix = `${config.name}__`;
          Object.keys(current).forEach((k) => {
            if (k.startsWith(prefix) && !(k in extras)) {
              form.setValue(k, "", { shouldDirty: false });
            }
          });
          Object.entries(extras).forEach(([k, v]) =>
            form.setValue(k, v, { shouldDirty: false }),
          );
        };

        const toggleOption = (option: InfiniteOption) => {
          const newValues = selectedValues.includes(option.value)
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value];
          if (config.maxItems && newValues.length > config.maxItems) return;
          field.onChange(newValues);
          applyExtrasFromValues(newValues);
          const newSelected = new Map(selectedOptions);
          if (selectedValues.includes(option.value)) newSelected.delete(option.value);
          else newSelected.set(option.value, option.label);
          setSelectedOptions(newSelected);
        };

        const removeValue = (value: string) => {
          const newValues = selectedValues.filter((v) => v !== value);
          field.onChange(newValues);
          applyExtrasFromValues(newValues);
          const newSelected = new Map(selectedOptions);
          newSelected.delete(value);
          setSelectedOptions(newSelected);
        };

        const getLabel = (value: string) =>
          selectedOptions.get(value) ||
          optionsForList.find((o) => o.value === value)?.label ||
          value;

        return (
          <FormItem className={cn("flex flex-col", config.className)}>
            {config.label && (
              <FormLabel>
                {config.label}
                {config.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full min-h-10 h-auto justify-between", !selectedValues.length && "text-muted-foreground")}
                    disabled={config.disabled}
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {selectedValues.length > 0 ? (
                        selectedValues.map((value) => (
                          <Badge key={value} variant="secondary" className="mr-1">
                            {getLabel(value)}
                            <button
                              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeValue(value); }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span>{config.placeholder || "Select options"}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder={config.searchPlaceholder || "Search..."} value={searchTerm} onValueChange={setSearchTerm} />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>
                      {isLoading && optionsForList.length === 0 ? (
                        <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div>
                      ) : (
                        config.emptyMessage || "No option found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {optionsForList.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => toggleOption(option)}
                          disabled={option.disabled}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")} />
                          {option.label}
                        </CommandItem>
                      ))}
                      {hasMore && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2">
                          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs text-muted-foreground">Scroll for more</span>}
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {config.description && <FormDescription>{config.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
