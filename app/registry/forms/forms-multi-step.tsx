import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "registration-wizard",
  title: "Create Account",
  description: "Complete all steps to create your account.",
  submitLabel: "Create Account",
  showReset: false,
  layout: "wizard",
  sections: [
    {
      id: "personal-info",
      title: "Personal Info",
      description: "Tell us about yourself",
      columns: 2,
      fields: [
        { type: "text", name: "firstName", label: "First Name", placeholder: "John", required: true },
        { type: "text", name: "lastName", label: "Last Name", placeholder: "Doe", required: true },
        { type: "date", name: "dob", label: "Date of Birth" },
        { type: "radio", name: "gender", label: "Gender", orientation: "horizontal" as const, options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Other", value: "other" },
        ]},
      ],
    },
    {
      id: "contact-details",
      title: "Contact Details",
      description: "How can we reach you?",
      columns: 2,
      fields: [
        { type: "email", name: "email", label: "Email Address", placeholder: "john@example.com", required: true },
        { type: "tel", name: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
        { type: "text", name: "address", label: "Address", placeholder: "123 Main Street" },
        { type: "text", name: "city", label: "City", placeholder: "New York" },
        { type: "text", name: "postalCode", label: "Postal Code", placeholder: "10001" },
      ],
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize your experience",
      columns: 1,
      fields: [
        { type: "select", name: "language", label: "Preferred Language", options: [
          { label: "English", value: "en" },
          { label: "Spanish", value: "es" },
          { label: "French", value: "fr" },
          { label: "German", value: "de" },
        ]},
        { type: "switchgroup", name: "notifications", label: "Notification Preferences", options: [
          { label: "Email notifications", value: "email" },
          { label: "SMS notifications", value: "sms" },
          { label: "Marketing emails", value: "marketing" },
        ]},
        { type: "checkboxgroup", name: "interests", label: "Interests", orientation: "horizontal" as const, options: [
          { label: "Technology", value: "technology" },
          { label: "Design", value: "design" },
          { label: "Business", value: "business" },
          { label: "Marketing", value: "marketing" },
          { label: "Finance", value: "finance" },
          { label: "Health", value: "health" },
        ]},
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  email: z.email("Invalid email address").min(1, "Email Address is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  language: z.string().optional(),
  notifications: z.record(z.string(), z.boolean()),
  interests: z.array(z.string()),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  email: z.email("Invalid email address").min(1, "Email Address is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  language: z.string().optional(),
  notifications: z.record(z.string(), z.boolean()),
  interests: z.array(z.string()),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Multi-step",
  description: "Wizard layout with personal info, contact, and preferences.",
};
