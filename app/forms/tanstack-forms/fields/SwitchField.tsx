import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import type { SwitchFieldConfig } from "@/forms/types/types";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function SwitchField({ config }: { config: SwitchFieldConfig }) {
  const { form } = useTanstackFormContext();
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => (
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
            checked={field.state.value}
            onCheckedChange={(v) => field.handleChange(v)}
            disabled={config.disabled}
          />
          <FieldError error={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}
