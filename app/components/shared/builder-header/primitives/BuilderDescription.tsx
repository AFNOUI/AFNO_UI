"use client";

import { cn } from "@/lib/utils";

export interface BuilderDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

/** PRIMITIVE — the muted one-liner under a builder title. */
export function BuilderDescription({ children, className }: BuilderDescriptionProps) {
  return (
    <p className={cn("text-xs leading-snug text-muted-foreground sm:text-sm", className)}>
      {children}
    </p>
  );
}
