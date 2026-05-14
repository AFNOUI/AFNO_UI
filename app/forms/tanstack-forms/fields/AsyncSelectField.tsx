import { Loader2 } from "lucide-react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "../../utils/watchPopulate";
import type { AsyncSelectFieldConfig } from "../../types/types";
import { useTanstackFormContext } from "../TanstackFormContext";
import { useAsyncOptions } from "../../hooks/useInfiniteOptions";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function AsyncSelectField({
  config,
}: {
  config: AsyncSelectFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
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
            <div className="relative">
              <Select
                key={`async-select-${config.name}-${value}`}
                value={value}
                disabled={config.disabled || isLoading}
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
              >
                <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
                  <SelectValue placeholder={config.placeholder || "Select an option"}>
                    {value ? displayLabel : (config.placeholder || "Select an option")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {optionsForSelect.map((o) => (
                    <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoading && (
                <Loader2 className="pointer-events-none absolute end-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
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
