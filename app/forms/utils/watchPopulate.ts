import type { FieldOption, FormFieldConfig, WatchTransform } from "../types/types";

/** Field types that store string[] in form state. */
const MULTI_STRING_VALUE_TYPES = new Set<FormFieldConfig["type"]>([
  "multiselect",
  "multicombobox",
  "asyncmultiselect",
  "asyncmulticombobox",
  "infinitemultiselect",
  "infinitemulticombobox",
  "checkboxgroup",
]);

export function isMultiStringFieldType(type: FormFieldConfig["type"]): boolean {
  return MULTI_STRING_VALUE_TYPES.has(type);
}

/** Keys to try against watchConfig.valueMap (arrays also try JSON.stringify). */
export function valueMapLookupKeys(watched: unknown): string[] {
  if (watched === undefined || watched === null) return [""];
  const keys: string[] = [String(watched)];
  if (Array.isArray(watched)) {
    try {
      keys.push(JSON.stringify(watched));
    } catch {
      /* ignore */
    }
  }
  return keys;
}

/**
 * Base string from the watched raw value before transforms:
 * uses valueMap when present, otherwise sensible string coercion.
 */
export function pickWatchBaseString(
  watched: unknown,
  valueMap?: Record<string, string>,
): string {
  if (valueMap) {
    for (const k of valueMapLookupKeys(watched)) {
      if (Object.prototype.hasOwnProperty.call(valueMap, k)) {
        return valueMap[k]!;
      }
    }
  }
  if (watched === undefined || watched === null) return "";
  if (typeof watched === "string") return watched;
  if (typeof watched === "number" || typeof watched === "boolean") return String(watched);
  if (Array.isArray(watched)) return watched.map(String).join(",");
  try {
    return JSON.stringify(watched);
  } catch {
    return "";
  }
}

export function applyWatchTransform(value: string, transform: WatchTransform): string {
  let result = value || "";

  if (transform.filter === "numbers") result = result.replace(/[^0-9]/g, "");
  else if (transform.filter === "letters") result = result.replace(/[^a-zA-Z\s]/g, "");
  else if (transform.filter === "alphanumeric") result = result.replace(/[^a-zA-Z0-9]/g, "");

  if (transform.slice) {
    result = result.slice(transform.slice.start, transform.slice.end);
  }

  if (transform.case === "upper") result = result.toUpperCase();
  else if (transform.case === "lower") result = result.toLowerCase();
  else if (transform.case === "capitalize")
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  else if (transform.case === "title")
    result = result.replace(
      /\w\S*/g,
      (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    );

  if (transform.template) {
    result = transform.template.replace("{value}", result);
  }

  return result;
}

/**
 * Maps watched form state + watchConfig into the value to write into the target field
 * (correct primitive / string[] shape for multi-select targets).
 */
export function resolveWatchPopulateValue(
  fieldConfig: Pick<FormFieldConfig, "type" | "name">,
  watchedRaw: unknown,
  wc: NonNullable<FormFieldConfig["watchConfig"]>,
): unknown {
  let mapped = pickWatchBaseString(watchedRaw, wc.valueMap);
  if (wc.transform) {
    mapped = applyWatchTransform(mapped, wc.transform);
  }

  if (isMultiStringFieldType(fieldConfig.type)) {
    if (Array.isArray(watchedRaw)) {
      return watchedRaw.map((x) => String(x)).filter((s) => s !== "");
    }
    if (mapped === "") return [];
    return mapped
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (fieldConfig.type === "number") {
    const n = Number(mapped);
    return Number.isFinite(n) ? n : "";
  }

  return mapped;
}

/** Empty / reset value when clearing dependent fields or hiding conditional fields. */
export function emptyValueForFieldType(type: FormFieldConfig["type"]): unknown {
  if (isMultiStringFieldType(type)) return [];
  if (type === "number") return "";
  if (type === "checkbox") return false;
  if (type === "switch") return false;
  return "";
}

export function resetFieldValueForConfig(config: Pick<FormFieldConfig, "type" | "defaultValue">): unknown {
  if (config.defaultValue !== undefined && config.defaultValue !== null) {
    return config.defaultValue;
  }
  return emptyValueForFieldType(config.type);
}

/** Radix Select / Command: ensure externally set value (e.g. watch) still has a matching option row. */
/** Coerce stored form values and API option values to the same string shape for Radix Select / Command. */
export function optionValueKey(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v);
}

export function optionValuesEqual(a: unknown, b: unknown): boolean {
  return optionValueKey(a) === optionValueKey(b);
}

export function mergeGhostOptionForSingle(
  options: FieldOption[],
  current: unknown,
): FieldOption[] {
  const key = optionValueKey(current);
  if (!key) return options;
  if (options.some((o) => optionValuesEqual(o.value, key))) return options;
  return [{ value: key, label: String(current) }, ...options];
}

export function mergeGhostOptionsForMultiValues(
  options: FieldOption[],
  selected: string[],
): FieldOption[] {
  const keys = selected.map((v) => optionValueKey(v)).filter(Boolean);
  const missing = keys.filter((k) => !options.some((o) => optionValuesEqual(o.value, k)));
  if (missing.length === 0) return options;
  const ghosts = missing.map((v) => ({ value: v, label: String(v) }));
  return [...ghosts, ...options];
}
