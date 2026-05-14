"use client";
  
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiselectFieldConfig } from "../../types/types";
import { useState } from "react";

interface MultiselectFieldProps {
  config: MultiselectFieldConfig;
}

export function MultiselectField({ config }: MultiselectFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const selectedValues = (field.value as string[]) || [];

        const toggleOption = (value: string) => {
          const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

          if (config.maxItems && newValues.length > config.maxItems) {
            return;
          }

          field.onChange(newValues);
        };

        const removeValue = (value: string) => {
          field.onChange(selectedValues.filter((v) => v !== value));
        };

        return (
          <FormItem className={cn("flex flex-col", config.className)}>
            {config.label && <FormLabel>{config.label}{config.required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full min-h-10 h-auto justify-start",
                      !selectedValues.length && "text-muted-foreground"
                    )}
                    disabled={config.disabled}
                  >
                    {selectedValues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedValues.map((value) => {
                          const option = config.options.find((o) => o.value === value);
                          return (
                            <Badge
                              key={value}
                              variant="secondary"
                              className="mr-1"
                            >
                              {option?.label || value}
                              <button
                                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeValue(value);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      config.placeholder || "Select options"
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="space-y-2">
                  {config.options.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !option.disabled && toggleOption(option.value)}
                    >
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        disabled={option.disabled}
                        onCheckedChange={() => toggleOption(option.value)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  ))}
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
