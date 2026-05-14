import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { mergeGhostOptionForSingle } from "../../utils/watchPopulate";
import { useInfiniteOptions } from "@/forms/hooks/useInfiniteOptions";
import type { InfiniteComboboxFieldConfig } from "@/forms/types/types";

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

export function InfiniteComboboxField({
  config,
}: {
  config: InfiniteComboboxFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const currentValue = useStore(form.store, (s) => s.values[config.name]) as
    | string
    | undefined;
  const {
    options,
    isLoading,
    isFetchingNextPage,
    hasMore,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });
  const optionsForSelect = useMemo(
    () => mergeGhostOptionForSingle(options, currentValue),
    [options, currentValue],
  );
  useEffect(() => {
    if (!currentValue) {
      setSelectedLabel("");
      return;
    }
    const option = options.find((o) => o.value === currentValue);
    setSelectedLabel(option?.label ?? String(currentValue));
  }, [currentValue, options]);
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
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
                  className={cn(
                    "w-full justify-between",
                    !field.state.value && "text-muted-foreground",
                  )}
                  disabled={config.disabled}
                >
                  {field.state.value
                    ? selectedLabel || String(field.state.value)
                    : config.placeholder || "Select an option"}
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
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>
                      {isLoading && optionsForSelect.length === 0 ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        config.emptyMessage || "No option found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {optionsForSelect.map((o) => (
                        <CommandItem
                          key={o.value}
                          value={o.value}
                          onSelect={() => {
                            field.handleChange(o.value);
                            setSelectedLabel(o.label);
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
                      {hasMore && (
                        <div
                          ref={sentinelRef}
                          className="flex items-center justify-center py-2"
                        >
                          {isFetchingNextPage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Scroll for more
                            </span>
                          )}
                        </div>
                      )}
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
