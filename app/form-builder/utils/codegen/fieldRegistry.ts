import type { FormConfig, FormFieldConfig } from "@/forms/types/types";
import { formStackInstall } from "@/registry/formRegistry";

/** Stack identifiers shared with the registry / CLI. */
export type FormStack = keyof typeof formStackInstall;

/**
 * Source-of-truth map: field-type → component name + source file + UI Radix deps.
 * Used by both the runtime config dispatcher and the static-page emitters, plus
 * `getRequiredComponents` / `generateInstallCommand`.
 */
export const fieldComponentMap: Record<string, { component: string; file: string; uiDeps: string[] }> = {
  empty: { component: "EmptyField", file: "EmptyField.tsx", uiDeps: [] },
  tel: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  url: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  text: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  preview: { component: "PreviewField", file: "PreviewField.tsx", uiDeps: ["form"] },
  file: { component: "FileField", file: "FileField.tsx", uiDeps: ["input", "form"] },
  email: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  number: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  password: { component: "TextField", file: "TextField.tsx", uiDeps: ["input", "form"] },
  switch: { component: "SwitchField", file: "SwitchField.tsx", uiDeps: ["switch", "form"] },
  select: { component: "SelectField", file: "SelectField.tsx", uiDeps: ["select", "form"] },
  textarea: { component: "TextareaField", file: "TextareaField.tsx", uiDeps: ["textarea", "form"] },
  checkbox: { component: "CheckboxField", file: "CheckboxField.tsx", uiDeps: ["checkbox", "form"] },
  radio: { component: "RadioField", file: "RadioField.tsx", uiDeps: ["radio-group", "label", "form"] },
  asyncselect: { component: "AsyncSelectField", file: "AsyncSelectField.tsx", uiDeps: ["select", "form"] },
  date: { component: "DateField", file: "DateField.tsx", uiDeps: ["calendar", "popover", "button", "form"] },
  switchgroup: { component: "SwitchGroupField", file: "SwitchGroupField.tsx", uiDeps: ["switch", "label", "form"] },
  infiniteselect: { component: "InfiniteSelectField", file: "InfiniteSelectField.tsx", uiDeps: ["select", "form"] },
  combobox: { component: "ComboboxField", file: "ComboboxField.tsx", uiDeps: ["command", "popover", "button", "form"] },
  checkboxgroup: { component: "CheckboxGroupField", file: "CheckboxGroupField.tsx", uiDeps: ["checkbox", "label", "form"] },
  asynccombobox: { component: "AsyncComboboxField", file: "AsyncComboboxField.tsx", uiDeps: ["command", "popover", "button", "form"] },
  multiselect: { component: "MultiselectField", file: "MultiselectField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
  multicombobox: { component: "MultiComboboxField", file: "MultiComboboxField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
  infinitecombobox: { component: "InfiniteComboboxField", file: "InfiniteComboboxField.tsx", uiDeps: ["command", "popover", "button", "form"] },
  asyncmultiselect: { component: "AsyncMultiSelectField", file: "AsyncMultiSelectField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
  asyncmulticombobox: { component: "AsyncMultiComboboxField", file: "AsyncMultiComboboxField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
  infinitemultiselect: { component: "InfiniteMultiSelectField", file: "InfiniteMultiSelectField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
  infinitemulticombobox: { component: "InfiniteMultiComboboxField", file: "InfiniteMultiComboboxField.tsx", uiDeps: ["command", "popover", "badge", "button", "form"] },
};

/**
 * Compact field-type → component-name lookup used by the trimmed dispatcher
 * and barrel emitters. Same component names as `fieldComponentMap` (kept as a
 * separate constant only because the dispatcher also references `hidden` indirectly).
 */
export const typeToComponent: Record<string, string> = {
  text: 'TextField', email: 'TextField', password: 'TextField',
  tel: 'TextField', url: 'TextField', number: 'TextField',
  textarea: 'TextareaField',
  select: 'SelectField', asyncselect: 'AsyncSelectField', infiniteselect: 'InfiniteSelectField',
  combobox: 'ComboboxField', asynccombobox: 'AsyncComboboxField', infinitecombobox: 'InfiniteComboboxField',
  multiselect: 'MultiselectField', asyncmultiselect: 'AsyncMultiSelectField', infinitemultiselect: 'InfiniteMultiSelectField',
  multicombobox: 'MultiComboboxField', asyncmulticombobox: 'AsyncMultiComboboxField', infinitemulticombobox: 'InfiniteMultiComboboxField',
  radio: 'RadioField', checkbox: 'CheckboxField', checkboxgroup: 'CheckboxGroupField',
  switch: 'SwitchField', switchgroup: 'SwitchGroupField',
  file: 'FileField', date: 'DateField',
  empty: 'EmptyField', preview: 'PreviewField',
};

export function getUsedFieldTypes(config: FormConfig): string[] {
  const types = new Set<string>();
  config.sections.forEach((s: FormConfig["sections"][number]) => s.fields.forEach((f: FormFieldConfig) => types.add(f.type)));
  return Array.from(types);
}

export function getRequiredComponents(config: FormConfig) {
  const types = getUsedFieldTypes(config);
  const components = new Map<string, { component: string; file: string }>();
  const uiDeps = new Set<string>();
  types.forEach(type => {
    const info = fieldComponentMap[type];
    if (info) {
      components.set(info.component, { component: info.component, file: info.file });
      info.uiDeps.forEach(d => uiDeps.add(d));
    }
  });
  return {
    fieldComponents: Array.from(components.values()),
    uiComponents: Array.from(uiDeps),
    coreComponents: ["card", "separator", "button"],
  };
}

export function generateInstallCommand(config: FormConfig): string {
  const { uiComponents, coreComponents } = getRequiredComponents(config);
  const all = [...new Set([...uiComponents, ...coreComponents])].sort();
  return `npm install ${all.map(c => `@radix-ui/react-${c}`).join(" ")}`;
}

/**
 * npm install command for a given form stack. Sourced directly from
 * `formStackInstall` (the registry that the CLI also reads), so adding a
 * runtime dep in `scripts/generate-registry.ts` propagates here automatically.
 */
export function generateNpmInstallCommand(stack: FormStack = "rhf"): string {
  const sorted = [...formStackInstall[stack].npmDependencies].sort();
  return `npm install ${sorted.join(" ")}`;
}

export function generateDevDepsInstallCommand(stack: FormStack = "rhf"): string {
  const fromRegistry = formStackInstall[stack].npmDevDependencies ?? [];
  const universal = ["@types/react", "@types/react-dom", "typescript"];
  const sorted = Array.from(new Set([...fromRegistry, ...universal])).sort();
  return `npm install -D ${sorted.join(" ")}`;
}
