import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "conditional-form",
  title: "Dynamic Registration",
  description: "Fields appear/disappear based on your selections",
  submitLabel: "Create Account",
  showReset: true,
  layout: "single",
  sections: [
    {
      id: "basic-info",
      title: "Basic Information",
      columns: 2,
      fields: [
        { type: "text", name: "firstName", label: "First Name", placeholder: "John", required: true },
        { type: "text", name: "lastName", label: "Last Name", placeholder: "Doe", required: true },
        { type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true },
        { type: "switch", name: "isCompany", label: "Account Type", switchLabel: "Register as a company?" },
      ],
    },
    {
      id: "company-info",
      title: "Company Information",
      description: "Fill in your company details",
      columns: 2,
      fields: [
        {
          type: "text", name: "companyName", label: "Company Name", placeholder: "Acme Inc.", required: true,
          condition: { field: "isCompany", operator: "isTrue" },
        },
        {
          type: "text", name: "registrationNumber", label: "Registration Number", placeholder: "REG-123456", required: true,
          condition: { field: "isCompany", operator: "isTrue" },
        },
        {
          type: "text", name: "taxId", label: "Tax ID", placeholder: "TAX-789012",
          condition: { field: "isCompany", operator: "isTrue" },
        },
        {
          type: "select", name: "companySize", label: "Company Size",
          condition: { field: "isCompany", operator: "isTrue" },
          options: [
            { label: "1-10 employees", value: "1-10" },
            { label: "11-50 employees", value: "11-50" },
            { label: "51-200 employees", value: "51-200" },
            { label: "200+ employees", value: "200+" },
          ],
        },
      ],
    },
    {
      id: "account-type",
      title: "Account & Services",
      columns: 1,
      fields: [
        { type: "radio", name: "accountType", label: "Account Type", options: [
          { label: "Basic Account — Free tier with limited features", value: "basic" },
          { label: "Pro Account — Advanced features + priority support", value: "pro" },
          { label: "Enterprise — Custom solutions + dedicated manager", value: "enterprise" },
        ]},
        {
          type: "email", name: "billingEmail", label: "Billing Email", placeholder: "billing@company.com",
          condition: { field: "accountType", operator: "equals", value: "pro" },
        },
        {
          type: "select", name: "paymentMethod", label: "Preferred Payment Method",
          condition: { field: "accountType", operator: "equals", value: "pro" },
          options: [
            { label: "Credit/Debit Card", value: "card" },
            { label: "Bank Transfer", value: "bank" },
            { label: "PayPal", value: "paypal" },
          ],
        },
        {
          type: "text", name: "accountManager", label: "Dedicated Account Manager", placeholder: "Preferred contact name",
          condition: { field: "accountType", operator: "equals", value: "enterprise" },
        },
        {
          type: "number", name: "expectedUsers", label: "Expected Monthly Users", placeholder: "1000",
          condition: { field: "accountType", operator: "equals", value: "enterprise" },
        },
        {
          type: "textarea", name: "customRequirements", label: "Custom Requirements", placeholder: "Describe your specific needs...", rows: 3,
          condition: { field: "accountType", operator: "equals", value: "enterprise" },
        },
        { type: "checkboxgroup", name: "services", label: "Additional Services", orientation: "horizontal" as const, options: [
          { label: "API Access", value: "api" },
          { label: "SSO Integration", value: "sso" },
          { label: "Advanced Analytics", value: "analytics" },
          { label: "24/7 Support", value: "support" },
        ]},
        { type: "checkbox", name: "needsShipping", label: "Shipping", checkboxLabel: "I need physical products shipped to me" },
      ],
    },
    {
      id: "shipping-address",
      title: "Shipping Address",
      columns: 2,
      fields: [
        { type: "text", name: "street", label: "Street Address", placeholder: "123 Main Street", condition: { field: "needsShipping", operator: "isTrue" } },
        { type: "text", name: "shippingCity", label: "City", placeholder: "New York", condition: { field: "needsShipping", operator: "isTrue" } },
        { type: "text", name: "shippingPostalCode", label: "Postal Code", placeholder: "10001", condition: { field: "needsShipping", operator: "isTrue" } },
        {
          type: "select", name: "shippingCountry", label: "Country",
          condition: { field: "needsShipping", operator: "isTrue" },
          options: [
            { label: "United States", value: "us" },
            { label: "United Kingdom", value: "uk" },
            { label: "Canada", value: "ca" },
            { label: "Australia", value: "au" },
          ],
        },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  isCompany: z.boolean(),
  companyName: z.string().optional().default(""),
  registrationNumber: z.string().optional().default(""),
  taxId: z.string().optional(),
  companySize: z.string().optional(),
  accountType: z.string().optional(),
  billingEmail: z.string().optional(),
  paymentMethod: z.string().optional(),
  accountManager: z.string().optional(),
  expectedUsers: z.any().optional(),
  customRequirements: z.string().optional(),
  services: z.array(z.string()).optional(),
  needsShipping: z.boolean().optional(),
  street: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
}).refine(
  (data) => !data.isCompany || (data.companyName && data.companyName.length > 0),
  { message: "Company Name is required", path: ["companyName"] }
).refine(
  (data) => !data.isCompany || (data.registrationNumber && data.registrationNumber.length > 0),
  { message: "Registration Number is required", path: ["registrationNumber"] }
);

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  isCompany: z.boolean(),
  companyName: z.string().optional().default(""),
  registrationNumber: z.string().optional().default(""),
  taxId: z.string().optional(),
  companySize: z.string().optional(),
  accountType: z.string().optional(),
  billingEmail: z.string().optional(),
  paymentMethod: z.string().optional(),
  accountManager: z.string().optional(),
  expectedUsers: z.any().optional(),
  customRequirements: z.string().optional(),
  services: z.array(z.string()).optional(),
  needsShipping: z.boolean().optional(),
  street: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
}).refine(
  (data) => !data.isCompany || (data.companyName && data.companyName.length > 0),
  { message: "Company Name is required", path: ["companyName"] }
).refine(
  (data) => !data.isCompany || (data.registrationNumber && data.registrationNumber.length > 0),
  { message: "Registration Number is required", path: ["registrationNumber"] }
);`

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`

export const data = {
  title: "Conditional",
  description: "Visible fields and Zod refinements based on account type, company, and shipping.",
};
