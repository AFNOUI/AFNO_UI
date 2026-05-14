/**
 * Hydration utilities for ReactHookForm — OPTIONAL.
 * Only import if fields need to be hydrated from a backend API at runtime.
 * For static forms, you don't need this file at all.
 */

import type { FieldOption, FormConfig, FormFieldConfig } from "./types";

/**
 * Hydration data for any field. Keys are field names.
 * - For option-based fields: provide FieldOption[]
 * - For any field: provide { options?, defaultValue?, placeholder?, label?, description?, disabled? }
 */
export type FormHydrationValue =
  | FieldOption[]
  | {
      options?: FieldOption[];
      defaultValue?: unknown;
      placeholder?: string;
      label?: string;
      description?: string;
      disabled?: boolean;
    };

export interface FormHydration {
  [fieldName: string]: FormHydrationValue;
}

/**
 * Apply hydration data to a FormConfig.
 * Call in your page component before passing config to ReactHookForm.
 */
export function applyHydration(config: FormConfig, hydration: FormHydration): FormConfig {
  return {
    ...config,
    sections: config.sections.map(s => ({
      ...s,
      fields: s.fields.map(f => {
        const data = hydration[f.name];
        if (!data) return f;

        if (Array.isArray(data)) {
          if ('options' in f) return { ...f, options: data } as FormFieldConfig;
          return f;
        }

        const merged = { ...f } as FormFieldConfig & Record<string, unknown>;
        if (data.options && 'options' in f) merged.options = data.options;
        if (data.defaultValue !== undefined) merged.defaultValue = data.defaultValue;
        if (data.placeholder !== undefined) merged.placeholder = data.placeholder;
        if (data.label !== undefined) merged.label = data.label;
        if (data.description !== undefined) merged.description = data.description;
        if (data.disabled !== undefined) merged.disabled = data.disabled;
        return merged as FormFieldConfig;
      })
    }))
  };
}
