"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TextareaFieldConfig } from "../../types/types";

interface TextareaFieldProps {
  config: TextareaFieldConfig;
}

export function TextareaField({ config }: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={config.className}>
          {config.label && <FormLabel>{config.label}{config.required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={config.placeholder}
              disabled={config.disabled}
              rows={config.rows || 4}
              minLength={config.minLength}
              maxLength={config.maxLength}
              {...field}
            />
          </FormControl>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
