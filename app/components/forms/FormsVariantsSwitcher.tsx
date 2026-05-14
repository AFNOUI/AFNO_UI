"use client";

import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ComponentInstall } from "@/components/lab/ComponentInstall";

import type { FormConfig, ReactHookFormZodSchema } from "@/forms/types/types";

import { ActionForm } from "@/forms/action-forms";
import { TanstackForm } from "@/forms/tanstack-forms";
import { ReactHookForm } from "@/forms/react-hook-form";
import { FormsSubmissionPreview } from "./FormsSubmissionPreview";
import type { ImplementationMode } from "@/registry/formRegistry";
import { FormsCodePanel, type FormsCodePanelLibrary } from "./FormsCodePanel";
import { generatePageComponentCode } from "@/form-builder/utils/formCodeGenerator";

import { formConfig as loginConfig, exportedSchemaCode as loginExportedSchemaCode, schema as loginSchema, data as loginMeta } from "@/registry/forms/forms-login";
import { formConfig as jobConfig, exportedSchemaCode as jobExportedSchemaCode, schema as jobSchema, data as jobMeta } from "@/registry/forms/forms-job-application";
import { formConfig as surveyConfig, exportedSchemaCode as surveyExportedSchemaCode, schema as surveySchema, data as surveyMeta } from "@/registry/forms/forms-survey";
import { formConfig as paymentConfig, exportedSchemaCode as paymentExportedSchemaCode, schema as paymentSchema, data as paymentMeta } from "@/registry/forms/forms-payment";
import { formConfig as invoiceConfig, exportedSchemaCode as invoiceExportedSchemaCode, schema as invoiceSchema, data as invoiceMeta } from "@/registry/forms/forms-invoice";
import { formConfig as contactConfig, exportedSchemaCode as contactExportedSchemaCode, schema as contactSchema, data as contactMeta } from "@/registry/forms/forms-contact";
import { formConfig as multiStepConfig, exportedSchemaCode as multiStepExportedSchemaCode, schema as multiStepSchema, data as multiStepMeta } from "@/registry/forms/forms-multi-step";
import { formConfig as conditionalConfig, exportedSchemaCode as conditionalExportedSchemaCode, schema as conditionalSchema, data as conditionalMeta } from "@/registry/forms/forms-conditional";
import { formConfig as displayOnlyConfig, exportedSchemaCode as displayOnlyExportedSchemaCode, schema as displayOnlySchema, data as displayOnlyMeta } from "@/registry/forms/forms-display-only";
import { formConfig as asyncInfiniteConfig, exportedSchemaCode as asyncInfiniteExportedSchemaCode, schema as asyncInfiniteSchema, data as asyncInfiniteMeta } from "@/registry/forms/forms-async-infinite";

type FormVariantEntry = {
  key: string;
  label: string;
  variant: string;
  formConfig: FormConfig;
  exportedSchemaCode: string;
  schema: ReactHookFormZodSchema;
  meta: { title: string; description: string };
};

const VARIANTS: FormVariantEntry[] = [
  { key: "job", label: jobMeta.title, variant: "forms-job-application", formConfig: jobConfig, exportedSchemaCode: jobExportedSchemaCode, schema: jobSchema, meta: jobMeta },
  { key: "login", label: loginMeta.title, variant: "forms-login", formConfig: loginConfig, exportedSchemaCode: loginExportedSchemaCode, schema: loginSchema, meta: loginMeta },
  { key: "survey", label: surveyMeta.title, variant: "forms-survey", formConfig: surveyConfig, exportedSchemaCode: surveyExportedSchemaCode, schema: surveySchema, meta: surveyMeta },
  { key: "payment", label: paymentMeta.title, variant: "forms-payment", formConfig: paymentConfig, exportedSchemaCode: paymentExportedSchemaCode, schema: paymentSchema, meta: paymentMeta },
  { key: "invoice", label: invoiceMeta.title, variant: "forms-invoice", formConfig: invoiceConfig, exportedSchemaCode: invoiceExportedSchemaCode, schema: invoiceSchema, meta: invoiceMeta },
  { key: "contact", label: contactMeta.title, variant: "forms-contact", formConfig: contactConfig, exportedSchemaCode: contactExportedSchemaCode, schema: contactSchema, meta: contactMeta },
  { key: "multi-step", label: multiStepMeta.title, variant: "forms-multi-step", formConfig: multiStepConfig, exportedSchemaCode: multiStepExportedSchemaCode, schema: multiStepSchema, meta: multiStepMeta },
  { key: "conditional", label: conditionalMeta.title, variant: "forms-conditional", formConfig: conditionalConfig, exportedSchemaCode: conditionalExportedSchemaCode, schema: conditionalSchema, meta: conditionalMeta },
  { key: "display-only", label: displayOnlyMeta.title, variant: "forms-display-only", formConfig: displayOnlyConfig, exportedSchemaCode: displayOnlyExportedSchemaCode, schema: displayOnlySchema, meta: displayOnlyMeta },
  { key: "async-infinite", label: asyncInfiniteMeta.title, variant: "forms-async-infinite", formConfig: asyncInfiniteConfig, exportedSchemaCode: asyncInfiniteExportedSchemaCode, schema: asyncInfiniteSchema, meta: asyncInfiniteMeta },
];

