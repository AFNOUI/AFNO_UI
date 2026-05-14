"use client";

import { cn } from "@/lib/utils";

import CodePreview from "@/components/lab/CodePreview";
import { getAfnouiAddCommand } from "@/components/lab/cliInstallCommands";
import { CliInstallCommandBar } from "@/components/lab/CliInstallCommandBar";

interface ComponentInstallProps {
  code: string;
  title: string;
  variant: string;
  category: string;
  fullCode?: string;
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
      <CodePreview title={title} code={code} fullCode={fullCode}>
        {children}
      </CodePreview>
    </div>
  );
}
