import type { FormConfig } from "../types/types";
import type { BackendFieldError } from "../hooks/useBackendErrors";

/**
 * Apply backend field errors to TanStack Form and return
 * the section index of the first errored field.
 */
export function applyBackendErrors(
  form: unknown,
  config: FormConfig,
  backendErrors: BackendFieldError[]
): number {
  let firstErrorSectionIndex = -1;
  const formApi = form as {
    setFieldMeta?: (name: string, updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  };

  for (const err of backendErrors) {
    if (typeof formApi.setFieldMeta === "function") {
      formApi.setFieldMeta(err.field, (prev) => {
        const prevErrors = Array.isArray(prev?.errors) ? (prev.errors as string[]) : [];
        return {
          ...prev,
          errors: [...prevErrors, err.message],
          isTouched: true,
        };
      });
    }

    if (firstErrorSectionIndex === -1) {
      const sectionIdx = config.sections.findIndex((s) =>
        s.fields.some((f) => f.name === err.field)
      );
      if (sectionIdx !== -1) firstErrorSectionIndex = sectionIdx;
    }
  }

  return firstErrorSectionIndex;
}
