"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { BuilderTitle } from "../primitives/BuilderTitle";
import { BuilderIconTile } from "../primitives/BuilderIconTile";
import { BuilderDescription } from "../primitives/BuilderDescription";

export interface BuilderIdentityProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Optional pills rendered inline after the title (counts, status, …). */
  meta?: React.ReactNode;
  titleAs?: "h1" | "h2";
  className?: string;
}

/**
 * CONTROL — icon tile + title + description.
 *
 * The left half of every builder header. Composed purely from primitives, so a
 * future surface (a docs page, a card) can reuse the same identity block.
 */
export function BuilderIdentity({
  icon,
  title,
  description,
  meta,
  titleAs = "h1",
  className,
}: BuilderIdentityProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <BuilderIconTile icon={icon} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <BuilderTitle as={titleAs}>{title}</BuilderTitle>
          {meta}
        </div>
        {description ? <BuilderDescription>{description}</BuilderDescription> : null}
      </div>
    </div>
  );
}
