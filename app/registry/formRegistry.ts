/**
 * Form registry facade backed by `formRegistryGenerated.ts`.
 * This adapts generated snapshots to the Vite-style API shape expected by form codegen.
 */

import {
  generatedFieldFiles,
  generatedFixedFiles,
  formRegistryGeneratedAt,
  formStackInstall,
  generatedActionFieldFiles,
  generatedActionFixedFiles,
  generatedTanstackFieldFiles,
  generatedTanstackFixedFiles,
} from "./formRegistryGenerated";
import type {
  FormStackInstallSpec,
  RegistryFile as GeneratedRegistryFile,
} from "./formRegistryGenerated";

/** Re-export so callers consume install metadata via the facade only. */
export { formStackInstall };
export type { FormStackInstallSpec };

export type ImplementationMode = "config" | "static";
export type FormLibrary = "rhf" | "tanstack" | "action";

export interface RegistryFile {
  name: string;
  path: string;
  code: string;
  language: "typescript" | "tsx";
  description: string;
  isFixed: boolean;
  category: "core" | "hook" | "util" | "field";
}

function cloneWith(f: GeneratedRegistryFile, patch: Partial<RegistryFile>): RegistryFile {
  return {
    name: patch.name ?? f.name,
    path: patch.path ?? f.path,
    code: patch.code ?? f.code,
    language: patch.language ?? f.language,
    description: patch.description ?? f.description,
    isFixed: patch.isFixed ?? f.isFixed,
    category: patch.category ?? f.category,
  };
}

function mapFixedFile(file: GeneratedRegistryFile, library: FormLibrary): RegistryFile {
  const name = file.name;

  if (name === "types.ts") return cloneWith(file, { path: "components/forms/types.ts" });
  if (name === "hydration.ts") return cloneWith(file, { path: "components/forms/hydration.ts" });
  if (name === "useBackendErrors.ts") return cloneWith(file, { path: "hooks/useBackendErrors.ts" });
  if (name === "useInfiniteOptions.ts") return cloneWith(file, { path: "hooks/useInfiniteOptions.ts" });
  if (name === "zodSchemaBuilder.ts") return cloneWith(file, { path: "utils/zodSchemaBuilder.ts" });

  if (library === "rhf") {
    if (name === "ReactHookForm.tsx") {
      return cloneWith(file, { path: "components/forms/react-hook-form/ReactHookForm.tsx" });
    }
    if (name === "ReactHookFormField.tsx") {
      return cloneWith(file, { path: "components/forms/react-hook-form/ReactHookFormField.tsx" });
    }
    if (name === "useReactHookForm.ts") {
      return cloneWith(file, { path: "components/forms/react-hook-form/useReactHookForm.ts" });
    }
    if (name === "react-hook-form/index.ts") {
      return cloneWith(file, { name: "index.ts", path: "components/forms/react-hook-form/index.ts" });
    }
    if (name === "fields/index.ts" && file.path.includes("/react-hook-form/fields/")) {
      return cloneWith(file, { path: "components/forms/react-hook-form/fields/index.ts" });
    }
  }

  if (library === "tanstack") {
    if (name === "TanstackForm.tsx") {
      return cloneWith(file, { path: "components/forms/tanstack-forms/TanstackForm.tsx" });
    }
    if (name === "TanstackFormField.tsx") {
      return cloneWith(file, { path: "components/forms/tanstack-forms/TanstackFormField.tsx" });
    }
    if (name === "TanstackFormContext.tsx") {
      return cloneWith(file, { path: "components/forms/tanstack-forms/TanstackFormContext.tsx" });
    }
    if (name === "tanstack-forms/index.ts") {
      return cloneWith(file, { name: "index.ts", path: "components/forms/tanstack-forms/index.ts" });
    }
    if (name === "fields/index.ts" && file.path.includes("/tanstack-forms/fields/")) {
      return cloneWith(file, { path: "components/forms/tanstack-forms/fields/index.ts" });
    }
    if (name === "useTanstackForm.ts") {
      return cloneWith(file, { path: "components/forms/tanstack-forms/useTanstackForm.ts" });
    }
  }

  if (name === "form.tsx") {
    return cloneWith(file, { path: "components/ui/form.tsx" });
  }
  if (name === "form-primitives.tsx") {
    return cloneWith(file, { path: "components/ui/form-primitives.tsx" });
  }

  if (library === "action") {
    if (name === "ActionForm.tsx") {
      return cloneWith(file, { path: "components/forms/action-forms/ActionForm.tsx" });
    }
    if (name === "ActionFormField.tsx") {
      return cloneWith(file, { path: "components/forms/action-forms/ActionFormField.tsx" });
    }
    if (name === "ActionFormContext.tsx") {
      return cloneWith(file, { path: "components/forms/action-forms/ActionFormContext.tsx" });
    }
    if (name === "fields/index.ts" && file.path.includes("/action-forms/fields/")) {
      return cloneWith(file, { path: "components/forms/action-forms/fields/index.ts" });
    }
    if (name === "action-forms/index.ts") {
      return cloneWith(file, { name: "index.ts", path: "components/forms/action-forms/index.ts" });
    }
    if (name === "useActionForm.ts") {
      return cloneWith(file, { path: "components/forms/action-forms/useActionForm.ts" });
    }
  }

  return cloneWith(file, {});
}

