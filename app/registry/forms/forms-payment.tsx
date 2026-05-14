import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "payment-form",
  title: "Payment Details",
  description: "Complete your purchase securely",
  submitLabel: "Pay $99.00",
  showReset: false,
  layout: "single",
  sections: [
    {
      id: "card-details",
      title: "Card Information",
      columns: 2,
      fields: [
        { type: "text", name: "cardNumber", label: "Card Number", placeholder: "4242 4242 4242 4242", required: true },
        { type: "text", name: "cardholderName", label: "Cardholder Name", placeholder: "John Doe", required: true },
        { type: "text", name: "expiry", label: "Expiry Date", placeholder: "MM/YY", required: true },
        { type: "text", name: "cvc", label: "CVC", placeholder: "123", required: true },
      ],
    },
    {
      id: "billing-address",
      title: "Billing Address",
      columns: 2,
      fields: [
        { type: "text", name: "address", label: "Address", placeholder: "Address line 1", required: true },
        { type: "text", name: "city", label: "City", placeholder: "City", required: true },
        { type: "text", name: "postalCode", label: "Postal Code", placeholder: "Postal Code", required: true },
        { type: "select", name: "country", label: "Country", required: true, options: [
          { label: "United States", value: "us" },
          { label: "United Kingdom", value: "uk" },
          { label: "Canada", value: "ca" },
        ]},
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  cardNumber: z.string().min(1, "Card Number is required"),
  cardholderName: z.string().min(1, "Cardholder Name is required"),
  expiry: z.string().min(1, "Expiry Date is required"),
  cvc: z.string().min(1, "CVC is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  country: z.string().min(1, "Country is required"),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  cardNumber: z.string().min(1, "Card Number is required"),
  cardholderName: z.string().min(1, "Cardholder Name is required"),
  expiry: z.string().min(1, "Expiry Date is required"),
  cvc: z.string().min(1, "CVC is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  country: z.string().min(1, "Country is required"),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Payment",
  description: "Card details and billing address in a single layout.",
};
