"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AsyncComboboxFieldConfig } from "../../types/types";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { mergeGhostOptionForSingle } from "../../utils/watchPopulate";
import { useAsyncOptions } from "../../hooks/useInfiniteOptions";

import { Button } from "@/components/ui/button";
import {
  FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AsyncComboboxFieldProps {
  config: AsyncComboboxFieldConfig;
}

export function AsyncComboboxField({ config }: AsyncComboboxFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedValue = form.watch(config.name) as string | undefined;

  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
  });

  const allOptions = useMemo(
    () => mergeGhostOptionForSingle(options, selectedValue),
    [options, selectedValue],
  );

  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allOptions;
    return allOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term),
    );
  }, [allOptions, searchTerm]);

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const selectedOption = options.find((opt) => opt.value === field.value);
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
                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    disabled={config.disabled || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : field.value ? (
                      selectedOption?.label || field.value
                    ) : (
                      config.placeholder || "Select an option"
                    )}
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
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>{config.emptyMessage || "No option found."}</CommandEmpty>
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            form.setValue(config.name, option.value);
                            const extras = getExtraKeyValues(config.name, option);
                            Object.entries(extras).forEach(([k, v]) =>
                              form.setValue(k, v, { shouldDirty: false }),
                            );
                            setOpen(false);
                          }}
                          disabled={option.disabled}
                        >
                          <Check className={cn("mr-2 h-4 w-4", field.value === option.value ? "opacity-100" : "opacity-0")} />
                          {option.label}
                        </CommandItem>
                      ))}
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
