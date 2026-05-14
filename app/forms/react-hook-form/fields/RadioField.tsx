"use client";

import { useFormContext } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioFieldConfig } from "../../types/types";
import { cn } from "@/lib/utils";

interface RadioFieldProps {
  config: RadioFieldConfig;
}

export function RadioField({ config }: RadioFieldProps) {
  const form = useFormContext();
  const isHorizontal = config.orientation === "horizontal";

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3", config.className)}>
          {config.label && <FormLabel>{config.label}{config.required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={cn(
                isHorizontal ? "flex flex-wrap gap-4" : "flex flex-col space-y-2"
              )}
              disabled={config.disabled}
            >
              {config.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${config.name}-${option.value}`}
                    disabled={option.disabled}
                  />
                  <Label
                    htmlFor={`${config.name}-${option.value}`}
                    className={cn(
                      "font-normal cursor-pointer",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.label}
                    {option.description && (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
