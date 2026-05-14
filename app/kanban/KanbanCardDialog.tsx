"use client";

/**
 * Generic, user-templated dialog for kanban cards. Mirrors the row-detail
 * dialog used by the Table Builder: the user supplies an HTML/Tailwind
 * template with {{card.field}} mustache tokens, plus optional sandboxed JS
 * that runs after the template mounts.
 */
import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";
import { runCellJs } from "@/utils/cellJsRunner";
import { renderRowDialogTemplate, renderRowDialogText } from "@/utils/rowDialogTemplate";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  card: KanbanCardData | null;
  action?: KanbanBuilderConfig["cardClickAction"];
  onOpenChange: (open: boolean) => void;
}

export function KanbanCardDialog({ card, action, onOpenChange }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const open = !!card;
  // Extract optional-chain values into stable locals so React Compiler's
  // dependency inference exactly matches our manual deps.
  const dialogTemplate = action?.dialogTemplate;
  const ctx = useMemo(
    () => ({ row: (card ?? {}) as Record<string, unknown>, value: undefined }),
    [card],
  );
  const html = useMemo(() => {
    if (!card) return "";
    if (dialogTemplate?.trim()) {
      return renderRowDialogTemplate(dialogTemplate, ctx);
    }
    // Default fallback — show every defined field as a key/value grid.
    const rows = Object.entries(card)
      .filter(([k, v]) => k !== "id" && v != null && v !== "")
      .map(
        ([k, v]) =>
          `<div class="grid grid-cols-[120px_1fr] gap-3 py-1.5 border-b border-border/50 last:border-0">
            <div class="text-xs text-muted-foreground capitalize">${k}</div>
            <div class="text-sm">${Array.isArray(v) ? v.join(", ") : String(v)}</div>
          </div>`,
      )
      .join("");
    return `<div>${rows}</div>`;
  }, [card, dialogTemplate, ctx]);

  const dialogJs = action?.dialogJs;
  useEffect(() => {
    if (!open || !card) return;
    const trimmed = dialogJs?.trim();
    if (!trimmed) return;
    const t = window.setTimeout(() => {
      if (!contentRef.current) return;
      runCellJs(trimmed, {
        row: card as unknown as Record<string, unknown>,
        value: undefined,
        el: contentRef.current,
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, card, dialogJs]);

  if (!card) return null;
  const title = action?.dialogTitle?.trim()
    ? renderRowDialogText(action.dialogTitle, ctx)
    : card.title;
  const description = action?.dialogDescription?.trim()
    ? renderRowDialogText(action.dialogDescription, ctx)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(action?.dialogWidthClass ?? "max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </DialogContent>
    </Dialog>
  );
}
