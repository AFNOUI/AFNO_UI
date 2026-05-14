import {
  Type, Mail, Phone, Hash, Link, AlignLeft, Calendar,
  ListOrdered, CircleDot, CheckSquare, List, ToggleLeft,
  Settings2, Search, Upload, Loader2, RefreshCw, Space, Eye
} from "lucide-react";

import type { FormConfig, FormFieldConfig, FieldType } from "@/forms/types/types";

export const fieldTypes = [
  // Basic inputs
  { type: "text", label: "Text", icon: Type, description: "Single line text input for names, titles, or short text. Supports min/max length and regex pattern validation.", category: "basic" },
  { type: "email", label: "Email", icon: Mail, description: "Email address input with built-in email format validation. Ensures a valid email like user@example.com.", category: "basic" },
  { type: "tel", label: "Phone", icon: Phone, description: "Phone number input optimized for phone entry. Shows numeric keyboard on mobile devices.", category: "basic" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric input with optional min/max range validation. Accepts integers and decimals.", category: "basic" },
  { type: "url", label: "URL", icon: Link, description: "URL input with web address format validation. Expects a full URL like https://example.com.", category: "basic" },
  { type: "textarea", label: "Textarea", icon: AlignLeft, description: "Multi-line text area for longer content like descriptions, comments, or messages. Configurable row height.", category: "basic" },
  { type: "date", label: "Date", icon: Calendar, description: "Date picker with calendar popup. Supports min/max date constraints and cross-field date validation.", category: "basic" },

  // Toggles & Choices
  { type: "select", label: "Select", icon: ListOrdered, description: "Dropdown menu for choosing one option from a predefined list. Best for 3–15 options.", category: "selection" },
  { type: "radio", label: "Radio", icon: CircleDot, description: "Radio button group for single selection. All options visible at once — best for 2–5 options.", category: "selection" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Boolean toggle returning true/false. Use for terms acceptance, opt-ins, or yes/no questions. Supports conditional visibility via isTrue/isFalse operators.", category: "selection" },
  { type: "checkboxgroup", label: "Checkbox Group", icon: List, description: "Multiple checkboxes for selecting several options from a list. Returns an array of selected values.", category: "selection" },
  { type: "switch", label: "Switch", icon: ToggleLeft, description: "On/off toggle switch, similar to checkbox but with a sliding UI. Best for feature toggles and settings.", category: "selection" },
  { type: "switchgroup", label: "Switch Group", icon: Settings2, description: "Multiple on/off toggle switches in a group. Returns an object with boolean values per option.", category: "selection" },

  // Combobox
  { type: "combobox", label: "Combobox", icon: Search, description: "Searchable dropdown — type to filter through options. Best for long lists (10+ options) where search helps.", category: "combobox" },
  { type: "multicombobox", label: "Multi Combobox", icon: Search, description: "Searchable dropdown allowing multiple selections with type-to-filter. Shows selected items as badges.", category: "combobox" },

  // Multi Select
  { type: "multiselect", label: "Multi Select", icon: CheckSquare, description: "Multi-select dropdown with badges for selected items. Supports max item limits.", category: "select" },

  // Async Fetch fields — options loaded from API at mount time
  { type: "asyncselect", label: "Async Select", icon: Loader2, description: "Select dropdown that fetches options from an API endpoint when the component mounts. Ideal for data that changes frequently (e.g., users, tags).", category: "async" },
  { type: "asyncmultiselect", label: "Async Multi Select", icon: Loader2, description: "Multi-select that fetches options from an API. Supports selecting multiple values from remotely-loaded data.", category: "async" },
  { type: "asynccombobox", label: "Async Combobox", icon: Loader2, description: "Searchable dropdown with type-ahead that fetches and filters options from a backend API endpoint.", category: "async" },
  { type: "asyncmulticombobox", label: "Async Multi Combobox", icon: Loader2, description: "Multi-select combobox with search and API-fetched options. Combine search filtering with remote data loading.", category: "async" },

  // Infinite Scroll fields — options loaded in pages as user scrolls
  { type: "infiniteselect", label: "Infinite Select", icon: RefreshCw, description: "Select with infinite scroll pagination. Loads more options as the user scrolls down. Best for very large datasets (100+ items).", category: "infinite" },
  { type: "infinitemultiselect", label: "Infinite Multi Select", icon: RefreshCw, description: "Multi-select with infinite scroll. Options load in batches as user scrolls, supporting large collections.", category: "infinite" },
  { type: "infinitecombobox", label: "Infinite Combobox", icon: RefreshCw, description: "Searchable dropdown with infinite scroll pagination. Combines type-ahead search with paginated loading.", category: "infinite" },
  { type: "infinitemulticombobox", label: "Infinite Multi Combobox", icon: RefreshCw, description: "Multi-select combobox with search and infinite scroll. The most feature-rich field type for large datasets.", category: "infinite" },

  // File
  { type: "file", label: "File Upload", icon: Upload, description: "File upload input supporting single or multiple files. Configurable file type restrictions (.pdf, .jpg, etc.) and size limits.", category: "file" },

  // Layout & Display
  { type: "empty", label: "Spacer", icon: Space, description: "An invisible spacer that occupies grid space. Useful for aligning fields in multi-column layouts. Never submitted to backend.", category: "layout" },
  { type: "preview", label: "Preview", icon: Eye, description: "Display-only field that shows calculated or composite values from other fields. Supports sum, multiply, concat, custom expressions, and format templates. Can be included or excluded from submission.", category: "layout" },
];

export const catLabels: Record<string, string> = {
  basic: "Basic Inputs",
  selection: "Toggles & Choices",
  combobox: "Combobox",
  select: "Select",
  async: "Async Fetch",
  infinite: "Infinite Scroll",
  file: "File",
  layout: "Layout & Display",
};

export const defaultOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

export function createField(type: string, index: number): FormFieldConfig {
  const baseField = {
    name: `field_${Date.now()}_${index}`,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    placeholder: `Enter ${type}...`,
    required: false,
  };

  switch (type) {
    case "select":
    case "radio":
    case "combobox":
    case "multiselect":
    case "multicombobox":
    case "checkboxgroup":
    case "switchgroup":
    case "asyncselect":
    case "asyncmultiselect":
    case "asynccombobox":
    case "asyncmulticombobox":
      return {
        ...baseField, type: type, options: [...defaultOptions],
        apiConfig: {
          url: '', method: 'GET' as const,
          responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
        },
      };
    case "infiniteselect":
    case "infinitemultiselect":
    case "infinitecombobox":
    case "infinitemulticombobox":
      return {
        ...baseField, type: type, options: [...defaultOptions],
        apiConfig: {
          url: '', method: 'GET' as const,
          responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
          searchParam: 'q', pageParam: 'page', pageSizeParam: 'limit', pageSize: 20,
          hasMorePath: 'meta.hasMore',
        },
      };
    case "checkbox":
      return { ...baseField, type: "checkbox", checkboxLabel: "Accept terms" };
    case "date":
      return { ...baseField, type: "date" };
    case "switch":
      return { ...baseField, type: "switch", switchLabel: "Enable feature" };
    case "textarea":
      return { ...baseField, type: "textarea", rows: 4 };
    case "file":
      return { ...baseField, type: "file", accept: ".pdf,.doc,.docx", multiple: false };
    case "number":
      return { ...baseField, type: "number", min: 0, max: 100 };
    case "empty":
      return { ...baseField, type: "empty", label: undefined, placeholder: undefined, excludeFromSubmit: true };
    case "preview":
      return {
        ...baseField, type: "preview", label: "Preview", placeholder: undefined,
        watchFields: [], calculation: { rule: 'concat' as const },
        emptyText: '—', variant: 'default' as const,
      };
    default:
      return { ...baseField, type: type as FieldType } as FormFieldConfig;
  }
}

export const initialConfig: FormConfig = {
  id: "custom-form",
  title: "My Custom Form",
  description: "Build your form by adding fields from the sidebar",
  submitLabel: "Submit",
  showReset: true,
  sections: [
    {
      id: "section-1",
      title: "Form Section",
      description: "Add fields to this section",
      columns: 1,
      fields: [],
    },
  ],
};
