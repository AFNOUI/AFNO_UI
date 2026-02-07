"use client";

import { useState } from "react";
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
  code: string;
  title: string;
  fullCode?: string;
  className?: string;
  children: React.ReactNode;
}

function generateFullComponent(title: string, snippet: string): string {
  const componentName = title.replace(/[^a-zA-Z0-9]/g, "").replace(/\s+/g, "") + "Example";

  const cleanSnippet = snippet
    .replace(/import[\s\S]*?from\s+['"].*?['"];?/g, "")
    .replace(/import\s*{[\s\S]*?}\s*from\s+['"].*?['"];?/g, "")
    .trim();

  const uiMatches = Array.from(cleanSnippet.matchAll(/<([A-Z][a-zA-Z0-9]*)/g)).map(m => m[1]);
  const commonIcons = ["Mail", "Settings", "Plus", "Trash", "Check", "Copy", "ChevronRight", "Search"];
  const detectedIcons = Array.from(new Set(uiMatches.filter(name => commonIcons.includes(name))));
  const detectedUI = Array.from(new Set(uiMatches.filter(name => !commonIcons.includes(name))));

  const groups: Record<string, string[]> = {};
  detectedUI.forEach(comp => {
    const folder = comp.split(/(?=[A-Z])/)[0].toLowerCase();
    if (!groups[folder]) groups[folder] = [];
    if (!groups[folder].includes(comp)) groups[folder].push(comp);
  });

  const importLines: string[] = [`import React from "react";`];
  Object.entries(groups).forEach(([folder, components]) => {
    importLines.push(`import { ${components.join(", ")} } from "@/components/ui/${folder}";`);
  });
  if (detectedIcons.length > 0) {
    importLines.push(`import { ${detectedIcons.join(", ")} } from "lucide-react";`);
  }

  return `${importLines.join("\n")}

export default function ${componentName}() {
  return (
    <div className="w-full p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        ${cleanSnippet.split('\n').join('\n        ')}
      </div>
    </div>
  );
}
`;
}

export default function CodePreview({ title, code, children, className, fullCode }: CodePreviewProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "component">("preview");

  const finalComponentCode = fullCode || generateFullComponent(title, code);
  const displayCode = activeTab === "component" ? finalComponentCode : code;

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">{title}</span>

        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "code" | "component")}>
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="preview" className="h-6 px-2 text-xs gap-1 cursor-pointer">
                <Eye size={12} />
                {t("code.preview")}
              </TabsTrigger>

              <TabsTrigger value="code" className="h-6 px-2 text-xs gap-1 cursor-pointer">
                <Code2 size={12} />
                Snippet
              </TabsTrigger>

              <TabsTrigger value="component" className="h-6 px-2 text-xs gap-1 cursor-pointer">
                <FileCode size={12} />
                Component
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {activeTab === "preview" ? (
        <div className="p-6 bg-background">
          {children}
        </div>
      ) : (
        <div className="relative grid grid-cols-1 w-full min-w-0 overflow-hidden bg-muted/20">
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
              <code className="text-foreground">
                {displayCode}
              </code>
            </pre>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
