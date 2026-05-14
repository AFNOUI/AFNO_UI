import type { z } from "zod";

/**
 * Stack-neutral Zod schema for form validation (TanStack Form, ActionForm, react-hook-form + zodResolver).
 */
export type FormZodSchema = z.ZodType<Record<string, unknown>, Record<string, unknown>>;

/** Alias for existing RHF-focused call sites and registry variants. */
export type ReactHookFormZodSchema = FormZodSchema;

// Field types supported by the form system
export type FieldType =
  | "text" | "email" | "password" | "number" | "tel" | "url"
  | "textarea" | "select" | "radio"
  | "checkbox" | "checkboxgroup"
  | "switch" | "switchgroup"
  | "combobox" | "multiselect" | "multicombobox"
  | "file" | "date" | "hidden"
  | "empty" | "preview"
  | "asyncselect" | "asyncmultiselect" | "asynccombobox" | "asyncmulticombobox"
  | "infiniteselect" | "infinitemultiselect" | "infinitecombobox" | "infinitemulticombobox";

// Option for select, radio, combobox fields
export interface FieldOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

// File validation config
export interface FileValidation {
  maxSize?: number;
  maxFiles?: number;
  acceptedTypes?: string[];
}

// Watch transform options for auto-populate constraints
export interface WatchTransform {
  slice?: { start: number; end?: number };
  filter?: 'numbers' | 'letters' | 'alphanumeric';
  case?: 'upper' | 'lower' | 'capitalize' | 'title';
  template?: string;
}

/**
 * API configuration for async and infinite field types.
 */
export interface AsyncApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  responseMapping: {
    dataPath: string;
    labelKey: string;
    valueKey: string;
    extraKeys?: string[];
  };
  searchParam?: string;
  pageParam?: string;
  pageSizeParam?: string;
  pageSize?: number;
  hasMorePath?: string;
  offsetBased?: boolean;
  _watchValue?: unknown;
}

/**
 * Dependent API config: fetches options from an API based on another field's value.
 * - **`{value}`** in `url`, `headers`, or string fields inside `payload`: replaced with the serialized watch
 *   (arrays → comma-separated). Not URL-encoded unless you encode it in a transform upstream.
 * - **Path segments `/:id` or `/:value`**: replaced with `encodeURIComponent(watch)` (before `?`), e.g.
 *   `https://api.example.com/countries/:id/cities`.
 * - **GET/DELETE**: `payload` object is merged into **query params** (with pagination keys).
 * - **POST/PUT/PATCH**: `payload` is JSON body; if omitted, defaults to `{ value: "<watched>" }` plus pagination.
 */
export interface DependentApiConfig extends AsyncApiConfig {
  watchField: string;
}

// Base field configuration
export interface BaseFieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Number of grid columns this field should span (e.g., 2 to span two columns). */
  colSpan?: number;
  /** If true, this field is excluded from submitted data (useful for display-only fields like preview/empty). */
  excludeFromSubmit?: boolean;
  defaultValue?: unknown;
  condition?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notEmpty' | 'empty' | 'in' | 'isTrue' | 'isFalse';
    value?: string;
  };
  watchConfig?: {
    watchField: string;
    valueMap?: Record<string, string>;
    transform?: WatchTransform;
  };
  dependentOptions?: {
    watchField: string;
    optionsMap: Record<string, FieldOption[]>;
  };
}

// Text-based field config
export interface TextFieldConfig extends BaseFieldConfig {
  type: "text" | "email" | "password" | "tel" | "url";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Number field config
export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

// Textarea field config
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

// Select field config
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options: FieldOption[];
}

// Async select field config
export interface AsyncSelectFieldConfig extends BaseFieldConfig {
  type: "asyncselect";
  options: FieldOption[];
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Infinite select field config
export interface InfiniteSelectFieldConfig extends BaseFieldConfig {
  type: "infiniteselect";
  options: FieldOption[];
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Radio field config
export interface RadioFieldConfig extends BaseFieldConfig {
  type: "radio";
  options: FieldOption[];
  orientation?: "horizontal" | "vertical";
}

// Checkbox field config
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox";
  checkboxLabel?: string;
}

// Checkbox Group field config
export interface CheckboxGroupFieldConfig extends BaseFieldConfig {
  type: "checkboxgroup";
  options: FieldOption[];
  orientation?: "horizontal" | "vertical";
}

// Switch field config
export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  switchLabel?: string;
}

