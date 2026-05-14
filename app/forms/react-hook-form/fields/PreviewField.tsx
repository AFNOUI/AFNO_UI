import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import type { PreviewCalculationRule, PreviewFieldConfig } from "../../types/types";

interface PreviewFieldProps {
  config: PreviewFieldConfig;
}

/** Safely parse a value to number, returning NaN for non-numeric */
function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return NaN;
  const n = Number(val);
  return n;
}

/** Apply a calculation rule to an array of numeric values */
function calculate(values: number[], rule: PreviewCalculationRule): number {
  const valid = values.filter(v => !isNaN(v));
  if (valid.length === 0) return NaN;

  switch (rule) {
    case 'sum':
      return valid.reduce((a, b) => a + b, 0);
    case 'subtract':
      return valid.reduce((a, b) => a - b);
    case 'multiply':
      return valid.reduce((a, b) => a * b, 1);
    case 'divide':
      if (valid.length < 2) return valid[0];
      return valid.slice(1).reduce((a, b) => (b !== 0 ? a / b : NaN), valid[0]);
    case 'average':
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    case 'min':
      return Math.min(...valid);
    case 'max':
      return Math.max(...valid);
    default:
      return NaN;
  }
}

/** Evaluate a custom expression by replacing {fieldName} with values */
function evaluateCustomExpression(
  expression: string,
  fieldValues: Record<string, unknown>
): number {
  let expr = expression;
  for (const [key, val] of Object.entries(fieldValues)) {
    const num = toNumber(val);
    expr = expr.split(`{${key}}`).join(isNaN(num) ? '0' : String(num));
  }

  // Safety: only allow numbers, operators, parentheses, dots, spaces
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
  if (!sanitized.trim()) return NaN;

  try {
    const result = new Function(`"use strict"; return (${sanitized});`)();
    return typeof result === 'number' ? result : NaN;
  } catch {
    return NaN;
  }
}

/** Format the display string using template placeholders */
function formatDisplay(
  template: string,
  calculatedValue: string,
  fieldValues: Record<string, unknown>
): string {
  let result = template.replace(/{value}/g, calculatedValue);
  for (const [key, val] of Object.entries(fieldValues)) {
    result = result.split(`{${key}}`).join(String(val ?? ''));
  }
  return result;
}

/**
 * PreviewField — displays a calculated or composite value from other form fields.
 * Read-only display that updates reactively when watched fields change.
 *
 * Supports:
 * - Arithmetic: sum, subtract, multiply, divide, average, min, max
 * - Custom expressions: "{price} * {quantity} * (1 + {taxRate} / 100)"
 * - Concatenation: joins field values as strings
 * - Format templates: "{value} USD", "{amount} {currency}"
 * - Variants: default, card, inline, highlight
 */
export function PreviewField({ config }: PreviewFieldProps) {
  const form = useFormContext();

  // Watch all specified fields
  const watchedValues: Record<string, unknown> = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const fieldName of config.watchFields) {
      out[fieldName] = form.watch(fieldName);
    }
    return out;
  }, [config.watchFields, form]);

  const displayValue = useMemo(() => {
    const allEmpty = config.watchFields.every(
      f => watchedValues[f] === undefined || watchedValues[f] === '' || watchedValues[f] === null
    );

    if (allEmpty) {
      return config.emptyText ?? '—';
    }

    const calc = config.calculation;
    let calculatedStr: string;

    if (!calc) {
      // No calculation — just concatenate or show single value
      calculatedStr = config.watchFields
        .map(f => String(watchedValues[f] ?? ''))
        .filter(Boolean)
        .join(' ');
    } else if (calc.rule === 'concat') {
      calculatedStr = config.watchFields
        .map(f => String(watchedValues[f] ?? ''))
        .filter(Boolean)
        .join(' ');
    } else if (calc.rule === 'custom' && calc.customExpression) {
      const result = evaluateCustomExpression(calc.customExpression, watchedValues);
      if (isNaN(result)) {
        calculatedStr = config.emptyText ?? '—';
      } else {
        calculatedStr = config.decimals !== undefined
          ? result.toFixed(config.decimals)
          : String(result);
      }
    } else {
      const nums = config.watchFields.map(f => toNumber(watchedValues[f]));
      const result = calculate(nums, calc.rule);
      if (isNaN(result)) {
        calculatedStr = config.emptyText ?? '—';
      } else {
        calculatedStr = config.decimals !== undefined
          ? result.toFixed(config.decimals)
          : String(result);
      }
    }

    // Apply format template
    if (config.format) {
      calculatedStr = formatDisplay(config.format, calculatedStr, watchedValues);
    }

    // Apply prefix/suffix
    const prefix = config.prefix ?? '';
    const suffix = config.suffix ?? '';
    return `${prefix}${calculatedStr}${suffix}`;
  }, [config, watchedValues]);

  const variant = config.variant ?? 'default';

  return (
    <FormItem className={config.className}>
      {config.label && <FormLabel>{config.label}</FormLabel>}
      <div
        className={cn(
          "text-sm select-text",
          variant === 'default' && "py-2 px-3 border border-border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center",
          variant === 'card' && "py-3 px-4 border border-border rounded-lg bg-card text-card-foreground shadow-sm",
          variant === 'inline' && "py-1 text-foreground font-medium",
          variant === 'highlight' && "py-2 px-3 border-2 border-primary/30 rounded-md bg-primary/5 text-primary font-semibold text-base",
        )}
      >
        {displayValue}
      </div>
      {config.description && <FormDescription>{config.description}</FormDescription>}
    </FormItem>
  );
}
