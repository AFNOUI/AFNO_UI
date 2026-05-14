import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode, type ErrorInfo } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fieldName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches rendering errors in individual form fields.
 * Prevents one broken field from crashing the entire form.
 */
export class FormFieldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[FormField${this.props.fieldName ? `: ${this.props.fieldName}` : ''}] Render error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">
            Field{this.props.fieldName ? ` "${this.props.fieldName}"` : ''} failed to render
            {this.state.error?.message ? `: ${this.state.error.message}` : ''}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * Validates a field config before rendering. Returns an error message if invalid, null if OK.
 * Use this to catch configuration issues (missing name, undefined options, etc.)
 * before they cause runtime crashes.
 */
export function validateFieldConfig(config: any): string | null {
  if (!config) return "Field config is undefined";
  if (!config.name || typeof config.name !== "string") return "Field name is missing or invalid";
  if (!config.type || typeof config.type !== "string") return "Field type is missing or invalid";

  // Validate that option-based fields have an options array
  const optionTypes = [
    "select", "radio", "combobox", "multiselect", "multicombobox",
    "checkboxgroup", "switchgroup",
    "asyncselect", "asynccombobox", "asyncmultiselect", "asyncmulticombobox",
    "infiniteselect", "infinitecombobox", "infinitemultiselect", "infinitemulticombobox",
  ];
  if (optionTypes.includes(config.type)) {
    if (!Array.isArray(config.options)) {
      // For async/infinite types, options can be empty if apiConfig is set
      if (config.type.startsWith("async") || config.type.startsWith("infinite")) {
        // Allow - these can fetch options from API
      } else {
        return `Field "${config.name}" (${config.type}) requires an options array`;
      }
    }
  }

  // Validate preview field has watchFields
  if (config.type === "preview" && !Array.isArray(config.watchFields)) {
    return `Preview field "${config.name}" requires watchFields array`;
  }

  return null;
}
