import { useMemo } from "react";
import { useStore } from "@tanstack/react-form";

import type {
  PreviewFieldConfig,
  PreviewCalculationRule,
} from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useTanstackFormContext } from "../TanstackFormContext";

import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/form-primitives";

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return NaN;
  return Number(val);
}

function calculate(values: number[], rule: PreviewCalculationRule): number {
  const valid = values.filter((v) => !isNaN(v));
  if (valid.length === 0) return NaN;
  switch (rule) {
    case "sum":
      return valid.reduce((a, b) => a + b, 0);
    case "subtract":
      return valid.reduce((a, b) => a - b);
    case "multiply":
      return valid.reduce((a, b) => a * b, 1);
    case "divide":
      return valid.length < 2
        ? valid[0]
        : valid.slice(1).reduce((a, b) => (b !== 0 ? a / b : NaN), valid[0]);
    case "average":
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    case "min":
      return Math.min(...valid);
    case "max":
      return Math.max(...valid);
    default:
      return NaN;
  }
}

function evaluateCustomExpression(
  expr: string,
  fv: Record<string, unknown>,
): number {
  let e = expr;
  for (const [k, v] of Object.entries(fv)) {
    const n = toNumber(v);
    e = e.split(`{${k}}`).join(isNaN(n) ? "0" : String(n));
  }
  const s = e.replace(/[^0-9+\-*/().%\s]/g, "");
  if (!s.trim()) return NaN;
  try {
    return new Function(`"use strict"; return (${s});`)() as number;
  } catch {
    return NaN;
  }
}

export function PreviewField({ config }: { config: PreviewFieldConfig }) {
  const { form } = useTanstackFormContext();
  const watchedValues = useStore(form.store, (s) => {
    const vals = (s as { values: Record<string, unknown> }).values;
    const out: Record<string, unknown> = {};
    for (const fn of config.watchFields) {
      out[fn] = vals[fn];
    }
    return out;
  });

  const displayValue = useMemo(() => {
    const allEmpty = config.watchFields.every(
      (f) =>
        watchedValues[f] === undefined ||
        watchedValues[f] === "" ||
        watchedValues[f] === null,
    );
    if (allEmpty) return config.emptyText ?? "â€”";
    const calc = config.calculation;
    let str: string;
    if (!calc || calc.rule === "concat") {
      str = config.watchFields
        .map((f) => String(watchedValues[f] ?? ""))
        .filter(Boolean)
        .join(" ");
    } else if (calc.rule === "custom" && calc.customExpression) {
      const r = evaluateCustomExpression(calc.customExpression, watchedValues);
      str = isNaN(r)
        ? (config.emptyText ?? "â€”")
        : config.decimals !== undefined
          ? r.toFixed(config.decimals)
          : String(r);
    } else {
      const nums = config.watchFields.map((f) => toNumber(watchedValues[f]));
      const r = calculate(nums, calc.rule);
      str = isNaN(r)
        ? (config.emptyText ?? "â€”")
        : config.decimals !== undefined
          ? r.toFixed(config.decimals)
          : String(r);
    }
    if (config.format) {
      str = config.format.replace(/{value}/g, str);
      for (const [k, v] of Object.entries(watchedValues))
        str = str.split(`{${k}}`).join(String(v ?? ""));
    }
    return `${config.prefix ?? ""}${str}${config.suffix ?? ""}`;
  }, [config, watchedValues]);

  const variant = config.variant ?? "default";

  return (
    <div className={config.className}>
      {config.label && <Label>{config.label}</Label>}
      <div
        className={cn(
          "text-sm select-text",
          variant === "default" &&
            "py-2 px-3 border border-border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center",
          variant === "card" &&
            "py-3 px-4 border border-border rounded-lg bg-card text-card-foreground shadow-sm",
          variant === "inline" && "py-1 text-foreground font-medium",
          variant === "highlight" &&
            "py-2 px-3 border-2 border-primary/30 rounded-md bg-primary/5 text-primary font-semibold text-base",
        )}
      >
        {displayValue}
      </div>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
    </div>
  );
}