type SubmissionEntry = { data: Record<string, unknown>; at: Date };

const libraryLabels: Record<FormsCodePanelLibrary, string> = {
  rhf: "React Hook Form",
  action: "useActionState",
  tanstack: "TanStack Form",
};

export function FormsVariantsSwitcher() {
  const [activeKey, setActiveKey] = useState("job");
  const [library, setLibrary] = useState<FormsCodePanelLibrary>("rhf");
  const [implementationMode, setImplementationMode] = useState<ImplementationMode>("config");
  const [submissions, setSubmissions] = useState<Record<string, SubmissionEntry>>({});

  const active = VARIANTS.find((v) => v.key === activeKey) ?? VARIANTS[0];

  const pageSource = useMemo(
    () => generatePageComponentCode(active.formConfig, "compile-time", [], library, implementationMode),
    [active.formConfig, library, implementationMode],
  );

  const currentSubmission = activeKey ? submissions[activeKey] : undefined;

  const handleSubmit = (submitted: Record<string, unknown>) => {
    setSubmissions((prev) => ({
      ...prev,
      [activeKey]: { data: submitted, at: new Date() },
    }));
    toast({ title: "Submitted", description: "Payload shown below the form." });
  };

  if (!active) return null;

  const formMountKey = `${active.key}-${library}`;

  const renderLiveForm = () => {
    switch (library) {
      case "tanstack":
        return (
          <TanstackForm
            key={formMountKey}
            config={active.formConfig}
            schema={active.schema}
            onSubmit={handleSubmit}
          />
        );
      case "action":
        return (
          <ActionForm
            key={formMountKey}
            config={active.formConfig}
            schema={active.schema}
            onSubmit={handleSubmit}
          />
        );
      default:
        return (
          <ReactHookForm
            key={formMountKey}
            onSubmit={handleSubmit}
            config={active.formConfig}
            schema={active.schema as ReactHookFormZodSchema}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border w-fit">
        {(Object.keys(libraryLabels) as FormsCodePanelLibrary[]).map((lib) => (
          <button
            key={lib}
            type="button"
            onClick={() => setLibrary(lib)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              library === lib
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {libraryLabels[lib]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border w-fit">
        {([
          { key: "config" as ImplementationMode, label: "JSON Config" },
          { key: "static" as ImplementationMode, label: "Static JSX" },
        ]).map((mode) => (
          <button
            key={mode.key}
            type="button"
            onClick={() => setImplementationMode(mode.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              implementationMode === mode.key
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Large screens: horizontal scroll when many tabs */}
      <div className="hidden md:block w-full min-w-0">

        <ScrollArea className="rounded-xl border border-border bg-muted/50" >
          <ScrollBar orientation="horizontal" />
          <div className="flex w-max flex-nowrap items-center gap-1.5 p-2">
            {VARIANTS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setActiveKey(v.key)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                  activeKey === v.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </ScrollArea></div>

      {/* Small screens: dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{active.label}</span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
            {VARIANTS.map((v) => (
              <DropdownMenuItem
                key={v.key}
                onClick={() => setActiveKey(v.key)}
                className={cn(activeKey === v.key && "bg-primary/10 text-primary font-medium")}
              >
                {v.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ComponentInstall
        category="forms"
        code={pageSource}
        fullCode={pageSource}
        variant={active.variant}
        title={active.meta.title}
        key={`${active.key}-${library}`}
        installArgs={
          library === "rhf" ? undefined : library === "tanstack" ? " --stack tanstack" : " --stack action"
        }
      >
        <div className="space-y-6 w-full max-w-full min-w-0">
          <div className="max-w-3xl">{renderLiveForm()}</div>

          <div className="max-w-3xl">
            <FormsSubmissionPreview
              data={currentSubmission?.data ?? null}
              submittedAt={currentSubmission?.at ?? null}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
                Source Code
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <FormsCodePanel
              code={pageSource}
              library={library}
              config={active.formConfig}
              implementationMode={implementationMode}
              exportedSchemaCode={active.exportedSchemaCode}
            />
          </div>
        </div>
      </ComponentInstall>
    </div>
  );
}
