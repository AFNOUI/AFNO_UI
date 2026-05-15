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
}: CodePreviewProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>("preview");
  const hasFullCode = typeof fullCode === "string" && fullCode.trim().length > 0;

  const displayCode = useMemo(() => {
    if (activeTab === "component" && hasFullCode) return fullCode as string;
    return code;
  }, [activeTab, code, fullCode, hasFullCode]);

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
