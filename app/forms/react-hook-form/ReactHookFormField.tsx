"use client";

import { useEffect, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type {
  FormFieldConfig,
  FieldOption,
} from "../types/types";
import {
  resetFieldValueForConfig,
  resolveWatchPopulateValue,
} from "../utils/watchPopulate";
import {
  hasDependentApiConfig,
  hasOptions,
  hasWatchValue,
} from "../utils/formFieldGuards";

import {
  FileField,
  DateField,
  TextField,
  TextareaField,
  SelectField,
  RadioField,
  CheckboxField,
  CheckboxGroupField,
  SwitchField,
  SwitchGroupField,
  ComboboxField,
  MultiselectField,
  MultiComboboxField,
  AsyncSelectField,
  AsyncMultiSelectField,
  AsyncComboboxField,
  AsyncMultiComboboxField,
  InfiniteSelectField,
  InfiniteMultiSelectField,
  InfiniteComboboxField,
  InfiniteMultiComboboxField,
  EmptyField,
  PreviewField,
} from "./fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormFieldErrorBoundary, validateFieldConfig } from "../FormFieldErrorBoundary";

interface ReactHookFormFieldProps {
  config: FormFieldConfig;
}

export function ReactHookFormField({ config }: ReactHookFormFieldProps) {
  const validationError = validateFieldConfig(config);
  const form = useFormContext();

  // Conditional visibility
  const conditionFieldName = config.condition?.field;
  const conditionValue = conditionFieldName
    ? form.watch(conditionFieldName)
    : undefined;

  // Watch auto-populate
  const watchFieldName = config.watchConfig?.watchField;
  const watchedValue = watchFieldName ? form.watch(watchFieldName) : undefined;

  // Dependent options
  const depFieldName = config.dependentOptions?.watchField;
  const depValue = depFieldName ? form.watch(depFieldName) : undefined;
  const depApiWatchField = hasDependentApiConfig(config)
    ? config.dependentApiConfig?.watchField
    : undefined;
  const depApiWatchValue = depApiWatchField
    ? form.watch(depApiWatchField)
    : undefined;

  useEffect(() => {
    if (!config.watchConfig || !watchFieldName) return;
    const next = resolveWatchPopulateValue(config, watchedValue, config.watchConfig);
    form.setValue(config.name, next, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValue, watchFieldName, config.name, config.type]);

  // Clear dependent field when parent changes
  useEffect(() => {
    if (!config.dependentOptions || !depFieldName) return;
    form.setValue(config.name, resetFieldValueForConfig(config), { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depValue]);

  // Clear field when dependent API watch field changes
  useEffect(() => {
    if (!hasDependentApiConfig(config) || !config.dependentApiConfig || !depApiWatchField) return;
    form.setValue(config.name, resetFieldValueForConfig(config), { shouldDirty: false });
  }, [depApiWatchValue]);

  // Resolve dependent options
  const resolvedConfig = useMemo((): FormFieldConfig => {
    let cfg = config;
    // Static dependent options
    if (cfg.dependentOptions && depValue) {
      const matchedOptions: FieldOption[] =
        cfg.dependentOptions.optionsMap[String(depValue)] || [];
      if (hasOptions(cfg)) {
        cfg = { ...cfg, options: matchedOptions };
      }
    }

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

  // Evaluate condition
  const visible = (() => {
    if (!config.condition || !conditionFieldName) return true;
    const { operator, value } = config.condition;
    switch (operator) {
      case "equals":
        return String(conditionValue) === String(value);
      case "notEquals":
        return String(conditionValue) !== String(value);
      case "contains":
        return String(conditionValue || "").includes(value || "");
      case "notEmpty":
        return !!conditionValue && conditionValue !== "";
      case "empty":
        return !conditionValue || conditionValue === "";
      case "in":
        return (value || "")
          .split(",")
          .map((v: string) => v.trim())
          .includes(String(conditionValue));
      case "isTrue":
        return conditionValue === true || conditionValue === "true";
      case "isFalse":
        return (
          conditionValue === false ||
          conditionValue === "false" ||
          !conditionValue
        );
      default:
        return true;
    }
  })();

  // Clear field value when conditionally hidden
  useEffect(() => {
    if (!visible && config.condition) {
      form.setValue(config.name, resetFieldValueForConfig(config), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  if (validationError) {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">{validationError}</AlertDescription>
      </Alert>
    );
  }

  // ─── Field type → Component mapping ───
  const renderField = () => {
    try {
      switch (resolvedConfig.type) {
        case "text":
        case "email":
        case "password":
        case "tel":
        case "url":
          return <TextField config={resolvedConfig} />;
        case "number":
          return <TextField config={resolvedConfig} />;
        case "textarea":
          return <TextareaField config={resolvedConfig} />;
        case "select":
          return <SelectField config={resolvedConfig} />;
        case "asyncselect":
          return <AsyncSelectField config={resolvedConfig} />;
        case "infiniteselect":
          return <InfiniteSelectField config={resolvedConfig} />;
        case "combobox":
          return <ComboboxField config={resolvedConfig} />;
        case "asynccombobox":
          return <AsyncComboboxField config={resolvedConfig} />;
        case "infinitecombobox":
          return <InfiniteComboboxField config={resolvedConfig} />;
        case "multiselect":
          return <MultiselectField config={resolvedConfig} />;
        case "asyncmultiselect":
          return <AsyncMultiSelectField config={resolvedConfig} />;
        case "infinitemultiselect":
          return <InfiniteMultiSelectField config={resolvedConfig} />;
        case "multicombobox":
          return <MultiComboboxField config={resolvedConfig} />;
        case "asyncmulticombobox":
          return <AsyncMultiComboboxField config={resolvedConfig} />;
        case "infinitemulticombobox":
          return <InfiniteMultiComboboxField config={resolvedConfig} />;
        case "radio":
          return <RadioField config={resolvedConfig} />;
        case "checkbox":
          return <CheckboxField config={resolvedConfig} />;
        case "checkboxgroup":
          return <CheckboxGroupField config={resolvedConfig} />;
        case "switch":
          return <SwitchField config={resolvedConfig} />;
        case "switchgroup":
          return <SwitchGroupField config={resolvedConfig} />;
        case "file":
          return <FileField config={resolvedConfig} />;
        case "date":
          return <DateField config={resolvedConfig} />;
        case "empty":
          return <EmptyField config={resolvedConfig} />;
        case "preview":
          return <PreviewField config={resolvedConfig} />;
        case "hidden":
          return null;
        default:
          return null;
      }
    } catch (e) {
      console.error(
        `[GenericFormField] Error rendering field "${config.name}":`,
        e,
      );
      return null;
    }
  };
  return (
    <FormFieldErrorBoundary fieldName={config.name}>
      {renderField()}
    </FormFieldErrorBoundary>
  );
}
