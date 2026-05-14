import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "job-application-form",
  title: "Senior Software Engineer",
  description: "Join our engineering team and build amazing products",
  submitLabel: "Submit Application",
  showReset: false,
  layout: "single",
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      columns: 2,
      fields: [
        { type: "text", name: "firstName", label: "First Name", placeholder: "John", required: true },
        { type: "text", name: "lastName", label: "Last Name", placeholder: "Doe", required: true },
        { type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true },
        { type: "tel", name: "phone", label: "Phone", placeholder: "+1 (555) 000-0000" },
        { type: "url", name: "linkedin", label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/johndoe" },
        { type: "select", name: "experience", label: "Years of Experience", options: [
          { label: "0-2 years", value: "0-2" },
          { label: "3-5 years", value: "3-5" },
          { label: "5-8 years", value: "5-8" },
          { label: "8+ years", value: "8+" },
        ]},
      ],
    },
    {
      id: "application-details",
      title: "Application Details",
      columns: 1,
      fields: [
        { type: "file", name: "resume", label: "Resume/CV", accept: ".pdf,.doc,.docx", required: true },
        { type: "textarea", name: "coverLetter", label: "Why do you want to join us?", placeholder: "Tell us about yourself...", rows: 4 },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  experience: z.string().optional(),
  resume: z.instanceof(File, { message: "Resume is required" }),
  coverLetter: z.string().optional(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
export const schemaCode = `z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  experience: z.string().optional(),
  resume: z.instanceof(File, { message: "Resume is required" }),
  coverLetter: z.string().optional(),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Job Application",
  description: "Personal info, experience select, resume upload, and cover letter.",
};
