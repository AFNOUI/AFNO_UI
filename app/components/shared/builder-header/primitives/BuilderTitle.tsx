"use client";

import { cn } from "@/lib/utils";

export interface BuilderTitleProps {
  children: React.ReactNode;
  /** Heading level. Builder pages own the page `h1`; keep the default. */
  as?: "h1" | "h2";
  className?: string;
}

/** PRIMITIVE — the builder's name. Single source of truth for its type scale. */
export function BuilderTitle({ children, as: Tag = "h1", className }: BuilderTitleProps) {
  return (
    <Tag className={cn("text-xl font-bold leading-tight tracking-tight sm:text-2xl", className)}>
      {children}
    </Tag>
  );
}
