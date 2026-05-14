import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";
import { useAsyncOptions } from "../../hooks/useInfiniteOptions";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { mergeGhostOptionForSingle } from "../../utils/watchPopulate";
import type { AsyncComboboxFieldConfig } from "@/forms/types/types";

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

export function AsyncComboboxField({
  config,
}: {
  config: AsyncComboboxFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fieldValue = useStore(form.store, (s) => s.values[config.name]) as
    | string
    | undefined;
  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
  });
  const allOptions = useMemo(
    () => mergeGhostOptionForSingle(options, fieldValue),
    [options, fieldValue],
  );
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allOptions;
    return allOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        o.value.toLowerCase().includes(term),
    );
  }, [allOptions, searchTerm]);
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const sel = options.find((o) => o.value === field.state.value);
        return (
          <div className={cn("flex flex-col space-y-2", config.className)}>
            {config.label && (
              <Label>
                {config.label}
                {config.required && (
                  <span className="text-destructive ms-1">*</span>
                )}
              </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.state.value && "text-muted-foreground",
                  )}
                  disabled={config.disabled || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                      Loading...
                    </>
                  ) : field.state.value ? (
                    sel?.label || field.state.value
                  ) : (
                    config.placeholder || "Select an option"
                  )}
                  <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={config.searchPlaceholder || "Search..."}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {config.emptyMessage || "No option found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredOptions.map((o) => (
                        <CommandItem
                          key={o.value}
                          value={o.value}
                          onSelect={() => {
                            field.handleChange(o.value);
                            const extras = getExtraKeyValues(config.name, o);
                            Object.entries(extras).forEach(([k, v]) => {
                              form.setFieldValue(k, v);
                            });
                            setOpen(false);
                          }}
                          disabled={o.disabled}
                        >
                          <Check
                            className={cn(
                              "me-2 h-4 w-4",
                              field.state.value === o.value
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
            <FieldError error={field.state.meta.errors} />
          </div>
        );
      }}
    </form.Field>
  );
}
