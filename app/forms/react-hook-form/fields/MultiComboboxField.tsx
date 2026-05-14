"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { MultiComboboxFieldConfig } from "../../types/types";

interface MultiComboboxFieldProps {
  config: MultiComboboxFieldConfig;
}

export function MultiComboboxField({ config }: MultiComboboxFieldProps) {
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
                    aria-expanded={open}
                    className={cn(
                      "w-full min-h-10 h-auto justify-between",
                      !selectedValues.length && "text-muted-foreground"
                    )}
                    disabled={config.disabled}
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {selectedValues.length > 0 ? (
                        selectedValues.map((value) => {
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
                        })
                      ) : (
                        <span>{config.placeholder || "Select options"}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={config.searchPlaceholder || "Search..."} />
                  <CommandList>
                    <CommandEmpty>{config.emptyMessage || "No option found."}</CommandEmpty>
                    <CommandGroup>
                      {config.options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => toggleOption(option.value)}
                          disabled={option.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
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
