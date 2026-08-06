"use client";

import { cn } from "@/lib/utils";

export interface BuilderToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CONTROL — the right-hand control rail of a builder header.
 *
 * Wraps onto its own line on small screens and right-aligns from `lg` up, so
 * a toolbar with two controls and one with five keep the same rhythm.
 */
export function BuilderToolbar({ children, className }: BuilderToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Builder actions"
      className={cn(
        "flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap lg:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
