import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { CheckboxFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function CheckboxField({ config }: { config: CheckboxFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  return (
    <div
      className={cn(
        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
        config.className,
      )}
    >
      <Checkbox
        checked={values[config.name] as boolean}
        onCheckedChange={(v) => setValue(config.name, v)}
        disabled={config.disabled}
      />
      <div className="space-y-1 leading-none">
        {(config.checkboxLabel || config.label) && (
          <Label className="cursor-pointer">
            {config.checkboxLabel || config.label}
            {config.required && (
              <span className="text-destructive ms-1">*</span>
            )}
          </Label>
        )}
        {config.description && (
          <FieldDescription>{config.description}</FieldDescription>
        )}
      </div>
      <FieldError error={errors[config.name]} />
    </div>
  );
}
