"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckboxFieldConfig } from "../../types/types";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  config: CheckboxFieldConfig;
}

export function CheckboxField({ config }: CheckboxFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", config.className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={config.disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {(config.checkboxLabel || config.label) && (
              <FormLabel className="cursor-pointer">
                {config.checkboxLabel || config.label}
                {config.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            {config.description && <FormDescription>{config.description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
