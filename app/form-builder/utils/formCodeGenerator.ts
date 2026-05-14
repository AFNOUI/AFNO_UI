/**
 * Public re-export surface for the form code-generator. The implementation lives in
 * `./codegen/*` — split per stack and per concern — so this file stays a thin orchestrator
 * preserving every existing import path.
 *
 * If you're adding a new helper, put it in the matching `codegen/` file and re-export it
 * here only when external callers need it.
 */
export {
  // Field registry
  fieldComponentMap,
  generateDevDepsInstallCommand,
  generateInstallCommand,
  generateNpmInstallCommand,
  getRequiredComponents,
  getUsedFieldTypes,
  typeToComponent,
  // Standalone emitters
  generateFormConfigCode,
  generateFormServiceCode,
  generateHydrationHookCode,
  // Page emitters
  generatePageComponentCode,
  generateStaticPageCode,
  generateAllFiles,
  getHydratableFields,
  // Import-path rewriter
  applyImportStyle,
  // CLI variant bundle
  buildFormVariantStackFiles,
  rewriteVariantBundleSourceImports,
  variantPageComponentName,
  // Runtime dispatcher emitter (per stack)
  generateTrimmedDispatcher,
  // Static-page section helpers (still used by some callers/tests)
  buildDefaultValues,
  buildSubmitExcludedSetLiteral,
  generateSectionFieldsJSX,
  generateTrimmedFieldsIndex,
  getComponentForType,
  getFieldImports,
  serializeConfig,
} from "./codegen";

export type {
  FormLibrary,
  FormVariantStackFile,
  GeneratedFile,
  ImplementationMode,
  ImportStyle,
  SchemaMode,
} from "./codegen";
