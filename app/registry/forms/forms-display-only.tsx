import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "display-only-form",
  title: "Order Summary",
  description: "Preview fields excluded from submission — display only",
  submitLabel: "Place Order",
  showReset: true,
  layout: "single",
  sections: [
    {
      id: "order-section",
      title: "Order Details",
      columns: 2,
      fields: [
        { type: "text", name: "product", label: "Product", placeholder: "Widget Pro", required: true },
        { type: "number", name: "qty", label: "Quantity", placeholder: "1", required: true, min: 1 },
        { type: "number", name: "price", label: "Price ($)", placeholder: "29.99", required: true, min: 0 },
        {
          type: "select",
          name: "currency",
          label: "Currency",
          required: true,
          options: [
            { label: "USD", value: "USD" },
            { label: "EUR", value: "EUR" },
            { label: "GBP", value: "GBP" },
          ],
        },
        { type: "empty", name: "spacerDisplay", excludeFromSubmit: true },
        {
          type: "preview",
          name: "lineTotal",
          label: "Estimated Total",
          excludeFromSubmit: true,
          watchFields: ["qty", "price"],
          calculation: { rule: "multiply" as const },
          decimals: 2,
          variant: "highlight" as const,
        },
        {
          type: "preview",
          name: "orderLabel",
          label: "Order Label",
          excludeFromSubmit: true,
          watchFields: ["product", "qty", "currency"],
          format: "{qty}x {product} ({currency})",
          emptyText: "Fill in order details",
          variant: "card" as const,
          colSpan: 2,
        },
        { type: "checkbox", name: "confirm", label: "Confirm", checkboxLabel: "I confirm this order", required: true },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  product: z.string().min(1, "Product is required"),
  qty: z.any().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1, "Quantity must be at least 1"),
  price: z.any().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Price is required"),
  currency: z.string().min(1, "Currency is required"),
  confirm: z.literal(true, { message: "You must confirm" }),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  product: z.string().min(1, "Product is required"),
  qty: z.any().refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Quantity must be at least 1"),
  price: z.any().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Price is required"),
  currency: z.string().min(1, "Currency is required"),
  confirm: z.literal(true, { message: "You must confirm" }),
});`;

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`;

export const data = {
  title: "Display Only",
  description: "Preview fields excluded from submission — display only.",
};
