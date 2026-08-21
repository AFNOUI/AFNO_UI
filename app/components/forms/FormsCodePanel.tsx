"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Braces } from "lucide-react";

import { cn } from "@/lib/utils";
import { BuilderFilesPanel, BuilderInstallPanel, type ConfigStep } from "@/components/shared/builder-export";



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

const libraryLabels: Record<FormsCodePanelLibrary, string> = {
  rhf: "React Hook Form",
  action: "useActionState",
  tanstack: "TanStack Form",
};

const implementationModeLabels: Record<ImplementationMode, string> = {
  config: "JSON Config",
  static: "Static JSX",
};

/** The segmented-pill look every stack/mode picker on the forms pages shares. */
function SegmentedPicker<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border w-fit">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
            value === opt
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function FormsCodePanel({
  code,
  config,
  library = "rhf",
  exportedSchemaCode,
  implementationMode = "config",
  transport = DEFAULT_TRANSPORT,
  onTransportChange,
  onLibraryChange,
  onImplementationModeChange,
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
  /** When passed, the form-stack picker renders as its own config step. */
  onLibraryChange?: (next: FormsCodePanelLibrary) => void;
  /** When passed, the JSON-Config/Static-JSX picker renders as its own config step. */
  onImplementationModeChange?: (next: ImplementationMode) => void;
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

  // Config steps come first in the panel, ahead of transport/CLI/packages —
  // choosing *what* is being generated (stack, implementation style) precedes
  // choosing *how it talks to a backend*. `--static` is an `add`-only flag, so
  // the implementation-mode step only makes sense once a variant is on show.
  const configSteps: ConfigStep[] = [
    ...(onLibraryChange
      ? [
          {
            id: "library",
            icon: Layers,
            title: "Form stack",
            hint: "Which form library the generated fields are wired to. Changes the code below and the live preview above.",
            content: (
              <SegmentedPicker
                value={library}
                options={["rhf", "action", "tanstack"] as const}
                labels={libraryLabels}
                onChange={onLibraryChange}
              />
            ),
          },
        ]
      : []),
    ...(onImplementationModeChange && variant
      ? [
          {
            id: "implementation-mode",
            icon: Braces,
            title: "Implementation mode",
            hint: "JSON Config reads a formConfig.ts at runtime through a generic renderer. Static JSX hand-unrolls each field instead — no formConfig.ts, no runtime dispatcher.",
            content: (
              <SegmentedPicker
                value={implementationMode}
                options={["config", "static"] as const}
                labels={implementationModeLabels}
                onChange={onImplementationModeChange}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Same two panels as every builder Export tab and every other variant
          gallery — this panel used to render its own dependency header, its own
          CLI hint and its own file browser, all worded differently. */}
      <BuilderInstallPanel
        subject="form"
        configSteps={configSteps.length > 0 ? configSteps : undefined}
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
                  static: implementationMode === "static",
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