// Switch Group field config
export interface SwitchGroupFieldConfig extends BaseFieldConfig {
  type: "switchgroup";
  options: FieldOption[];
}

// Combobox field config
export interface ComboboxFieldConfig extends BaseFieldConfig {
  type: "combobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  creatable?: boolean;
}

// Async combobox field config
export interface AsyncComboboxFieldConfig extends BaseFieldConfig {
  type: "asynccombobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  creatable?: boolean;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Infinite combobox field config
export interface InfiniteComboboxFieldConfig extends BaseFieldConfig {
  type: "infinitecombobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  creatable?: boolean;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Multiselect field config
export interface MultiselectFieldConfig extends BaseFieldConfig {
  type: "multiselect";
  options: FieldOption[];
  maxItems?: number;
}

// Async multiselect field config
export interface AsyncMultiselectFieldConfig extends BaseFieldConfig {
  type: "asyncmultiselect";
  options: FieldOption[];
  maxItems?: number;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Infinite multiselect field config
export interface InfiniteMultiselectFieldConfig extends BaseFieldConfig {
  type: "infinitemultiselect";
  options: FieldOption[];
  maxItems?: number;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Multi-combobox field config
export interface MultiComboboxFieldConfig extends BaseFieldConfig {
  type: "multicombobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  creatable?: boolean;
}

// Async multi-combobox field config
export interface AsyncMultiComboboxFieldConfig extends BaseFieldConfig {
  type: "asyncmulticombobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  creatable?: boolean;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// Infinite multi-combobox field config
export interface InfiniteMultiComboboxFieldConfig extends BaseFieldConfig {
  type: "infinitemulticombobox";
  options: FieldOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  creatable?: boolean;
  apiConfig?: AsyncApiConfig;
  dependentApiConfig?: DependentApiConfig;
}

// File field config
export interface FileFieldConfig extends BaseFieldConfig {
  type: "file";
  multiple?: boolean;
  accept?: string;
  validation?: FileValidation;
}

// Date field config
export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
  minDateField?: string;
  maxDateField?: string;
  /** Quick constraint preset: 'futureOnly' | 'pastOnly' | 'todayOnly' | 'noWeekends' | 'futureNoWeekends' */
  dateConstraint?: 'futureOnly' | 'pastOnly' | 'todayOnly' | 'noWeekends' | 'futureNoWeekends';
  /** Fixed min date string for builder (ISO date string, e.g. "2024-01-01") */
  minDateFixed?: string;
  /** Fixed max date string for builder */
  maxDateFixed?: string;
  /** Show time picker alongside date picker */
  showTime?: boolean;
  /** Time format: 12-hour or 24-hour. Defaults to '24h'. */
  timeFormat?: '12h' | '24h';
  /** Allow picking seconds (only meaningful when showTime is true). Defaults to false. */
  showSeconds?: boolean;
  /** Start year for the year dropdown. Defaults to 1920. */
  fromYear?: number;
  /** End year for the year dropdown. Defaults to 2100. */
  toYear?: number;
}

// Hidden field config
export interface HiddenFieldConfig extends BaseFieldConfig {
  type: "hidden";
}

// Empty field config (spacer — takes grid space but renders nothing visible)
export interface EmptyFieldConfig extends BaseFieldConfig {
  type: "empty";
  /** Optional height for the spacer (CSS value, e.g. "40px", "2rem"). Defaults to auto. */
  height?: string;
}

// Preview calculation rules
export type PreviewCalculationRule = 'sum' | 'subtract' | 'multiply' | 'divide' | 'concat' | 'average' | 'min' | 'max' | 'custom';

// Preview field config (displays calculated or composite values from other fields)
export interface PreviewFieldConfig extends BaseFieldConfig {
  type: "preview";
  /** Field names to watch for values */
  watchFields: string[];
  /** Calculation configuration */
  calculation?: {
    rule: PreviewCalculationRule;
    /** Custom expression using {fieldName} placeholders, e.g. "{price} * {quantity} * (1 + {taxRate} / 100)" */
    customExpression?: string;
  };
  /**
   * Display format template using {fieldName} or {value} placeholders.
   * {value} = calculated result, {fieldName} = raw value of that field.
   * Example: "{value} USD" or "{amount} {currency}"
   */
  format?: string;
  /** Text prefix before the value */
  prefix?: string;
  /** Text suffix after the value */
  suffix?: string;
  /** Text to show when all watched fields are empty */
  emptyText?: string;
  /** Number of decimal places for numeric results */
  decimals?: number;
  /** Visual variant */
  variant?: 'default' | 'card' | 'inline' | 'highlight';
}

// Union of all field configs
export type FormFieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | AsyncSelectFieldConfig
  | InfiniteSelectFieldConfig
  | RadioFieldConfig
  | CheckboxFieldConfig
  | CheckboxGroupFieldConfig
  | SwitchFieldConfig
  | SwitchGroupFieldConfig
  | ComboboxFieldConfig
  | AsyncComboboxFieldConfig
  | InfiniteComboboxFieldConfig
  | MultiselectFieldConfig
  | AsyncMultiselectFieldConfig
  | InfiniteMultiselectFieldConfig
  | MultiComboboxFieldConfig
  | AsyncMultiComboboxFieldConfig
  | InfiniteMultiComboboxFieldConfig
  | FileFieldConfig
  | DateFieldConfig
  | HiddenFieldConfig
  | EmptyFieldConfig
  | PreviewFieldConfig;

/** Helper type: fields that have an options property */
export type OptionFieldConfig = Extract<FormFieldConfig, { options: FieldOption[] }>;
/** Helper type: fields that support dynamic dependent API config */
export type DependentApiFieldConfig = Extract<FormFieldConfig, { dependentApiConfig?: DependentApiConfig }>;

// Form section for grouping fields
export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  columns?: 1 | 2 | 3 | 4;
}

// Form layout types
export type FormLayout = "single" | "multi-tab" | "wizard" | "compact";

// Complete form configuration
export interface FormConfig {
  id: string;
  title?: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  className?: string;
  layout?: FormLayout;
}

// Form submission handler
export type FormSubmitHandler<T = Record<string, unknown>> = (data: T) => void | Promise<void>;

// Get default values from form config
export function getDefaultValues(config: FormConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  const fields = config.sections.flatMap(s => s.fields);

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue;
    } else {
      switch (field.type) {
        case "checkbox":
        case "switch":
          defaults[field.name] = false;
          break;
        case "multiselect":
        case "multicombobox":
        case "asyncmultiselect":
        case "asyncmulticombobox":
        case "infinitemultiselect":
        case "infinitemulticombobox":
        case "checkboxgroup":
          defaults[field.name] = [];
          break;
        case "switchgroup":
          defaults[field.name] = {};
          break;
        case "number":
          defaults[field.name] = "";
          break;
        case "empty":
        case "preview":
          // No default value needed for display-only fields
          break;
        default:
          defaults[field.name] = "";
      }
    }
  }

  return defaults;
}

/** Field names omitted from `onSubmit` payloads (display-only + explicit opt-out). */
export function getSubmitExcludedFieldNames(config: FormConfig): Set<string> {
  const excluded = new Set<string>();
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.excludeFromSubmit || field.type === "empty" || field.type === "preview") {
        excluded.add(field.name);
      }
    }
  }
  return excluded;
}

/** Returns a shallow copy of `data` without excluded field keys (and `name__*` extras for excluded `name`). */
export function omitExcludedSubmitValues(
  data: Record<string, unknown>,
  config: FormConfig
): Record<string, unknown> {
  const out = { ...data };
  for (const name of getSubmitExcludedFieldNames(config)) {
    delete out[name];
    const prefix = `${name}__`;
    for (const key of Object.keys(out)) {
      if (key.startsWith(prefix)) delete out[key];
    }
  }
  return out;
}
