import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import type { TextareaFieldConfig } from "@/forms/types/types";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function TextareaField({ config }: { config: TextareaFieldConfig }) {
  const { form } = useTanstackFormContext();
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
          <Textarea
            placeholder={config.placeholder}
            disabled={config.disabled}
            rows={config.rows || 4}
            value={field.state.value ?? ""}
            onChange={(e) => field.handleChange(e.target.value)}
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
