"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { PACKAGE_MANAGERS } from "@/components/lab/cliInstallCommands";
import type { PackageManager } from "@/components/lab/cliInstallCommands";

export type CliInstallCommandBarProps = {
  /** Shown next to the package-manager tabs (e.g. "Install with:"). */
  label?: string;
  className?: string;
  /** Current command string for the selected package manager. */
  resolveCommand: (pm: PackageManager) => string;
};

export function CliInstallCommandBar({
  className,
  resolveCommand,
  label = "Install with:",
}: CliInstallCommandBarProps) {
  const [copied, setCopied] = useState(false);
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  const command = resolveCommand(packageManager);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir="ltr"
      className={cn(
        "border border-border rounded-lg overflow-hidden bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {PACKAGE_MANAGERS.map((pm) => (
            <button
              key={pm}
              type="button"
              onClick={() => setPackageManager(pm)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                packageManager === pm
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );
}
