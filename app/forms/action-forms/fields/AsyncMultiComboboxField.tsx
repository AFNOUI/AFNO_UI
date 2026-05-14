import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";

import type {
  FieldOption,
  AsyncMultiComboboxFieldConfig,
} from "@/forms/types/types";
import { buildAxiosConfigForAsyncApi } from "@/forms/utils/dependentApiRequest";
import { mergeGhostOptionsForMultiValues } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function AsyncMultiComboboxField({
  config,
}: {
  config: AsyncMultiComboboxFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<FieldOption[]>(config.options || []);
  const [loading, setLoading] = useState(false);
  const selected: string[] = (values[config.name] as string[]) || [];
  const optionsWithGhosts = useMemo(
    () => mergeGhostOptionsForMultiValues(options, selected),
    [options, selected],
  );
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return optionsWithGhosts;
    return optionsWithGhosts.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        o.value.toLowerCase().includes(term),
    );
  }, [optionsWithGhosts, searchTerm]);
  const applyExtrasFromValues = (nextValues: string[]) => {
    const selectedOptions = mergeGhostOptionsForMultiValues(options, nextValues).filter(
      (o) => nextValues.includes(o.value),
    );
    const extras = getExtraKeyValuesFromOptions(config.name, selectedOptions);
    const prefix = `${config.name}__`;
    Object.keys(values).forEach((k) => {
      if (k.startsWith(prefix) && !(k in extras)) setValue(k, "");
    });
    Object.entries(extras).forEach(([k, val]) => setValue(k, val));
  };

  const fetchOptions = useCallback(async () => {
    if (!config.apiConfig?.url) {
      setOptions(config.options || []);
      return;
    }
    setLoading(true);
    try {
      const { responseMapping } = config.apiConfig;
      const res = await axios(buildAxiosConfigForAsyncApi(config.apiConfig));
      const raw = responseMapping.dataPath
        .split(".")
        .reduce((o, k: string) => o?.[k], res.data);
      const items = Array.isArray(raw) ? raw : [];
      setOptions(
        items.map((item) => ({
          label: String(item[responseMapping.labelKey] || ""),
          value: String(item[responseMapping.valueKey] || ""),
        })),
      );
    } catch {
      /* keep existing */
    }
    setLoading(false);
  }, [config.apiConfig, config.options]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const toggle = (v: string) => {
    const nv = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    if (config.maxItems && nv.length > config.maxItems) return;
    setValue(config.name, nv);
    applyExtrasFromValues(nv);
  };
  const remove = (v: string) => {
    const nv = selected.filter((x) => x !== v);
    setValue(config.name, nv);
    applyExtrasFromValues(nv);
  };

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
            disabled={config.disabled || loading}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : selected.length > 0 ? (
                selected.map((v) => (
                  <Badge key={v} variant="secondary" className="me-1">
                    {optionsWithGhosts.find((o) => o.value === v)?.label || v}
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
                {filteredOptions.map((o) => (
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
