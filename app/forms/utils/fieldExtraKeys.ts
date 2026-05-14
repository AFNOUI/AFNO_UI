/**
 * Utility for handling extra keys from async/infinite field selections.
 * 
 * When an async/infinite field fetches data like { id, city_code, name }
 * and maps label=name, value=id, extra keys like city_code are stored
 * as "{fieldName}__{keyName}" in form state so other fields can watch them.
 */

import type { FieldOption } from "../types/types";

type FieldOptionWithRaw = FieldOption & {
  _raw?: Record<string, unknown>;
};

/**
 * Given a selected option with _raw metadata, returns a map of
 * extra key form values to set: { "fieldName__city_code": "KTM", ... }
 */
export function getExtraKeyValues(
  fieldName: string,
  option: FieldOption | undefined
): Record<string, unknown> {
  if (!option) return {};

  const extendedOption = option as FieldOptionWithRaw;
  const raw = extendedOption._raw;

  if (!raw || typeof raw !== "object") return {};

  const result: Record<string, unknown> = {};
  
  for (const [key, val] of Object.entries(raw)) {
    result[`${fieldName}__${key}`] = val;
  }

  return result;
}

/**
 * For multi-select fields, aggregate extra keys from all selected options.
 * Values are flattened into comma-separated strings to stay compatible with text watchers.
 */
export function getExtraKeyValuesFromOptions(
  fieldName: string,
  options: FieldOption[]
): Record<string, unknown> {
  const grouped = new Map<string, string[]>();

  for (const option of options) {
    const raw = (option as FieldOptionWithRaw)._raw;
    if (!raw || typeof raw !== "object") continue;
    for (const [key, val] of Object.entries(raw)) {
      const text = val == null ? "" : String(val);
      if (!grouped.has(key)) grouped.set(key, []);
      if (text) grouped.get(key)!.push(text);
    }
  }

  const result: Record<string, unknown> = {};
  for (const [key, values] of grouped.entries()) {
    result[`${fieldName}__${key}`] = values.join(", ");
  }
  return result;
}
