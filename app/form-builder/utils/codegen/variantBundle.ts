import type { FormConfig } from "@/forms/types/types";

import { generateAllFiles } from "./generateAllFiles";
import type { FormLibrary, FormVariantStackFile } from "./types";

/** `forms-contact` → `ContactForm`, `forms-job-application` → `JobApplicationForm` */
export function variantPageComponentName(variantSlug: string): string {
  const withoutPrefix = variantSlug.replace(/^forms-/, "");
  const parts = withoutPrefix.split(/[-_/]/).filter(Boolean);
  const pascal = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
  return `${pascal}Form`;
}

/**
 * Map `@/…` imports to paths relative to `forms/<variantSlug>/` (two levels below project root).
 */
export function rewriteVariantBundleSourceImports(source: string): string {
  let out = source;
  // Paths align with `form init` / forms.json: hooks + utils live under components/forms/, types in types/types.ts.
  const specific: Array<{ pattern: RegExp; to: string }> = [
    { pattern: /from "@\/components\/forms\/react-hook-form"/g, to: 'from "../../components/forms/react-hook-form"' },
    { pattern: /from "@\/components\/forms\/tanstack-forms"/g, to: 'from "../../components/forms/tanstack-forms"' },
    { pattern: /from "@\/components\/forms\/action-forms"/g, to: 'from "../../components/forms/action-forms"' },
    { pattern: /from "@\/hooks\/useBackendErrors"/g, to: 'from "../../components/forms/hooks/useBackendErrors"' },
    { pattern: /from "@\/hooks\/useInfiniteOptions"/g, to: 'from "../../components/forms/hooks/useInfiniteOptions"' },
    { pattern: /from "@\/components\/forms\/types"/g, to: 'from "../../components/forms/types/types"' },
    { pattern: /from "@\/components\/forms\/hydration"/g, to: 'from "../../components/forms/types/hydration"' },
    { pattern: /from "@\/utils\/zodSchemaBuilder"/g, to: 'from "../../components/forms/utils/zodSchemaBuilder"' },
  ];
  for (const { pattern, to } of specific) {
    out = out.replace(pattern, to);
  }
  const broad: Array<{ pattern: RegExp; to: string }> = [
    { pattern: /from "@\/components\//g, to: 'from "../../components/' },
    { pattern: /from "@\/hooks\//g, to: 'from "../../hooks/' },
    { pattern: /from "@\/lib\//g, to: 'from "../../lib/' },
    { pattern: /from "@\/utils\//g, to: 'from "../../utils/' },
  ];
  for (const { pattern, to } of broad) {
    out = out.replace(pattern, to);
  }
  // Defensive cleanup in case any malformed relative specifier was produced.
  out = out
    .replace(/from "\.\.components\//g, 'from "../components/')
    .replace(/from '\.\.components\//g, "from '../components/")
    .replace(/import\("\.\.components\//g, 'import("../components/')
    .replace(/import\('\.\.components\//g, "import('../components/");
  return out;
}

/**
 * Files the CLI installs for a form variant (stack-specific). Only non-fixed outputs from
 * {@link generateAllFiles}; paths are `forms/<slug>/…` with relative imports for consumer apps.
 */
export function buildFormVariantStackFiles(
  config: FormConfig,
  library: FormLibrary,
  variantSlug: string,
): FormVariantStackFile[] {
  const pageComponent = variantPageComponentName(variantSlug);
  const pageFileName = `${pageComponent}.tsx`;
  const rootPrefix = `forms/${variantSlug}`;

  const bundle = generateAllFiles(config, "compile-time", [], library, "config", "alias").filter((f) => !f.isFixed);

  return bundle.map((file) => {
    let diskRel = file.path.replace(/^forms\//, "");
    if (file.name === "MyFormPage.tsx") {
      diskRel = pageFileName;
    }
    const outPath = `${rootPrefix}/${diskRel}`;

    let code = file.code;
    if (file.name === "MyFormPage.tsx") {
      code = code.replace(/\bfunction MyFormPage\b/g, `function ${pageComponent}`);
    }
    code = rewriteVariantBundleSourceImports(code);
    return { path: outPath, content: code };
  });
}
