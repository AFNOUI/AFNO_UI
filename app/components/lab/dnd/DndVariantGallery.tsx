"use client";

import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ComponentInstall } from "@/components/lab/ComponentInstall";

import {
  buildDndUsageCode,
  dndVariantBySlug,
} from "@/components/lab/dnd/dndVariantSources";

/**
 * One-variant gallery used by `app/(pages)/dnd/<slug>/page.tsx`.
 *
 * Accepts a `slug` string (not the full source object) on purpose: the parent
 * `page.tsx` is a Server Component, and `DndVariantSource` carries a
 * `forwardRef` lucide icon + a React component — neither survives RSC
 * serialization. By doing the lookup *here* (in a client module), we keep
 * the server→client boundary down to a single string.
 *
 * Mirrors `ChartVariantGallery` shape (header + `ComponentInstall` card)
 * without the LTR/RTL toggle — DnD primitives derive direction from the
 * `<html dir>` set by `RtlLayoutProvider`, not a per-page switch.
 */
export function DndVariantGallery({ slug }: { slug: string }) {
  const source = dndVariantBySlug[slug];
  if (!source) notFound();

  const { name, description, badges, icon: Icon, Component, snippet } = source;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Badge variant="secondary" className="gap-1 w-fit">
          <Icon className="h-3 w-3" /> Custom Pointer DnD
        </Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b} variant="secondary" className="text-[10px]">
                  {b}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      <ComponentInstall
        category="dnd"
        variant={slug}
        title={name}
        code={buildDndUsageCode(source)}
        fullCode={snippet}
      >
        <Component />
      </ComponentInstall>
    </div>
  );
}
