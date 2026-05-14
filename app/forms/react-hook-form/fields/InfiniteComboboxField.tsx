"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { mergeGhostOptionForSingle } from "../../utils/watchPopulate";
import { useInfiniteOptions } from "../../hooks/useInfiniteOptions";
import type { InfiniteComboboxFieldConfig } from "../../types/types";

import {
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InfiniteComboboxFieldProps {
  config: InfiniteComboboxFieldConfig;
}

export function InfiniteComboboxField({ config }: InfiniteComboboxFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const currentValue = form.watch(config.name) as string | undefined;

  const {
    options,
    isLoading,
    isFetchingNextPage,
    hasMore,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });

  const optionsForSelect = useMemo(
    () => mergeGhostOptionForSingle(options, currentValue),
    [options, currentValue],
  );

  useEffect(() => {
    if (!currentValue) {
      setSelectedLabel("");
      return;
    }
    const option = options.find((opt) => opt.value === currentValue);
    setSelectedLabel(option?.label ?? String(currentValue));
  }, [currentValue, options]);

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", config.className)}>
          {config.label && (
            <FormLabel>
              {config.label}
              {config.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                  )}
                  disabled={config.disabled}
                >
                  {field.value
                    ? selectedLabel || String(field.value)
                    : config.placeholder || "Select an option"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={config.searchPlaceholder || "Search..."}
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>
                    {isLoading && optionsForSelect.length === 0 ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      config.emptyMessage || "No option found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {optionsForSelect.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          form.setValue(config.name, option.value);
                          setSelectedLabel(option.label);
                          setOpen(false);
                          const extras = getExtraKeyValues(config.name, option);
                          Object.entries(extras).forEach(([k, v]) =>
                            form.setValue(k, v, { shouldDirty: false }),
                          );
                        }}
                        disabled={option.disabled}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                    {hasMore && (
                      <div
                        ref={sentinelRef}
                        className="flex items-center justify-center py-2"
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Scroll for more
                          </span>
                        )}
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {config.description && (
            <FormDescription>{config.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
