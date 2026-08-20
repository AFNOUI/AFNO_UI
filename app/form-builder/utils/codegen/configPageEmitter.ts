import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";
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
  /** Which HTTP client / query strategy this bundle was generated against (R-56). */
  transport: TransportChoice = DEFAULT_TRANSPORT,
): string {
  if (implementationMode === 'static') {
    const staticPage = generateStaticPageCode(config, library, transport);
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
    `import { useFormSubmit } from "./hooks";`,
    ...(transport.http === "axios" || transport.query === "tanstack"
      ? [
          `import { FormTransportProvider } from "@/components/forms/transport/context";`,
          ...(transport.http === "axios" ? [`import { optionsTransport } from "./services";`] : []),
          ...(transport.query === "tanstack" ? [`import { optionsQueryAdapter } from "./hooks";`] : []),
        ]
      : []),
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

  // Mount the engine's transport port when a non-default client was chosen, so
  // async / infinite option loading uses the same client as the rest of the
  // bundle. Without this the engine keeps its fetch + React-state default (R-56).
  const providerProps = [
    transport.http === "axios" ? "transport={optionsTransport}" : "",
    transport.query === "tanstack" ? "adapter={optionsQueryAdapter}" : "",
  ].filter(Boolean).join(" ");
  const openProvider = providerProps ? `<FormTransportProvider ${providerProps}>\n      ` : "";
  const closeProvider = providerProps ? `\n      </FormTransportProvider>` : "";

  const submitHandler = `
  const { submit } = useFormSubmit();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await submit(data);
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
      ${openProvider}<${FormComponent} config={config} schema={schema} onSubmit={handleSubmit} />${closeProvider}
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
      ${openProvider}<${FormComponent} config={formConfig} schema={schema} onSubmit={handleSubmit} />${closeProvider}
    </div>
  );
}`;
  }

  const generated = `${imports.join("\n")}\n\n${body}\n`;
  return applyImportStyle(generated, outputPath, importStyle);
}
