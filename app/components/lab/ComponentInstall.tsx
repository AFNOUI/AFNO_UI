"use client";

import { cn } from "@/lib/utils";

import CodePreview from "@/components/lab/CodePreview";
import { CliPlayground } from "@/components/shared/cli-playground";

interface ComponentInstallProps {
  code: string;
  title: string;
  variant: string;
  category: string;
  fullCode?: string;
  /** Multi-file bundles pass their files instead of `fullCode` — see CodePreview. */
  files?: { name: string; code: string }[];
  className?: string;
  /**
   * Drop the install bar and render only the preview. Set on pages that show
   * the CLI playground instead — two command surfaces on one page can disagree,
   * which is how the kanban gallery once printed two different install
   * commands for the same variant.
   */
  hideInstallBar?: boolean;
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
  hideInstallBar,
}: ComponentInstallProps) {
  const slug = `${category}/${variant}`;

  return (
    <div className={cn("space-y-3 w-full min-w-0 max-w-full", className)}>
      {!hideInstallBar && (
        <CliPlayground
          idPrefix={`install-${slug}`.replace(/[^a-zA-Z0-9-]/g, "-")}
          scope={{ commandId: "add", args: [slug], lockCommand: true, lockArgs: true }}
        />
      )}

      {/* CodePreview Component */}
      <CodePreview title={title} code={code} fullCode={fullCode} files={files}>
        {children}
      </CodePreview>
    </div>
  );
}
