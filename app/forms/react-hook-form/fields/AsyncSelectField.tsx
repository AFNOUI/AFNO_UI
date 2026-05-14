"use client";

import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "../../utils/watchPopulate";
import type { AsyncSelectFieldConfig } from "../../types/types";
import { useAsyncOptions } from "../../hooks/useInfiniteOptions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AsyncSelectFieldProps {
  config: AsyncSelectFieldConfig;
}

export function AsyncSelectField({ config }: AsyncSelectFieldProps) {
  const form = useFormContext();

  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
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
                {config.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FormLabel>
            )}
            <div className="relative">
              <Select
                key={`async-select-${config.name}-${value}`}
                value={value}
                disabled={config.disabled || isLoading}
                onValueChange={(v) => {
                  field.onChange(v);
                  const opt = options.find((o) => optionValuesEqual(o.value, v));
                  if (opt) {
                    const extras = getExtraKeyValues(config.name, opt);
                    Object.entries(extras).forEach(([k, val]) =>
                      form.setValue(k, val, { shouldDirty: false }),
                    );
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
                    <SelectValue placeholder={config.placeholder || "Select an option"}>
                      {value ? displayLabel : (config.placeholder || "Select an option")}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {optionsForSelect.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoading && (
                <Loader2 className="pointer-events-none absolute end-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {config.description && (
              <FormDescription>{config.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
