import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AsyncMultiselectFieldConfig } from "@/forms/types/types";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import { useActionFormContext } from "../ActionFormContext";
import { useAsyncOptions, type InfiniteOption } from "../../hooks/useInfiniteOptions";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export function AsyncMultiSelectField({
  config,
}: {
  config: AsyncMultiselectFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selected: string[] = (values[config.name] as string[]) || [];
  const { options, isLoading, filterOptions } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
  });
  const filtered = useMemo(() => filterOptions(searchTerm), [filterOptions, searchTerm]);

  const syncExtras = (newValues: string[]) => {
    const selectedOpts = options.filter((o) => newValues.includes(o.value));
    const extras = getExtraKeyValuesFromOptions(config.name, selectedOpts);
    Object.entries(extras).forEach(([k, val]) => setValue(k, val));
    for (const key of config.apiConfig?.responseMapping?.extraKeys || []) {
      const synthetic = `${config.name}__${key}`;
      if (!(synthetic in extras)) setValue(synthetic, "");
    }
  };

  const toggleOption = (option: InfiniteOption) => {
    const nv = selected.includes(option.value)
      ? selected.filter((x) => x !== option.value)
      : [...selected, option.value];
    if (config.maxItems && nv.length > config.maxItems) return;
    setValue(config.name, nv);
    syncExtras(nv);
  };
  const removeValue = (v: string) => {
    const nv = selected.filter((x) => x !== v);
    setValue(config.name, nv);
    syncExtras(nv);
  };

  const getLabel = (v: string) => options.find((o) => o.value === v)?.label || v;

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
            disabled={config.disabled || isLoading}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : selected.length > 0 ? (
                selected.map((v) => (
                  <Badge key={v} variant="secondary" className="me-1">
                    {getLabel(v)}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ms-1 rounded-full"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeValue(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          removeValue(v);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              ) : (
                config.placeholder || "Select options"
              )}
            </div>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 border-b border-border">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filtered.map((o) => (
                <button
                key={o.value}
                  type="button"
                className={cn(
                    "w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent",
                    o.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => toggleOption(o)}
                  disabled={o.disabled}
                >
                  <Check
                    className={cn(
                      "me-2 h-4 w-4",
                      selected.includes(o.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o.label}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
