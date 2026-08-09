import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import type { InfiniteComboboxFieldConfig } from "@/forms/types/types";
import { mergeGhostOptionForSingle } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { useInfiniteOptions } from "../../hooks/useInfiniteOptions";
import { useActionFormContext } from "../ActionFormContext";

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
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const v = values[config.name] as string;

  const {
    options,
    isLoading: loading,
    isFetchingNextPage,
    searchTerm: search,
    setSearchTerm: setSearch,
    sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });

  const optionsForSelect = useMemo(
    () => mergeGhostOptionForSingle(options, v),
    [options, v],
  );

  useEffect(() => {
    if (!v) {
      setSelectedLabel("");
      return;
    }
    const option = options.find((o) => o.value === v);
    setSelectedLabel(option?.label ?? String(v));
  }, [v, options]);

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
              ? selectedLabel || String(v)
              : config.placeholder || "Select an option"}
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={config.searchPlaceholder || "Search..."}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading && optionsForSelect.length === 0 ? (
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
                      setValue(config.name, o.value);
                      setSelectedLabel(o.label);
                      const extras = getExtraKeyValues(config.name, o);
                      Object.entries(extras).forEach(([k, val]) => setValue(k, val));
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
              <div
                ref={sentinelRef}
                className="h-6 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
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
