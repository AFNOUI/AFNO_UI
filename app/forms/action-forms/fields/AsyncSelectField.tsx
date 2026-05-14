import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { getExtraKeyValues } from "../../utils/fieldExtraKeys";
import {
  mergeGhostOptionForSingle,
  optionValueKey,
  optionValuesEqual,
} from "@/forms/utils/watchPopulate";
import { useActionFormContext } from "../ActionFormContext";
import type { AsyncSelectFieldConfig } from "@/forms/types/types";
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
  const { values, errors, setValue } = useActionFormContext();
  const { options, isLoading } = useAsyncOptions({
    apiConfig: config.apiConfig,
    initialOptions: config.options,
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
      <div className="relative">
        <Select
          key={`async-select-${config.name}-${value}`}
          value={value}
          disabled={config.disabled || isLoading}
          onValueChange={(v) => {
            setValue(config.name, v);
            const opt = options.find((o) => optionValuesEqual(o.value, v));
            if (opt) {
              const extras = getExtraKeyValues(config.name, opt);
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
            {optionsForSelect.map((o) => (
              <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <Loader2 className="absolute end-10 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