function mapFieldFile(file: GeneratedRegistryFile, library: FormLibrary): RegistryFile {
  const base =
    library === "rhf"
      ? "components/forms/react-hook-form/fields"
      : library === "tanstack"
        ? "components/forms/tanstack-forms/fields"
        : "components/forms/action-forms/fields";
  return cloneWith(file, { path: `${base}/${file.name}` });
}

export const fixedFiles: RegistryFile[] = generatedFixedFiles.map((f) => mapFixedFile(f, "rhf"));
export const tanstackFixedFiles: RegistryFile[] = generatedTanstackFixedFiles.map((f) => mapFixedFile(f, "tanstack"));
export const actionFixedFiles: RegistryFile[] = generatedActionFixedFiles.map((f) => mapFixedFile(f, "action"));

export const fieldFiles: Record<string, RegistryFile> = Object.fromEntries(
  Object.entries(generatedFieldFiles).map(([k, f]) => [k, mapFieldFile(f, "rhf")]),
);
export const tanstackFieldFiles: Record<string, RegistryFile> = Object.fromEntries(
  Object.entries(generatedTanstackFieldFiles).map(([k, f]) => [k, mapFieldFile(f, "tanstack")]),
);
export const actionFieldFiles: Record<string, RegistryFile> = Object.fromEntries(
  Object.entries(generatedActionFieldFiles).map(([k, f]) => [k, mapFieldFile(f, "action")]),
);

/** Get all fixed files for a given library */
export function getFixedFiles(library: FormLibrary = "rhf"): RegistryFile[] {
  if (library === "tanstack") return tanstackFixedFiles;
  if (library === "action") return actionFixedFiles;
  return fixedFiles;
}

/** Get all field files for a given library */
export function getFieldFiles(library: FormLibrary = "rhf"): Record<string, RegistryFile> {
  if (library === "tanstack") return tanstackFieldFiles;
  if (library === "action") return actionFieldFiles;
  return fieldFiles;
}

/** Get all field files */
export function getAllFieldFiles(library: FormLibrary = "rhf"): RegistryFile[] {
  return Object.values(getFieldFiles(library));
}

/** Get field file by filename */
export function getFieldFile(filename: string, library: FormLibrary = "rhf"): RegistryFile | undefined {
  return getFieldFiles(library)[filename];
}

/** Get only the fixed files needed based on which field types are used */
export function getRequiredFixedFiles(usedFieldTypes: string[], library: FormLibrary = "rhf"): RegistryFile[] {
  const hasAsync = usedFieldTypes.some((t) => t.startsWith("async"));
  const hasInfinite = usedFieldTypes.some((t) => t.startsWith("infinite"));
  const needsInfiniteHook = hasAsync || hasInfinite;
  const source = getFixedFiles(library);

  return source.filter((f) => {
    if (f.name === "useInfiniteOptions.ts") return needsInfiniteHook;
    return true;
  });
}

function pick(f: RegistryFile) {
  return { name: f.name, path: f.path, code: f.code, description: f.description };
}

/** Get the complete registry as a JSON-serializable object */
export function getFullRegistry() {
  return {
    generatedAt: formRegistryGeneratedAt,
    fixed: {
      rhf: {
        core: fixedFiles.filter((f) => f.category === "core").map(pick),
        hooks: fixedFiles.filter((f) => f.category === "hook").map(pick),
        utils: fixedFiles.filter((f) => f.category === "util").map(pick),
      },
      tanstack: {
        core: tanstackFixedFiles.filter((f) => f.category === "core").map(pick),
        hooks: tanstackFixedFiles.filter((f) => f.category === "hook").map(pick),
        utils: tanstackFixedFiles.filter((f) => f.category === "util").map(pick),
      },
      action: {
        core: actionFixedFiles.filter((f) => f.category === "core").map(pick),
        hooks: actionFixedFiles.filter((f) => f.category === "hook").map(pick),
        utils: actionFixedFiles.filter((f) => f.category === "util").map(pick),
      },
    },
    fields: {
      rhf: Object.fromEntries(Object.entries(fieldFiles).map(([key, f]) => [key, pick(f)])),
      action: Object.fromEntries(Object.entries(actionFieldFiles).map(([key, f]) => [key, pick(f)])),
      tanstack: Object.fromEntries(Object.entries(tanstackFieldFiles).map(([key, f]) => [key, pick(f)])),
    },
  };
}
