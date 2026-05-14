import type { FormConfig } from "@/forms/react-hook-form";

export const formTemplates: Record<string, FormConfig> = {
  allFields: {
    showReset: true,
    layout: "multi-tab",
    id: "all-fields-demo",
    title: "Job Application Form",
    submitLabel: "Submit Application",
    description: "Complete demo showcasing every field type with a real-life hiring scenario",
    sections: [
      {
        columns: 2,
        id: "personal",
        title: "Personal Information",
        description: "Basic details about the applicant",
        fields: [
          { type: "text", name: "full_name", label: "Full Name", placeholder: "Jane Smith", required: true, minLength: 2, maxLength: 100 },
          { type: "email", name: "email", label: "Email Address", placeholder: "jane@company.com", required: true },
          { type: "tel", name: "phone", label: "Phone Number", placeholder: "+1 (555) 123-4567" },
          { type: "url", name: "linkedin", label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/janesmith" },
          { type: "number", name: "years_experience", label: "Years of Experience", placeholder: "5", required: true, min: 0, max: 50 },
          { type: "password", name: "portal_password", label: "Create Portal Password", placeholder: "Min 8 characters", required: true, minLength: 8 },
          { type: "date", name: "available_from", label: "Available From", required: true },
          { type: "date", name: "available_to", label: "Available Until (optional)", minDateField: "available_from" },
        ],
      },
      {
        id: "job-preferences",
        title: "Job Preferences",
        description: "Role and work preferences",
        columns: 2,
        fields: [
          {
            type: "select", name: "department", label: "Department", required: true,
            options: [
              { label: "Engineering", value: "engineering" },
              { label: "Design", value: "design" },
              { label: "Marketing", value: "marketing" },
              { label: "Sales", value: "sales" },
              { label: "HR", value: "hr" },
            ],
          },
          {
            type: "select", name: "team", label: "Team", required: true,
            options: [],
            dependentOptions: {
              watchField: "department",
              optionsMap: {
                engineering: [
                  { label: "Frontend", value: "frontend" },
                  { label: "Backend", value: "backend" },
                  { label: "DevOps", value: "devops" },
                  { label: "QA", value: "qa" },
                ],
                design: [
                  { label: "UI/UX", value: "uiux" },
                  { label: "Graphic Design", value: "graphic" },
                  { label: "Product Design", value: "product" },
                ],
                marketing: [
                  { label: "Content", value: "content" },
                  { label: "SEO", value: "seo" },
                  { label: "Social Media", value: "social" },
                ],
                sales: [
                  { label: "Enterprise", value: "enterprise" },
                  { label: "SMB", value: "smb" },
                ],
                hr: [
                  { label: "Recruitment", value: "recruitment" },
                  { label: "People Ops", value: "people-ops" },
                ],
              },
            },
          },
          {
            type: "radio", name: "employment_type", label: "Employment Type", required: true,
            options: [
              { label: "Full-Time", value: "full-time" },
              { label: "Part-Time", value: "part-time" },
              { label: "Contract", value: "contract" },
              { label: "Freelance", value: "freelance" },
            ],
            orientation: "horizontal" as const,
          },
          {
            type: "combobox", name: "primary_skill", label: "Primary Skill", required: true,
            options: [
              { label: "JavaScript", value: "javascript" },
              { label: "TypeScript", value: "typescript" },
              { label: "Python", value: "python" },
              { label: "Java", value: "java" },
              { label: "Go", value: "go" },
              { label: "Rust", value: "rust" },
              { label: "C#", value: "csharp" },
              { label: "Ruby", value: "ruby" },
              { label: "Swift", value: "swift" },
              { label: "Kotlin", value: "kotlin" },
            ],
            searchPlaceholder: "Search skills...",
            emptyMessage: "No skill found",
          },
          {
            type: "multiselect", name: "secondary_skills", label: "Secondary Skills",
            options: [
              { label: "React", value: "react" },
              { label: "Vue", value: "vue" },
              { label: "Angular", value: "angular" },
              { label: "Node.js", value: "nodejs" },
              { label: "Django", value: "django" },
              { label: "Spring Boot", value: "springboot" },
              { label: "Docker", value: "docker" },
              { label: "Kubernetes", value: "kubernetes" },
            ],
            maxItems: 5,
          },
          {
            type: "multicombobox", name: "certifications", label: "Certifications",
            options: [
              { label: "AWS Solutions Architect", value: "aws-sa" },
              { label: "Google Cloud Professional", value: "gcp-pro" },
              { label: "Azure Administrator", value: "azure-admin" },
              { label: "Kubernetes CKAD", value: "ckad" },
              { label: "PMP", value: "pmp" },
              { label: "Scrum Master", value: "csm" },
            ],
            searchPlaceholder: "Search certifications...",
            emptyMessage: "No certification found",
            maxItems: 3,
          },
        ],
      },
      {
        id: "additional",
        title: "Additional Details",
        description: "Work preferences and additional info",
        columns: 2,
        fields: [
          {
            type: "checkboxgroup", name: "work_perks", label: "Desired Perks",
            options: [
              { label: "Remote Work", value: "remote" },
              { label: "Flexible Hours", value: "flexible" },
              { label: "Health Insurance", value: "health" },
              { label: "Stock Options", value: "stock" },
              { label: "Learning Budget", value: "learning" },
              { label: "Gym Membership", value: "gym" },
            ],
          },
          {
            type: "switchgroup", name: "notifications_pref", label: "Notification Preferences",
            options: [
              { label: "Email updates", value: "email_notif" },
              { label: "SMS alerts", value: "sms_notif" },
              { label: "Push notifications", value: "push_notif" },
            ],
          },
          { type: "switch", name: "willing_to_relocate", label: "Relocation", switchLabel: "Willing to relocate" },
          { type: "checkbox", name: "has_visa", label: "Work Authorization", checkboxLabel: "I am authorized to work in this country" },
          {
            type: "textarea", name: "cover_letter", label: "Cover Letter",
            placeholder: "Tell us why you're a great fit for this role...",
            required: true, rows: 5, minLength: 50, maxLength: 2000,
          },
          {
            type: "textarea", name: "relocation_details", label: "Relocation Details",
            placeholder: "Where would you consider relocating to?",
            rows: 3,
            condition: { field: "willing_to_relocate", operator: "isTrue" },
          },
          {
            type: "file", name: "resume", label: "Upload Resume",
            accept: ".pdf,.doc,.docx",
            multiple: false,
            required: true,
          },
          { type: "checkbox", name: "agree_terms", label: "Terms", checkboxLabel: "I certify that all information is accurate and agree to the privacy policy", required: true },
        ],
      },
    ],
  },
  contact: {
    id: "contact-form",
    title: "Contact Form",
    description: "Get in touch with us",
    submitLabel: "Send Message",
    showReset: true,
    sections: [{
      id: "contact-section",
      title: "Your Details",
      columns: 2,
      fields: [
        { type: "text", name: "first_name", label: "First Name", placeholder: "John", required: true },
        { type: "text", name: "last_name", label: "Last Name", placeholder: "Doe", required: true },
        { type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true },
        { type: "tel", name: "phone", label: "Phone", placeholder: "+1 (555) 000-0000" },
        { type: "textarea", name: "message", label: "Message", placeholder: "Your message...", required: true, rows: 4 },
        { type: "checkbox", name: "terms", label: "Terms", checkboxLabel: "I agree to the terms and conditions" },
      ],
    }],
  },
  registration: {
    id: "registration-form",
    title: "Registration Form",
    description: "Create your account",
    submitLabel: "Register",
    showReset: true,
    sections: [
      {
        id: "personal",
        title: "Personal Information",
        columns: 2,
        fields: [
          { type: "text", name: "username", label: "Username", required: true },
          { type: "email", name: "email", label: "Email", required: true },
          { type: "password", name: "password", label: "Password", required: true, minLength: 8 },
          { type: "password", name: "confirm_password", label: "Confirm Password", required: true },
          { type: "date", name: "date_of_birth", label: "Date of Birth" },
          { type: "select", name: "gender", label: "Gender", options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]},
        ],
      },
      {
        id: "preferences",
        title: "Preferences",
        columns: 1,
        fields: [
          { type: "switchgroup", name: "notifications", label: "Notifications", options: [
            { label: "Email notifications", value: "email" },
            { label: "SMS notifications", value: "sms" },
          ]},
          { type: "checkbox", name: "terms", label: "Terms", checkboxLabel: "I accept the terms and conditions", required: true },
        ],
      },
    ],
  },
  survey: {
    id: "survey-form",
    title: "Customer Survey",
    description: "Help us improve our service",
    submitLabel: "Submit Survey",
    showReset: false,
    sections: [{
      id: "survey-section",
      title: "Your Feedback",
      columns: 1,
      fields: [
        { type: "radio", name: "satisfaction", label: "Overall Satisfaction", required: true, options: [
          { label: "Very Satisfied", value: "5" },
          { label: "Satisfied", value: "4" },
          { label: "Neutral", value: "3" },
          { label: "Dissatisfied", value: "2" },
          { label: "Very Dissatisfied", value: "1" },
        ], orientation: "horizontal" as const },
        { type: "checkboxgroup", name: "features", label: "Features You Like", options: [
          { label: "Ease of Use", value: "ease" },
          { label: "Performance", value: "performance" },
          { label: "Design", value: "design" },
          { label: "Support", value: "support" },
        ]},
        { type: "textarea", name: "comments", label: "Additional Comments", placeholder: "Tell us more...", rows: 4 },
        { type: "switch", name: "follow_up", label: "Follow Up", switchLabel: "I'd like to be contacted for follow-up" },
      ],
    }],
  },
  dateRange: {
    id: "date-range-form",
    title: "Date Range Form",
    description: "Select a validity period with linked date constraints",
    submitLabel: "Submit",
    showReset: true,
    sections: [{
      id: "date-section",
      title: "Validity Period",
      columns: 2,
      fields: [
        { type: "text", name: "document_name", label: "Document Name", required: true },
        { type: "select", name: "document_type", label: "Document Type", options: [
          { label: "Contract", value: "contract" },
          { label: "License", value: "license" },
          { label: "Certificate", value: "certificate" },
        ]},
        { type: "date", name: "valid_from", label: "Valid From", required: true },
        { type: "date", name: "valid_to", label: "Valid To", required: true, minDateField: "valid_from" },
      ],
    }],
  },
  countryState: {
    id: "country-state-form",
    title: "Location Form",
    description: "Dependent dropdowns — selecting a country filters the state options",
    submitLabel: "Save Location",
    showReset: true,
    sections: [{
      id: "location-section",
      title: "Location Details",
      columns: 2,
      fields: [
        { type: "text", name: "full_name", label: "Full Name", required: true },
        { type: "email", name: "email", label: "Email", required: true },
        {
          type: "select", name: "country", label: "Country", required: true,
          options: [
            { label: "United States", value: "usa" },
            { label: "Canada", value: "canada" },
            { label: "United Kingdom", value: "uk" },
          ],
        },
        {
          type: "select", name: "state", label: "State / Province", required: true,
          options: [],
          dependentOptions: {
            watchField: "country",
            optionsMap: {
              usa: [
                { label: "California", value: "CA" },
                { label: "New York", value: "NY" },
                { label: "Texas", value: "TX" },
                { label: "Florida", value: "FL" },
                { label: "Illinois", value: "IL" },
              ],
              canada: [
                { label: "Ontario", value: "ON" },
                { label: "Quebec", value: "QC" },
                { label: "British Columbia", value: "BC" },
                { label: "Alberta", value: "AB" },
              ],
              uk: [
                { label: "England", value: "ENG" },
                { label: "Scotland", value: "SCO" },
                { label: "Wales", value: "WAL" },
                { label: "Northern Ireland", value: "NI" },
              ],
            },
          },
        },
        { type: "text", name: "city", label: "City" },
        { type: "text", name: "zip", label: "Zip / Postal Code" },
        {
          type: "textarea", name: "notes", label: "Additional Notes",
          condition: { field: "country", operator: "notEmpty" },
          placeholder: "Any special instructions...",
          rows: 3,
        },
      ],
    }],
  },
  // ─── Invoice Calculator (preview fields SENT to backend) ───
  invoiceCalculator: {
    id: "invoice-calculator",
    title: "Invoice Calculator",
    description: "Preview fields included in submission — useful when backend needs calculated values",
    submitLabel: "Create Invoice",
    showReset: true,
    sections: [{
      id: "invoice-section",
      title: "Line Item",
      columns: 2,
      fields: [
        { type: "text", name: "item_name", label: "Item Name", placeholder: "Product or service", required: true },
        { type: "number", name: "quantity", label: "Quantity", placeholder: "1", required: true, min: 1 },
        { type: "number", name: "unit_price", label: "Unit Price ($)", placeholder: "0.00", required: true, min: 0 },
        { type: "number", name: "tax_rate", label: "Tax Rate (%)", placeholder: "10", min: 0, max: 100, defaultValue: "10" },
        {
          type: "preview", name: "subtotal", label: "Subtotal",
          watchFields: ["quantity", "unit_price"],
          calculation: { rule: "multiply" as const },
          format: "${value}", decimals: 2, variant: "default" as const,
        },
        {
          type: "preview", name: "total", label: "Total (incl. tax)",
          watchFields: ["quantity", "unit_price", "tax_rate"],
          calculation: { rule: "custom" as const, customExpression: "{quantity} * {unit_price} * (1 + {tax_rate} / 100)" },
          format: "${value}", decimals: 2, variant: "highlight" as const,
        },
        { type: "empty", name: "spacer1", excludeFromSubmit: true },
        {
          type: "preview", name: "summary", label: "Summary",
          watchFields: ["item_name", "quantity"],
          calculation: { rule: "concat" as const },
          format: "{quantity}x {item_name}", emptyText: "Fill item details above",
          variant: "card" as const, colSpan: 2,
        },
        { type: "textarea", name: "notes", label: "Notes", placeholder: "Additional notes...", rows: 3, colSpan: 2 },
      ],
    }],
  },
  // ─── Display-Only Preview (preview fields NOT sent to backend) ───
  displayOnlyPreview: {
    id: "display-only-preview",
    title: "Order Summary Form",
    description: "Preview and empty fields excluded from submission — display only for user reference",
    submitLabel: "Place Order",
    showReset: true,
    sections: [{
      id: "order-section",
      title: "Order Details",
      columns: 2,
      fields: [
        { type: "text", name: "product", label: "Product Name", placeholder: "Widget Pro", required: true },
        { type: "number", name: "qty", label: "Quantity", placeholder: "1", required: true, min: 1 },
        { type: "number", name: "price", label: "Price ($)", placeholder: "29.99", required: true, min: 0 },
        { type: "select", name: "currency", label: "Currency", required: true, options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" },
          { label: "GBP", value: "GBP" },
        ]},
        { type: "empty", name: "spacer_display", excludeFromSubmit: true },
        {
          type: "preview", name: "line_total_display", label: "Estimated Total",
          excludeFromSubmit: true,
          watchFields: ["qty", "price"],
          calculation: { rule: "multiply" as const },
          decimals: 2, variant: "highlight" as const,
        },
        {
          type: "preview", name: "order_label_display", label: "Order Label",
          excludeFromSubmit: true,
          watchFields: ["product", "qty", "currency"],
          format: "{qty}x {product} ({currency})", emptyText: "Fill in order details",
          variant: "card" as const, colSpan: 2,
        },
        { type: "checkbox", name: "confirm", label: "Confirm", checkboxLabel: "I confirm this order", required: true },
      ],
    }],
  },
  // ─── Async & Infinite Fields Demo ───
  asyncInfiniteDemo: {
    id: "async-infinite-demo",
    title: "Remote Data Form",
    description: "All async and infinite field types using JSONPlaceholder & DummyJSON APIs",
    submitLabel: "Submit",
    showReset: true,
    sections: [
      {
        id: "async-section",
        title: "Async Fields (fetch all on mount)",
        columns: 2,
        fields: [
          {
            type: "asyncselect", name: "async_user", label: "User (Async Select)", required: true,
            options: [],
            apiConfig: {
              url: "https://jsonplaceholder.typicode.com/users", method: "GET" as const,
              responseMapping: { dataPath: "", labelKey: "name", valueKey: "id" },
            },
          },
          {
            type: "asynccombobox", name: "async_post", label: "Post (Async Combobox)",
            options: [],
            searchPlaceholder: "Search posts...", emptyMessage: "No posts found",
            apiConfig: {
              url: "https://jsonplaceholder.typicode.com/posts", method: "GET" as const,
              responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
            },
          },
          {
            type: "asyncmultiselect", name: "async_albums", label: "Albums (Async Multi Select)",
            options: [], maxItems: 3,
            apiConfig: {
              url: "https://jsonplaceholder.typicode.com/albums", method: "GET" as const,
              responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
            },
          },
          {
            type: "asyncmulticombobox", name: "async_todos", label: "Todos (Async Multi Combobox)",
            options: [], maxItems: 5,
            searchPlaceholder: "Search todos...", emptyMessage: "No todos found",
            apiConfig: {
              url: "https://jsonplaceholder.typicode.com/todos", method: "GET" as const,
              responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
            },
          },
        ],
      },
      {
        id: "infinite-section",
        title: "Infinite Scroll Fields (paginated loading)",
        columns: 2,
        fields: [
          {
            type: "infiniteselect", name: "inf_product", label: "Product (Infinite Select)",
            options: [],
            apiConfig: {
              url: "https://dummyjson.com/products", method: "GET" as const,
              responseMapping: { dataPath: "products", labelKey: "title", valueKey: "id" },
              searchParam: "q", pageParam: "skip", pageSizeParam: "limit", pageSize: 10,
              hasMorePath: "total",
            },
          },
          {
            type: "infinitecombobox", name: "inf_recipe", label: "Recipe (Infinite Combobox)",
            options: [],
            searchPlaceholder: "Search recipes...", emptyMessage: "No recipes found",
            apiConfig: {
              url: "https://dummyjson.com/recipes", method: "GET" as const,
              responseMapping: { dataPath: "recipes", labelKey: "name", valueKey: "id" },
              searchParam: "q", pageParam: "skip", pageSizeParam: "limit", pageSize: 10,
              hasMorePath: "total",
            },
          },
          {
            type: "infinitemultiselect", name: "inf_users", label: "Users (Infinite Multi Select)",
            options: [], maxItems: 5,
            apiConfig: {
              url: "https://dummyjson.com/users", method: "GET" as const,
              responseMapping: { dataPath: "users", labelKey: "firstName", valueKey: "id" },
              searchParam: "q", pageParam: "skip", pageSizeParam: "limit", pageSize: 10,
              hasMorePath: "total",
            },
          },
          {
            type: "infinitemulticombobox", name: "inf_posts", label: "Posts (Infinite Multi Combobox)",
            options: [], maxItems: 5,
            searchPlaceholder: "Search posts...", emptyMessage: "No posts found",
            apiConfig: {
              url: "https://dummyjson.com/posts", method: "GET" as const,
              responseMapping: { dataPath: "posts", labelKey: "title", valueKey: "id" },
              searchParam: "q", pageParam: "skip", pageSizeParam: "limit", pageSize: 10,
              hasMorePath: "total",
            },
          },
        ],
      },
    ],
  },
};
