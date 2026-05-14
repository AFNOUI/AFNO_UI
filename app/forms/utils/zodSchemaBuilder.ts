import { z } from "zod";
import type {
  FormConfig,
  FileFieldConfig,
  TextFieldConfig,
  FormFieldConfig,
  NumberFieldConfig,
  TextareaFieldConfig,
  MultiselectFieldConfig,
} from "../types/types";

/** Extract all fields from a form config */
export function extractFields(config: FormConfig): FormFieldConfig[] {
  return config.sections.flatMap((section) => section.fields);
}

/**
 * Evaluate a field's condition against current form values.
 * Returns true if the field should be VISIBLE (and thus required).
 */
export function evaluateCondition(
  condition: FormFieldConfig["condition"],
  formValues: Record<string, unknown>
): boolean {
  if (!condition) return true;
  const { field, operator, value } = condition;
  const condVal = formValues[field];
  switch (operator) {
    case "equals": return String(condVal) === String(value);
    case "notEquals": return String(condVal) !== String(value);
    case "contains": return String(condVal || "").includes(value || "");
    case "notEmpty": return !!condVal && condVal !== "";
    case "empty": return !condVal || condVal === "";
    case "in": return (value || "").split(",").map((v: string) => v.trim()).includes(String(condVal));
    case "isTrue": return condVal === true || condVal === "true";
    case "isFalse": return condVal === false || condVal === "false" || !condVal;
    default: return true;
  }
}

/**
 * Build a Zod schema dynamically from field configs at runtime.
 * Pass optional `formValues` to make conditional fields properly required/optional
 * based on the current form state — fields hidden by a condition become fully optional.
 *
 * Usage in your page component:
 *   const schema = useMemo(() => buildZodSchema(extractFields(config)), [config]);
 *   <ReactHookForm config={config} schema={schema} onSubmit={handleSubmit} />
 */
