import type { FormConfig } from "@/forms/types/types";

import {
  buildDefaultValues,
  buildSubmitExcludedSetLiteral,
  generateSectionFieldsJSX,
  getFieldImports,
} from "../sectionRendering";

/** Generate the complete static page code for TanStack Form */
export function generateStaticTanStack(config: FormConfig): string {
  const fieldImports = getFieldImports(config);
  const defaults = buildDefaultValues(config);
  const submitExcluded = buildSubmitExcludedSetLiteral(config);

  const imports = [
    `import { useState } from "react";`,
    `import { useForm } from "@tanstack/react-form";`,
    `import { Button } from "@/components/ui/button";`,
    `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";`,
    `import { Alert, AlertDescription } from "@/components/ui/alert";`,
    `import { AlertCircle, X } from "lucide-react";`,
    `import { TanstackFormProvider } from "@/components/forms/tanstack-forms/TanstackFormContext";`,
    ...fieldImports.map(f => `import { ${f.component} } from "@/components/forms/tanstack-forms/fields/${f.file.replace('.tsx', '')}";`),
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
  const [globalError, setGlobalError] = useState<string | null>(null);
  const SUBMIT_EXCLUDED = ${submitExcluded};

  const form = useForm({
    defaultValues: ${JSON.stringify(defaults, null, 4).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n')},
    validators: {
      onSubmit: ${schemaRef},
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      try {
        const payload = { ...(value as Record<string, unknown>) };
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
      }
    },
  });

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <TanstackFormProvider value={{ form, values: form.state.values as Record<string, unknown> }}>
        <form
          onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
          className="space-y-6"
        >
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

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "${config.submitLabel || 'Submit'}"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </TanstackFormProvider>
    </div>
  );
}
`;
}
