"use client";

import { LabPrereqBanner } from "@/components/shared/LabPrereqBanner";
import { getAfnouiInitCommand } from "@/components/lab/cliInstallCommands";

/**
 * Shown at the top of every `/charts/*` lab page: explains when `afnoui init` is
 * required vs when `afnoui add charts/...` alone is enough.
 */
export function ChartsLabPrereqBanner() {
  return (
    <LabPrereqBanner
      title="CLI setup for chart code on this page"
      resolveCommand={getAfnouiInitCommand}
      description={
        <>
          <p dir="auto">
            If you <strong className="text-foreground font-medium">copy code</strong> from the{" "}
            <strong className="text-foreground font-medium">Snippet</strong> or{" "}
            <strong className="text-foreground font-medium">Component</strong> tabs, run the command
            below <strong className="text-foreground font-medium">first</strong> so your project has
            the AfnoUI base layout and UI primitives those snippets expect (utilities, Tailwind tokens,
            shared chart helpers, and so on).
          </p>
          <p dir="auto">
            If you install a chart with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              afnoui add charts/&lt;type&gt;/&lt;variant&gt;
            </code>{" "}
            instead, you <strong className="text-foreground font-medium">do not</strong> need this
            step—that command pulls the registry bundle and dependencies for that variant on its own.
          </p>
        </>
      }
    />
  );
}
