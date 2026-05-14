import type { AnyFieldApi } from "@tanstack/react-form";
import type {
  TextFieldConfig,
  NumberFieldConfig,
} from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

type Config = TextFieldConfig | NumberFieldConfig;

export function TextField({ config }: { config: Config }) {
  const { form } = useTanstackFormContext();
  const isNumber = config.type === "number";
  const min = isNumber ? (config as NumberFieldConfig).min : undefined;
  const max = isNumber ? (config as NumberFieldConfig).max : undefined;
  const step = isNumber ? (config as NumberFieldConfig).step : undefined;

  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => (
        <div className={cn("space-y-2", config.className)}>
          {config.label && (
            <Label>
              {config.label}
              {config.required && (
                <span className="text-destructive ms-1">*</span>
              )}
            </Label>
          )}
          <Input
            type={config.type}
            placeholder={config.placeholder}
            disabled={config.disabled}
            min={min}
            max={max}
            step={step}
            value={field.state.value ?? ""}
            onChange={(e) => {
              if (isNumber) {
                const raw = e.target.value;
                if (raw === "") {
                  field.handleChange("");
                  return;
                }
                let num = parseFloat(raw);
                if (min !== undefined && !isNaN(num) && num < min) num = min;
                if (max !== undefined && !isNaN(num) && num > max) num = max;
                field.handleChange(isNaN(num) ? raw : String(num));
              } else {
                field.handleChange(e.target.value);
              }
            }}
            onBlur={field.handleBlur}
          />
          {config.description && (
            <FieldDescription>{config.description}</FieldDescription>
          )}
          <FieldError error={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}
