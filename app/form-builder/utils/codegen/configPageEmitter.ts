import { FormConfig } from "@/forms/types/types";

import { applyImportStyle, ImportStyle } from "./importAliases";
import { generateStaticPageCode } from "./staticPages";
import type { FormLibrary, ImplementationMode, SchemaMode } from "./types";

export function generatePageComponentCode(
  config: FormConfig,
  schemaMode: SchemaMode,
  hydratedFieldNames: string[],
  library: FormLibrary = 'rhf',
  implementationMode: ImplementationMode = 'config',
  importStyle: ImportStyle = "relative",
  outputPath = "pages/MyFormPage.tsx",
): string {
  if (implementationMode === 'static') {
    const staticPage = generateStaticPageCode(config, library);
    return applyImportStyle(staticPage, outputPath, importStyle);
  }

  const useHydration = hydratedFieldNames.length > 0;

  const formComponentMap: Record<FormLibrary, { component: string; importPath: string }> = {
    rhf: { component: "ReactHookForm", importPath: "@/components/forms/react-hook-form" },
    tanstack: { component: "TanstackForm", importPath: "@/components/forms/tanstack-forms" },
    action: { component: "ActionForm", importPath: "@/components/forms/action-forms" },
  };

  const { component: FormComponent, importPath } = formComponentMap[library];

  const imports: string[] = [
    `import { useMemo } from "react";`,
    `import { ${FormComponent} } from "${importPath}";`,
    `import { BackendErrorResponse } from "@/hooks/useBackendErrors";`,
    `import { formService } from "./formService";`,
    `import { formConfig } from "./formConfig";`,
  ];

  if (schemaMode === 'runtime') {
    imports.push(`import { buildZodSchema } from "@/utils/zodSchemaBuilder";`);
    imports.push(`import { extractFields } from "@/utils/zodSchemaBuilder";`);
  } else {
    imports.push(`import { formSchema } from "./formSchema";`);
  }

  if (useHydration) {
    imports.push(`import { useFormHydration } from "./useFormHydration";`);
    imports.push(`import { applyHydration } from "@/components/forms/hydration";`);
  }

  const submitHandler = `
  const handleSubmit = async (data: Record<string, unknown>) => {
    await formService.submitForm(data);
  };`;

  let body: string;

  if (useHydration) {
    const schemaLine = schemaMode === 'runtime'
      ? `\n  const schema = useMemo(() => buildZodSchema(extractFields(config)), [config]);`
      : `\n  const schema = formSchema;`;

    body = `export default function MyFormPage() {
  const { hydration, isLoading } = useFormHydration();
  const config = useMemo(() => {
    if (!hydration || Object.keys(hydration).length === 0) return formConfig;
    return applyHydration(formConfig, hydration);
  }, [hydration]);
${schemaLine}
${submitHandler}

  if (isLoading) {
    return <div className="container mx-auto py-8 max-w-3xl text-center text-muted-foreground">Loading form data...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <${FormComponent} config={config} schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}`;
  } else {
    const schemaLine = schemaMode === 'runtime'
      ? `\n  const schema = useMemo(() => buildZodSchema(extractFields(formConfig)), []);`
      : `\n  const schema = formSchema;`;

    body = `export default function MyFormPage() {${schemaLine}
${submitHandler}

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <${FormComponent} config={formConfig} schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}`;
  }

  const generated = `${imports.join("\n")}\n\n${body}\n`;
  return applyImportStyle(generated, outputPath, importStyle);
}
