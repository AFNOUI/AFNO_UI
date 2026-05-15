"use client";

import CodePreview from "@/components/lab/CodePreview";
import {
  buildDndUsageCode,
  dndVariantSources,
} from "@/components/lab/dnd/dndVariantSources";

export default function DndVariantsOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">DnD variants</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Live preview of every drag-and-drop interaction, each on its own page.
          All demos are built on the in-house pointer DnD library at{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
            @/components/ui/dnd
          </code>{" "}
          — no <code className="rounded bg-muted px-1">@dnd-kit</code>, no{" "}
          <code className="rounded bg-muted px-1">react-beautiful-dnd</code>.
        </p>
      </div>

      <div className="space-y-6">
        {dndVariantSources.map((variant) => {
          const Demo = variant.Component;
          return (
            <CodePreview
              key={variant.slug}
              title={variant.name}
              code={buildDndUsageCode(variant)}
              fullCode={variant.snippet}
            >
              <Demo />
            </CodePreview>
          );
        })}
      </div>
    </div>
  );
}
