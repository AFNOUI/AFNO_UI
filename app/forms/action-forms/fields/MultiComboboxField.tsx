import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { MultiComboboxFieldConfig } from "@/forms/types/types";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function MultiComboboxField({
  config,
}: {
  config: MultiComboboxFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const selected: string[] = (values[config.name] as string[]) || [];
  const toggle = (v: string) => {
    const nv = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    if (config.maxItems && nv.length > config.maxItems) return;
    setValue(config.name, nv);
  };
  const remove = (v: string) =>
    setValue(
      config.name,
      selected.filter((x) => x !== v),
    );
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
            className={cn(
              "w-full min-h-10 h-auto justify-between",
              !selected.length && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length > 0 ? (
                selected.map((v) => (
                  <Badge key={v} variant="secondary" className="me-1">
                    {config.options.find((o) => o.value === v)?.label || v}
                    <button
                      className="ms-1 rounded-full"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{config.placeholder || "Select options"}</span>
              )}
            </div>
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
                    onSelect={() => toggle(o.value)}
                    disabled={o.disabled}
                  >
                    <Check
                      className={cn(
                        "me-2 h-4 w-4",
                        selected.includes(o.value)
                          ? "opacity-100"
                          : "opacity-0",
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
