"use client";

import { cn } from "@/lib/utils";

export interface DiffValuePillProps {
  children: React.ReactNode;
  /** The template's side is muted; the current side carries the emphasis. */
  tone: "template" | "current";
  className?: string;
}

/**
 * PRIMITIVE — one formatted value in a diff row.
 *
 * Two tones rather than red/green: nothing here is an error or a success. The
 * template value is context and the current value is the answer, so only the
 * current one gets contrast.
 */
export function DiffValuePill({ children, tone, className }: DiffValuePillProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[14rem] items-center truncate rounded-(--radius) border px-1.5 py-0.5",
        "text-[11px] leading-none tabular-nums",
        tone === "template"
          ? "border-border/60 bg-muted/40 text-muted-foreground line-through decoration-muted-foreground/40"
          : "border-border bg-background font-medium text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
