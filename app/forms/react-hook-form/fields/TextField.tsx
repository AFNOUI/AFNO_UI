"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { TextFieldConfig, NumberFieldConfig } from "../../types/types";

type TextOrNumberFieldConfig = TextFieldConfig | NumberFieldConfig;

interface TextFieldProps {
  config: TextOrNumberFieldConfig;
}

export function TextField({ config }: TextFieldProps) {
  const form = useFormContext();

  const inputType = config.type;
  const min = config.type === "number" ? (config as NumberFieldConfig).min : undefined;
  const max = config.type === "number" ? (config as NumberFieldConfig).max : undefined;
  const minLength = 'minLength' in config ? config.minLength : undefined;
  const maxLength = 'maxLength' in config ? config.maxLength : undefined;

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={config.className}>
          {config.label && <FormLabel>{config.label}{config.required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
          <FormControl>
            <Input
              type={inputType}
              placeholder={config.placeholder}
              disabled={config.disabled}
              min={min}
              max={max}
              minLength={minLength}
              maxLength={maxLength}
              {...field}
              onChange={(e) => {
                if (config.type === "number") {
                  field.onChange(e.target.value === "" ? "" : e.target.value);
                } else {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
