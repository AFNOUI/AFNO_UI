"use client";
  
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, X, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FileFieldConfig } from "../../types/types";
import { formatFileSize, matchesAcceptedType } from "../../utils/fileFieldHelpers";

interface FileFieldProps {
  config: FileFieldConfig;
}

export function FileField({ config }: FileFieldProps) {
  const form = useFormContext();
  const [dragActive, setDragActive] = useState(false);

  const isImage = (file: File): boolean => file.type.startsWith("image/");

  const validateFile = useCallback((file: File): string | null => {
    if (config.validation?.maxSize && file.size > config.validation.maxSize) {
      return `File size must be less than ${formatFileSize(config.validation.maxSize)}`;
    }
    if (config.validation?.acceptedTypes && config.validation.acceptedTypes.length > 0) {
      const isAccepted = config.validation.acceptedTypes.some((type) =>
        matchesAcceptedType(file, type),
      );
      if (!isAccepted) {
        return `File type not accepted. Allowed: ${config.validation.acceptedTypes.join(", ")}`;
      }
    }
    return null;
  }, [config.validation]);

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const files = config.multiple
          ? (field.value as File[]) || []
          : field.value
          ? [field.value as File]
          : [];

        const handleDrag = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
          } else if (e.type === "dragleave") {
            setDragActive(false);
          }
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);

          const droppedFiles = Array.from(e.dataTransfer.files);
          handleFiles(droppedFiles);
        };

        const handleFiles = (newFiles: File[]) => {
          for (const file of newFiles) {
            const error = validateFile(file);
            if (error) {
              form.setError(config.name, { message: error });
              return;
            }
          }

          if (config.multiple) {
            const currentFiles = (field.value as File[]) || [];
            const allFiles = [...currentFiles, ...newFiles];
            if (config.validation?.maxFiles && allFiles.length > config.validation.maxFiles) {
              form.setError(config.name, {
                message: `Maximum ${config.validation.maxFiles} files allowed`,
              });
              return;
            }
            field.onChange(allFiles);
          } else {
            field.onChange(newFiles[0]);
          }
        };

        const removeFile = (index: number) => {
          if (config.multiple) {
            const currentFiles = (field.value as File[]) || [];
            field.onChange(currentFiles.filter((_, i) => i !== index));
          } else {
            field.onChange(undefined);
          }
        };

        return (
          <FormItem className={config.className}>
            {config.label && <FormLabel>{config.label}{config.required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
            <FormControl>
              <div className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    config.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!config.disabled) {
                      document.getElementById(`file-input-${config.name}`)?.click();
                    }
                  }}
                >
                  <input
                    id={`file-input-${config.name}`}
                    type="file"
                    className="hidden"
                    accept={config.accept}
                    multiple={config.multiple}
                    disabled={config.disabled}
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      handleFiles(selectedFiles);
                      e.target.value = "";
                    }}
                  />
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  {config.validation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.validation.acceptedTypes?.join(", ")}
                      {config.validation.maxSize && ` (max ${formatFileSize(config.validation.maxSize)})`}
                    </p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        {isImage(file) ? (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            {config.description && <FormDescription>{config.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
