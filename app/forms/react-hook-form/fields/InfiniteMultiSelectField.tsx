import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InfiniteMultiselectFieldConfig } from "../../types/types";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import { useInfiniteOptions, type InfiniteOption } from "../../hooks/useInfiniteOptions";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfiniteMultiSelectFieldProps {
  config: InfiniteMultiselectFieldConfig;
}

export function InfiniteMultiSelectField({ config }: InfiniteMultiSelectFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(new Map());

  const {
    options, isLoading, isFetchingNextPage, hasMore, searchTerm, setSearchTerm, sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const selectedValues = (field.value as string[]) || [];

        const toggleOption = (option: InfiniteOption) => {
          const newValues = selectedValues.includes(option.value)
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value];
          if (config.maxItems && newValues.length > config.maxItems) return;
          field.onChange(newValues);
          const selectedOpts = options.filter((o) => newValues.includes(o.value));
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOpts);
          Object.entries(extras).forEach(([k, v]) => form.setValue(k, v, { shouldDirty: false }));
          for (const key of config.apiConfig?.responseMapping?.extraKeys || []) {
            const synthetic = `${config.name}__${key}`;
            if (!(synthetic in extras)) form.setValue(synthetic, "", { shouldDirty: false });
          }
          const newSelected = new Map(selectedOptions);
          if (selectedValues.includes(option.value)) newSelected.delete(option.value);
          else newSelected.set(option.value, option.label);
          setSelectedOptions(newSelected);
        };

        const removeValue = (value: string) => {
          const newValues = selectedValues.filter((v) => v !== value);
          field.onChange(newValues);
          const selectedOpts = options.filter((o) => newValues.includes(o.value));
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOpts);
          Object.entries(extras).forEach(([k, v]) => form.setValue(k, v, { shouldDirty: false }));
          for (const key of config.apiConfig?.responseMapping?.extraKeys || []) {
            const synthetic = `${config.name}__${key}`;
            if (!(synthetic in extras)) form.setValue(synthetic, "", { shouldDirty: false });
          }
          const newSelected = new Map(selectedOptions);
          newSelected.delete(value);
          setSelectedOptions(newSelected);
        };

        const getLabel = (value: string) =>
          selectedOptions.get(value) || options.find((o) => o.value === value)?.label || value;

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
                            <span
                              role="button"
                              tabIndex={0}
                              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeValue(value); }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeValue(value);
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </span>
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
                <div className="p-2 border-b border-border" onPointerDown={(e) => e.stopPropagation()}>
                  <Input
                    autoFocus
                    className="h-8"
                    value={searchTerm}
                    placeholder="Search..."
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {options.length === 0 && isLoading ? (
                    <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div>
                  ) : options.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
                  ) : (
                    <div className="p-1">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleOption(option)}
                          disabled={option.disabled}
                          className={cn("w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground", option.disabled && "opacity-50 cursor-not-allowed")}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")} />
                          {option.label}
                        </button>
                      ))}
                      {hasMore && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2">
                          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs text-muted-foreground">Scroll for more</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
