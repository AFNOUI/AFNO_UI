"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Eye, Plus, Zap, Database, Clock } from "lucide-react";

import { FormConfig } from "@/forms/react-hook-form";
import { extractFields, buildZodSchema } from "@/forms/utils/zodSchemaBuilder";

import { SubmittedDataView } from "@/form-builder/SubmittedDataView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantJsonConfigPanel } from "@/components/shared/VariantJsonConfigPanel";

import { ActionForm } from "@/forms/action-forms/ActionForm";
import { TanstackForm } from "@/forms/tanstack-forms/TanstackForm";
import { ReactHookForm } from "@/forms/react-hook-form/ReactHookForm";

type FormLibrary = "rhf" | "tanstack" | "action";

const libraryMeta: Record<FormLibrary, { label: string; icon: typeof Zap }> = {
  rhf: { label: "React Hook Form", icon: Zap },
  tanstack: { label: "TanStack Form", icon: Database },
  action: { label: "useActionState", icon: Clock },
};

interface PreviewTabProps {
  formConfig: FormConfig;
  onClearSubmittedData: () => void;
  submittedData: Record<string, unknown> | null;
  onSubmit: (data: Record<string, unknown>) => void;
}

export function PreviewTab({ formConfig, onSubmit, submittedData, onClearSubmittedData }: PreviewTabProps) {
  const [library, setLibrary] = useState<FormLibrary>("rhf");
  const hasFields = formConfig.sections.some(s => s.fields.length > 0);

  const schema = useMemo(() => buildZodSchema(extractFields(formConfig)), [formConfig]);
  const formKey = `${JSON.stringify(formConfig)}-${library}`;

  return (
    <div className="space-y-4">
      {/* Library Selector */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview Library</CardTitle>
          <CardDescription className="text-xs">Choose which form library renders the preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(libraryMeta) as FormLibrary[]).map(lib => {
              const meta = libraryMeta[lib];
              return (
                <button
                  key={lib}
                  onClick={() => setLibrary(lib)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    library === lib
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
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Live Preview</CardTitle>
            <span className="text-xs text-muted-foreground">({libraryMeta[library].label})</span>
          </div>
          <CardDescription>Interactive preview — fill it out and submit to test validation</CardDescription>
        </CardHeader>
        <CardContent>
          {hasFields ? (
            <>
              {library === "action" && (
                <ActionForm key={formKey} config={formConfig} schema={schema} onSubmit={onSubmit} />
              )}
              {library === "tanstack" && (
                <TanstackForm key={formKey} config={formConfig} schema={schema} onSubmit={onSubmit} />
              )}
              {library === "rhf" && (
                <ReactHookForm key={formKey} config={formConfig} schema={schema} onSubmit={onSubmit} />
              )}
              <SubmittedDataView data={submittedData} onClear={onClearSubmittedData} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No fields yet</p>
              <p className="text-sm text-muted-foreground">Add fields in the Builder tab</p>
            </div>
          )}
        </CardContent>
      </Card>

      <VariantJsonConfigPanel
        blocks={[
          {
            value: formConfig,
            copySuccessDescription: "Form configuration JSON copied to clipboard",
          },
        ]}
      />
    </div>
  );
}
