"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BuilderIconTileProps {
  /** Lucide icon rendered inside the tile. */
  icon: LucideIcon;
  /**
   * Accessible name. Omit when the adjacent title already names the page —
   * the tile is then marked decorative.
   */
  label?: string;
  className?: string;
}

/**
 * PRIMITIVE — the rounded, tinted square that opens every builder header.
 *
 * One definition of the tile's size, radius, tint and ring so all four
 * builders read as the same product.
 */
export function BuilderIconTile({ icon: Icon, label, className }: BuilderIconTileProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11",
        "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
        "shadow-sm transition-colors",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}
