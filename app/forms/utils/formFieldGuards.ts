import type {
  DependentApiFieldConfig,
  FormFieldConfig,
  OptionFieldConfig,
} from "../types/types";

/** Type guard: field config carries a static `options` array. */
export function hasOptions(config: FormFieldConfig): config is OptionFieldConfig {
  return "options" in config;
}

/**
 * Type guard: field type is one of the dependent-API families
 * (`async*` and `infinite*`). Used by every form-field router to decide
 * whether the field needs to participate in dependent-API watching/refetching.
 */
export function hasDependentApiConfig(
  config: FormFieldConfig,
): config is DependentApiFieldConfig {
  return config.type.startsWith("async") || config.type.startsWith("infinite");
}

/**
 * Truthy-watch detector — a watched-source value is considered "meaningful"
 * (i.e. should trigger downstream refetch / population) only when it is
 * neither `undefined`/`null` nor the empty string.
 */
export function hasWatchValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value) !== "";
}
