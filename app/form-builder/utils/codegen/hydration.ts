import type { FormConfig, FormFieldConfig } from "@/forms/types/types";
import { extractFields } from "@/forms/utils/zodSchemaBuilder";

export function generateHydrationHookCode(hydratedFieldNames: string[], config: FormConfig): string {
  const allFields = extractFields(config);
  const optionTypes = ['select', 'combobox', 'multiselect', 'multicombobox', 'checkboxgroup', 'radio',
    'switchgroup', 'asyncselect', 'asyncmultiselect', 'asynccombobox', 'asyncmulticombobox',
    'infiniteselect', 'infinitemultiselect', 'infinitecombobox', 'infinitemulticombobox'];

  const fieldInfos = hydratedFieldNames.map(name => {
    const field = allFields.find((f: FormFieldConfig) => f.name === name);
    return { name, hasOptions: field ? optionTypes.includes(field.type) : false, type: field?.type || 'text' };
  });

  const fieldFetches = fieldInfos.map(({ name, hasOptions }) => {
    if (hasOptions) {
      return `    // Fetch options for "${name}" from your API
    // const ${name}Response = await axios.get("/api/${name}-options");
    // const ${name}Data = ${name}Response.data;`;
    }
    return `    // Fetch data for "${name}" from your API
    // const ${name}Response = await axios.get("/api/${name}-data");
    // const ${name}Data = ${name}Response.data;`;
  }).join("\n\n");

  const fieldMappings = fieldInfos.map(({ name, hasOptions }) => {
    if (hasOptions) {
      return `      ${name}: [
        // Replace with: ...${name}Data.map((item: any) => ({ label: item.name, value: String(item.id) }))
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
      ],`;
    }
    return `      ${name}: {
        defaultValue: "",
        placeholder: "Loaded from backend",
      },`;
  }).join("\n");

  return `import { useState, useEffect } from "react";
import { FormHydration } from "@/components/forms/hydration";

interface HydrationState {
  hydration: FormHydration;
  isLoading: boolean;
  error: Error | null;
}

export function useFormHydration(): HydrationState {
  const [state, setState] = useState<HydrationState>({
    hydration: {},
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchHydration() {
      try {
${fieldFetches}

        const hydration: FormHydration = {
${fieldMappings}
        };

        setState({ hydration, isLoading: false, error: null });
      } catch (err) {
        setState({ hydration: {}, isLoading: false, error: err as Error });
      }
    }

    fetchHydration();
  }, []);

  return state;
}
`;
}
