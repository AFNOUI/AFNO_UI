import { cn } from "@/lib/utils";
import { Layers, LayoutList, ArrowRight, Square, HelpCircle } from "lucide-react";

import { FormConfig } from "@/forms/react-hook-form";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type FormLayoutType = "single" | "multi-tab" | "wizard" | "compact";

interface LayoutOption {
  name: string;
  id: FormLayoutType;
  description: string;
  icon: typeof Layers;
}

const layoutOptions: LayoutOption[] = [
  {
    id: "single",
    icon: Square,
    name: "Single Section",
    description: "All fields in one card. Best for simple forms with 3-6 fields.",
  },
  {
    icon: Layers,
    id: "multi-tab",
    name: "Multi-Tab",
    description: "Fields organized into tabbed sections with Previous/Next navigation. Best for 7+ fields grouped by topic.",
  },
  {
    id: "wizard",
    icon: ArrowRight,
    name: "Wizard (Steps)",
    description: "Multi-step form with one section visible at a time and step indicators. Best for onboarding or long flows.",
  },
  {
    id: "compact",
    icon: LayoutList,
    name: "Compact (No Title)",
    description: "Minimal form without section titles. Best for inline forms, login, or search.",
  },
];

export function createLayoutConfig(layout: FormLayoutType): FormConfig {
  switch (layout) {
    case "single":
      return {
        showReset: true,
        layout: "single",
        id: "custom-form",
        submitLabel: "Submit",
        title: "Employee Onboarding",
        description: "Fill out the new hire information below",
        sections: [
          {
            columns: 2,
            id: "section-1",
            title: "Personal Information",
            description: "Basic employee details",
            fields: [
              { type: "text", name: "first_name", label: "First Name", placeholder: "John", required: true },
              { type: "text", name: "last_name", label: "Last Name", placeholder: "Doe", required: true },
              { type: "email", name: "email", label: "Work Email", placeholder: "john.doe@company.com", required: true },
              { type: "tel", name: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
              { type: "date", name: "start_date", label: "Start Date", required: true },
              { type: "select", name: "department", label: "Department", required: true, options: [
                { label: "Engineering", value: "engineering" },
                { label: "Design", value: "design" },
                { label: "Marketing", value: "marketing" },
                { label: "Sales", value: "sales" },
                { label: "HR", value: "hr" },
              ]},
            ],
          },
        ],
      };
    case "multi-tab":
      return {
        id: "custom-form",
        title: "Company Registration",
        description: "Complete all sections to register your company",
        submitLabel: "Register Company",
        showReset: true,
        layout: "multi-tab",
        sections: [
          {
            id: "company-info",
            title: "Company Information",
            description: "Basic company details",
            columns: 2,
            fields: [
              { type: "text", name: "company_code", label: "Company Code", placeholder: "ABC-123", required: true },
              { type: "text", name: "company_name", label: "Company Name", placeholder: "ACME Corporation LLC", required: true },
              { type: "text", name: "display_name", label: "Company Display Name", placeholder: "ACME Corp", required: true },
              { type: "select", name: "parent_company", label: "Parent Company", options: [
                { label: "None", value: "none" },
                { label: "Global Corp", value: "global" },
                { label: "Tech Holdings", value: "tech" },
              ]},
              { type: "text", name: "registration_number", label: "Registration Number", placeholder: "REG-123456789" },
              { type: "select", name: "company_type", label: "Company Type", required: true, options: [
                { label: "LLC", value: "llc" },
                { label: "Corporation", value: "corp" },
                { label: "Partnership", value: "partnership" },
                { label: "Sole Proprietorship", value: "sole" },
              ]},
              { type: "file", name: "company_logo", label: "Company Logo", accept: ".png,.jpg,.svg", multiple: false },
            ],
          },
          {
            id: "legal-registration",
            title: "Legal & Registration",
            description: "Legal information and tax details",
            columns: 2,
            fields: [
              { type: "text", name: "tax_id", label: "Tax ID / EIN", placeholder: "XX-XXXXXXX", required: true },
              { type: "text", name: "legal_entity", label: "Legal Entity Name", placeholder: "ACME Corporation LLC", required: true },
              { type: "date", name: "incorporation_date", label: "Incorporation Date" },
              { type: "select", name: "jurisdiction", label: "Jurisdiction", options: [
                { label: "Delaware", value: "DE" },
                { label: "California", value: "CA" },
                { label: "New York", value: "NY" },
                { label: "Texas", value: "TX" },
              ]},
            ],
          },
          {
            id: "address",
            title: "Address",
            description: "Company headquarters and mailing address",
            columns: 2,
            fields: [
              { type: "text", name: "street_address", label: "Street Address", placeholder: "123 Main St", required: true },
              { type: "text", name: "suite", label: "Suite / Unit", placeholder: "Suite 100" },
              { type: "text", name: "city", label: "City", placeholder: "San Francisco", required: true },
              { type: "text", name: "state", label: "State / Province", placeholder: "CA", required: true },
              { type: "text", name: "zip", label: "ZIP / Postal Code", placeholder: "94105", required: true },
              { type: "select", name: "country", label: "Country", required: true, options: [
                { label: "United States", value: "us" },
                { label: "Canada", value: "ca" },
                { label: "United Kingdom", value: "uk" },
              ]},
            ],
          },
          {
            id: "contact",
            title: "Contact",
            description: "Primary contact information",
            columns: 2,
            fields: [
              { type: "text", name: "contact_name", label: "Contact Person", placeholder: "Jane Smith", required: true },
              { type: "email", name: "contact_email", label: "Contact Email", placeholder: "jane@acme.com", required: true },
              { type: "tel", name: "contact_phone", label: "Contact Phone", placeholder: "+1 (555) 000-0000" },
              { type: "url", name: "website", label: "Website", placeholder: "https://acme.com" },
            ],
          },
        ],
      };
    case "wizard":
      return {
        id: "custom-form",
        title: "Account Setup Wizard",
        description: "Complete each step to set up your account",
        submitLabel: "Create Account",
        showReset: false,
        layout: "wizard",
        sections: [
          {
            id: "step-1",
            title: "Step 1: Personal Info",
            description: "Tell us about yourself",
            columns: 2,
            fields: [
              { type: "text", name: "full_name", label: "Full Name", placeholder: "John Doe", required: true },
              { type: "email", name: "email", label: "Email Address", placeholder: "john@example.com", required: true },
              { type: "tel", name: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
              { type: "date", name: "dob", label: "Date of Birth" },
            ],
          },
          {
            id: "step-2",
            title: "Step 2: Professional Details",
            description: "Your work information",
            columns: 2,
            fields: [
              { type: "text", name: "company", label: "Company Name", placeholder: "ACME Inc." },
              { type: "text", name: "job_title", label: "Job Title", placeholder: "Software Engineer" },
              { type: "select", name: "industry", label: "Industry", required: true, options: [
                { label: "Technology", value: "tech" },
                { label: "Finance", value: "finance" },
                { label: "Healthcare", value: "healthcare" },
                { label: "Education", value: "education" },
                { label: "Other", value: "other" },
              ]},
              { type: "select", name: "company_size", label: "Company Size", options: [
                { label: "1-10", value: "1-10" },
                { label: "11-50", value: "11-50" },
                { label: "51-200", value: "51-200" },
                { label: "201-1000", value: "201-1000" },
                { label: "1000+", value: "1000+" },
              ]},
            ],
          },
          {
            id: "step-3",
            title: "Step 3: Preferences",
            description: "Customize your experience",
            columns: 1,
            fields: [
              { type: "switchgroup", name: "notifications", label: "Notification Preferences", options: [
                { label: "Email notifications", value: "email" },
                { label: "SMS notifications", value: "sms" },
                { label: "Push notifications", value: "push" },
              ]},
              { type: "radio", name: "theme", label: "Preferred Theme", options: [
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "system" },
              ], orientation: "horizontal" as const },
              { type: "textarea", name: "bio", label: "Short Bio", placeholder: "Tell us about yourself...", rows: 3 },
              { type: "checkbox", name: "terms", label: "Terms", checkboxLabel: "I agree to the Terms of Service and Privacy Policy", required: true },
            ],
          },
        ],
      };
    case "compact":
      return {
        id: "custom-form",
        title: "",
        description: "",
        submitLabel: "Sign In",
        showReset: false,
        layout: "compact",
        sections: [
          {
            id: "section-1",
            columns: 1,
            fields: [
              { type: "email", name: "email", label: "Email", placeholder: "you@example.com", required: true },
              { type: "password", name: "password", label: "Password", placeholder: "••••••••", required: true },
              { type: "checkbox", name: "remember", label: "Remember", checkboxLabel: "Remember me for 30 days" },
            ],
          },
        ],
      };
  }
}

interface LayoutPickerProps {
  currentLayout: FormLayoutType;
  onSelectLayout: (layout: FormLayoutType) => void;
}

export function LayoutPicker({ currentLayout, onSelectLayout }: LayoutPickerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 mr-1">
        <span className="text-xs font-medium text-muted-foreground">Layout:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <p className="text-xs">Choose a layout to load a pre-filled sample form. You can always customize fields, add/remove sections, and change settings after loading.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {layoutOptions.map((layout) => {
        const Icon = layout.icon;
        const isActive = currentLayout === layout.id;
        return (
          <Tooltip key={layout.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectLayout(layout.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {layout.name}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px]">
              <p className="text-xs font-medium mb-1">{layout.name}</p>
              <p className="text-xs text-muted-foreground">{layout.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
