import type { AnyFieldApi } from "@tanstack/react-form";
import { useCallback, useState } from "react";
import { Upload, X, File as FileIcon, Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FileFieldConfig } from "@/forms/types/types";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";
import { formatFileSize, matchesAcceptedType } from "@/forms/utils/fileFieldHelpers";

export function FileField({ config }: { config: FileFieldConfig }) {
  const { form } = useTanstackFormContext();
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (config.validation?.maxSize && file.size > config.validation.maxSize)
        return `File size must be less than ${formatFileSize(config.validation.maxSize)}`;
      if (config.validation?.acceptedTypes?.length) {
        const ok = config.validation.acceptedTypes.some((t) => matchesAcceptedType(file, t));
        if (!ok)
          return `File type not accepted. Allowed: ${config.validation.acceptedTypes.join(", ")}`;
      }
      return null;
    },
    [config.validation],
  );

  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const files: File[] = config.multiple
          ? (field.state.value as File[]) || []
          : field.state.value
            ? [field.state.value as File]
            : [];
        const handleFiles = (newFiles: File[]) => {
          for (const f of newFiles) {
            const err = validateFile(f);
            if (err) return;
          }
          if (config.multiple) {
            const all = [...((field.state.value as File[]) || []), ...newFiles];
            if (
              config.validation?.maxFiles &&
              all.length > config.validation.maxFiles
            )
              return;
            field.handleChange(all);
          } else {
            field.handleChange(newFiles[0]);
          }
        };
        const removeFile = (i: number) => {
          if (config.multiple)
            field.handleChange(
              ((field.state.value as File[]) || []).filter(
                (_: File, idx: number) => idx !== i,
              ),
            );
          else field.handleChange(undefined);
        };
        return (
          <div className={cn("space-y-2", config.className)}>
            {config.label && (
              <Label>
                {config.label}
                {config.required && (
                  <span className="text-destructive ms-1">*</span>
                )}
              </Label>
            )}
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  config.disabled && "opacity-50 cursor-not-allowed",
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
                  document.getElementById(`ts-file-${config.name}`)?.click()
                }
              >
                <input
                  id={`ts-file-${config.name}`}
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
                  <span className="font-medium text-primary">
                    Click to upload
                  </span>{" "}
                  or drag and drop
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
            </div>
            {config.description && (
              <FieldDescription>{config.description}</FieldDescription>
            )}
            <FieldError error={field.state.meta.errors} />
          </div>
        );
      }}
    </form.Field>
  );
}
