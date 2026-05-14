import { Loader2 } from "lucide-react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "../../utils/watchPopulate";
import { useTanstackFormContext } from "../TanstackFormContext";
import type { InfiniteSelectFieldConfig } from "../../types/types";
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
  const { form } = useTanstackFormContext();

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

  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const value = optionValueKey(field.state.value);
        const matchedOption = value
          ? options.find((o) => optionValuesEqual(o.value, value))
          : undefined;
        const displayLabel = matchedOption?.label ?? value;
        const optionsForSelect = mergeGhostOptionForSingle(options, value);

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
            <Select
              onValueChange={(v) => {
                field.handleChange(v);
                const o = options.find((x) => optionValuesEqual(x.value, v));
                if (o) {
                  const extras = getExtraKeyValues(config.name, o);
                  Object.entries(extras).forEach(([k, val]) =>
                    form.setFieldValue(k, val),
                  );
                }
              }}
              value={value}
              disabled={config.disabled}
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
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No options found
                    </div>
                  ) : (
                    <>
                      {optionsForSelect.map((o) => (
                        <SelectItem
                          key={o.value}
                          value={o.value}
                          disabled={o.disabled}
                        >
                          {o.label}
                        </SelectItem>
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
                    </>
                  )}
                </div>
              </SelectContent>
            </Select>
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
