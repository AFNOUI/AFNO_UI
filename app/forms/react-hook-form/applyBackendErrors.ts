import type { UseFormReturn } from "react-hook-form";

import type { FormConfig } from "../types/types";
import type { BackendFieldError } from "../hooks/useBackendErrors";

/**
 * Apply backend errors to react-hook-form fields and return the section index of the first error.
 * Returns -1 if no field-level errors found.
 */
export function applyBackendErrors(
  form: UseFormReturn<Record<string, unknown>>,
  config: FormConfig,
  backendErrors: BackendFieldError[]
): number {
  let firstErrorSectionIndex = -1;

  for (const err of backendErrors) {
    form.setError(err.field, { type: "server", message: err.message });

    if (firstErrorSectionIndex === -1) {
      const sectionIdx = config.sections.findIndex((s) =>
        s.fields.some((f) => f.name === err.field)
      );
      if (sectionIdx !== -1) firstErrorSectionIndex = sectionIdx;
    }
  }

  return firstErrorSectionIndex;
}
