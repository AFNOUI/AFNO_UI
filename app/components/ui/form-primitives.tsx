import * as React from "react";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

const FieldItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FieldItem.displayName = "FieldItem";

function FieldLabel({ children, required, htmlFor, className }: { children: React.ReactNode; required?: boolean; htmlFor?: string; className?: string }) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      {required && <span className="text-destructive ms-1">*</span>}
    </Label>
  );
}

function FieldDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

/**
 * Recursively extracts human-readable error strings from any error shape:
 * - string → kept as-is
 * - { message: string } → Standard Schema / Zod issue
 * - array → flatMapped recursively
 * - nested .error / .errors / .issues → unwrapped
 * Never returns "[object Object]".
 */
function normalizeFieldErrors(error?: unknown): string[] {
  if (error == null || error === "" || error === false) return [];

  if (typeof error === "string") return error ? [error] : [];
  if (typeof error === "number" || typeof error === "boolean") return [String(error)];

  if (Array.isArray(error)) {
    return error.flatMap((item) => normalizeFieldErrors(item)).filter(Boolean);
  }

  if (typeof error === "object") {
    const obj = error as Record<string, unknown>;

    // Standard Schema issue / Zod error: { message: string, path?: ... }
    if (typeof obj.message === "string" && obj.message) return [obj.message];
    if (Array.isArray(obj.message)) return normalizeFieldErrors(obj.message);

    // Nested containers
    if (obj.error) return normalizeFieldErrors(obj.error);
    if (obj.errors) return normalizeFieldErrors(obj.errors);
    if (obj.issues) return normalizeFieldErrors(obj.issues);

    // Zod flat field errors: { fieldName: ["msg1", "msg2"] }
    if (obj.fieldErrors && typeof obj.fieldErrors === "object") {
      return normalizeFieldErrors(obj.fieldErrors);
    }

    // Last resort: try to find any string values in the object
    const stringVals = Object.values(obj)
      .flatMap((v) => normalizeFieldErrors(v))
      .filter(Boolean);
    if (stringVals.length > 0) return stringVals;
  }

  // Absolute fallback — never return "[object Object]"
  const str = String(error);
  return str && str !== "[object Object]" ? [str] : [];
}

function FieldError({ error, className }: { error?: unknown; className?: string }) {
  const messages = normalizeFieldErrors(error);
  if (!messages.length) return null;

  return <p className={cn("text-sm font-medium text-destructive", className)}>{messages.join(", ")}</p>;
}

export { FieldItem, FieldLabel, FieldDescription, FieldError, normalizeFieldErrors };
