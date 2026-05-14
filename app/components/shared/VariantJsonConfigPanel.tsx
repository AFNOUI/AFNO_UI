"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, FileJson } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

export type VariantJsonConfigBlock = {
  /** Uppercase section title (table: "Table config", "Sample data"). Omit for single-block form/kanban layout. */
  label?: string;
  value: unknown;
  /** Tailwind max-height class on ScrollArea (default: sectioned `max-h-[320px]`, single `max-h-[400px]`). */
  maxHeightClass?: string;
  /** Toast description after copy (defaults by label / generic). */
  copySuccessDescription?: string;
};

export type VariantJsonConfigPanelProps = {
  blocks: VariantJsonConfigBlock[];
  /** Subtitle in header, e.g. `6 columns · 5 rows` */
  titleMeta?: string;
  className?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * Collapsible JSON viewer shared by Form Builder preview, Table Preview,
 * Kanban Builder preview, and Kanban variants — same header rhythm, padding,
 * and copy affordances. Behaviour-preserving: still toggles + copies JSON.
 */
export function VariantJsonConfigPanel({
  blocks,
  titleMeta,
  className,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: VariantJsonConfigPanelProps) {
  const contentId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const sectioned =
    blocks.length > 1 ||
    blocks.some((b) => (b.label?.trim() ?? "").length > 0);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  useEffect(() => {
    if (!copiedKey) return;
    const t = window.setTimeout(() => setCopiedKey(null), 2000);
    return () => window.clearTimeout(t);
  }, [copiedKey]);

  const copyBlock = async (block: VariantJsonConfigBlock, key: string) => {
    try {
      await navigator.clipboard.writeText(stringifyJson(block.value));
      setCopiedKey(key);
      toast({
        title: "Copied",
        description:
          block.copySuccessDescription ??
          (block.label
            ? `${block.label} copied to clipboard`
            : "JSON copied to clipboard"),
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not write to clipboard",
        variant: "destructive",
      });
    }
  };

  if (blocks.length === 0) return null;

  return (
    <Card className={cn("border-border", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer px-4 py-3 transition-colors select-none hover:bg-muted/30"
            id={`${contentId}-trigger`}
            aria-controls={`${contentId}-content`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FileJson className="h-4 w-4 shrink-0 text-primary" />
                <CardTitle className="shrink-0 text-sm">
                  JSON Configuration
                </CardTitle>
                {titleMeta ? (
                  <span className="truncate text-[10px] font-normal text-muted-foreground">
                    {titleMeta}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-expanded={open}
                aria-label={open ? "Collapse JSON" : "Expand JSON"}
              >
                {open ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent id={`${contentId}-content`}>
          <CardContent className="space-y-3 px-4 pb-4 pt-0">
            {sectioned ? (
              blocks.map((block, i) => {
                const key = `${i}-${block.label ?? "block"}`;
                const maxH = block.maxHeightClass ?? "max-h-[320px]";
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {block.label?.trim() || `Section ${i + 1}`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-[10px]"
                        onClick={() => void copyBlock(block, key)}
                      >
                        {copiedKey === key ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedKey === key ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <ScrollArea className={maxH}>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed">
                        {stringifyJson(block.value)}
                      </pre>
                    </ScrollArea>
                  </div>
                );
              })
            ) : (
              blocks[0] && (
                <div className="relative overflow-hidden rounded-lg border border-border bg-muted/50">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute end-2 top-2 z-10 h-7 gap-1.5 px-2 text-xs shadow-sm"
                    onClick={() => void copyBlock(blocks[0], "single")}
                  >
                    {copiedKey === "single" ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedKey === "single" ? "Copied" : "Copy"}
                  </Button>
                  <ScrollArea
                    className={blocks[0].maxHeightClass ?? "max-h-[400px]"}
                  >
                    <pre className="min-w-max p-3 pe-24 pb-3 font-mono text-xs leading-relaxed whitespace-pre">
                      {stringifyJson(blocks[0].value)}
                    </pre>
                  </ScrollArea>
                </div>
              )
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
