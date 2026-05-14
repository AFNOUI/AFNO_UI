import type { FormConfig, FormFieldConfig } from "@/forms/types/types";

import { fieldComponentMap, typeToComponent } from "./fieldRegistry";

/** Serialize a field config object as a TypeScript object literal */
export function serializeConfig(field: FormFieldConfig, indent: number): string {
  // Build a clean config with only meaningful properties
  const clean: Record<string, unknown> = {};
  const skip = new Set(['excludeFromSubmit']);

  for (const [key, value] of Object.entries(field)) {
    if (skip.has(key)) continue;
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    clean[key] = value;
  }

  const json = JSON.stringify(clean, null, 2);
  // Indent each line
  const pad = ' '.repeat(indent);
  return json.split('\n').map((line, i) => i === 0 ? line : pad + line).join('\n');
}

/** Get the component name for a field type */
export function getComponentForType(type: string): string {
  return fieldComponentMap[type]?.component ?? 'TextField';
}

/** Collect unique field component imports needed */
export function getFieldImports(config: FormConfig): { component: string; file: string }[] {
  const map = new Map<string, string>();
  for (const section of config.sections) {
    for (const field of section.fields) {
      const comp = getComponentForType(field.type);
      if (!map.has(comp)) {
        map.set(comp, fieldComponentMap[field.type]?.file ?? `${comp}.tsx`);
      }
    }
  }
  return Array.from(map.entries()).map(([component, file]) => ({ component, file }));
}

/** Build default values object from config */
export function buildDefaultValues(config: FormConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === 'empty' || field.type === 'preview') continue;
      if (field.type === 'checkbox' || field.type === 'switch') {
        defaults[field.name] = field.defaultValue ?? false;
      } else if (field.type === 'checkboxgroup' || field.type === 'multiselect' || field.type === 'multicombobox' ||
                 field.type === 'asyncmultiselect' || field.type === 'asyncmulticombobox' ||
                 field.type === 'infinitemultiselect' || field.type === 'infinitemulticombobox' ||
                 field.type === 'switchgroup') {
        defaults[field.name] = field.defaultValue ?? [];
      } else {
        defaults[field.name] = field.defaultValue ?? '';
      }
    }
  }
  return defaults;
}

/** Names stripped before `formService.submitForm` in generated static pages (matches runtime hooks). */
export function buildSubmitExcludedSetLiteral(config: FormConfig): string {
  const names: string[] = [];
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.excludeFromSubmit || field.type === "empty" || field.type === "preview") {
        names.push(field.name);
      }
    }
  }
  if (names.length === 0) return "new Set<string>()";
  return `new Set<string>([${names.map((n) => JSON.stringify(n)).join(", ")}])`;
}

/** Generate section fields JSX */
export function generateSectionFieldsJSX(section: FormConfig['sections'][0], indent: number): string {
  const pad = ' '.repeat(indent);
  const lines: string[] = [];

  for (const field of section.fields) {
    const comp = getComponentForType(field.type);
    const configStr = serializeConfig(field, indent + 2);
    const colStyle = field.colSpan && field.colSpan > 1
      ? ` style={{ gridColumn: "span ${field.colSpan}" }}`
      : '';

    if (colStyle) {
      lines.push(`${pad}<div${colStyle}>`);
      lines.push(`${pad}  <${comp} config={${configStr}} />`);
      lines.push(`${pad}</div>`);
    } else {
      lines.push(`${pad}<${comp} config={${configStr}} />`);
    }
  }

  return lines.join('\n');
}

/** Generate a trimmed fields/index.ts barrel that only exports used components */
export function generateTrimmedFieldsIndex(usedTypes: string[]): string {
  const components = new Set<string>();
  usedTypes.forEach(t => { const c = typeToComponent[t]; if (c) components.add(c); });
  return Array.from(components)
    .map(c => `export { ${c} } from "./${c}";`)
    .join('\n') + '\n';
}
