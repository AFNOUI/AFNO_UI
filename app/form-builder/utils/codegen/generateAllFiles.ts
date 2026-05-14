import { getFieldFile, getRequiredFixedFiles } from "@/registry/formRegistry";
import { FormConfig } from "@/forms/types/types";
import { extractFields, generateZodSchemaCode } from "@/forms/utils/zodSchemaBuilder";

import { generatePageComponentCode } from "./configPageEmitter";
import { generateTrimmedDispatcher } from "./dispatchers";
import { getRequiredComponents, getUsedFieldTypes } from "./fieldRegistry";
import { generateFormConfigCode } from "./formConfigEmitter";
import { generateFormServiceCode } from "./formService";
import { generateHydrationHookCode } from "./hydration";
import { applyImportStyle, ImportStyle } from "./importAliases";
import { generateTrimmedFieldsIndex } from "./sectionRendering";
import type { FormLibrary, GeneratedFile, ImplementationMode, SchemaMode } from "./types";

/** Files that are NOT needed in static mode */
const configOnlyFileNames = new Set([
  'ReactHookForm.tsx', 'TanstackForm.tsx', 'ActionForm.tsx',
  'ReactHookFormField.tsx', 'TanstackFormField.tsx', 'ActionFormField.tsx',
  'fields/index.ts', 'index.ts',
  'useReactHookForm.ts', 'useTanstackForm.ts', 'useActionForm.ts',
]);

/** All fields can be hydrated */
export function getHydratableFields(config: FormConfig) {
  return extractFields(config);
}

/**
 * Generate all files needed to run a form.
 * Fixed files use exact copies from the registry (actual source code).
 * Dispatcher and barrel files are generated with only the used imports.
 */
export function generateAllFiles(
  config: FormConfig,
  schemaMode: SchemaMode,
  hydratedFieldNames: string[] = [],
  library: FormLibrary = 'rhf',
  implementationMode: ImplementationMode = 'config',
  importStyle: ImportStyle = "relative",
): GeneratedFile[] {
  const usedTypes = getUsedFieldTypes(config);
  const isStatic = implementationMode === 'static';

  // Dispatcher/barrel file names per library
  const dispatcherNames: Record<FormLibrary, string> = {
    rhf: 'ReactHookFormField.tsx',
    tanstack: 'TanstackFormField.tsx',
    action: 'ActionFormField.tsx',
  };
  const barrelName = 'fields/index.ts';
  const dispatcherName = dispatcherNames[library];

  // ─── Variant-specific files (generated per form) ───
  const files: GeneratedFile[] = [
    {
      name: "MyFormPage.tsx",
      path: "pages/MyFormPage.tsx",
      code: generatePageComponentCode(
        config,
        schemaMode,
        hydratedFieldNames,
        library,
        implementationMode,
        importStyle,
        "pages/MyFormPage.tsx",
      ),
      language: "tsx",
      description: isStatic
        ? "Standalone page with fields directly in JSX — no JSON config or runtime renderer needed."
        : "Page component. " +
          (schemaMode === 'runtime' ? "Builds schema at runtime using buildZodSchema()." : "Uses pre-compiled formSchema.") +
          (hydratedFieldNames.length > 0 ? " Hydrates config via useFormHydration + applyHydration()." : ""),
      isFixed: false,
    },
  ];

  // Config file only in config mode
  if (!isStatic) {
    files.unshift({
      name: "formConfig.ts",
      path: "forms/formConfig.ts",
      code: applyImportStyle(generateFormConfigCode(config), "forms/formConfig.ts", importStyle),
      language: "typescript",
      description: "Your form's JSON configuration — defines structure, fields, validation, and layout.",
      isFixed: false,
    });
  }

  // Static mode always needs compile-time schema; config mode only when selected
  if (isStatic || schemaMode === 'compile-time') {
    const allFields = extractFields(config);
    files.push({
      name: "formSchema.ts",
      path: "forms/formSchema.ts",
      code: applyImportStyle(generateZodSchemaCode(allFields), "forms/formSchema.ts", importStyle),
      language: "typescript",
      description: "Pre-compiled Zod schema with full TypeScript type inference.",
      isFixed: false,
    });
  }

  // Hydration only in config mode
  if (!isStatic && hydratedFieldNames.length > 0) {
    files.push({
      name: "useFormHydration.ts",
      path: "forms/useFormHydration.ts",
      code: applyImportStyle(generateHydrationHookCode(hydratedFieldNames, config), "forms/useFormHydration.ts", importStyle),
      language: "typescript",
      description: `Custom hook that fetches data for ${hydratedFieldNames.length} field(s) from your backend API.`,
      isFixed: false,
    });
  }

  files.push({
    name: "formService.ts",
    path: "forms/formService.ts",
    code: applyImportStyle(generateFormServiceCode(), "forms/formService.ts", importStyle),
    language: "typescript",
    description: "Service layer for form API operations. Throws BackendErrorResponse on validation errors.",
    isFixed: false,
  });

  // ─── Fixed files from registry (library-aware) ───
  const allFixed = getRequiredFixedFiles(usedTypes, library);
  const useHydration = !isStatic && hydratedFieldNames.length > 0;

  for (const regFile of allFixed) {
    // Skip hydration if not used
    if (regFile.name === 'hydration.ts' && !useHydration) continue;
    // Skip zodSchemaBuilder in compile-time or static mode (both use pre-compiled schema)
    if (regFile.name === 'zodSchemaBuilder.ts' && (schemaMode === 'compile-time' || isStatic)) continue;
    // In static mode, skip config-driven stack files (dispatcher, barrel, hooks)
    if (isStatic && configOnlyFileNames.has(regFile.name)) continue;

    // Replace dispatcher with trimmed version (config mode only)
    if (!isStatic && regFile.name === dispatcherName) {
      files.push({
        name: regFile.name,
        path: regFile.path,
        code: generateTrimmedDispatcher(usedTypes, library),
        language: regFile.language,
        description: regFile.description + ' (trimmed to used fields only)',
        isFixed: true,
      });
      continue;
    }

    // Replace barrel with trimmed version (config mode only)
    if (!isStatic && regFile.name === barrelName) {
      files.push({
        name: regFile.name,
        path: regFile.path,
        code: generateTrimmedFieldsIndex(usedTypes),
        language: regFile.language,
        description: regFile.description + ' (trimmed to used fields only)',
        isFixed: true,
      });
      continue;
    }

    files.push({
      name: regFile.name,
      path: regFile.path,
      code: regFile.code,
      language: regFile.language,
      description: regFile.description,
      isFixed: true,
    });
  }

  // ─── Field component files (per used field type) ───
  // Without this, the /forms variant gallery (which renders whatever this fn
  // returns) silently dropped TextField.tsx / SelectField.tsx / DateField.tsx /
  // … from the displayed file list — only the engine + variant files showed up.
  // Field components are also "fixed" (sourced verbatim from the registry) and
  // are required at install time, so they belong here alongside the engine.
  // De-duplicated against `files` already emitted to keep tab keys unique.
  const seenPaths = new Set(files.map((f) => `${f.path}:${f.name}`));
  const { fieldComponents } = getRequiredComponents(config);
  for (const comp of fieldComponents) {
    const reg = getFieldFile(comp.file, library);
    if (!reg) continue;
    const key = `${reg.path}:${reg.name}`;
    if (seenPaths.has(key)) continue;
    seenPaths.add(key);
    files.push({
      name: reg.name,
      path: reg.path,
      code: reg.code,
      language: reg.language,
      description: reg.description,
      isFixed: true,
    });
  }

  return files;
}
