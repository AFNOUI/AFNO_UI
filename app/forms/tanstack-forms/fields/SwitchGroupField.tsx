import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";
import type { SwitchGroupFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function SwitchGroupField({
  config,
}: {
  config: SwitchGroupFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const values = field.state.value || {};
        return (
          <div className={cn("space-y-3", config.className)}>
            {config.label && (
              <Label>
                {config.label}
                {config.required && (
                  <span className="text-destructive ms-1">*</span>
                )}
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
                    <Label className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                    {o.description && (
                      <p className="text-xs text-muted-foreground">
                        {o.description}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={values[o.value] || false}
                    disabled={config.disabled || o.disabled}
                    onCheckedChange={(checked) =>
                      field.handleChange({ ...values, [o.value]: checked })
                    }
                  />
                </div>
              ))}
            </div>
            <FieldError error={field.state.meta.errors} />
          </div>
        );
      }}
    </form.Field>
  );
}
