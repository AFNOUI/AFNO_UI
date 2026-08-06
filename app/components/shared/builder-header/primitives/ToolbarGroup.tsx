"use client";

import { cn } from "@/lib/utils";

export interface ToolbarGroupProps {
  children: React.ReactNode;
  /**
   * `loose`     — free-standing controls separated by a gap (default).
   * `segmented` — controls welded into one bordered pill (undo/redo pair).
   */
  variant?: "loose" | "segmented";
  className?: string;
}

/**
 * PRIMITIVE — layout primitive that groups related toolbar controls.
 *
 * `segmented` visually binds a pair of controls into a single unit, which is
 * what makes the undo/redo cluster read as one thing in every builder.
 */
export function ToolbarGroup({ children, variant = "loose", className }: ToolbarGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        variant === "loose" && "gap-2",
        variant === "segmented" &&
          "gap-0.5 rounded-(--radius) border border-input bg-background/60 p-0.5 [&>button]:h-8 [&>button]:w-8 [&>button]:border-0 [&>button]:bg-transparent [&>button]:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
