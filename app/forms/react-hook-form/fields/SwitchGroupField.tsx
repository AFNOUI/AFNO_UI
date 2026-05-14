"use client";

import { useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SwitchGroupFieldConfig } from "../../types/types";
import { cn } from "@/lib/utils";

interface SwitchGroupFieldProps {
  config: SwitchGroupFieldConfig;
}

export function SwitchGroupField({ config }: SwitchGroupFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3", config.className)}>
          {config.label && (
            <FormLabel>
              {config.label}
              {config.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <div className="space-y-3">
            {config.options.map((option) => {
              const values = field.value || {};
              const isChecked = values[option.value] || false;
              return (
                <div
                  key={option.value}
                  className="flex flex-row items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-0.5">
                    <FormLabel className="font-normal cursor-pointer">
                      {option.label}
                    </FormLabel>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                  <FormControl>
                    <Switch
                      checked={isChecked}
                      disabled={config.disabled || option.disabled}
                      onCheckedChange={(checked) => {
                        field.onChange({ ...values, [option.value]: checked });
                      }}
                    />
                  </FormControl>
                </div>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
