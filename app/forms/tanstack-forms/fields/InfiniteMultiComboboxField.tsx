import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import {
  useInfiniteOptions,
  type InfiniteOption,
} from "@/forms/hooks/useInfiniteOptions";
import type { InfiniteMultiComboboxFieldConfig } from "@/forms/types/types";
import { mergeGhostOptionsForMultiValues } from "../../utils/watchPopulate";
import { useTanstackFormContext } from "../TanstackFormContext";

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

export function InfiniteMultiComboboxField({
  config,
}: {
  config: InfiniteMultiComboboxFieldConfig;
}) {
  const { form, values } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  const [selMap, setSelMap] = useState<Map<string, string>>(new Map());
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
  const selectedValues = useStore(form.store, (s) => (s.values[config.name] as string[]) || []);
  const optionsForList = useMemo(
    () => mergeGhostOptionsForMultiValues(options, selectedValues),
    [options, selectedValues],
  );
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const selected: string[] = field.state.value || [];
        const applyExtrasFromValues = (nextValues: string[]) => {
          const selectedOptions = mergeGhostOptionsForMultiValues(
            options,
            nextValues,
          ).filter((o) => nextValues.includes(o.value));
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOptions);
          const prefix = `${config.name}__`;
          Object.keys(values).forEach((k) => {
            if (k.startsWith(prefix) && !(k in extras)) {
              form.setFieldValue(k, "");
            }
          });
          Object.entries(extras).forEach(([k, v]) => {
            form.setFieldValue(k, v);
          });
        };
        const toggle = (o: InfiniteOption) => {
          const nv = selected.includes(o.value)
            ? selected.filter((v) => v !== o.value)
            : [...selected, o.value];
          if (config.maxItems && nv.length > config.maxItems) return;
          field.handleChange(nv);
          applyExtrasFromValues(nv);
          const nm = new Map(selMap);
          if (selected.includes(o.value)) nm.delete(o.value);
          else nm.set(o.value, o.label);
          setSelMap(nm);
        };
        const remove = (v: string) => {
          const nv = selected.filter((x) => x !== v);
          field.handleChange(nv);
          applyExtrasFromValues(nv);
          const nm = new Map(selMap);
          nm.delete(v);
          setSelMap(nm);
        };
        const getLabel = (v: string) =>
          selMap.get(v) || optionsForList.find((o) => o.value === v)?.label || v;
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
                    "w-full min-h-10 h-auto justify-between",
                    !selected.length && "text-muted-foreground",
                  )}
                  disabled={config.disabled}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selected.length > 0 ? (
                      selected.map((v) => (
                        <Badge key={v} variant="secondary" className="me-1">
                          {getLabel(v)}
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
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={config.searchPlaceholder || "Search..."}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>
                      {isLoading && optionsForList.length === 0 ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        config.emptyMessage || "No option found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {optionsForList.map((o) => (
                        <CommandItem
                          key={o.value}
                          value={o.value}
                          onSelect={() => toggle(o)}
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
