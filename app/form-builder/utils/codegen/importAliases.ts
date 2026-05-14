import path from "path";

export type ImportStyle = "relative" | "alias";

const GENERATED_IMPORT_ALIAS_TO_PROJECT_PATH: Array<{ alias: string; projectPath: string }> = [
  { alias: "@/components/forms/react-hook-form", projectPath: "components/forms/react-hook-form" },
  { alias: "@/components/forms/tanstack-forms", projectPath: "components/forms/tanstack-forms" },
  { alias: "@/components/forms/action-forms", projectPath: "components/forms/action-forms" },
  { alias: "@/components/forms/types", projectPath: "components/forms/types/types" },
  { alias: "@/components/forms/hydration", projectPath: "components/forms/types/hydration" },
  { alias: "@/hooks/useBackendErrors", projectPath: "components/forms/hooks/useBackendErrors" },
  { alias: "@/hooks/useInfiniteOptions", projectPath: "components/forms/hooks/useInfiniteOptions" },
  { alias: "@/utils/zodSchemaBuilder", projectPath: "components/forms/utils/zodSchemaBuilder" },
  { alias: "@/components/", projectPath: "components/" },
  { alias: "@/hooks/", projectPath: "hooks/" },
  { alias: "@/lib/", projectPath: "lib/" },
  { alias: "@/utils/", projectPath: "utils/" },
];

function normalizeImportTarget(projectPath: string): string {
  return projectPath.replace(/\\/g, "/").replace(/\/+$/, "");
}

function resolveGeneratedAliasSpecifier(spec: string): string | null {
  for (const rule of GENERATED_IMPORT_ALIAS_TO_PROJECT_PATH) {
    if (spec === rule.alias) {
      return normalizeImportTarget(rule.projectPath);
    }
    if (rule.alias.endsWith("/") && spec.startsWith(rule.alias)) {
      const rest = spec.slice(rule.alias.length);
      return normalizeImportTarget(`${rule.projectPath}${rest}`);
    }
  }
  return null;
}

function toRelativeImportSpecifier(fromFilePath: string, toProjectPath: string): string {
  const fromDir = path.posix.dirname(fromFilePath.replace(/\\/g, "/"));
  const target = toProjectPath.replace(/\\/g, "/");
  let rel = path.posix.relative(fromDir, target);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  // Guard against malformed segments like "..components/..." from any upstream transform.
  rel = rel.replace(/(^|\/)\.\.(?=[^/])/g, "$1../");
  return rel
    .replace(/\.tsx$/i, "")
    .replace(/\.ts$/i, "")
    .replace(/\.jsx$/i, "")
    .replace(/\.js$/i, "");
}

function rewriteGeneratedAliasesToRelative(content: string, outputPath: string): string {
  const fromFile = outputPath.replace(/\\/g, "/");
  const replaceOne = (q: string, spec: string): string => {
    const target = resolveGeneratedAliasSpecifier(spec);
    if (!target) return `${q}${spec}${q}`;
    return `${q}${toRelativeImportSpecifier(fromFile, target)}${q}`;
  };

  let out = content.replace(/(["'])(@\/[^"']+)\1/g, (_m, q: string, spec: string) => replaceOne(q, spec));

  out = out.replace(/import\(\s*(["'])(@\/[^"']+)\1\s*\)/g, (_m, q: string, spec: string) => {
    const target = resolveGeneratedAliasSpecifier(spec);
    if (!target) return _m;
    return `import(${q}${toRelativeImportSpecifier(fromFile, target)}${q})`;
  });

  return out;
}

export function applyImportStyle(content: string, outputPath: string, importStyle: ImportStyle): string {
  return importStyle === "relative" ? rewriteGeneratedAliasesToRelative(content, outputPath) : content;
}
