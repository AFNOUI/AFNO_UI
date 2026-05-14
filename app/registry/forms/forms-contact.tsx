import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "contact-form",
  title: "Contact Us",
  description: "Send us a message and we'll get back to you.",
  submitLabel: "Send Message",
  showReset: false,
  layout: "single",
  sections: [
    {
      id: "contact-details",
      title: "Your Details",
      columns: 2,
      fields: [
        { type: "text", name: "firstName", label: "First Name", placeholder: "John", required: true },
        { type: "text", name: "lastName", label: "Last Name", placeholder: "Doe", required: true },
        { type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true },
        { type: "textarea", name: "message", label: "Message", placeholder: "Your message...", rows: 4, required: true },
        { type: "checkbox", name: "terms", label: "Terms", checkboxLabel: "I agree to the terms and conditions" },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  message: z.string().min(1, "Message is required"),
  terms: z.boolean(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  message: z.string().min(1, "Message is required"),
  terms: z.boolean(),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Contact",
  description: "Single-section contact form with text, email, textarea, and terms checkbox.",
};
