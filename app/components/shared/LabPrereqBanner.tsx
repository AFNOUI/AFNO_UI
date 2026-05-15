"use client";

import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CliInstallCommandBar } from "@/components/lab/CliInstallCommandBar";
import type { PackageManager } from "@/components/lab/cliInstallCommands";

/**
 * Shared "prereq" banner shown at the top of every lab section page
 * (`/charts`, `/dnd`, future `/forms`-style sections, …).
 *
 * Each section supplies its own copy + `afnoui init` command resolver via props.
 * Keeps the visual shape (icon, title, body, install bar) identical so users
 * learn the pattern once.
 */
export function LabPrereqBanner({
  title,
  description,
  resolveCommand,
  icon: Icon = Info,
}: {
  title: string;
  description: ReactNode;
  resolveCommand: (pm: PackageManager) => string;
  icon?: LucideIcon;
}) {
  return (
    <Alert className="border-border bg-muted/20">
      <Icon className="h-4 w-4" aria-hidden />
      <AlertTitle dir="auto">{title}</AlertTitle>
      <AlertDescription className="space-y-3 text-muted-foreground">
        {description}
        <CliInstallCommandBar resolveCommand={resolveCommand} />
      </AlertDescription>
    </Alert>
  );
}
