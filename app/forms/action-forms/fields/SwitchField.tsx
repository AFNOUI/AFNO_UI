import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { SwitchFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function SwitchField({ config }: { config: SwitchFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between rounded-lg border p-4",
        config.className,
      )}
    >
      <div className="space-y-0.5">
        {(config.switchLabel || config.label) && (
          <Label className="text-base">
            {config.switchLabel || config.label}
          </Label>
        )}
        {config.description && (
          <FieldDescription>{config.description}</FieldDescription>
        )}
      </div>
      <Switch
        checked={values[config.name] as boolean}
        onCheckedChange={(v) => setValue(config.name, v)}
        disabled={config.disabled}
      />
      <FieldError error={errors[config.name]} />
    </div>
  );
}
