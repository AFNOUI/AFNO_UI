/**
 * Form-builder health rules.
 *
 * Pure — takes the form config and returns stats + issues for the shared
 * `<BuilderInsightsPanel />`.
 */

import {
  formatList,
  findDuplicates,
  isUnsafeIdentifier,
  type BuilderStat,
  type BuilderIssue,
  type BuilderInsights,
} from "@/components/shared/builder-insights";

import type { FormConfig } from "@/forms/types/types";

export function getFormInsights(config: FormConfig): BuilderInsights {
  const issues: BuilderIssue[] = [];
  const sections = config.sections ?? [];
  const fields = sections.flatMap((s) => s.fields ?? []);
  const names = fields.map((f) => f.name);
  const nameSet = new Set(names);

  // ── Structure ───────────────────────────────────────────────────────────
  if (fields.length === 0) {
    // A note, not an error: the builder *starts* on an empty canvas, so an
    // empty form is the expected first state rather than a defect.
    issues.push({
      id: "no-fields",
      level: "info",
      title: "The form has no fields yet",
      detail: "Generated code would render a submit button and nothing else.",
      fix: "Add fields from the palette on the left.",
    });
  }

  const emptySections = sections
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (s.fields?.length ?? 0) === 0);
  if (emptySections.length > 0 && fields.length > 0) {
    issues.push({
      id: "empty-sections",
      level: "warning",
      title: `${emptySections.length} empty section${emptySections.length === 1 ? "" : "s"}`,
      location: formatList(emptySections.map(({ s, i }) => s.title || `Section ${i + 1}`)),
      detail: "An empty section still renders its heading and spacing.",
      fix: "Add fields to it, or delete the section.",
    });
  }

  // ── Field names — these become object keys in generated code ────────────
  const dupes = findDuplicates(names);
  if (dupes.length > 0) {
    issues.push({
      id: "duplicate-field-names",
      level: "error",
      title: "Duplicate field names",
      location: formatList(dupes),
      detail: "Fields are keyed by name, so duplicates overwrite each other in submitted data and validation binds to the wrong input.",
      fix: "Rename one of each pair in the properties panel.",
    });
  }

  const unnamed = fields.filter((f) => !f.name?.trim()).length;
  if (unnamed > 0) {
    issues.push({
      id: "unnamed-fields",
      level: "error",
      title: `${unnamed} field${unnamed === 1 ? " has" : "s have"} no name`,
      detail: "A nameless field cannot be registered with the form library or appear in submitted data.",
      fix: "Set a name in the properties panel.",
    });
  }

  const unsafe = names.filter((n) => n.trim() && isUnsafeIdentifier(n));
  if (unsafe.length > 0) {
    issues.push({
      id: "unsafe-field-names",
      level: "warning",
      title: "Field names that are not safe identifiers",
      location: formatList(unsafe),
      detail: "Spaces, dashes and leading digits force bracket access and read badly in the generated schema.",
      fix: "Use letters, digits and underscores, starting with a letter.",
    });
  }

  const unlabelled = fields.filter((f) => !f.label?.trim() && f.type !== "empty").length;
  if (unlabelled > 0) {
    issues.push({
      id: "unlabelled-fields",
      level: "warning",
      title: `${unlabelled} field${unlabelled === 1 ? "" : "s"} without a label`,
      detail: "An unlabelled input is unusable with a screen reader and ambiguous on screen.",
      fix: "Add a label in the properties panel.",
    });
  }

  // ── Cross-field references ──────────────────────────────────────────────
  const brokenConditions = fields
    .filter((f) => f.condition?.field && !nameSet.has(f.condition.field))
    .map((f) => `${f.name} → ${f.condition?.field}`);
  if (brokenConditions.length > 0) {
    issues.push({
      id: "broken-conditions",
      level: "error",
      title: "Conditional fields watch a field that does not exist",
      location: formatList(brokenConditions),
      detail: "The condition can never be satisfied, so the field never appears.",
      fix: "Point the condition at an existing field, or clear it.",
    });
  }

  const brokenWatches = fields
    .filter((f) => f.watchConfig?.watchField && !nameSet.has(f.watchConfig.watchField))
    .map((f) => `${f.name} → ${f.watchConfig?.watchField}`);
  if (brokenWatches.length > 0) {
    issues.push({
      id: "broken-watches",
      level: "error",
      title: "Watch bindings point at a field that does not exist",
      location: formatList(brokenWatches),
      detail: "The watched value is always undefined, so the field never populates.",
      fix: "Point the watch at an existing field, or clear it.",
    });
  }

  const selfReferencing = fields
    .filter((f) => f.condition?.field === f.name || f.watchConfig?.watchField === f.name)
    .map((f) => f.name);
  if (selfReferencing.length > 0) {
    issues.push({
      id: "self-referencing-fields",
      level: "warning",
      title: "Fields that watch themselves",
      location: formatList(selfReferencing),
      detail: "A self-reference either does nothing or loops on every change.",
      fix: "Point it at a different field.",
    });
  }

  // ── Choice fields without choices ───────────────────────────────────────
  const CHOICE_TYPES = new Set(["select", "multiselect", "radio", "combobox"]);
  const emptyChoices = fields
    .filter((f) => {
      if (!CHOICE_TYPES.has(f.type)) return false;
      const withOptions = f as { options?: unknown[]; apiConfig?: unknown };
      return !withOptions.options?.length && !withOptions.apiConfig;
    })
    .map((f) => f.name);
  if (emptyChoices.length > 0) {
    issues.push({
      id: "choice-fields-without-options",
      level: "warning",
      title: "Choice fields with no options",
      location: formatList(emptyChoices),
      detail: "The dropdown opens empty with no way to pick a value.",
      fix: "Add options, or configure an API source.",
    });
  }

  const stats: BuilderStat[] = [
    { label: "sections", value: sections.length },
    { label: "fields", value: fields.length },
    {
      label: "required",
      value: fields.filter((f) => f.required).length,
      hint: "Fields that block submission when empty",
    },
    {
      label: "conditional",
      value: fields.filter((f) => f.condition?.field).length,
      hint: "Fields shown only when a condition is met",
    },
  ];

  return { stats, issues };
}
