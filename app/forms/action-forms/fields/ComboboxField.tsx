import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { ComboboxFieldConfig } from "@/forms/types/types";

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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function ComboboxField({ config }: { config: ComboboxFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  const v = values[config.name] as string;

  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !v && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            {v
              ? config.options.find((o) => o.value === v)?.label
              : config.placeholder || "Select an option"}
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={config.searchPlaceholder || "Search..."}
            />
            <CommandList>
              <CommandEmpty>
                {config.emptyMessage || "No option found."}
              </CommandEmpty>
              <CommandGroup>
                {config.options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => {
                      setValue(config.name, o.value);
                      setOpen(false);
                    }}
                    disabled={o.disabled}
                  >
                    <Check
                      className={cn(
                        "me-2 h-4 w-4",
                        v === o.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
