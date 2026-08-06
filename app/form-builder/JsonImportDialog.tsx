"use client";

import { useCallback, useMemo } from "react";

import { toast } from "@/hooks/use-toast";

import { BuilderJsonDialog } from "@/components/shared/builder-header";
import type { FormConfig, FormFieldConfig } from "@/forms/types/types";

/**
 * Walk every field in `config` and rename any duplicate `name` so React keys
 * stay unique in the canvas. Pasted/imported configs frequently contain
 * duplicates from copy-pasting, which previously caused selection / deletion
 * to misfire on the duplicates.
 */
function ensureUniqueFieldNames(config: FormConfig): {
  config: FormConfig;
  renamedCount: number;
} {
  const used = new Set<string>();
  let renamed = 0;
  const sections = config.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      const original = field.name;
      let candidate = original;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${original}_${suffix++}`;
      }
      used.add(candidate);
      if (candidate === original) return field;
      renamed += 1;
      return { ...field, name: candidate } as FormFieldConfig;
    }),
  }));
  return { config: { ...config, sections }, renamedCount: renamed };
}

interface JsonImportDialogProps {
  currentConfig: FormConfig;
  onImport: (config: FormConfig) => void;
}

/**
 * Form-builder JSON import/export.
 *
 * Chrome comes from the shared `<BuilderJsonDialog />`; this file owns only the
 * form-specific payload and validation. The exported config is the complete
 * `FormConfig`, so pasting it back after a refresh rebuilds the same form.
 */
export function JsonImportDialog({ onImport, currentConfig }: JsonImportDialogProps) {
  const exportJson = useMemo(() => JSON.stringify(currentConfig, null, 2), [currentConfig]);

  const handleImport = useCallback(
    (text: string): string | null => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return "Invalid JSON: " + (e instanceof Error ? e.message : "Parse error");
      }

      const candidate = parsed as Partial<FormConfig>;
      if (!candidate?.id || !Array.isArray(candidate.sections)) {
        return "Invalid form config: must have 'id' and a 'sections' array.";
      }
      for (const section of candidate.sections) {
        if (!section.id || !Array.isArray(section.fields)) {
          return "Each section must have 'id' and a 'fields' array.";
        }
        for (const field of section.fields) {
          if (!field.type || !field.name) return "Each field must have 'type' and 'name'.";
        }
      }

      const { config: deduped, renamedCount } = ensureUniqueFieldNames(candidate as FormConfig);
      onImport(deduped);
      toast({
        title: "Form imported",
        description:
          renamedCount > 0
            ? `Loaded "${deduped.title || deduped.id}" — auto-renamed ${renamedCount} duplicate field name${renamedCount === 1 ? "" : "s"}.`
            : `Loaded "${deduped.title || deduped.id}"`,
      });
      return null;
    },
    [onImport],
  );

  return (
    <BuilderJsonDialog
      title="Form JSON"
      description="Import or export the full form configuration."
      exportJson={exportJson}
      onImport={handleImport}
    />
  );
}
