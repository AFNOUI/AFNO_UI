"use client";

import { useState } from "react";
import { Check, Copy, FileCode, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  filename?: string;
  /**
   * Optional language hint. Currently unused in rendering but accepted for call-site
   * parity with syntax-highlighted code blocks — kept so consumers can pass
   * `{ language: file.language }` without churn.
   */
  language?: string;
}

export function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: filename ? `${filename} copied to clipboard` : "Code copied to clipboard",
    });
  };

  return (
    <div className="relative group rounded-lg border border-border overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">{filename}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
      <div className="max-h-[500px] overflow-auto overscroll-contain">
        <pre
          className={cn(
            "min-w-max p-4 text-xs font-mono leading-relaxed whitespace-pre",
            !filename && "pt-11 pe-14",
          )}
        >
          <code>{code}</code>
        </pre>
      </div>
      {!filename && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 end-2 h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );
}

export function InstallCommand({ command, label }: { command: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Install command copied" });
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
      <Terminal className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
        <code className="text-xs font-mono text-foreground break-all">{command}</code>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 cursor-pointer"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
