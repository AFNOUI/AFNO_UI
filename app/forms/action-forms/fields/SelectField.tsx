import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { SelectFieldConfig } from "@/forms/types/types";

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
  const { values, errors, setValue } = useActionFormContext();
  return (
    <div className={cn("space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Select
        onValueChange={(v) => setValue(config.name, v)}
        value={values[config.name] as string}
        disabled={config.disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={config.placeholder || "Select an option"} />
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
      <FieldError error={errors[config.name]} />
    </div>
  );
}
