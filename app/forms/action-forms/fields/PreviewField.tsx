import { useMemo } from "react";

import type {
  PreviewFieldConfig,
  PreviewCalculationRule,
} from "@/forms/types/types";
import { cn } from "@/lib/utils";
import { useActionFormContext } from "../ActionFormContext";

import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/form-primitives";

function toNum(v: unknown) {
  if (v === null || v === undefined || v === "") return NaN;
  return Number(v);
}

function calc(vals: number[], r: PreviewCalculationRule) {
  const v = vals.filter((x) => !isNaN(x));
  if (!v.length) return NaN;
  switch (r) {
    case "sum":
      return v.reduce((a, b) => a + b, 0);
    case "subtract":
      return v.reduce((a, b) => a - b);
    case "multiply":
      return v.reduce((a, b) => a * b, 1);
    case "divide":
      return v.length < 2
        ? v[0]
        : v.slice(1).reduce((a, b) => (b ? a / b : NaN), v[0]);
    case "average":
      return v.reduce((a, b) => a + b, 0) / v.length;
    case "min":
      return Math.min(...v);
    case "max":
      return Math.max(...v);
    default:
      return NaN;
  }
}

function evalExpr(e: string, fv: Record<string, unknown>) {
  let x = e;
  for (const [k, v] of Object.entries(fv)) {
    const n = toNum(v);
    x = x.split(`{${k}}`).join(isNaN(n) ? "0" : String(n));
  }
  const s = x.replace(/[^0-9+\-*/().%\s]/g, "");
  if (!s.trim()) return NaN;
  try {
    return new Function(`"use strict"; return (${s});`)() as number;
  } catch {
    return NaN;
  }
}

export function PreviewField({ config }: { config: PreviewFieldConfig }) {
  const { values } = useActionFormContext();
  const wv: Record<string, unknown> = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const f of config.watchFields) out[f] = values[f];
    return out;
  }, [config.watchFields, values]);
  const display = useMemo(() => {
    if (
      config.watchFields.every(
        (f) => wv[f] === undefined || wv[f] === "" || wv[f] === null,
      )
    )
      return config.emptyText ?? "—";
    const c = config.calculation;
    let s: string;
    if (!c || c.rule === "concat")
      s = config.watchFields
        .map((f) => String(wv[f] ?? ""))
        .filter(Boolean)
        .join(" ");
    else if (c.rule === "custom" && c.customExpression) {
      const r = evalExpr(c.customExpression, wv);
      s = isNaN(r)
        ? (config.emptyText ?? "—")
        : config.decimals !== undefined
          ? r.toFixed(config.decimals)
          : String(r);
    } else {
      const r = calc(
        config.watchFields.map((f) => toNum(wv[f])),
        c.rule,
      );
      s = isNaN(r)
        ? (config.emptyText ?? "—")
        : config.decimals !== undefined
          ? r.toFixed(config.decimals)
          : String(r);
    }
    if (config.format) {
      s = config.format.replace(/{value}/g, s);
      for (const [k, v] of Object.entries(wv))
        s = s.split(`{${k}}`).join(String(v ?? ""));
    }
    return `${config.prefix ?? ""}${s}${config.suffix ?? ""}`;
  }, [config, wv]);

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
        {display}
      </div>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
    </div>
  );
}
