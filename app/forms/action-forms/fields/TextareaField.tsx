import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { TextareaFieldConfig } from "@/forms/types/types";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function TextareaField({ config }: { config: TextareaFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  return (
    <div className={cn("space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Textarea
        placeholder={config.placeholder}
        disabled={config.disabled}
        rows={config.rows || 4}
        value={String(values[config.name] ?? "")}
        onChange={(e) => setValue(config.name, e.target.value)}
      />
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
