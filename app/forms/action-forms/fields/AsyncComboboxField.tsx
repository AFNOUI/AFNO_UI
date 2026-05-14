import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import type {
  FieldOption,
  AsyncComboboxFieldConfig,
} from "@/forms/types/types";
import { buildAxiosConfigForAsyncApi } from "@/forms/utils/dependentApiRequest";
import { mergeGhostOptionForSingle } from "@/forms/utils/watchPopulate";
import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import { useActionFormContext } from "../ActionFormContext";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function AsyncComboboxField({
  config,
}: {
  config: AsyncComboboxFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const v = values[config.name] as string | undefined;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<FieldOption[]>(config.options || []);

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

  const allOptions = useMemo(
    () => mergeGhostOptionForSingle(options, v),
    [options, v],
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
            disabled={config.disabled || loading}
          >
            {loading ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : v ? (
              options.find((o) => o.value === v)?.label ?? v
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
                      setValue(config.name, o.value);
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
