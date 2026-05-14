import { z } from "zod";
import { useState, useCallback } from "react";
import { useForm, type AnyFieldMeta } from "@tanstack/react-form";

import type { FormConfig } from "../types/types";
import { getDefaultValues, omitExcludedSubmitValues } from "../types/types";
import type { BackendErrorResponse } from "../hooks/useBackendErrors";
import { normalizeFieldErrors } from "@/components/ui/form-primitives";
import { applyBackendErrors } from "./applyBackendErrors";

type FieldMetaByName = Partial<Record<string, AnyFieldMeta>>;

interface UseTanstackFormOptions {
  config: FormConfig;
  initialValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  schema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
}

export function useTanstackForm({ config, schema, onSubmit, initialValues }: UseTanstackFormOptions) {
  const configDefaults = getDefaultValues(config);
  const defaultValues = initialValues ? { ...configDefaults, ...initialValues } : configDefaults;

  const [currentStep, setCurrentStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(config.sections[0]?.id || "");

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      const parsed = schema.safeParse(value);
      const submitBase = (parsed.success ? parsed.data : value) as Record<string, unknown>;
      const filteredData = omitExcludedSubmitValues(submitBase, config);
      try {
        await onSubmit(filteredData);
      } catch (error: unknown) {
        const err = error as { response?: { data?: BackendErrorResponse }; success?: boolean; message?: string } & Partial<BackendErrorResponse>;
        const backendResponse: BackendErrorResponse | undefined =
          err?.response?.data ||
          (err?.success === false ? (err as BackendErrorResponse) : undefined);

        if (backendResponse?.errors && backendResponse.errors.length > 0) {
          const firstErrorSection = applyBackendErrors(form, config, backendResponse.errors);
          const layout = config.layout || "single";
          if (firstErrorSection !== -1) {
            if (layout === "multi-tab") setActiveTab(config.sections[firstErrorSection].id);
            else if (layout === "wizard") setCurrentStep(firstErrorSection);
          }
          if (backendResponse.message) {
            setGlobalError(backendResponse.message);
          }
        } else {
          setGlobalError(backendResponse?.message || err?.message || "An unexpected error occurred");
        }
      }
    },
  });

  // Navigate to first error section after a failed validation
  const navigateToFirstError = useCallback(() => {
    const meta = form.state.fieldMeta as FieldMetaByName;
    const layout = config.layout || "single";
    if (layout !== "multi-tab" && layout !== "wizard") return;
    for (let i = 0; i < config.sections.length; i++) {
      for (const f of config.sections[i].fields) {
        const fm = meta[f.name];
        if (normalizeFieldErrors(fm?.errors).length > 0) {
          if (layout === "multi-tab") setActiveTab(config.sections[i].id);
          else if (layout === "wizard") setCurrentStep(i);
          return;
        }
      }
    }
  }, [form, config]);

  const isSectionReached = useCallback(
    (sectionIndex: number) => {
      const layout = config.layout || "single";
      if (layout === "wizard") return sectionIndex <= currentStep;
      if (layout === "multi-tab") {
        const activeIndex = config.sections.findIndex((s) => s.id === activeTab);
        return activeIndex < 0 || sectionIndex <= activeIndex;
      }
      return true;
    },
    [activeTab, config.layout, config.sections, currentStep]
  );

  const getSectionErrorCount = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return 0;
      if (!isSectionReached(sectionIndex)) return 0;

      const meta = form.state.fieldMeta as FieldMetaByName;
      return section.fields.filter((f) => normalizeFieldErrors(meta[f.name]?.errors).length > 0).length;
    },
    [form, config.sections, isSectionReached]
  );

  const isSectionComplete = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return false;
      const requiredFields = section.fields.filter((f) => f.required);
      if (requiredFields.length === 0) return true;
      const values = form.state.values as Record<string, unknown>;
      const meta = form.state.fieldMeta as FieldMetaByName;
      return requiredFields.every((f) => {
        const value = values[f.name];
        if (value === undefined || value === null || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return normalizeFieldErrors(meta[f.name]?.errors).length === 0;
      });
    },
    [config.sections, form]
  );

  const getOverallProgress = useCallback(() => {
    const allRequired = config.sections.flatMap((s) => s.fields.filter((f) => f.required));
    if (allRequired.length === 0) return 100;
    const values = form.state.values as Record<string, unknown>;
    const filled = allRequired.filter((f) => {
      const value = values[f.name];
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
    return Math.round((filled / allRequired.length) * 100);
  }, [config.sections, form]);

  // Section validation for wizard/multi-tab
  const validateSection = useCallback(
    async (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return true;

      await Promise.all(
        section.fields.map((field) => form.validateField(field.name as never, "submit"))
      );

      const meta = form.state.fieldMeta as FieldMetaByName;
      return section.fields.every((field) => normalizeFieldErrors(meta[field.name]?.errors).length === 0);
    },
    [config.sections, form]
  );

  const handleTabChange = useCallback(
    async (newTab: string) => {
      const newIndex = config.sections.findIndex((s) => s.id === newTab);
      const curIndex = config.sections.findIndex((s) => s.id === activeTab);
      if (newIndex > curIndex) {
        for (let i = curIndex; i < newIndex; i++) {
          const valid = await validateSection(i);
          if (!valid) return;
        }
      }
      setActiveTab(newTab);
    },
    [config.sections, activeTab, validateSection]
  );

  return {
    form,
    activeTab,
    globalError,
    currentStep,
    setActiveTab,
    setGlobalError,
    setCurrentStep,
    validateSection,
    handleTabChange,
    isSectionComplete,
    getOverallProgress,
    getSectionErrorCount,
    navigateToFirstError,
  };
}
