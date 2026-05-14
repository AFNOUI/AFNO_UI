import { useEffect, useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { useActionFormContext } from "./ActionFormContext";
import { FormFieldErrorBoundary, validateFieldConfig } from "../FormFieldErrorBoundary";
import {
  TextField, TextareaField, SelectField, RadioField,
  CheckboxField, CheckboxGroupField, SwitchField, SwitchGroupField,
  ComboboxField, MultiselectField, MultiComboboxField,
  FileField, DateField, EmptyField, PreviewField,
  AsyncSelectField, AsyncMultiSelectField, AsyncComboboxField, AsyncMultiComboboxField,
  InfiniteSelectField, InfiniteMultiSelectField, InfiniteComboboxField, InfiniteMultiComboboxField,
} from "./fields";
import type {
  FormFieldConfig,
  FieldOption,
} from "../types/types";
import { resetFieldValueForConfig, resolveWatchPopulateValue } from "../utils/watchPopulate";
import {
  hasDependentApiConfig,
  hasOptions,
  hasWatchValue,
} from "../utils/formFieldGuards";

export function ActionFormField({ config }: { config: FormFieldConfig }) {
  const validationError = validateFieldConfig(config);
  const { values, setValue } = useActionFormContext();

  const conditionFieldName = config.condition?.field;
  const conditionValue = conditionFieldName ? values[conditionFieldName] : undefined;
  const watchFieldName = config.watchConfig?.watchField;
  const watchedValue = watchFieldName ? values[watchFieldName] : undefined;
  const depFieldName = config.dependentOptions?.watchField;
  const depValue = depFieldName ? values[depFieldName] : undefined;
  const depApiWatchField = hasDependentApiConfig(config)
    ? config.dependentApiConfig?.watchField
    : undefined;
  const depApiWatchValue = depApiWatchField ? values[depApiWatchField] : undefined;

  useEffect(() => {
    if (!config.watchConfig || !watchFieldName) return;
    const next = resolveWatchPopulateValue(config, watchedValue, config.watchConfig);
    setValue(config.name, next);
  }, [watchedValue, watchFieldName, config.name, config.type, config.watchConfig, setValue]);

  useEffect(() => {
    if (!config.dependentOptions || !depFieldName) return;
    setValue(config.name, resetFieldValueForConfig(config));
  }, [depValue, depFieldName, config.dependentOptions, config.name, setValue]);

  useEffect(() => {
    if (!hasDependentApiConfig(config) || !config.dependentApiConfig || !depApiWatchField) return;
    setValue(config.name, resetFieldValueForConfig(config));
  }, [depApiWatchValue, depApiWatchField, config, setValue]);

  const resolvedConfig = useMemo((): FormFieldConfig => {
    let cfg = config;
    if (cfg.dependentOptions && depValue) {
      const matchedOptions: FieldOption[] = cfg.dependentOptions.optionsMap[String(depValue)] || [];
      if (hasOptions(cfg)) cfg = { ...cfg, options: matchedOptions };
    }
    // Dynamic dependent API config
    if (
      hasDependentApiConfig(cfg) &&
      cfg.dependentApiConfig &&
      hasWatchValue(depApiWatchValue)
    ) {
      const depApi = cfg.dependentApiConfig;
      const apiConfig = {
        ...depApi,
        _watchValue: depApiWatchValue,
      };
      cfg = { ...cfg, apiConfig } as FormFieldConfig;
    }
    return cfg;
  }, [config, depValue, depApiWatchValue]);

  const visible = (() => {
    if (!config.condition || !conditionFieldName) return true;
    const { operator, value } = config.condition;
    switch (operator) {
      case "equals": return String(conditionValue) === String(value);
      case "notEquals": return String(conditionValue) !== String(value);
      case "contains": return String(conditionValue || "").includes(value || "");
      case "notEmpty": return !!conditionValue && conditionValue !== "";
      case "empty": return !conditionValue || conditionValue === "";
      case "in": return (value || "").split(",").map((v: string) => v.trim()).includes(String(conditionValue));
      case "isTrue": return conditionValue === true || conditionValue === "true";
      case "isFalse": return conditionValue === false || conditionValue === "false" || !conditionValue;
      default: return true;
    }
  })();

  useEffect(() => {
    if (!visible && config.condition) {
      setValue(config.name, resetFieldValueForConfig(config));
    }
  }, [visible, config.condition, config.defaultValue, config.name, setValue]);

  if (!visible) return null;

  if (validationError) {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">{validationError}</AlertDescription>
      </Alert>
    );
  }

  const renderField = () => {
    try {
      switch (resolvedConfig.type) {
        case "text": case "email": case "password": case "tel": case "url": case "number":
          return <TextField config={resolvedConfig} />;
        case "textarea": return <TextareaField config={resolvedConfig} />;
        case "select": return <SelectField config={resolvedConfig} />;
        case "asyncselect": return <AsyncSelectField config={resolvedConfig} />;
        case "infiniteselect": return <InfiniteSelectField config={resolvedConfig} />;
        case "combobox": return <ComboboxField config={resolvedConfig} />;
        case "asynccombobox": return <AsyncComboboxField config={resolvedConfig} />;
        case "infinitecombobox": return <InfiniteComboboxField config={resolvedConfig} />;
        case "multiselect": return <MultiselectField config={resolvedConfig} />;
        case "asyncmultiselect": return <AsyncMultiSelectField config={resolvedConfig} />;
        case "infinitemultiselect": return <InfiniteMultiSelectField config={resolvedConfig} />;
        case "multicombobox": return <MultiComboboxField config={resolvedConfig} />;
        case "asyncmulticombobox": return <AsyncMultiComboboxField config={resolvedConfig} />;
        case "infinitemulticombobox": return <InfiniteMultiComboboxField config={resolvedConfig} />;
        case "radio": return <RadioField config={resolvedConfig} />;
        case "checkbox": return <CheckboxField config={resolvedConfig} />;
        case "checkboxgroup": return <CheckboxGroupField config={resolvedConfig} />;
        case "switch": return <SwitchField config={resolvedConfig} />;
        case "switchgroup": return <SwitchGroupField config={resolvedConfig} />;
        case "file": return <FileField config={resolvedConfig} />;
        case "date": return <DateField config={resolvedConfig} />;
        case "empty": return <EmptyField config={resolvedConfig} />;
        case "preview": return <PreviewField config={resolvedConfig} />;
        case "hidden": return null;
        default: return null;
      }
    } catch (e) {
      console.error(`[ActionFormField] Error rendering field "${config.name}":`, e);
      return null;
    }
  };

  return (
    <FormFieldErrorBoundary fieldName={config.name}>
      {renderField()}
    </FormFieldErrorBoundary>
  );
}
