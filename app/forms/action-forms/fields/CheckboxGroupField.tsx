import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { CheckboxGroupFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function CheckboxGroupField({
  config,
}: {
  config: CheckboxGroupFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const selected: string[] = (values[config.name] as string[]) || [];
  return (
    <div className={cn("space-y-3", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <div
        className={cn(
          "space-y-2",
          config.orientation === "horizontal" &&
            "flex flex-wrap gap-4 space-y-0",
        )}
      >
        {config.options.map((o) => (
          <div
            key={o.value}
            className="flex flex-row items-start space-x-3 space-y-0"
          >
            <Checkbox
              checked={selected.includes(o.value)}
              disabled={config.disabled || o.disabled}
              onCheckedChange={(c) =>
                setValue(
                  config.name,
                  c
                    ? [...selected, o.value]
                    : selected.filter((v) => v !== o.value),
                )
              }
            />
            <div className="space-y-0.5 leading-none">
              <Label className="font-normal cursor-pointer">{o.label}</Label>
              {o.description && (
                <p className="text-xs text-muted-foreground">{o.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <FieldError error={errors[config.name]} />
    </div>
  );
}
