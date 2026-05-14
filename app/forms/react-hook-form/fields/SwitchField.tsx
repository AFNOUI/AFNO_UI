"use client";

import * as React from "react";
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
import { SwitchFieldConfig } from "../../types/types";
import { cn } from "@/lib/utils";

interface SwitchFieldProps {
  config: SwitchFieldConfig;
}

export const SwitchField = React.forwardRef<HTMLDivElement, SwitchFieldProps>(
  ({ config }, ref) => {
    const form = useFormContext();

    return (
      <FormField
        control={form.control}
        name={config.name}
        render={({ field }) => (
          <FormItem 
            ref={ref}
            className={cn("flex flex-row items-center justify-between rounded-lg border p-4", config.className)}
          >
            <div className="space-y-0.5">
              {(config.switchLabel || config.label) && (
                <FormLabel className="text-base">
                  {config.switchLabel || config.label}
                </FormLabel>
              )}
              {config.description && (
                <FormDescription>{config.description}</FormDescription>
              )}
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={config.disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

SwitchField.displayName = "SwitchField";
