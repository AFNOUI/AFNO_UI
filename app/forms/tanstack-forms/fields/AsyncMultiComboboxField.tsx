import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import {
  useAsyncOptions,
  type InfiniteOption,
} from "../../hooks/useInfiniteOptions";
import { useTanstackFormContext } from "../TanstackFormContext";
import type { AsyncMultiComboboxFieldConfig } from "@/forms/types/types";
import { mergeGhostOptionsForMultiValues } from "../../utils/watchPopulate";

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


export function AsyncMultiComboboxField({
  config,
}: {
  config: AsyncMultiComboboxFieldConfig;
}) {
  const { form, values } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedValues = useStore(form.store, (s) => (s.values[config.name] as string[]) || []);
  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
  });
  const optionsWithGhosts = useMemo(
    () => mergeGhostOptionsForMultiValues(options, selectedValues),
    [options, selectedValues],
  );
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return optionsWithGhosts;
    return optionsWithGhosts.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        o.value.toLowerCase().includes(term),
    );
  }, [optionsWithGhosts, searchTerm]);

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
        };
        const remove = (v: string) => {
          const nv = selected.filter((x) => x !== v);
          field.handleChange(nv);
          applyExtrasFromValues(nv);
        };
        const getLabel = (v: string) =>
          optionsWithGhosts.find((o) => o.value === v)?.label || v;
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
                  disabled={config.disabled || isLoading}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                        Loading...
                      </>
                    ) : selected.length > 0 ? (
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
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {config.emptyMessage || "No option found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {filtered.map((o) => (
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
