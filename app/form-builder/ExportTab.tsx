"use client";

import { useEffect, useState, useMemo } from "react";
import { Code2, Info, Zap, Clock, Database } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormConfig } from "@/forms/react-hook-form";
import { formStackInstall, ImplementationMode } from "@/registry/formRegistry";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BuilderFilesPanel, BuilderInstallPanel, type ConfigStep } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, transportNpmDependencies, type TransportChoice } from "@/lib/codegen/transport";
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
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);

  const hasFields = formConfig.sections.some(s => s.fields.length > 0);
  // All fields can be hydrated — not just option-based ones
  const hydratableFields = useMemo(() => getHydratableFields(formConfig), [formConfig]);

  const generatedFiles = generateAllFiles(formConfig, schemaMode, {
    hydratedFieldNames: hydratedFields,
    library: formLibrary,
    implementationMode,
    transport,
  });
  // transport opt-ins ride on top of the stack's own deps (R-56)
  const coreDeps = [
    ...formStackInstall[formLibrary].npmDependencies,
    ...transportNpmDependencies(transport),
  ].sort();
  const coreDepsCommand = `npm install ${coreDeps.join(" ")}`;
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

  // Form Library changes the printed command — `form init --stack tanstack`
  // and the packages step both follow it — so it lives *inside* "Install &
  // set up" as a config step, same rule as transport. Implementation Style,
  // Schema Approach and Backend Hydration only change what's generated in
  // the files below and never touch the command, so they stay as their own
  // cards below the panel instead.
  const configSteps: ConfigStep[] = [
    {
      id: "library",
      icon: Code2,
      title: "Form Library",
      hint: "Choose which form library to generate code for.",
      content: (
        <div>
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <BuilderInstallPanel
        subject="form"
        configSteps={configSteps}
        transport={{
          value: transport,
          onChange: setTransport,
          idPrefix: "form-transport",
        }}
        idPrefix="form-builder"
        generatedCount={generatedFiles.filter((f) => !f.isFixed).length}
        sharedCount={generatedFiles.filter((f) => f.isFixed).length}
        runtimeCommand={coreDepsCommand}
        extraCommands={[{ label: "UI components (Radix UI)", command: installCmd }]}
        notes={[
          `Uses ${usedTypes.length} field type${usedTypes.length === 1 ? "" : "s"} and ${requiredComponents.fieldComponents.length} field component${requiredComponents.fieldComponents.length === 1 ? "" : "s"}: ${requiredComponents.fieldComponents.map((c) => c.file).join(", ")}.`,
          "Copy the field components from the tabs below into `@/components/forms/fields/`.",
          schemaMode === "runtime"
            ? "Schema is built automatically at runtime from formConfig.ts."
            : "Schema is pre-compiled in formSchema.ts for type safety.",
          ...(hydratedFields.length > 0
            ? [`${hydratedFields.length} field(s) are hydrated from the backend via applyHydration().`]
            : []),
        ]}
        cliScope={{
          commandId: "form-init",
          lockCommand: true,
          lockArgs: true,
          flags: { stack: formLibrary },
        }}
      />

      {/* Source-code-only choices live below "Install & set up" — they never
          change the command above, only the generated files further down. */}
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

      <BuilderFilesPanel
        subject="form"
        files={generatedFiles}
        activeFile={codeFileTab}
        onActiveFileChange={setCodeFileTab}
      />

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
