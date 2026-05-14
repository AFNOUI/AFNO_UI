import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { RadioFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function RadioField({ config }: { config: RadioFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  const isH = config.orientation === "horizontal";
  return (
    <div className={cn("space-y-3", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <RadioGroup
        onValueChange={(v) => setValue(config.name, v)}
        value={values[config.name] as string}
        className={cn(isH ? "flex flex-wrap gap-4" : "flex flex-col space-y-2")}
        disabled={config.disabled}
      >
        {config.options.map((o) => (
          <div key={o.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={o.value}
              id={`a-${config.name}-${o.value}`}
              disabled={o.disabled}
            />
            <Label
              htmlFor={`a-${config.name}-${o.value}`}
              className={cn(
                "font-normal cursor-pointer",
                o.disabled && "opacity-50",
              )}
            >
              {o.label}
              {o.description && (
                <span className="block text-xs text-muted-foreground">
                  {o.description}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
