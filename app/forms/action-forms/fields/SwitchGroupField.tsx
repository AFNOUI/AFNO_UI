import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { SwitchGroupFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function SwitchGroupField({
  config,
}: {
  config: SwitchGroupFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const vals = (values[config.name] as Record<string, boolean>) || {};
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
      <div className="space-y-3">
        {config.options.map((o) => (
          <div
            key={o.value}
            className="flex flex-row items-center justify-between rounded-lg border border-border p-3"
          >
            <div className="space-y-0.5">
              <Label className="font-normal cursor-pointer">{o.label}</Label>
              {o.description && (
                <p className="text-xs text-muted-foreground">{o.description}</p>
              )}
            </div>
            <Switch
              checked={vals[o.value] || false}
              disabled={config.disabled || o.disabled}
              onCheckedChange={(c) =>
                setValue(config.name, { ...vals, [o.value]: c })
              }
            />
          </div>
        ))}
      </div>
      <FieldError error={errors[config.name]} />
    </div>
  );
}
