import type { FormConfig } from "@/forms/types/types";

export function generateFormConfigCode(config: FormConfig): string {
  const jsonStr = JSON.stringify(config, null, 2);
  return `import { FormConfig } from "@/components/forms/types";

export const formConfig: FormConfig = ${jsonStr};
`;
}
