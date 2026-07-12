/**
 * Generic, user-templated dialog for kanban cards. Mirrors the row-detail
 * dialog used by the Table Builder: the user supplies an HTML/Tailwind
 * template with {{card.field}} mustache tokens, plus optional sandboxed JS
 * that runs after the template mounts.
 */
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { runCellJs } from "@/utils/cellJsRunner";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";
import { renderRowDialogTemplate, renderRowDialogText } from "@/utils/rowDialogTemplate";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  card: KanbanCardData | null;
  onOpenChange: (open: boolean) => void;
  action?: KanbanBuilderConfig["cardClickAction"];
}

export function KanbanCardDialog({ card, action, onOpenChange }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const open = !!card;
  // Plain derivations — the React Compiler memoizes these; manual useMemo here
  // could not be preserved (mixed optional-chain deps + cross-memo references).
  const ctx = { row: (card ?? {}) as Record<string, unknown>, value: undefined };
  // Typed JSX renderer wins over the mustache template path.
  const jsxNode =
    !card || !action?.renderDialog
      ? null
      : action.renderDialog({ card, close: () => onOpenChange(false) }) ?? null;
  const html = ((): string => {
    if (!card || jsxNode) return "";
    if (action?.dialogTemplate?.trim()) {
      return renderRowDialogTemplate(action.dialogTemplate, ctx);
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
  })();

  useEffect(() => {
    if (!open || !action?.dialogJs?.trim() || !card || jsxNode) return;
    const t = window.setTimeout(() => {
      if (!contentRef.current) return;
      runCellJs(action.dialogJs!, {
        row: card as unknown as Record<string, unknown>,
        value: undefined,
        el: contentRef.current,
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, card, action?.dialogJs]);

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
        {jsxNode ? (
          <div ref={contentRef}>{jsxNode}</div>
        ) : (
          <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </DialogContent>
    </Dialog>
  );
}
