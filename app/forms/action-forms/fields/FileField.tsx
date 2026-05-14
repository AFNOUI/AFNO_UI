import { useCallback, useState } from "react";
import { Upload, X, File as FileIcon, Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FileFieldConfig } from "@/forms/types/types";
import { useActionFormContext } from "../ActionFormContext";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";
import { formatFileSize } from "@/forms/utils/fileFieldHelpers";

export function FileField({ config }: { config: FileFieldConfig }) {
  const { values, errors, setValue } = useActionFormContext();
  const [dragActive, setDragActive] = useState(false);
  const validate = useCallback(
    (f: File): string | null => {
      if (config.validation?.maxSize && f.size > config.validation.maxSize)
        return `Max ${formatFileSize(config.validation.maxSize)}`;
      return null;
    },
    [config.validation],
  );
  const files: File[] = config.multiple
    ? (values[config.name] as File[]) || []
    : values[config.name]
      ? [values[config.name] as File]
      : [];
  const handleFiles = (nf: File[]) => {
    for (const f of nf) if (validate(f)) return;
    if (config.multiple) {
      const all = [...((values[config.name] as File[]) || []), ...nf];
      if (
        config.validation?.maxFiles &&
        all.length > config.validation.maxFiles
      )
        return;
      setValue(config.name, all);
    } else setValue(config.name, nf[0]);
  };
  const removeFile = (i: number) => {
    if (config.multiple)
      setValue(
        config.name,
        ((values[config.name] as File[]) || []).filter((_, idx) => idx !== i),
      );
    else setValue(config.name, undefined);
  };

  return (
    <div className={cn("space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          config.disabled && "opacity-50",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() =>
          !config.disabled &&
          document.getElementById(`af-${config.name}`)?.click()
        }
      >
        <input
          id={`af-${config.name}`}
          type="file"
          className="hidden"
          accept={config.accept}
          multiple={config.multiple}
          disabled={config.disabled}
          onChange={(e) => {
            handleFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Click to upload</span> or
          drag and drop
        </p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              {f.type.startsWith("image/") ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <FileIcon className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(f.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
