import type { FormConfig } from "@/forms/types/types";

import {
  buildDefaultValues,
  buildSubmitExcludedSetLiteral,
  generateSectionFieldsJSX,
  getFieldImports,
} from "../sectionRendering";

/** Generate the complete static page code for useActionState */
export function generateStaticAction(config: FormConfig): string {
  const fieldImports = getFieldImports(config);
  const defaults = buildDefaultValues(config);
  const submitExcluded = buildSubmitExcludedSetLiteral(config);

  const imports = [
    `import { useState, useCallback } from "react";`,
    `import { Button } from "@/components/ui/button";`,
    `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";`,
    `import { Alert, AlertDescription } from "@/components/ui/alert";`,
    `import { AlertCircle, X } from "lucide-react";`,
    `import { ActionFormProvider } from "@/components/forms/action-forms/ActionFormContext";`,
    ...fieldImports.map(f => `import { ${f.component} } from "@/components/forms/action-forms/fields/${f.file.replace('.tsx', '')}";`),
    `import { formService } from "./formService";`,
    `import { formSchema } from "./formSchema";`,
  ];

  const schemaRef = 'formSchema';

  const sectionsJSX = config.sections.map((section: FormConfig["sections"][number], i: number) => {
    const cols = section.columns || 1;
    const colClass = cols === 2 ? ' md:grid-cols-2' : cols === 3 ? ' md:grid-cols-3' : cols === 4 ? ' md:grid-cols-4' : '';
    const fieldsJSX = generateSectionFieldsJSX(section, 14);

    if (config.sections.length === 1 && !section.title) {
      return `            <div className="grid gap-4${colClass}">
${fieldsJSX}
            </div>`;
    }

    return `            <Card>
              <CardHeader>
                <CardTitle>${section.title || `Section ${i + 1}`}</CardTitle>${section.description ? `\n                <CardDescription>${section.description}</CardDescription>` : ''}
              </CardHeader>
              <CardContent className="grid gap-4${colClass}">
${fieldsJSX}
              </CardContent>
            </Card>`;
  }).join('\n\n');

  return `${imports.join('\n')}

export default function MyFormPage() {
  const SUBMIT_EXCLUDED = ${submitExcluded};
  const [values, setValues] = useState<Record<string, unknown>>(${JSON.stringify(defaults, null, 4).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    if (globalError) setGlobalError(null);
  }, [globalError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setGlobalError(null);

    const result = ${schemaRef}.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
      setErrors(flat);
      setIsPending(false);
      return;
    }

    try {
      const payload = { ...(result.data as Record<string, unknown>) };
      for (const name of SUBMIT_EXCLUDED) {
        delete payload[name];
        const p = \`\${name}__\`;
        for (const k of Object.keys(payload)) {
          if (k.startsWith(p)) delete payload[k];
        }
      }
      await formService.submitForm(payload);
    } catch (error: any) {
      setGlobalError(error?.message || "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <ActionFormProvider value={{ values, setValue, errors, isPending }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {globalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {globalError}
                <button type="button" onClick={() => setGlobalError(null)}><X className="h-4 w-4" /></button>
              </AlertDescription>
            </Alert>
          )}

${sectionsJSX}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "${config.submitLabel || 'Submit'}"}
            </Button>
        </form>
      </ActionFormProvider>
    </div>
  );
}
`;
}
