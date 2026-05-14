import { typeToComponent } from "../fieldRegistry";
import type { FormLibrary } from "../types";

import { STACK_DISPATCHER_PIECES } from "./stackPieces";

/**
 * Generate a trimmed dispatcher file (`ReactHookFormField.tsx` / `TanstackFormField.tsx` /
 * `ActionFormField.tsx`) that only imports the field components actually used by the form.
 *
 * The output is identical to the per-stack source files shipped in the registry except:
 *   - the field-component import list is the *intersection* of `usedTypes` (smaller bundle), and
 *   - the `switch` body lists only those used cases (plus a `default: return null;`).
 *
 * Per-stack pieces (context import / function signature / watch+dep effects / clear effect)
 * live in `./stackPieces.ts` so this orchestrator stays focused on the trimming logic.
 */
export function generateTrimmedDispatcher(usedTypes: string[], library: FormLibrary): string {
  const components = new Set<string>();
  usedTypes.forEach(t => { const c = typeToComponent[t]; if (c) components.add(c); });
  const importList = Array.from(components).join(', ');

  const lc = STACK_DISPATCHER_PIECES[library];

  const switchCases: string[] = [];
  const textTypes = ['text', 'email', 'password', 'tel', 'url', 'number'].filter(t => usedTypes.includes(t));
  if (textTypes.length > 0) {
    switchCases.push(`    case ${textTypes.map(t => `"${t}"`).join(': case ')}:\n      return <TextField config={resolvedConfig} />;`);
  }
  const otherTypes = usedTypes.filter(t => !['text', 'email', 'password', 'tel', 'url', 'number', 'hidden'].includes(t));
  otherTypes.forEach(t => {
    const c = typeToComponent[t];
    if (c) switchCases.push(`    case "${t}": return <${c} config={resolvedConfig} />;`);
  });
  if (usedTypes.includes('hidden')) switchCases.push(`    case "hidden": return null;`);
  switchCases.push(`    default: return null;`);

  const clearEffect = library === 'rhf'
    ? `  useEffect(() => {
    if (!visible && config.condition) {
${lc.clearEffect}
    }
  }, [visible]);`
    : `  useEffect(() => {
    if (!visible && config.condition) {
${lc.clearEffect}
    }
  }, [visible, config.condition, config.defaultValue, config.name${library === 'tanstack' ? ', form' : ', setValue'}]);`;

  return `import { useEffect, useMemo } from "react";
${lc.contextImport}
${lc.typesImport}
import { resetFieldValueForConfig, resolveWatchPopulateValue } from "../utils/watchPopulate";
import {
  ${importList},
} from "./fields";

function hasOptions(config: FormFieldConfig): config is OptionFieldConfig {
  return "options" in config;
}

function hasDependentApiConfig(
  config: FormFieldConfig,
): config is DependentApiFieldConfig {
  return config.type.startsWith("async") || config.type.startsWith("infinite");
}

function hasWatchValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value) !== "";
}

${lc.funcSignature}

${lc.watchSetup}

${lc.watchEffect}

${lc.depEffect}

${lc.depApiEffect}

  const resolvedConfig = useMemo((): FormFieldConfig => {
    let cfg = config;
    if (cfg.dependentOptions && depValue) {
      const matchedOptions: FieldOption[] =
        cfg.dependentOptions.optionsMap[String(depValue)] || [];
      if (hasOptions(cfg)) cfg = { ...cfg, options: matchedOptions };
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

${clearEffect}

  if (!visible) return null;

  switch (resolvedConfig.type) {
${switchCases.join('\n')}
  }
}
`;
}
