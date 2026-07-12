/**
 * Demo templates that exercise the new card-renderer system end-to-end:
 *   - "reusable-card-renderer": single board-wide `config.renderCard` that
 *     highlights urgent cards. Other cards fall through to <KanbanCard />.
 *   - "per-card-renderer": specific cards override with `card.render`.
 *
 * Each template ships both:
 *   - live functions used by the preview (config.renderCard / card.render)
 *   - matching source strings (`rendererSources`) used by the code generator
 *     so the generated `renderers.tsx` file mirrors what's running on screen.
 */
import { AlertTriangle, Sparkles } from "lucide-react";

import type {
  CardRenderer,
  KanbanTemplate,
  KanbanCardData,
  CardDialogRenderer,
} from "@/kanban/types";

/* ─── Case 1 — single reusable renderer ─────────────────────────────────── */

const urgentHighlightRenderer: CardRenderer = ({ card }) => {
  if (card.priority !== "urgent") return undefined; // fall through to built-in
  return (
    <div className="rounded-md border-2 border-destructive bg-destructive/5 p-3 text-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Urgent
      </div>
      <div className="font-medium leading-tight">{card.title}</div>
      {card.assignee && (
        <div className="mt-2 text-[11px] text-muted-foreground">@{card.assignee}</div>
      )}
    </div>
  );
};

const urgentHighlightSource = `({ card }) => {
  if (card.priority !== "urgent") return undefined;
  return (
    <div className="rounded-md border-2 border-destructive bg-destructive/5 p-3 text-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Urgent
      </div>
      <div className="font-medium leading-tight">{card.title}</div>
      {card.assignee && (
        <div className="mt-2 text-[11px] text-muted-foreground">@{card.assignee}</div>
      )}
    </div>
  );
}`;

const reusableImports = `import { AlertTriangle } from "lucide-react";
import type { CardRenderer } from "@/components/kanban/types";`;

const reusableCards: KanbanCardData[] = [
  { id: "u1", columnId: "todo", title: "Fix login regression", priority: "urgent", assignee: "JD" },
  { id: "u2", columnId: "todo", title: "Schedule retro", priority: "low" },
  { id: "u3", columnId: "doing", title: "Migrate to Vite 7", priority: "medium", assignee: "MR" },
  { id: "u4", columnId: "doing", title: "Payments outage RCA", priority: "urgent", assignee: "TK" },
  { id: "u5", columnId: "done", title: "Onboarding email v2", priority: "medium" },
];

