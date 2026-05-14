import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "survey-form",
  title: "Customer Feedback",
  description: "Help us improve our services by sharing your experience",
  submitLabel: "Submit Feedback",
  showReset: false,
  layout: "single",
  sections: [
    {
      id: "feedback",
      title: "Your Feedback",
      columns: 1,
      fields: [
        { type: "radio", name: "satisfaction", label: "How would you rate your overall experience?", required: true, orientation: "horizontal" as const, options: [
          { label: "1 - Very Poor", value: "1" },
          { label: "2 - Poor", value: "2" },
          { label: "3 - Neutral", value: "3" },
          { label: "4 - Good", value: "4" },
          { label: "5 - Excellent", value: "5" },
        ]},
        { type: "checkboxgroup", name: "features", label: "What features do you use most?", orientation: "horizontal" as const, options: [
          { label: "Dashboard", value: "dashboard" },
          { label: "Reports", value: "reports" },
          { label: "Analytics", value: "analytics" },
          { label: "Integrations", value: "integrations" },
          { label: "API", value: "api" },
          { label: "Support", value: "support" },
        ]},
        { type: "radio", name: "recommend", label: "How likely are you to recommend us?", options: [
          { label: "Very Likely", value: "very-likely" },
          { label: "Likely", value: "likely" },
          { label: "Neutral", value: "neutral" },
          { label: "Unlikely", value: "unlikely" },
        ]},
        { type: "textarea", name: "comments", label: "Additional Comments", placeholder: "Share your thoughts...", rows: 4 },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  satisfaction: z.string().min(1, "Please rate your experience"),
  features: z.array(z.string()),
  recommend: z.string().optional(),
  comments: z.string().optional(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  satisfaction: z.string().min(1, "Please rate your experience"),
  features: z.array(z.string()),
  recommend: z.string().optional(),
  comments: z.string().optional(),
});`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Survey",
  description: "Ratings, multi-select features, recommendation, and comments.",
};
