"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import type { FormConfig } from "@/forms/types/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formStackInstall, type ImplementationMode } from "@/registry/formRegistry";
import { generateAllFiles } from "@/form-builder/utils/formCodeGenerator";

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

function stackFormInitHint(library: FormsCodePanelLibrary): string {
  if (library === "rhf") return "npx afnoui form init";
  if (library === "tanstack") return "npx afnoui form init --stack tanstack";
  return "npx afnoui form init --stack action";
}

export function FormsCodePanel({
  code,
  config,
  library = "rhf",
  exportedSchemaCode,
  implementationMode = "config",
}: {
  code: string;
  config: FormConfig;
  exportedSchemaCode: string;
  library?: FormsCodePanelLibrary;
  implementationMode?: ImplementationMode;
}) {
  void code;
  void exportedSchemaCode;
  const [activeFile, setActiveFile] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

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

    const fixedCoreFiles = generateAllFiles(config, "compile-time", [], library, implementationMode);

    // const allFiles = [...variantFiles, ...fixedCoreFiles];

    const seen = new Set<string>();
    // return allFiles.filter((file) => {
    return fixedCoreFiles.filter((file) => {
      const key = `${file.path}:${file.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [config, library, implementationMode]);

  useEffect(() => {
    setActiveFile((i) => (files.length === 0 ? 0 : Math.min(i, files.length - 1)));
  }, [files]);

  const libInfo = libraryDeps[library];
  const copyToClipboard = async (content: string, name: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
    toast({ title: "Copied!", description: `${name} copied to clipboard` });
  };

  const safeIndex =
    files.length === 0 ? 0 : Math.min(Math.max(0, activeFile), files.length - 1);
  const current = files[safeIndex];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Required Dependencies & Files</p>
            <p className="text-[11px] text-muted-foreground">
              Install packages and copy <span className="font-medium text-foreground">{files.length} files</span> to run this form
            </p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Dependencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {libInfo.deps.map((dep) => (
                  <span key={dep} className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/8 text-primary text-[10px] font-mono font-medium border border-primary/15">
                    {dep}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(libInfo.installCmd);
                  toast({ title: "Copied!", description: "Install command copied" });
                }}
                className="w-full text-left text-[10px] font-mono bg-muted/60 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5 group"
              >
                <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100 shrink-0" />
                <span className="truncate">{libInfo.installCmd}</span>
              </button>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Dev Dependencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {libInfo.devDeps.map((dep) => (
                  <span key={dep} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono font-medium border border-border">
                    {dep}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(libInfo.devInstallCmd);
                  toast({ title: "Copied!", description: "Dev install command copied" });
                }}
                className="w-full text-left text-[10px] font-mono bg-muted/60 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5 group"
              >
                <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100 shrink-0" />
                <span className="truncate">{libInfo.devInstallCmd}</span>
              </button>
            </div>
          </div>
          {/* CLI init note */}
          <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">💡 Using CLI? Shared files are auto-installed</p>
            <p>
              Run <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{stackFormInitHint(library)}</code>{" "}
              (or <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">pnpm dlx</code> / <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">yarn dlx</code> / <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">bunx</code>)
              to scaffold all <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded bg-muted text-muted-foreground font-medium border border-border text-[9px]">● shared</span> files for this stack.
              You only need to copy <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded bg-primary/10 text-primary font-medium border border-primary/15 text-[9px]">● variant-specific</span> files for your form.
            </p>
          </div>

          {/* File legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/15">
              ● Variant-specific
            </span>
            <span className="text-muted-foreground">formConfig.ts, MyFormPage.tsx, formSchema.ts — regenerated per form</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium border border-border">
              ● Shared
            </span>
            <span className="text-muted-foreground">
              types.ts,{" "}
              {library === "tanstack" ? (
                <>TanstackForm.tsx, TanstackFormField.tsx, …</>
              ) : library === "action" ? (
                <>ActionForm.tsx, ActionFormField.tsx, …</>
              ) : (
                <>ReactHookForm.tsx, ReactHookFormField.tsx, …</>
              )}{" "}
              useBackendErrors.ts, field components — install via CLI or copy once
            </span>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {current ? (
          <>
            <div className="flex items-center justify-between px-1 py-1 bg-muted/40 border-b border-border gap-1">
              <ScrollArea>
                <ScrollBar orientation="horizontal" className="hidden" />
                <div className="flex items-center gap-1 flex-1">
                  {files.map((file, idx) => (
                    <button
                      key={`${file.path}-${file.name}`}
                      type="button"
                      onClick={() => setActiveFile(idx)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap",
                        safeIndex === idx
                          ? "bg-background text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", file.isFixed ? "bg-muted-foreground" : "bg-primary")} />
                      {file.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 shrink-0 mr-1 text-xs"
                onClick={() => copyToClipboard(current.code, current.name)}
              >
                {copiedFile === current.name ? (
                  <>
                    <Check className="h-3 w-3 text-primary" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="px-4 py-2 bg-muted/20 border-b border-border text-xs space-y-0.5">
              <div className="font-mono text-muted-foreground flex items-center gap-1.5">
                <span>📁</span>
                <span className="text-foreground font-medium">{current.path}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    current.isFixed
                      ? "bg-muted text-muted-foreground border border-border"
                      : "bg-primary/10 text-primary border border-primary/15"
                  )}
                >
                  {current.isFixed ? "shared — install once" : "variant-specific"}
                </span>
              </div>
              <div className="text-muted-foreground">{current.description}</div>
            </div>

            <ScrollArea className="h-72">
              <pre className="p-4 text-xs font-mono leading-relaxed bg-muted/30 text-foreground">
                <code>{current.code}</code>
              </pre>
            </ScrollArea>
          </>
        ) : (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">No files to show.</div>
        )}
      </div>
    </div>
  );
}
