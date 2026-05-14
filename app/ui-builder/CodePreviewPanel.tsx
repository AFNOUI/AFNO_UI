"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tsx from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";

import { toast } from "@/hooks/use-toast";
import { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import { generateCleanCode } from "@/ui-builder/utils/uiBuilderCodeGen";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

SyntaxHighlighter.registerLanguage("tsx", tsx);

interface CodePreviewPanelProps {
  nodes: BuilderNode[];
}

export function CodePreviewPanel({ nodes }: CodePreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => generateCleanCode(nodes), [nodes]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Clean JSX code copied to clipboard" });
  };

  return (
    <div className="flex flex-col h-full border-s border-border bg-[#282c34]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-mono text-white/60">Page.tsx</span>
        <Button variant="ghost" size="sm" className="h-6 gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <SyntaxHighlighter
          language="tsx"
          style={atomOneDark}
          customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "12px", lineHeight: "1.6" }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </ScrollArea>
    </div>
  );
}
