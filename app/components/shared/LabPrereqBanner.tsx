"use client";

import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CliPlayground } from "@/components/shared/cli-playground";

/**
 * Shared "prereq" banner shown at the top of every lab section page
 * (`/charts`, `/dnd`, future `/forms`-style sections, …).
 *
 * Each section supplies its own copy + init flags via props. Keeps the
 * visual shape (icon, title, body, install bar) identical so users learn the
 * pattern once — and, since the switch off the static `CliInstallCommandBar`,
 * the same interactive command surface every `ComponentInstall` and builder
 * Export tab uses.
 */
export function LabPrereqBanner({
  title,
  description,
  idPrefix,
  flags,
  icon: Icon = Info,
}: {
  title: string;
  description: ReactNode;
  /** Unique per banner instance — feeds the playground's internal element ids. */
  idPrefix: string;
  /** `init` flags this section always wants set, e.g. `{ dnd: true }`. */
  flags?: Record<string, string | boolean>;
  icon?: LucideIcon;
}) {
  return (
    <Alert className="border-border bg-muted/20">
      <Icon className="h-4 w-4" aria-hidden />
      <AlertTitle dir="auto">{title}</AlertTitle>
      <AlertDescription className="space-y-3 text-muted-foreground">
        {description}
        <CliPlayground
          idPrefix={idPrefix}
          scope={{ commandId: "init", lockCommand: true, lockArgs: true, flags }}
        />
      </AlertDescription>
    </Alert>
  );
}
