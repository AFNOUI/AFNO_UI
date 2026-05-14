import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";

import { applyBackendErrors } from "./applyBackendErrors";
import type { BackendErrorResponse } from "../hooks/useBackendErrors";
import {
  getDefaultValues,
  omitExcludedSubmitValues,
  type FormConfig,
  type ReactHookFormZodSchema,
} from "../types/types";

interface UseReactHookFormOptions {
  config: FormConfig;
  schema: ReactHookFormZodSchema;
  initialValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
}

interface UseReactHookFormReturn {
  activeTab: string;
  currentStep: number;
  globalError: string | null;
  getOverallProgress: () => number;
  setActiveTab: (tab: string) => void;
  setCurrentStep: (step: number) => void;
  form: UseFormReturn<Record<string, unknown>>;
  setGlobalError: (error: string | null) => void;
  handleTabChange: (newTab: string) => Promise<void>;
  isSectionComplete: (sectionIndex: number) => boolean;
  getSectionErrorCount: (sectionIndex: number) => number;
  validateSection: (sectionIndex: number) => Promise<boolean>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useReactHookForm({
  config,
  schema,
  onSubmit,
  initialValues,
}: UseReactHookFormOptions): UseReactHookFormReturn {
  const configDefaults = getDefaultValues(config);
  const defaultValues = initialValues
    ? { ...configDefaults, ...initialValues }
    : configDefaults;

  const [currentStep, setCurrentStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(config.sections[0]?.id || "");

  const form = useForm<Record<string, unknown>>({
    defaultValues,
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  // Clear global error when user edits
  useEffect(() => {
    const subscription = form.watch(() => {
      if (globalError) setGlobalError(null);
    });
    return () => subscription.unsubscribe();
  }, [form, globalError]);

  const getSectionErrorCount = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return 0;
      return section.fields.filter((f) => form.formState.errors[f.name]).length;
    },
    [config.sections, form.formState.errors]
  );

  const isSectionComplete = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return false;
      const requiredFields = section.fields.filter((f) => f.required);
      if (requiredFields.length === 0) return true;
      return requiredFields.every((f) => {
        const value = form.getValues(f.name);
        if (value === undefined || value === null || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return !form.formState.errors[f.name];
      });
    },
    [config.sections, form]
  );

  const getOverallProgress = useCallback(() => {
    const allRequired = config.sections.flatMap((s) =>
      s.fields.filter((f) => f.required)
    );
    if (allRequired.length === 0) return 100;
    const filled = allRequired.filter((f) => {
      const value = form.getValues(f.name);
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
    return Math.round((filled / allRequired.length) * 100);
  }, [config.sections, form]);

  const validateSection = useCallback(
    async (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return true;
      const fieldNames = section.fields.map((f) => f.name);
      return form.trigger(fieldNames as (keyof Record<string, unknown>)[]);
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

  const handleSubmit = form.handleSubmit(
    async (data) => {
      setGlobalError(null);
      try {
        await onSubmit(omitExcludedSubmitValues(data, config));
      } catch (error: unknown) {
        const err = error as { response?: { data?: BackendErrorResponse }; success?: boolean; message?: string } & Partial<BackendErrorResponse>;
        const backendResponse: BackendErrorResponse | undefined =
          err?.response?.data ||
          (err?.success === false ? (err as BackendErrorResponse) : undefined);

        if (backendResponse?.errors && backendResponse.errors.length > 0) {
          const firstErrorSection = applyBackendErrors(form, config, backendResponse.errors);
          const layout = config.layout || "single";
          if (firstErrorSection !== -1) {
            if (layout === "multi-tab") {
              setActiveTab(config.sections[firstErrorSection].id);
            } else if (layout === "wizard") {
              setCurrentStep(firstErrorSection);
            }
          }
          if (backendResponse.message) {
            setGlobalError(backendResponse.message);
          }
        } else {
          const msg =
            backendResponse?.message || err?.message || "An unexpected error occurred";
          setGlobalError(msg);
        }
      }
    },
    (errors) => {
      console.warn("[ReactHookForm] Validation errors:", errors);
    }
  );

  return {
    form,
    activeTab,
    globalError,
    currentStep,
    handleSubmit,
    setActiveTab,
    setGlobalError,
    setCurrentStep,
    validateSection,
    handleTabChange,
    isSectionComplete,
    getOverallProgress,
    getSectionErrorCount,
  };
}
