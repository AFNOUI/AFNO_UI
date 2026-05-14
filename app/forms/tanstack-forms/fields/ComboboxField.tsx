import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ComboboxFieldConfig } from "@/forms/types/types";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function ComboboxField({ config }: { config: ComboboxFieldConfig }) {
  const { form } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => (
        <div className={cn("flex flex-col space-y-2", config.className)}>
          {config.label && <Label>{config.label}{config.required && <span className="text-destructive ms-1">*</span>}</Label>}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open}
                className={cn("w-full justify-between", !field.state.value && "text-muted-foreground")} disabled={config.disabled}>
                {field.state.value ? config.options.find((o) => o.value === field.state.value)?.label : config.placeholder || "Select an option"}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder={config.searchPlaceholder || "Search..."} />
                <CommandList>
                  <CommandEmpty>{config.emptyMessage || "No option found."}</CommandEmpty>
                  <CommandGroup>
                    {config.options.map((o) => (
                      <CommandItem key={o.value} value={o.value} onSelect={() => { field.handleChange(o.value); setOpen(false); }} disabled={o.disabled}>
                        <Check className={cn("me-2 h-4 w-4", field.state.value === o.value ? "opacity-100" : "opacity-0")} />
                        {o.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {config.description && <FieldDescription>{config.description}</FieldDescription>}
          <FieldError error={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}
