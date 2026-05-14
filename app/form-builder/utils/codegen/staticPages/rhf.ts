import type { FormConfig } from "@/forms/types/types";

import {
  buildDefaultValues,
  buildSubmitExcludedSetLiteral,
  generateSectionFieldsJSX,
  getFieldImports,
} from "../sectionRendering";

/**
 * Generate the complete static page code for React Hook Form.
 * Static mode always uses compile-time schema (no JSON config exists to build from at runtime).
 */
export function generateStaticRHF(config: FormConfig): string {
  const fieldImports = getFieldImports(config);
  const defaults = buildDefaultValues(config);
  const submitExcluded = buildSubmitExcludedSetLiteral(config);

  const imports = [
    `import { useForm } from "react-hook-form";`,
    `import { zodResolver } from "@hookform/resolvers/zod";`,
    `import { Form } from "@/components/ui/form";`,
    `import { Button } from "@/components/ui/button";`,
    `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";`,
    ...fieldImports.map(f => `import { ${f.component} } from "@/components/forms/react-hook-form/fields/${f.file.replace('.tsx', '')}";`),
    `import { formService } from "./formService";`,
    `import { formSchema } from "./formSchema";`,
  ];

  // Build section JSX
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: ${JSON.stringify(defaults, null, 4).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n')},
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = { ...data } as Record<string, unknown>;
    for (const name of SUBMIT_EXCLUDED) {
      delete payload[name];
      const p = \`\${name}__\`;
      for (const k of Object.keys(payload)) {
        if (k.startsWith(p)) delete payload[k];
      }
    }
    await formService.submitForm(payload);
  });

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
${sectionsJSX}

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "${config.submitLabel || 'Submit'}"}
            </Button>
        </form>
      </Form>
    </div>
  );
}
`;
}
