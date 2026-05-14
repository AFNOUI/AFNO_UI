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
import { CheckboxGroupFieldConfig } from "../../types/types";
import { cn } from "@/lib/utils";

interface CheckboxGroupFieldProps {
  config: CheckboxGroupFieldConfig;
}

export function CheckboxGroupField({ config }: CheckboxGroupFieldProps) {
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
          <div className={cn(
            "space-y-2",
            config.orientation === "horizontal" && "flex flex-wrap gap-4 space-y-0"
          )}>
            {config.options.map((option) => {
              const isChecked = (field.value || []).includes(option.value);
              return (
                <FormItem
                  key={option.value}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={isChecked}
                      disabled={config.disabled || option.disabled}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        if (checked) {
                          field.onChange([...currentValues, option.value]);
                        } else {
                          field.onChange(currentValues.filter((v: string) => v !== option.value));
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="font-normal cursor-pointer">
                      {option.label}
                    </FormLabel>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                </FormItem>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
