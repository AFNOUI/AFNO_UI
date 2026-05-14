import { z } from "zod";
import { useState, useCallback, useMemo } from "react";

import type { FormConfig } from "../types/types";
import { getDefaultValues, omitExcludedSubmitValues } from "../types/types";
import type { BackendErrorResponse } from "../hooks/useBackendErrors";
import { normalizeFieldErrors } from "@/components/ui/form-primitives";
import { applyBackendErrors } from "./applyBackendErrors";

interface UseActionFormOptions {
  config: FormConfig;
  initialValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  schema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
}

export function useActionForm({ config, schema, onSubmit, initialValues }: UseActionFormOptions) {
  const configDefaults = getDefaultValues(config);
  const defaultValues = useMemo(() => initialValues ? { ...configDefaults, ...initialValues } : configDefaults, [configDefaults, initialValues]);

  const [isPending, setIsPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(config.sections[0]?.id || "");
  const [values, setValuesState] = useState<Record<string, unknown>>(defaultValues);

  const setValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setGlobalError(null);
  }, []);

  const setValues = useCallback((newValues: Record<string, unknown>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const watch = useCallback((name: string) => values[name], [values]);

  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      setGlobalError(null);
      const result = schema.safeParse(values);
      if (!result.success) {
        const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
        setErrors(flat);
        const firstErrorField = Object.keys(flat)[0];
        if (firstErrorField) {
          const layout = config.layout || "single";
          const sectionIdx = config.sections.findIndex((s) =>
            s.fields.some((f) => f.name === firstErrorField)
          );
          if (sectionIdx >= 0) {
            if (layout === "multi-tab") setActiveTab(config.sections[sectionIdx].id);
            else if (layout === "wizard") setCurrentStep(sectionIdx);
          }
        }
        return;
      }
      setErrors({});
      const filteredData = omitExcludedSubmitValues({ ...result.data }, config);
      setIsPending(true);
      try {
        await onSubmit(filteredData);
      } catch (error: unknown) {
        const err = error as { response?: { data?: BackendErrorResponse }; success?: boolean; message?: string } & Partial<BackendErrorResponse>;
        const backendResponse: BackendErrorResponse | undefined =
          err?.response?.data ||
          (err?.success === false ? (err as BackendErrorResponse) : undefined);

        if (backendResponse?.errors && backendResponse.errors.length > 0) {
          const firstErrorSection = applyBackendErrors(setErrors, config, backendResponse.errors);
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
      } finally {
        setIsPending(false);
      }
    },
    [values, schema, onSubmit, config]
  );

  const reset = useCallback(() => {
    setValuesState(defaultValues);
    setErrors({});
    setGlobalError(null);
  }, [defaultValues]);

  const getSectionErrorCount = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return 0;
      const layout = config.layout || "single";
      const activeIndex = config.sections.findIndex((s) => s.id === activeTab);
      if (layout === "wizard" && sectionIndex > currentStep) return 0;
      if (layout === "multi-tab" && activeIndex >= 0 && sectionIndex > activeIndex) return 0;
      return section.fields.filter((f) => errors[f.name]).length;
    },
    [activeTab, config.layout, config.sections, currentStep, errors]
  );

  const isSectionComplete = useCallback(
    (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return false;
      const requiredFields = section.fields.filter((f) => f.required);
      if (requiredFields.length === 0) return true;
      return requiredFields.every((f) => {
        const value = values[f.name];
        if (value === undefined || value === null || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return !errors[f.name];
      });
    },
    [config.sections, values, errors]
  );

  const getOverallProgress = useCallback(() => {
    const allRequired = config.sections.flatMap((s) => s.fields.filter((f) => f.required));
    if (allRequired.length === 0) return 100;
    const filled = allRequired.filter((f) => {
      const value = values[f.name];
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
    return Math.round((filled / allRequired.length) * 100);
  }, [config.sections, values]);

  const validateSection = useCallback(
    async (sectionIndex: number) => {
      const section = config.sections[sectionIndex];
      if (!section) return true;
      const result = schema.safeParse(values);
      const sectionFieldNames = new Set(section.fields.map((f) => f.name));

      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          for (const fieldName of sectionFieldNames) delete next[fieldName];
          return next;
        });
        return true;
      }

      const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
      const sectionErrors: Record<string, string[]> = {};

      for (const [key, errs] of Object.entries(flat)) {
        if (sectionFieldNames.has(key) && normalizeFieldErrors(errs).length > 0) {
          sectionErrors[key] = normalizeFieldErrors(errs);
        }
      }

      setErrors((prev) => {
        const next = { ...prev };
        for (const fieldName of sectionFieldNames) delete next[fieldName];
        return { ...next, ...sectionErrors };
      });

      return Object.keys(sectionErrors).length === 0;
    },
    [config.sections, values, schema]
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
    values,
    errors,
    activeTab,
    isPending,
    globalError,
    currentStep,
    reset,
    watch,
    setValue,
    setValues,
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
