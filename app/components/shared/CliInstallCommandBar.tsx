"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { PACKAGE_MANAGERS } from "@/components/shared/cliInstallCommands";
import type { PackageManager } from "@/components/shared/cliInstallCommands";

export type CliInstallCommandBarProps = {
  /** Shown next to the package-manager tabs (e.g. "Install with:"). */
  label?: string;
  className?: string;
  /** Current command string for the selected package manager. */
  resolveCommand: (pm: PackageManager) => string;
  /**
   * Heading for the bar, shown in the header row in place of `label`. Use this
   * when the bar names a specific command rather than a variant install.
   */
  title?: ReactNode;
  /** Icon rendered beside `title`. */
  icon?: LucideIcon;
  /** Explanatory copy rendered beneath the command. */
  description?: ReactNode;
  /**
   * Hide the package-manager tabs — for pages that drive the choice from a
   * single selector instead of repeating tabs on every bar.
   */
  showPackageManagers?: boolean;
  /**
   * Controlled package manager. When omitted the bar keeps its own state, so
   * existing call sites need no changes.
   */
  packageManager?: PackageManager;
  onPackageManagerChange?: (pm: PackageManager) => void;
};

export function CliInstallCommandBar({
  icon: Icon,
  title,
  className,
  description,
  resolveCommand,
  packageManager,
  label = "Install with:",
  onPackageManagerChange,
  showPackageManagers = true,
}: CliInstallCommandBarProps) {
  const [copied, setCopied] = useState(false);
  const [internalPm, setInternalPm] = useState<PackageManager>("npm");

  // Controlled when a package manager is passed in, uncontrolled otherwise.
  const activePm = packageManager ?? internalPm;
  const selectPm = (pm: PackageManager) => {
    if (packageManager === undefined) setInternalPm(pm);
    onPackageManagerChange?.(pm);
  };

  const command = resolveCommand(activePm);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  // With no tabs and no title there is nothing to put in the header row.
  const showHeader = showPackageManagers || Boolean(title);

  return (
    <div
      dir="ltr"
      className={cn(
        "border border-border rounded-lg overflow-hidden bg-card",
        className,
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/30">
          {title ? (
            <span className="flex items-center gap-2 min-w-0">
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />}
              <span className="truncate text-sm font-semibold">{title}</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground shrink-0">
              {label}
            </span>
          )}
          {showPackageManagers && (
            <div className="flex flex-wrap items-center justify-end gap-1">
              {PACKAGE_MANAGERS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => selectPm(pm)}
                  aria-pressed={activePm === pm}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    activePm === pm
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {pm}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative px-4 py-3 bg-muted/20 pe-12">
        <code className="text-sm font-mono text-foreground break-all">{command}</code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => void copyCommand()}
              className="absolute top-2 end-2 h-7 w-7 p-0"
              aria-label={copied ? "Copied" : "Copy command"}
            >
              {copied ? (
                <Check size={14} className="text-primary" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" showArrow>
            {copied ? "Copied!" : "Copy command"}
          </TooltipContent>
        </Tooltip>
      </div>

      {description && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
