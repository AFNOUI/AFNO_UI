import { X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";
import type { MultiselectFieldConfig } from "@/forms/types/types";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";
export function MultiselectField({
  config,
}: {
  config: MultiselectFieldConfig;
}) {
  const { values, errors, setValue } = useActionFormContext();
  const [open, setOpen] = useState(false);
  const selected: string[] = (values[config.name] as string[]) || [];
  const toggle = (v: string) => {
    const nv = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    if (config.maxItems && nv.length > config.maxItems) return;
    setValue(config.name, nv);
  };
  const remove = (v: string) =>
    setValue(
      config.name,
      selected.filter((x) => x !== v),
    );
  return (
    <div className={cn("flex flex-col space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-h-10 h-auto justify-start",
              !selected.length && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selected.map((v) => (
                  <Badge key={v} variant="secondary" className="me-1">
                    {config.options.find((o) => o.value === v)?.label || v}
                    <button
                      className="ms-1 rounded-full"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              config.placeholder || "Select options"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="space-y-2">
            {config.options.map((o) => (
              <div
                key={o.value}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer",
                  o.disabled && "opacity-50",
                )}
                onClick={() => !o.disabled && toggle(o.value)}
              >
                <Checkbox
                  checked={selected.includes(o.value)}
                  disabled={o.disabled}
                  onCheckedChange={() => toggle(o.value)}
                />
                <span className="text-sm">{o.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
