import type { Dispatch, SetStateAction } from "react";

import type { FormConfig } from "../types/types";
import type { BackendFieldError } from "../hooks/useBackendErrors";

/**
 * Apply backend field errors to ActionForm local error state and return
 * the section index of the first errored field.
 */
export function applyBackendErrors(
  setErrors: Dispatch<SetStateAction<Record<string, string[]>>>,
  config: FormConfig,
  backendErrors: BackendFieldError[]
): number {
  let firstErrorSectionIndex = -1;
  const nextErrors: Record<string, string[]> = {};

  for (const err of backendErrors) {
    nextErrors[err.field] = [...(nextErrors[err.field] || []), err.message];

    if (firstErrorSectionIndex === -1) {
      const sectionIdx = config.sections.findIndex((s) =>
        s.fields.some((f) => f.name === err.field)
      );
      if (sectionIdx !== -1) firstErrorSectionIndex = sectionIdx;
    }
  }

  setErrors((prev) => ({ ...prev, ...nextErrors }));
  return firstErrorSectionIndex;
}
