"use client";

import { LabPrereqBanner } from "@/components/shared/LabPrereqBanner";
import { getAfnouiDndInitCommand } from "@/components/lab/cliInstallCommands";

/**
 * Shown at the top of every `/dnd/*` lab page.
 *
 * The advertised command (`afnoui init --dnd`) runs the regular AfnoUI init
 * AND installs the Pointer DnD primitives (`components/dnd/*`), so a user who
 * copies code from the **Component** tab can run it as-is — the snippet's
 * relative imports (`../../components/dnd`, `../../lib/utils`) resolve
 * immediately when the demo file lands at `dnd/<variant>/<Pascal>Demo.tsx`.
 */
export function DndLabPrereqBanner() {
  return (
    <LabPrereqBanner
      title="CLI setup for DnD code on this page"
      resolveCommand={getAfnouiDndInitCommand}
      description={
        <>
          <p dir="auto">
            If you <strong className="text-foreground font-medium">copy code</strong> from the{" "}
            <strong className="text-foreground font-medium">Snippet</strong> or{" "}
            <strong className="text-foreground font-medium">Component</strong> tabs, run the command
            below <strong className="text-foreground font-medium">first</strong>. It scaffolds
            AfnoUI, installs the pointer-event DnD primitives at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">components/dnd/*</code>,
            and pulls the runtime deps the snippets import (
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">lucide-react</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">clsx</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">tailwind-merge</code>
            ).
          </p>
          <p dir="auto">
            Alternatively, install a ready-made demo with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              afnoui add dnd/&lt;variant&gt;
            </code>
            . That command pulls the DnD primitives and the variant&apos;s example file (under{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">dnd/&lt;variant&gt;/</code>
            , a sibling of <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">components/</code>
            ) in one go — you don&apos;t need to run the init step separately.
          </p>
        </>
      }
    />
  );
}