export const reusableCardRenderer: KanbanTemplate = {
  title: "Reusable Card Renderer",
  description:
    "Single `config.renderCard` highlights urgent cards; all others fall through to the built-in card.",
  complexity: "intermediate",
  config: {
    title: "Reusable Card Renderer",
    subtitle: "config.renderCard — applied to every card",
    layout: "board",
    columns: [
      { id: "todo", title: "To Do", color: "amber" },
      { id: "doing", title: "Doing", color: "blue" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
    renderCard: urgentHighlightRenderer,
  },
  cards: reusableCards,
  rendererSources: {
    imports: reusableImports,
    reusable: urgentHighlightSource,
  },
};

/* ─── Case 2 — per-card renderers ──────────────────────────────────────── */

const starredRenderer: CardRenderer = ({ card }) => (
  <div className="flex items-start gap-2 rounded-md border bg-gradient-to-br from-amber-50 to-amber-100/40 p-3 dark:from-amber-500/10 dark:to-amber-500/5">
    <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold leading-tight">{card.title}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
        ★ Featured
      </div>
    </div>
  </div>
);

const starredSource = `({ card }) => (
  <div className="flex items-start gap-2 rounded-md border bg-gradient-to-br from-amber-50 to-amber-100/40 p-3 dark:from-amber-500/10 dark:to-amber-500/5">
    <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold leading-tight">{card.title}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
        ★ Featured
      </div>
    </div>
  </div>
)`;

const perCardImports = `import { Sparkles } from "lucide-react";
import type { CardRenderer } from "@/components/kanban/types";`;

const perCardCards: KanbanCardData[] = [
  {
    id: "f1", columnId: "todo", title: "Launch landing page redesign",
    priority: "high", assignee: "JD", render: starredRenderer,
  },
  { id: "f2", columnId: "todo", title: "Audit analytics events", priority: "low" },
  { id: "f3", columnId: "doing", title: "API rate-limit middleware", priority: "medium", assignee: "MR" },
  {
    id: "f4", columnId: "doing", title: "Marketing site rebuild",
    priority: "high", assignee: "TK", render: starredRenderer,
  },
  { id: "f5", columnId: "done", title: "Migrate to React 18", priority: "medium" },
];

export const perCardRenderer: KanbanTemplate = {
  title: "Per-Card Renderer",
  description:
    "Specific cards override with `card.render` — others use the built-in card. Mirrors the per-node tree pattern.",
  complexity: "advanced",
  config: {
    title: "Per-Card Renderer",
    subtitle: "card.render — overrides for individual cards",
    layout: "board",
    columns: [
      { id: "todo", title: "To Do", color: "amber" },
      { id: "doing", title: "Doing", color: "blue" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
  },
  cards: perCardCards,
  rendererSources: {
    imports: perCardImports,
    perCard: {
      f1: starredSource,
      f4: starredSource,
    },
  },
};

/* ─── Case 3 — typed JSX cardClickAction.renderDialog ─────────────────── */

const jsxCardDialogRenderer: CardDialogRenderer = ({ card, close }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-primary" />
      <div className="text-base font-semibold">{card.title}</div>
    </div>
    {card.description && (
      <p className="text-sm text-muted-foreground">{card.description}</p>
    )}
    <div className="grid grid-cols-2 gap-2 text-xs">
      {card.assignee && (
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Assignee</div>
          <div className="font-medium">@{card.assignee}</div>
        </div>
      )}
      {card.priority && (
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Priority</div>
          <div className="font-medium capitalize">{card.priority}</div>
        </div>
      )}
    </div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={close}
        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted"
      >
        Close
      </button>
    </div>
  </div>
);

const jsxCardDialogSource = `({ card, close }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-primary" />
      <div className="text-base font-semibold">{card.title}</div>
    </div>
    {card.description && (
      <p className="text-sm text-muted-foreground">{card.description}</p>
    )}
    <div className="grid grid-cols-2 gap-2 text-xs">
      {card.assignee && (
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Assignee</div>
          <div className="font-medium">@{card.assignee}</div>
        </div>
      )}
      {card.priority && (
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Priority</div>
          <div className="font-medium capitalize">{card.priority}</div>
        </div>
      )}
    </div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={close}
        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted"
      >
        Close
      </button>
    </div>
  </div>
)`;

export const jsxCardDialog: KanbanTemplate = {
  title: "JSX Card Dialog",
  description:
    "`cardClickAction.renderDialog` returns typed JSX — overrides the mustache template path.",
  complexity: "advanced",
  config: {
    title: "JSX Card Dialog",
    subtitle: "cardClickAction.renderDialog — typed JSX",
    layout: "board",
    columns: [
      { id: "todo", title: "To Do", color: "amber" },
      { id: "doing", title: "Doing", color: "blue" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
    cardClickAction: { renderDialog: jsxCardDialogRenderer },
  },
  cards: [
    { id: "j1", columnId: "todo", title: "Wire OAuth callback", description: "PKCE flow + token refresh.", priority: "high", assignee: "JD" },
    { id: "j2", columnId: "doing", title: "Realtime cursor sync", description: "Broadcast presence over WS.", priority: "medium", assignee: "MR" },
    { id: "j3", columnId: "done", title: "Onboarding email v2", description: "A/B test variant B.", priority: "low" },
  ],
  rendererSources: {
    imports: `import { Sparkles } from "lucide-react";\nimport type { CardDialogRenderer } from "@/components/kanban/types";`,
    dialog: jsxCardDialogSource,
  },
};
