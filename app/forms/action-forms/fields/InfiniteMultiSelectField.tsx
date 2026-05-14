import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import type { InfiniteMultiselectFieldConfig } from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import { useInfiniteOptions, type InfiniteOption } from "../../hooks/useInfiniteOptions";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function InfiniteMultiSelectField({
  config,
}: {
  config: InfiniteMultiselectFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(new Map());
  const selected: string[] = (values[config.name] as string[]) || [];
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
    const newSelected = new Map(selectedOptions);
    if (selected.includes(option.value)) newSelected.delete(option.value);
    else newSelected.set(option.value, option.label);
    setSelectedOptions(newSelected);
  };
  const removeValue = (value: string) => {
    const nv = selected.filter((x) => x !== value);
    setValue(config.name, nv);
    syncExtras(nv);
    const newSelected = new Map(selectedOptions);
    newSelected.delete(value);
    setSelectedOptions(newSelected);
  };
  const getLabel = (value: string) =>
    selectedOptions.get(value) || options.find((o) => o.value === value)?.label || value;

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
                <span>{config.placeholder || "Select options"}</span>
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
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {options.length === 0 && isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
            ) : (
              <div className="p-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option)}
                    disabled={option.disabled}
                    className={cn("w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground", option.disabled && "opacity-50 cursor-not-allowed")}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </button>
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
              </div>
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
