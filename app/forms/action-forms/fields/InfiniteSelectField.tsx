import { Loader2 } from "lucide-react";

import type {
  InfiniteSelectFieldConfig,
} from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "@/forms/utils/watchPopulate";
import { useInfiniteOptions } from "../../hooks/useInfiniteOptions";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function InfiniteSelectField({
  config,
}: {
  config: InfiniteSelectFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
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

  const value = optionValueKey(values[config.name]);
  const matchedOption = value
    ? options.find((o) => optionValuesEqual(o.value, value))
    : undefined;
  const displayLabel = matchedOption?.label ?? value;
  const optionsForSelect = mergeGhostOptionForSingle(options, value);

  return (
    <div className={cn("space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        disabled={config.disabled}
        onValueChange={(v) => {
          setValue(config.name, v);
          const option = options.find((o) => optionValuesEqual(o.value, v));
          if (option) {
            const extras = getExtraKeyValues(config.name, option);
            Object.entries(extras).forEach(([k, val]) => setValue(k, val));
          }
        }}
      >
        <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
          <SelectValue placeholder={config.placeholder || "Select an option"}>
            {value ? displayLabel : (config.placeholder || "Select an option")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2" onPointerDown={(e) => e.stopPropagation()}>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {optionsForSelect.length === 0 && isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : optionsForSelect.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
            ) : (
              <>
                {optionsForSelect.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
                {hasMore && (
                  <div ref={sentinelRef} className="flex items-center justify-center py-2">
                    {isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-center text-xs text-muted-foreground">Scroll for more</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </SelectContent>
      </Select>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
