"use client";

import { cn } from "@/lib/utils";

import CodePreview from "@/components/lab/CodePreview";
import { getAfnouiAddCommand } from "@/components/shared/cliInstallCommands";
import { CliInstallCommandBar } from "@/components/shared/CliInstallCommandBar";

interface ComponentInstallProps {
  code: string;
  title: string;
  variant: string;
  category: string;
  fullCode?: string;
  /** Multi-file bundles pass their files instead of `fullCode` — see CodePreview. */
  files?: { name: string; code: string }[];
  className?: string;
  installArgs?: string;
  children: React.ReactNode;
}

export function ComponentInstall({
  code,
  title,
  variant,
  category,
  fullCode,
  files,
  children,
  className,
  installArgs,
}: ComponentInstallProps) {
  const args = installArgs ?? "";

  return (
    <div className={cn("space-y-3 w-full min-w-0 max-w-full", className)}>
      <CliInstallCommandBar
        resolveCommand={(pm) =>
          getAfnouiAddCommand(pm, category, variant, args)
        }
      />

      {/* CodePreview Component */}
      <CodePreview title={title} code={code} fullCode={fullCode} files={files}>
        {children}
      </CodePreview>
    </div>
  );
}