export function buildZodSchema(
  fields: FormFieldConfig[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const conditionalRequiredFields: {
    name: string;
    label: string;
    condition: NonNullable<FormFieldConfig["condition"]>;
    type: string;
  }[] = [];

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;
    const isConditionalRequired = !!field.condition && !!field.required;

    switch (field.type) {
      case "text":
      case "password":
      case "tel":
      case "url":
        fieldSchema = z.string();
        if (field.required && !isConditionalRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label || field.name} is required`);
        }
        if ((field as TextFieldConfig).minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            (field as TextFieldConfig).minLength!,
            `Minimum ${(field as TextFieldConfig).minLength} characters`
          );
        }
        if ((field as TextFieldConfig).maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            (field as TextFieldConfig).maxLength!,
            `Maximum ${(field as TextFieldConfig).maxLength} characters`
          );
        }
        break;

      case "email":
        fieldSchema =
          field.required && !isConditionalRequired
            ? z.email("Invalid email address").min(1, `${field.label || field.name} is required`)
            : z.preprocess(
                (v) => (v === "" || v === null || v === undefined ? undefined : v),
                z.email("Invalid email address").optional(),
              );
        break;

      case "number": {
        const toNum = (val: unknown) =>
          val === "" || val === null || val === undefined ? undefined : Number(val);

        const numField = field as NumberFieldConfig;
        let baseNum = z.number({ message: "Must be a number" });
        if (numField.min !== undefined)
          baseNum = baseNum.min(numField.min, `Minimum value is ${numField.min}`);
        if (numField.max !== undefined)
          baseNum = baseNum.max(numField.max, `Maximum value is ${numField.max}`);

        if (field.required && !isConditionalRequired) {
          fieldSchema = z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
            baseNum
          );
        } else {
          fieldSchema = z.preprocess(toNum, baseNum.optional());
        }
        break;
      }

      case "textarea":
        fieldSchema = z.string();
        if (field.required && !isConditionalRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label || field.name} is required`);
        }
        if ((field as TextareaFieldConfig).minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            (field as TextareaFieldConfig).minLength!,
            `Minimum ${(field as TextareaFieldConfig).minLength} characters`
          );
        }
        if ((field as TextareaFieldConfig).maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            (field as TextareaFieldConfig).maxLength!,
            `Maximum ${(field as TextareaFieldConfig).maxLength} characters`
          );
        }
        break;

      case "select":
      case "combobox":
      case "asyncselect":
      case "asynccombobox":
      case "infiniteselect":
      case "infinitecombobox":
        fieldSchema = z.string();
        if (field.required && !isConditionalRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label || field.name} is required`);
        }
        break;

      case "radio":
        fieldSchema = z.string();
        if (field.required && !isConditionalRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label || field.name} is required`);
        }
        break;

      case "checkbox":
      case "switch":
        fieldSchema = z.boolean();
        break;

      case "checkboxgroup":
        fieldSchema = z.array(z.string());
        break;

      case "switchgroup":
        fieldSchema = z.record(z.string(), z.boolean());
        break;

      case "multiselect":
      case "multicombobox":
      case "asyncmultiselect":
      case "asyncmulticombobox":
      case "infinitemultiselect":
      case "infinitemulticombobox":
        fieldSchema = z.array(z.string());
        if ((field as MultiselectFieldConfig).maxItems) {
          fieldSchema = (fieldSchema as z.ZodArray<z.ZodString>).max(
            (field as MultiselectFieldConfig).maxItems!,
            `Maximum ${(field as MultiselectFieldConfig).maxItems} items`
          );
        }
        break;

      case "file": {
        const fileField = field as FileFieldConfig;
        if (fileField.multiple) {
          fieldSchema = z.array(z.instanceof(File)).refine(
            (files) => {
              if (fileField.validation?.maxFiles && files.length > fileField.validation.maxFiles) return false;
              if (fileField.validation?.maxSize) return files.every((f) => f.size <= fileField.validation!.maxSize!);
              return true;
            },
            { message: fileField.validation?.maxSize ? `File size must be less than ${Math.round(fileField.validation.maxSize / 1024 / 1024)}MB` : "Invalid file" }
          );
        } else {
          fieldSchema = z.instanceof(File).optional().refine(
            (file) => {
              if (!file) return true;
              if (fileField.validation?.maxSize && file.size > fileField.validation.maxSize) return false;
              return true;
            },
            { message: fileField.validation?.maxSize ? `File size must be less than ${Math.round(fileField.validation.maxSize / 1024 / 1024)}MB` : "Invalid file" }
          );
        }
        break;
      }

      case "date":
        fieldSchema = z.string();
        if (field.required && !isConditionalRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label || field.name} is required`);
        }
        break;

      case "hidden":
        fieldSchema = z.string();
        break;

      default:
        fieldSchema = z.string();
    }

    // Conditional required fields are optional in the base shape
    // (superRefine handles the required check dynamically)
    if (isConditionalRequired) {
      conditionalRequiredFields.push({
        name: field.name,
        label: field.label || field.name,
        condition: field.condition!,
        type: field.type,
      });
      const isBoolType = field.type === "checkbox" || field.type === "switch";
      if (!isBoolType) {
        fieldSchema = fieldSchema.optional();
      }
    } else {
      // Non-conditional, non-required → optional (except booleans and numbers already handled)
      const isBoolType = field.type === "checkbox" || field.type === "switch";
      const isNumType = field.type === "number";
      if (!field.required && !isBoolType && !isNumType) {
        fieldSchema = fieldSchema.optional();
      }
    }

    shape[field.name] = fieldSchema;
  }

  const baseSchema = z.object(shape);

  // Add superRefine for conditional required fields
  if (conditionalRequiredFields.length > 0) {
    return baseSchema.superRefine((data, ctx) => {
      for (const crf of conditionalRequiredFields) {
        const isVisible = evaluateCondition(crf.condition, data as Record<string, unknown>);
        if (isVisible) {
          const val = (data as Record<string, unknown>)[crf.name];
          const isEmpty =
            val === undefined ||
            val === null ||
            (typeof val === "string" && val.length === 0) ||
            (Array.isArray(val) && val.length === 0);
          if (isEmpty) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${crf.label} is required`,
              path: [crf.name],
            });
          }
        }
      }
    });
  }

  return baseSchema;
}

/**
 * Generate compile-time Zod schema code from field config.
 * Produces a static formSchema.ts file string for full IDE type inference.
 */
