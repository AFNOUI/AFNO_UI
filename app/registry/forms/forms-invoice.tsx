import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "invoice-form",
  title: "Invoice Calculator",
  description: "Preview fields are included in submission data",
  submitLabel: "Create Invoice",
  showReset: true,
  layout: "single",
  sections: [
    {
      id: "invoice-items",
      title: "Line Item",
      columns: 2,
      fields: [
        { type: "text", name: "itemName", label: "Item Name", placeholder: "Product or service", required: true },
        { type: "number", name: "quantity", label: "Quantity", placeholder: "1", required: true, min: 1 },
        { type: "number", name: "unitPrice", label: "Unit Price ($)", placeholder: "0.00", required: true, min: 0 },
        { type: "number", name: "taxRate", label: "Tax Rate (%)", placeholder: "10", min: 0, max: 100, defaultValue: "10" },
        {
          type: "preview",
          name: "subtotal",
          label: "Subtotal",
          watchFields: ["quantity", "unitPrice"],
          calculation: { rule: "multiply" as const },
          format: "${value}",
          decimals: 2,
          variant: "default" as const,
        },
        {
          type: "preview",
          name: "total",
          label: "Total (incl. tax)",
          watchFields: ["quantity", "unitPrice", "taxRate"],
          calculation: {
            rule: "custom" as const,
            customExpression: "{quantity} * {unitPrice} * (1 + {taxRate} / 100)",
          },
          format: "${value}",
          decimals: 2,
          variant: "highlight" as const,
        },
        { type: "empty", name: "spacer1", excludeFromSubmit: true },
        {
          type: "preview",
          name: "summary",
          label: "Summary",
          watchFields: ["itemName", "quantity"],
          calculation: { rule: "concat" as const },
          format: "{quantity}x {itemName}",
          emptyText: "Fill item details above",
          variant: "card" as const,
          colSpan: 2,
        },
        { type: "textarea", name: "notes", label: "Notes", placeholder: "Additional notes...", rows: 3, colSpan: 2 },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  itemName: z.string().min(1, "Item Name is required"),
  quantity: z.any().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1, "Quantity must be at least 1"),
  unitPrice: z.any().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Unit Price is required"),
  taxRate: z.any().optional(),
  notes: z.string().optional(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  itemName: z.string().min(1, "Item Name is required"),
  quantity: z.any().refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Quantity must be at least 1"),
  unitPrice: z.any().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Unit Price is required"),
  taxRate: z.any().optional(),
  notes: z.string().optional(),
});`;

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`;

export const data = {
  title: "Invoice (Preview)",
  description: "Preview fields are included in submission data.",
};
