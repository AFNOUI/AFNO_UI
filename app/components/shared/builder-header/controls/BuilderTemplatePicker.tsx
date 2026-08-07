"use client";

import * as React from "react";
import { Check, ChevronDown, LayoutTemplate } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";

import {
  TEMPLATE_PICKER_WIDTH,
  TOOLBAR_CONTROL_HEIGHT,
  TEMPLATE_SEARCH_THRESHOLD,
} from "../constants";
import type { BuilderTemplateOption } from "../types";
import { BuilderBadge } from "../primitives/BuilderBadge";

export interface BuilderTemplatePickerProps {
  options: BuilderTemplateOption[];
  /** Currently loaded template key, or `undefined` for "nothing loaded yet". */
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  /** Show the search field. Auto-enabled once the list gets long. */
  searchable?: boolean;
  className?: string;
}

/**
 * CONTROL — the "Load template…" dropdown shared by all four builders.
 *
 * Built on Popover + Command rather than `<Select>` so it stays usable at the
 * tree builder's ~30 templates: type-to-filter, keyboard nav, and a check mark
 * on the active entry. The trigger keeps the exact height/radius of the other
 * toolbar primitives so the row stays optically aligned.
 */
export function BuilderTemplatePicker({
  options,
  value,
  onSelect,
  placeholder = "Load template…",
  searchable,
  className,
}: BuilderTemplatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const active = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const showSearch = searchable ?? options.length > TEMPLATE_SEARCH_THRESHOLD;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          size="sm"
          variant="outline"
          aria-expanded={open}
          aria-label={active ? `Template: ${active.label}` : placeholder}
          className={cn(
            TOOLBAR_CONTROL_HEIGHT,
            TEMPLATE_PICKER_WIDTH,
            "justify-between gap-2 px-3 font-normal",
            !active && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <LayoutTemplate className="h-4 w-4 shrink-0 opacity-60" />
            <span className="truncate">{active?.label ?? placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          {showSearch ? <CommandInput placeholder="Search templates…" className="h-9" /> : null}
          <CommandList className="max-h-[min(60vh,20rem)]">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              No template matches.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // cmdk lowercases the value it hands back, so we close over
                  // `option.value` instead of trusting the callback argument.
                  value={`${option.label} ${option.description ?? ""} ${option.value}`}
                  onSelect={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                  className="gap-2 text-xs"
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.badge ? (
                    <BuilderBadge tone={option.badge.tone}>{option.badge.label}</BuilderBadge>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