export function generateZodSchemaCode(fields: FormFieldConfig[]): string {
  const lines: string[] = ['import { z } from "zod";', '', 'const baseSchema = z.object({'];

  // Collect conditional required fields for .superRefine()
  const conditionalRequiredFields: { name: string; label: string; condition: NonNullable<FormFieldConfig["condition"]> }[] = [];

  for (const field of fields) {
    let chain = '';
    // If field has a condition AND is required, make it optional in the base schema
    // and add a .superRefine() check instead
    const isConditionalRequired = !!field.condition && !!field.required;

    switch (field.type) {
      case "email":
        if (field.required && !isConditionalRequired) {
          chain = 'z.email("Invalid email").min(1, "' + (field.label || field.name) + ' is required")';
        } else {
          chain =
            'z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.email("Invalid email").optional())';
        }
        break;
      case "number":
        chain = 'z.coerce.number()';
        if ((field as NumberFieldConfig).min !== undefined) chain += `.min(${(field as NumberFieldConfig).min})`;
        if ((field as NumberFieldConfig).max !== undefined) chain += `.max(${(field as NumberFieldConfig).max})`;
        if (!field.required || isConditionalRequired) chain += '.optional()';
        break;
      case "checkbox":
      case "switch":
        chain = 'z.boolean()';
        break;
      case "checkboxgroup":
      case "multiselect":
      case "multicombobox":
      case "asyncmultiselect":
      case "asyncmulticombobox":
      case "infinitemultiselect":
      case "infinitemulticombobox":
        chain = 'z.array(z.string())';
        if ((field as MultiselectFieldConfig).maxItems) chain += `.max(${(field as MultiselectFieldConfig).maxItems})`;
        if (!field.required || isConditionalRequired) chain += '.optional()';
        break;
      case "switchgroup":
        chain = 'z.record(z.string(), z.boolean())';
        break;
      case "file":
        chain = 'z.instanceof(File).optional()';
        break;
      default:
        chain = 'z.string()';
        if (field.required && !isConditionalRequired) chain += `.min(1, "${field.label || field.name} is required")`;
        else chain += '.optional()';
    }

    if (isConditionalRequired) {
      conditionalRequiredFields.push({
        name: field.name,
        label: field.label || field.name,
        condition: field.condition!,
      });
    }

    lines.push(`  ${field.name}: ${chain},`);
  }

  lines.push('});');

  // Generate .superRefine() if there are conditional required fields
  if (conditionalRequiredFields.length > 0) {
    lines.push('');
    lines.push('export const formSchema = baseSchema.superRefine((data, ctx) => {');
    for (const crf of conditionalRequiredFields) {
      const { condition } = crf;
      let conditionExpr = '';
      switch (condition.operator) {
        case 'isTrue':
          conditionExpr = `data.${condition.field} === true`;
          break;
        case 'isFalse':
          conditionExpr = `!data.${condition.field}`;
          break;
        case 'equals':
          conditionExpr = `data.${condition.field} === "${condition.value}"`;
          break;
        case 'notEquals':
          conditionExpr = `data.${condition.field} !== "${condition.value}"`;
          break;
        case 'notEmpty':
          conditionExpr = `!!data.${condition.field} && data.${condition.field} !== ""`;
          break;
        case 'empty':
          conditionExpr = `!data.${condition.field} || data.${condition.field} === ""`;
          break;
        case 'contains':
          conditionExpr = `String(data.${condition.field} || "").includes("${condition.value || ""}")`;
          break;
        case 'in':
          conditionExpr = `[${(condition.value || "").split(",").map(v => `"${v.trim()}"`).join(", ")}].includes(String(data.${condition.field}))`;
          break;
        default:
          conditionExpr = `true`;
      }
      lines.push(`  if (${conditionExpr}) {`);
      lines.push(`    if (!data.${crf.name} || (typeof data.${crf.name} === "string" && data.${crf.name}.length === 0)) {`);
      lines.push(`      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "${crf.label} is required", path: ["${crf.name}"] });`);
      lines.push(`    }`);
      lines.push(`  }`);
    }
    lines.push('});');
  } else {
    lines.push('');
    lines.push('export const formSchema = baseSchema;');
  }

  lines.push('');
  lines.push('export type FormValues = z.infer<typeof formSchema>;');
  return lines.join('\n');
}
