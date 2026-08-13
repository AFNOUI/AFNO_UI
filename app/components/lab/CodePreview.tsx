"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Code2, Eye, FileCode } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CodePreviewProps {
  /** Short, illustrative usage snippet — shown in the "Snippet" tab. */
  code: string;
  /** Card title. */
  title: string;
  /**
   * Full standalone component source — shown in the "Component" tab. When
   * absent the Component tab is hidden entirely (no auto-generation: the
   * previous heuristic produced broken wrappers for non-trivial demos like
   * the DnD variants).
   */
  fullCode?: string;
  /**
   * Multi-file variants (anything installing a `component → hooks → services`
   * bundle) pass their files here instead of `fullCode`, and the Component tab
   * gains a per-file strip. Concatenating a bundle into one blob was the old
   * stopgap and it hid the layering the bundle exists to teach.
   *
   * Takes precedence over `fullCode` when both are present.
   */
  files?: { name: string; code: string }[];
  className?: string;
  children: React.ReactNode;
}

type CodeTab = "preview" | "code" | "component";

export default function CodePreview({
  title,
  code,
  children,
  className,
  fullCode,
  files,
}: CodePreviewProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>("preview");
  const [activeFile, setActiveFile] = useState(0);
  const hasFiles = Array.isArray(files) && files.length > 0;
  const hasFullCode = hasFiles || (typeof fullCode === "string" && fullCode.trim().length > 0);

  const displayCode = useMemo(() => {
    if (activeTab !== "component") return code;
    if (hasFiles) return files[Math.min(activeFile, files.length - 1)]?.code ?? "";
    return hasFullCode ? (fullCode as string) : code;
  }, [activeTab, code, fullCode, hasFullCode, hasFiles, files, activeFile]);

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "border border-border rounded-lg bg-card w-full min-w-0 max-w-full",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">{title}</span>

        <div className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as CodeTab)}
          >
            <TabsList className="h-7 p-0.5">
              <TabsTrigger
                value="preview"
                className="h-6 px-2 text-xs gap-1 cursor-pointer"
              >
                <Eye size={12} />
                {t("code.preview")}
              </TabsTrigger>

              <TabsTrigger
                value="code"
                className="h-6 px-2 text-xs gap-1 cursor-pointer"
              >
                <Code2 size={12} />
                {t("code.snippet")}
              </TabsTrigger>

              {hasFullCode && (
                <TabsTrigger
                  value="component"
                  className="h-6 px-2 text-xs gap-1 cursor-pointer"
                >
                  <FileCode size={12} />
                  {t("code.component")}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="p-3 sm:p-4 md:p-6 bg-background min-w-0 w-full max-w-full">
          <div className="w-full min-w-0 max-w-full [&_.relative]:max-w-full">
            {children}
          </div>
        </div>
      ) : (
        <div
          dir="ltr"
          className="relative grid grid-cols-1 w-full min-w-0 overflow-hidden bg-muted/20"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyCode(displayCode)}
                className="absolute top-3 right-3 h-8 w-8 p-0 z-30 bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-background"
              >
                {copied ? (
                  <Check size={14} className="text-primary" />
                ) : (
                  <Copy size={14} />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent side="top" showArrow>
              {copied ? t("code.copied") : t("code.copyCode")}
            </TooltipContent>
          </Tooltip>

          {activeTab === "component" && hasFiles && (
            <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-border bg-muted/40">
              {files.map((file, i) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => setActiveFile(i)}
                  className={cn(
                    "text-[11px] font-mono px-2 py-1 rounded-md border transition-colors cursor-pointer",
                    i === Math.min(activeFile, files.length - 1)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted",
                  )}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}

          <ScrollArea className="h-[400px] w-full border-t border-border">
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
              <code className="text-foreground">{displayCode}</code>
            </pre>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
