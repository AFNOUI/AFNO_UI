import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import type { SelectFieldConfig } from "@/forms/types/types";
import { useTanstackFormContext } from "../TanstackFormContext";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function SelectField({ config }: { config: SelectFieldConfig }) {
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
          <Select
            onValueChange={(v) => field.handleChange(v)}
            value={field.state.value}
            disabled={config.disabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={config.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {config.options.map((o) => (
                <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {config.description && (
            <FieldDescription>{config.description}</FieldDescription>
          )}
          <FieldError error={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}
