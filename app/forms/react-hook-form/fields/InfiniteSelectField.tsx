import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "../../utils/watchPopulate";
import type { InfiniteSelectFieldConfig } from "../../types/types";
import { useInfiniteOptions } from "../../hooks/useInfiniteOptions";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface InfiniteSelectFieldProps {
  config: InfiniteSelectFieldConfig;
}

export function InfiniteSelectField({ config }: InfiniteSelectFieldProps) {
  const form = useFormContext();

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
        const value = optionValueKey(field.value);
        const matchedOption = value
          ? options.find((o) => optionValuesEqual(o.value, value))
          : undefined;
        const displayLabel = matchedOption?.label ?? value;
        const optionsForSelect = mergeGhostOptionForSingle(options, value);

        return (
          <FormItem className={cn("flex flex-col", config.className)}>
            {config.label && (
              <FormLabel>
                {config.label}
                {config.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <Select
              onValueChange={(v) => {
                field.onChange(v);
                const option = options.find((o) => optionValuesEqual(o.value, v));
                if (option) {
                  const extras = getExtraKeyValues(config.name, option);
                  Object.entries(extras).forEach(([k, val]) => form.setValue(k, val, { shouldDirty: false }));
                }
              }}
              value={value}
              disabled={config.disabled}
            >
              <FormControl>
                <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
                  <SelectValue placeholder={config.placeholder || "Select an option"}>
                    {value ? displayLabel : (config.placeholder || "Select an option")}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <div className="p-2" onPointerDown={(e) => e.stopPropagation()}>
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {optionsForSelect.length === 0 && isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : optionsForSelect.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
                  ) : (
                    <>
                      {optionsForSelect.map((option) => (
                        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </SelectItem>
                      ))}
                      {hasMore && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2">
                          {isFetchingNextPage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="text-center text-xs text-muted-foreground">Scroll for more</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SelectContent>
            </Select>
            {config.description && <FormDescription>{config.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
