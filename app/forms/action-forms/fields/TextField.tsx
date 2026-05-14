import type {
  TextFieldConfig,
  NumberFieldConfig,
} from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/form-primitives";

type Config = TextFieldConfig | NumberFieldConfig;

export function TextField({ config }: { config: Config }) {
  const { values, errors, setValue } = useActionFormContext();
  const v = values[config.name];
  const e = errors[config.name];
  const isNum = config.type === "number";
  const min = isNum ? (config as NumberFieldConfig).min : undefined;
  const max = isNum ? (config as NumberFieldConfig).max : undefined;
  return (
    <div className={cn("space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Input
        type={config.type}
        placeholder={config.placeholder}
        disabled={config.disabled}
        min={min}
        max={max}
        step={isNum ? (config as NumberFieldConfig).step : undefined}
        value={String(v ?? "")}
        onChange={(ev) => {
          if (isNum) {
            const raw = ev.target.value;
            if (raw === "") {
              setValue(config.name, "");
              return;
            }
            let n = parseFloat(raw);
            if (min !== undefined && !isNaN(n) && n < min) n = min;
            if (max !== undefined && !isNaN(n) && n > max) n = max;
            setValue(config.name, isNaN(n) ? raw : String(n));
          } else setValue(config.name, ev.target.value);
        }}
      />
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      {e?.[0] && <p className="text-sm font-medium text-destructive">{e[0]}</p>}
    </div>
  );
}
