import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "login-form",
  title: "Welcome Back",
  description: "Sign in to your account to continue",
  submitLabel: "Sign In",
  showReset: false,
  layout: "compact",
  sections: [
    {
      id: "login-fields",
      columns: 1,
      fields: [
        { type: "email", name: "email", label: "Email", placeholder: "name@example.com", required: true },
        { type: "password", name: "password", label: "Password", placeholder: "••••••••", required: true },
        { type: "checkbox", name: "remember", label: "Remember", checkboxLabel: "Remember me" },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Login",
  description: "Compact layout with email, password, and remember me.",
};
