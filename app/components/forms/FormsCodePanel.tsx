"use client";

import { useEffect, useMemo, useState } from "react";

import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";



import type { FormConfig } from "@/forms/types/types";
import { generateAllFiles } from "@/form-builder/utils/formCodeGenerator";
import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";
import { formStackInstall, type ImplementationMode } from "@/registry/formRegistry";

export type FormsCodePanelLibrary = "rhf" | "tanstack" | "action";

type CodePanelFile = {
  name: string;
  path: string;
  code: string;
  isFixed: boolean;
  description: string;
};

/** Universal TypeScript / React types every consumer needs — kept here because
 * they're a property of any TS+React project, not a stack-specific dep. */
const UNIVERSAL_DEV_DEPS = ["typescript", "@types/react", "@types/react-dom"] as const;

/**
 * Per-stack install metadata, derived from `formStackInstall` in the registry
 * (the same single source of truth that the CLI consumes from `forms.json`).
 * Adding a new dep happens once, in `scripts/generate-registry.ts`.
 */
const libraryDeps: Record<
  FormsCodePanelLibrary,
  { deps: string[]; devDeps: string[]; installCmd: string; devInstallCmd: string }
> = (() => {
  const out = {} as Record<
    FormsCodePanelLibrary,
    { deps: string[]; devDeps: string[]; installCmd: string; devInstallCmd: string }
  >;
  for (const stack of ["rhf", "tanstack", "action"] as const) {
    const deps = [...formStackInstall[stack].npmDependencies].sort();
    const devDeps = Array.from(
      new Set([...(formStackInstall[stack].npmDevDependencies ?? []), ...UNIVERSAL_DEV_DEPS]),
    ).sort();
    out[stack] = {
      deps,
      devDeps,
      installCmd: `npm install ${deps.join(" ")}`,
      devInstallCmd: `npm install -D ${devDeps.join(" ")}`,
    };
  }
  return out;
})();

export function FormsCodePanel({
  code,
  config,
  library = "rhf",
  exportedSchemaCode,
  implementationMode = "config",
  transport = DEFAULT_TRANSPORT,
  onTransportChange,
  variant,
}: {
  code: string;
  config: FormConfig;
  exportedSchemaCode: string;
  library?: FormsCodePanelLibrary;
  implementationMode?: ImplementationMode;
  /** Which HTTP client / query strategy the shown code targets (R-56). */
  transport?: TransportChoice;
  /** When passed, the transport axes render as step 1 of the install panel. */
  onTransportChange?: (next: TransportChoice) => void;
  /**
   * Registry slug of the variant on show. Present on the gallery, where the
   * whole bundle is installable — so the command is `add forms/<slug>`, which
   * writes the shared files AND the variant's own. `form init` would be wrong
   * here: it installs only the shared stack, leaving the variant behind.
   */
  variant?: string;
}) {
  void code;
  void exportedSchemaCode;
  const [activeFile, setActiveFile] = useState(0);

  const files = useMemo<CodePanelFile[]>(() => {
    // const variantFiles: CodePanelFile[] = [
    //   {
    //     name: "MyFormPage.tsx",
    //     path: "@/pages/MyFormPage.tsx",
    //     code,
    //     description: "Form page component",
    //     isFixed: false,
    //   },
    //   {
    //     name: "formSchema.ts",
    //     path: "@/forms/formSchema.ts",
    //     code: exportedSchemaCode,
    //     description: "Zod schema",
    //     isFixed: false,
    //   },
    // ];

    const fixedCoreFiles = generateAllFiles(config, "compile-time", { library, implementationMode, transport });

    // const allFiles = [...variantFiles, ...fixedCoreFiles];

    const seen = new Set<string>();
    // return allFiles.filter((file) => {
    return fixedCoreFiles.filter((file) => {
      const key = `${file.path}:${file.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [config, library, implementationMode, transport]);

  useEffect(() => {
    setActiveFile((i) => (files.length === 0 ? 0 : Math.min(i, files.length - 1)));
  }, [files]);

  const libInfo = libraryDeps[library];
  const safeIndex =
    files.length === 0 ? 0 : Math.min(Math.max(0, activeFile), files.length - 1);
  const current = files[safeIndex];

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No files to show.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Same two panels as every builder Export tab and every other variant
          gallery — this panel used to render its own dependency header, its own
          CLI hint and its own file browser, all worded differently. */}
      <BuilderInstallPanel
        subject="form"
        transport={
          onTransportChange
            ? {
                value: transport,
                onChange: onTransportChange,
                idPrefix: `forms-${library}-transport`,
              }
            : undefined
        }
        idPrefix={`forms-code-${library}`}
        generatedCount={files.filter((f) => !f.isFixed).length}
        sharedCount={files.filter((f) => f.isFixed).length}
        runtimeCommand={libInfo.installCmd}
        devCommand={libInfo.devDeps.length > 0 ? libInfo.devInstallCmd : undefined}
        cliScope={
          variant
            ? {
                commandId: "add",
                lockCommand: true,
                lockArgs: true,
                args: [`forms/${variant}`],
                flags: {
                  stack: library,
                  axios: transport.http === "axios",
                  tanstackQuery: transport.query === "tanstack",
                },
              }
            : { commandId: "form-init", lockCommand: true, lockArgs: true, flags: { stack: library } }
        }
      />

      <BuilderFilesPanel
        subject="form"
        files={files}
        activeFile={current.name}
        onActiveFileChange={(name) => {
          const index = files.findIndex((file) => file.name === name);
          if (index >= 0) setActiveFile(index);
        }}
      />
    </div>
  );
}
