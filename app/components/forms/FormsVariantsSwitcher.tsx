"use client";

import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { VariantPicker } from "@/components/shared/VariantPicker";

import type { FormConfig, ReactHookFormZodSchema } from "@/forms/types/types";

import { ActionForm } from "@/forms/action-forms";
import { TanstackForm } from "@/forms/tanstack-forms";
import { ReactHookForm } from "@/forms/react-hook-form";
import { FormsSubmissionPreview } from "./FormsSubmissionPreview";
import type { ImplementationMode } from "@/registry/formRegistry";
import { FormsCodePanel, type FormsCodePanelLibrary } from "./FormsCodePanel";
import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";
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

export function FormsVariantsSwitcher() {
  const [activeKey, setActiveKey] = useState("job");
  const [library, setLibrary] = useState<FormsCodePanelLibrary>("rhf");
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);
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
      <VariantPicker
        variants={VARIANTS.map((v) => ({ key: v.key, label: v.label }))}
        activeKey={activeKey}
        onSelect={setActiveKey}
      />

      <ComponentInstall
        category="forms"
        code={pageSource}
        fullCode={pageSource}
        variant={active.variant}
        title={active.meta.title}
        hideInstallBar
        key={`${active.key}-${library}`}
      >
        <div className="space-y-6 w-full max-w-full min-w-0">
          <div className="max-w-3xl">{renderLiveForm()}</div>

          <div className="max-w-3xl">
            <FormsSubmissionPreview
              data={currentSubmission?.data ?? null}
              submittedAt={currentSubmission?.at ?? null}
            />
          </div>
        </div>
      </ComponentInstall>

      {/* Outside ComponentInstall/CodePreview on purpose — CodePreview only
          renders its children while its own "Preview" tab is active, which
          buried this whole install-bar + multi-file source browser inside a
          tab-gated preview box and hid it under the unrelated "Snippet"/
          "Component" tabs. It's the real install surface for this variant,
          so it always stays visible, sibling to the preview card above. */}
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
          transport={transport}
          onTransportChange={setTransport}
          onLibraryChange={setLibrary}
          onImplementationModeChange={setImplementationMode}
          variant={active.variant}
        />
      </div>
    </div>
  );
}
