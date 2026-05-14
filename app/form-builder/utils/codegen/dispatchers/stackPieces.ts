import { typeToComponent } from "../fieldRegistry";

/**
 * Per-stack `XxxFormField.tsx` dispatcher: routes a `FormFieldConfig` to the right field
 * component, applies `condition`/`watchConfig`/`dependentOptions`/`dependentApiConfig` reactivity,
 * and reset-on-hide. Each stack implements the same contract with its own form context API.
 */
export type DispatcherStackOutputs = {
  /** Top-of-file context import (e.g. `import { useFormContext } from "react-hook-form";`). */
  contextImport: string;
  /** `import type { ... } from "../types/types";` block. */
  typesImport: string;
  /** Function declaration line + first hook (`const form = ...` / `const { values } = ...`). */
  funcSignature: string;
  /** Body that wires `conditionFieldName` / `watchedValue` / `depValue` / `depApiWatchValue`. */
  watchSetup: string;
  /** Effect that pushes the resolved watch-populate value back into the form. */
  watchEffect: string;
  /** Effect that resets the field when the dependent-options watch source changes. */
  depEffect: string;
  /** Effect that resets the field when the dependent-API watch source changes. */
  depApiEffect: string;
  /** Effect that resets the field when its `condition` flips to hidden. */
  clearEffect: string;
};

/** RHF dispatcher pieces — uses `useFormContext` + `form.watch` + `form.setValue`. */
export const RHF_DISPATCHER: DispatcherStackOutputs = {
  contextImport: 'import { useFormContext } from "react-hook-form";',
  typesImport: `import type {
  FormFieldConfig,
  FieldOption,
  OptionFieldConfig,
  DependentApiFieldConfig,
} from "../types/types";`,
  funcSignature:
    'export function ReactHookFormField({ config }: { config: FormFieldConfig }) {\n  const form = useFormContext();',
  watchSetup: `  const conditionFieldName = config.condition?.field;
  const conditionValue = conditionFieldName ? form.watch(conditionFieldName) : undefined;
  const watchFieldName = config.watchConfig?.watchField;
  const watchedValue = watchFieldName ? form.watch(watchFieldName) : undefined;
  const depFieldName = config.dependentOptions?.watchField;
  const depValue = depFieldName ? form.watch(depFieldName) : undefined;
  const depApiWatchField = hasDependentApiConfig(config)
    ? config.dependentApiConfig?.watchField
    : undefined;
  const depApiWatchValue = depApiWatchField ? form.watch(depApiWatchField) : undefined;`,
  watchEffect: `  useEffect(() => {
    if (!config.watchConfig || !watchFieldName) return;
    const next = resolveWatchPopulateValue(config, watchedValue, config.watchConfig);
    form.setValue(config.name, next, { shouldDirty: false });
  }, [watchedValue, watchFieldName, config.name, config.type, config.watchConfig, form]);`,
  depEffect: `  useEffect(() => {
    if (!config.dependentOptions || !depFieldName) return;
    form.setValue(config.name, resetFieldValueForConfig(config), { shouldDirty: false });
  }, [depValue]);`,
  depApiEffect: `  useEffect(() => {
    if (!hasDependentApiConfig(config) || !config.dependentApiConfig || !depApiWatchField) return;
    form.setValue(config.name, resetFieldValueForConfig(config), { shouldDirty: false });
  }, [depApiWatchValue]);`,
  clearEffect: `      form.setValue(config.name, resetFieldValueForConfig(config), { shouldDirty: false, shouldValidate: false });`,
};

