"use client";

import { useEffect, useState, useMemo } from "react";
import { Code2, Download, FileCode, Package, ArrowRight, Info, Zap, Clock, Database } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormConfig } from "@/forms/react-hook-form";
import { formStackInstall, ImplementationMode } from "@/registry/formRegistry";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";
import {
  generateAllFiles, generateInstallCommand,
  getRequiredComponents, getUsedFieldTypes, getHydratableFields, SchemaMode,
} from "@/form-builder/utils/formCodeGenerator";

interface ExportTabProps {
  formConfig: FormConfig;
}

type FormLibrary = "rhf" | "tanstack" | "action";

/**
 * Per-stack metadata for the library picker. The `deps` line is *derived from*
 * `formStackInstall` (the same object the CLI consumes via `forms.json`), so
 * adding/removing a stack-level npm dep happens in exactly one place:
 * `STACK_INSTALL` in `scripts/generate-registry.ts`.
 */
const buildDepsCommand = (stack: FormLibrary): string => {
  const sorted = [...formStackInstall[stack].npmDependencies].sort();
  return `npm install ${sorted.join(" ")}`;
};

const libraryMeta: Record<FormLibrary, { label: string; desc: string; deps: string; icon: typeof Zap }> = {
  rhf: { label: "React Hook Form", desc: "Most popular — uses Controller, FormProvider, useFormContext", deps: buildDepsCommand("rhf"), icon: Zap },
  tanstack: { label: "TanStack Form", desc: "Modern — uses form.Field render props with Standard Schema validation", deps: buildDepsCommand("tanstack"), icon: Database },
  action: { label: "useActionState", desc: "React 19 native — zero form library, pure Zod validation", deps: buildDepsCommand("action"), icon: Clock },
};

