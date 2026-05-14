import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";
import type { CheckboxGroupFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function CheckboxGroupField({
  config,
}: {
  config: CheckboxGroupFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const selected: string[] = field.state.value || [];
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
                    onCheckedChange={(checked) => {
                      field.handleChange(
                        checked
                          ? [...selected, o.value]
                          : selected.filter((v: string) => v !== o.value),
                      );
                    }}
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                    {o.description && (
                      <p className="text-xs text-muted-foreground">
                        {o.description}
                      </p>
                    )}
                  </div>
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