/** TanStack dispatcher pieces — reads from `values` snapshot + writes via `form.setFieldValue`. */
export const TANSTACK_DISPATCHER: DispatcherStackOutputs = {
  contextImport: 'import { useTanstackFormContext } from "./TanstackFormContext";',
  typesImport: `import type {
  FormFieldConfig,
  FieldOption,
  OptionFieldConfig,
  DependentApiFieldConfig,
} from "../types/types";`,
  funcSignature:
    'export function TanstackFormField({ config }: { config: FormFieldConfig }) {\n  const { form, values } = useTanstackFormContext();',
  watchSetup: `  const conditionFieldName = config.condition?.field || "";
  const watchFieldName = config.watchConfig?.watchField || "";
  const depFieldName = config.dependentOptions?.watchField || "";
  const depApiWatchField = hasDependentApiConfig(config)
    ? config.dependentApiConfig?.watchField || ""
    : "";
  const conditionValue = conditionFieldName ? values[conditionFieldName] : undefined;
  const watchedValue = watchFieldName ? values[watchFieldName] : undefined;
  const depValue = depFieldName ? values[depFieldName] : undefined;
  const depApiWatchValue = depApiWatchField ? values[depApiWatchField] : undefined;`,
  watchEffect: `  useEffect(() => {
    if (!config.watchConfig || !watchFieldName) return;
    const next = resolveWatchPopulateValue(config, watchedValue, config.watchConfig);
    form.setFieldValue(config.name, next);
  }, [watchedValue, watchFieldName, config.name, config.type, config.watchConfig, form]);`,
  depEffect: `  useEffect(() => {
    if (!config.dependentOptions || !depFieldName) return;
    form.setFieldValue(config.name, resetFieldValueForConfig(config));
  }, [depValue, depFieldName, config.dependentOptions, config.name, form]);`,
  depApiEffect: `  useEffect(() => {
    if (!hasDependentApiConfig(config) || !config.dependentApiConfig || !depApiWatchField) return;
    form.setFieldValue(config.name, resetFieldValueForConfig(config));
  }, [depApiWatchValue, depApiWatchField, config, form]);`,
  clearEffect: `      form.setFieldValue(config.name, resetFieldValueForConfig(config));`,
};

/** Action dispatcher pieces — reads from `values` snapshot + writes via `setValue`. */
export const ACTION_DISPATCHER: DispatcherStackOutputs = {
  contextImport: 'import { useActionFormContext } from "./ActionFormContext";',
  typesImport: `import type {
  FormFieldConfig,
  FieldOption,
  OptionFieldConfig,
  DependentApiFieldConfig,
} from "../types/types";`,
  funcSignature:
    'export function ActionFormField({ config }: { config: FormFieldConfig }) {\n  const { values, setValue } = useActionFormContext();',
  watchSetup: `  const conditionFieldName = config.condition?.field;
  const conditionValue = conditionFieldName ? values[conditionFieldName] : undefined;
  const watchFieldName = config.watchConfig?.watchField;
  const watchedValue = watchFieldName ? values[watchFieldName] : undefined;
  const depFieldName = config.dependentOptions?.watchField;
  const depValue = depFieldName ? values[depFieldName] : undefined;
  const depApiWatchField = hasDependentApiConfig(config)
    ? config.dependentApiConfig?.watchField
    : undefined;
  const depApiWatchValue = depApiWatchField ? values[depApiWatchField] : undefined;`,
  watchEffect: `  useEffect(() => {
    if (!config.watchConfig || !watchFieldName) return;
    const next = resolveWatchPopulateValue(config, watchedValue, config.watchConfig);
    setValue(config.name, next);
  }, [watchedValue, watchFieldName, config.name, config.type, config.watchConfig, setValue]);`,
  depEffect: `  useEffect(() => {
    if (!config.dependentOptions || !depFieldName) return;
    setValue(config.name, resetFieldValueForConfig(config));
  }, [depValue, depFieldName, config.dependentOptions, config.name, setValue]);`,
  depApiEffect: `  useEffect(() => {
    if (!hasDependentApiConfig(config) || !config.dependentApiConfig || !depApiWatchField) return;
    setValue(config.name, resetFieldValueForConfig(config));
  }, [depApiWatchValue, depApiWatchField, config, setValue]);`,
  clearEffect: `      setValue(config.name, resetFieldValueForConfig(config));`,
};

export const STACK_DISPATCHER_PIECES = {
  rhf: RHF_DISPATCHER,
  tanstack: TANSTACK_DISPATCHER,
  action: ACTION_DISPATCHER,
} as const;

// Re-export so consumers don't need to know about the registry split.
export { typeToComponent };