export function ExportTab({ formConfig }: ExportTabProps) {
  const [formLibrary, setFormLibrary] = useState<FormLibrary>("rhf");
  const [hydratedFields, setHydratedFields] = useState<string[]>([]);
  const [codeFileTab, setCodeFileTab] = useState<string>("formConfig.ts");
  const [schemaMode, setSchemaMode] = useState<SchemaMode>("compile-time");
  const [implementationMode, setImplementationMode] = useState<ImplementationMode>("config");

  const hasFields = formConfig.sections.some(s => s.fields.length > 0);
  // All fields can be hydrated — not just option-based ones
  const hydratableFields = useMemo(() => getHydratableFields(formConfig), [formConfig]);

  const generatedFiles = generateAllFiles(formConfig, schemaMode, hydratedFields, formLibrary, implementationMode);
  const installCmd = generateInstallCommand(formConfig);
  const requiredComponents = getRequiredComponents(formConfig);
  const usedTypes = getUsedFieldTypes(formConfig);

  useEffect(() => {
    // `generatedFiles` now includes the per-field-type components (TextField, …)
    // emitted from the registry, so there's only ONE list of available tabs.
    const availableTabs = generatedFiles.map((file) => file.name);

    if (!availableTabs.includes(codeFileTab)) {
      setCodeFileTab(generatedFiles[0]?.name ?? "");
    }
  }, [codeFileTab, generatedFiles]);

  const toggleHydrationField = (fieldName: string) => {
    setHydratedFields(prev =>
      prev.includes(fieldName) ? prev.filter(f => f !== fieldName) : [...prev, fieldName]
    );
  };

  if (!hasFields) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No form to export</p>
          <p className="text-sm text-muted-foreground">Add some fields in the Builder tab first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Library Selector */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Form Library</CardTitle>
          <CardDescription className="text-xs">Choose which form library to generate code for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(libraryMeta) as FormLibrary[]).map(lib => {
              const meta = libraryMeta[lib];
              return (
                <button
                  key={lib}
                  onClick={() => { setFormLibrary(lib); setCodeFileTab("formConfig.ts"); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    formLibrary === lib
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <meta.icon className="h-3.5 w-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {libraryMeta[formLibrary].desc}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Implementation Style</CardTitle>
          <CardDescription className="text-xs">Choose whether export uses a separate config file or keeps the form definition inline in the page file</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={implementationMode} onValueChange={(v) => { setImplementationMode(v as ImplementationMode); setCodeFileTab(v === "static" ? "MyFormPage.tsx" : "formConfig.ts"); }} className="grid sm:grid-cols-2 gap-3">
            <Label htmlFor="config-mode" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="config" id="config-mode" className="mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold">JSON Config</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Exports a separate <code className="bg-muted px-1 rounded">formConfig.ts</code> and uses the dynamic config-driven renderer.</p>
              </div>
            </Label>
            <Label htmlFor="static-mode" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="static" id="static-mode" className="mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Static JSX (No Config)</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Traditional approach — field components written directly in JSX. No JSON config, no runtime renderer. Just a page file with form setup and field imports.</p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Schema Mode Selector — hidden in static mode (always compile-time) */}
      {implementationMode !== 'static' && <>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Schema Approach</CardTitle>
          <CardDescription className="text-xs">Choose how form validation schema is handled</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={schemaMode} onValueChange={(v) => { setSchemaMode(v as SchemaMode); setCodeFileTab("formConfig.ts"); }} className="grid sm:grid-cols-2 gap-3">
            <Label htmlFor="runtime" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="runtime" id="runtime" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold">Runtime Schema</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Schema is built automatically from the JSON config using <code className="bg-muted px-1 rounded">buildZodSchema()</code>.
                  Best when form config is <strong>fetched from a backend/database</strong> at runtime, or when you want a single config file that controls everything.
                  No separate schema file needed.
                </p>
              </div>
            </Label>
            <Label htmlFor="compile-time" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="compile-time" id="compile-time" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold">Compile-Time Schema</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Generates a separate <code className="bg-muted px-1 rounded">formSchema.ts</code> with an explicit Zod schema.
                  Best for <strong>simple/static forms</strong> that don&apos;t need a backend. Gives full TypeScript type inference,
                  IDE autocompletion, and catches validation errors at build time.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>
      </>}

      {/* Hydration Field Selector — ALL fields, not just option-based */}
      {hydratableFields.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Backend Hydration (Optional)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Select fields that should be hydrated from your backend API at runtime.
              For option-based fields (select, combobox, radio, etc.), options will be fetched.
              For other fields (text, textarea, etc.), properties like defaultValue, placeholder, or label can be loaded.
              A <code className="bg-muted px-1 rounded">useFormHydration</code> hook + <code className="bg-muted px-1 rounded">applyHydration()</code> will be generated in MyFormPage.tsx.
              Leave all unchecked if your form uses static data only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {hydratableFields.map(field => (
                <label
                  key={field.name}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <Checkbox
                    checked={hydratedFields.includes(field.name)}
                    onCheckedChange={() => toggleHydrationField(field.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{field.label || field.name}</p>
                    <p className="text-[10px] text-muted-foreground">{field.type} · <code className="font-mono">{field.name}</code></p>
                  </div>
                </label>
              ))}
            </div>
            {hydratedFields.length > 0 && (
              <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                {hydratedFields.length} field{hydratedFields.length !== 1 ? 's' : ''} will be hydrated from backend.
                Hydration runs in MyFormPage.tsx — ReactHookForm receives pre-hydrated config.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Setup Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 px-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Export Your Form ({libraryMeta[formLibrary].label})</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uses <strong>{usedTypes.length}</strong> field type{usedTypes.length !== 1 ? 's' : ''} and <strong>{requiredComponents.fieldComponents.length}</strong> field component{requiredComponents.fieldComponents.length !== 1 ? 's' : ''}.
                  {schemaMode === 'runtime' ? " Schema is built automatically at runtime." : " Schema is pre-compiled in formSchema.ts."}
                  {hydratedFields.length > 0 ? ` ${hydratedFields.length} field(s) hydrated from backend via applyHydration().` : ""}
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <InstallCommand command={libraryMeta[formLibrary].deps} label="Step 1: Install core deps" />
                <InstallCommand command={installCmd} label="Step 2: Install UI components (Radix UI)" />
                <InstallCommand command={`# Required field components:\n# ${requiredComponents.fieldComponents.map(c => c.file).join(', ')}`} label="Step 3: Copy field components" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Field components are provided below — copy them into <code className="bg-muted px-1 rounded">@/components/forms/fields/</code></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Files */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <CardTitle>Generated Files</CardTitle>
          </div>
          <CardDescription>All files needed to run this form in your project</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={codeFileTab} onValueChange={setCodeFileTab}>
            <ScrollArea className="w-full">
              <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                {generatedFiles.map((file) => (
                  <TabsTrigger key={file.name} value={file.name} className="text-xs gap-1.5 data-[state=active]:bg-background">
                    {file.isFixed ? <Package className="h-3 w-3" /> : <FileCode className="h-3 w-3" />}
                    {file.name}
                    {file.isFixed && <Badge variant="outline" className="text-[8px] h-3.5 px-1 ml-0.5">fixed</Badge>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-medium">Install fixed form files with the CLI (optional)</p>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    AfnoUI can write the reusable form stack (types, <code className="bg-muted px-1 rounded">ReactHookForm</code>, hooks, shared utilities) into your repo in one step.
                    Run one of the commands below at your project root instead of copying every tab marked{" "}
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 align-middle">fixed</Badge>.
                    For <strong>this form only</strong>, copy the tabs labeled <strong>Generated per form</strong> (e.g. config and page) and any <strong>field</strong> components you still need — you do not have to duplicate the fixed files if the CLI already installed them.
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <InstallCommand command="npx afnoui form init" label="npm (npx)" />
                <InstallCommand command="pnpm dlx afnoui form init" label="pnpm" />
                <InstallCommand command="yarn dlx afnoui form init" label="yarn" />
                <InstallCommand command="bunx afnoui form init" label="bun" />
              </div>
            </div>

            {generatedFiles.map((file) => (
              <TabsContent key={`${file.path}:${file.name}`} value={file.name} className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    {file.isFixed ? (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <Package className="h-3 w-3 mr-1" /> Reusable — install once
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
                        <FileCode className="h-3 w-3 mr-1" /> Generated per form
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">{file.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> {file.path}
                  </div>
                  <CodeBlock code={file.code} filename={file.path} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { step: 1, title: "Install dependencies", desc: "Run both install commands above in your project root" },
              { step: 2, title: "Copy reusable files", desc: "Copy types, hooks, utils, index.ts, and [Generic]-form ([Generic]Form, [Generic]FormField, fields/) into @/components/forms/ — or run npx afnoui form init." },
              {
                step: 3, title: "Copy your form config", desc: schemaMode === 'runtime'
                  ? "Copy formConfig.ts — schema is auto-generated from it at runtime."
                  : "Copy formConfig.ts and formSchema.ts — the schema is pre-compiled for type safety."
              },
              ...(hydratedFields.length > 0
                ? [{ step: 4, title: "Set up hydration hook", desc: "Copy useFormHydration.ts and replace placeholder API calls with your actual axios endpoints. applyHydration() in MyFormPage.tsx merges backend data into config before passing to [Generic]Form." }]
                : []),
              { step: hydratedFields.length > 0 ? 5 : 4, title: "Add route and render", desc: "Import MyFormPage in your router and you're done!" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3 items-start">
                <Badge className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center">{step}</Badge>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
