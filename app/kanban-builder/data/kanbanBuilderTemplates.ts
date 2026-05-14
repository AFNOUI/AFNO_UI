/**
 * Kanban Builder — templates + builder-only metadata.
 *
 * The runtime types (KanbanBuilderConfig, KanbanCardData, KanbanColumnConfig, …)
 * have moved to `app/kanban/types.ts` so they ship with the installed engine.
 * This file re-exports them for back-compat and adds the editor-only
 * `KanbanTemplate` shape + the `kanbanTemplates` catalog.
 */

export type {
  KanbanComplexity,
  KanbanCardField,
  KanbanColumnConfig,
  KanbanCardData,
  KanbanBuilderConfig,
  KanbanCardChangeEvent,
  KanbanLoadMoreEvent,
} from "@/kanban/types";

import type {
  KanbanComplexity,
  KanbanCardField,
  KanbanCardData,
  KanbanBuilderConfig,
} from "@/kanban/types";

export interface KanbanTemplate {
  title: string;
  description: string;
  complexity: KanbanComplexity;
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
}

// ─── Templates ───────────────────────────────────────────────────────────────

const personalTasks: KanbanTemplate = {
  title: "Personal Tasks",
  description: "Simple to-do board with three lanes.",
  complexity: "basic",
  config: {
    title: "My Tasks",
    subtitle: "Personal productivity board",
    layout: "board",
    columns: [
      { id: "todo", title: "To Do", color: "amber" },
      { id: "doing", title: "Doing", color: "blue" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "dueDate"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
  },
  cards: [
    { id: "p1", columnId: "todo", title: "Buy groceries", priority: "low", dueDate: "Apr 25" },
    { id: "p2", columnId: "todo", title: "Renew gym membership", priority: "medium" },
    { id: "p3", columnId: "doing", title: "Read TanStack docs", priority: "medium" },
    { id: "p4", columnId: "done", title: "Pay electricity bill", priority: "high" },
  ],
};

const bugTracker: KanbanTemplate = {
  title: "Bug Tracker",
  description: "Triage flow with priority + assignee.",
  complexity: "intermediate",
  config: {
    title: "Bug Tracker",
    subtitle: "Triage and resolve issues",
    layout: "board",
    columns: [
      { id: "new", title: "New", color: "muted" },
      { id: "triage", title: "Triage", color: "amber" },
      { id: "fixing", title: "Fixing", color: "blue" },
      { id: "verify", title: "Verify", color: "purple" },
      { id: "closed", title: "Closed", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee", "tags", "comments"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
  },
  cards: [
    { id: "b1", columnId: "new", title: "Login button not responsive on mobile", priority: "high", assignee: "JD", tags: ["mobile", "auth"], comments: 2 },
    { id: "b2", columnId: "triage", title: "Charts flicker on dark mode toggle", priority: "medium", assignee: "MR", tags: ["ui"], comments: 1 },
    { id: "b3", columnId: "fixing", title: "API timeout on /reports", priority: "urgent", assignee: "TK", tags: ["api"], comments: 5 },
    { id: "b4", columnId: "verify", title: "Date picker offset by 1 day", priority: "low", assignee: "AK", tags: ["forms"] },
    { id: "b5", columnId: "closed", title: "Logo blurry on retina", priority: "low", assignee: "MR", tags: ["assets"] },
  ],
};

const sprintBoard: KanbanTemplate = {
  title: "Sprint Board (WIP limits)",
  description: "Engineering sprint with WIP enforcement.",
  complexity: "advanced",
  config: {
    title: "Sprint 24 — Q2 Kickoff",
    subtitle: "WIP limits enforced per lane",
    layout: "board",
    columns: [
      { id: "backlog", title: "Backlog", color: "muted" },
      { id: "ready", title: "Ready", wipLimit: 4, color: "amber" },
      { id: "progress", title: "In Progress", wipLimit: 3, color: "blue" },
      { id: "review", title: "Review", wipLimit: 2, color: "purple" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee", "tags", "estimate", "comments", "attachments"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: true,
    showColumnTotals: true,
    compactCards: false,
  },
  cards: [
    { id: "s1", columnId: "backlog", title: "Implement billing webhook", priority: "high", assignee: "JD", tags: ["billing"], estimate: "5pt" },
    { id: "s2", columnId: "backlog", title: "Refactor auth middleware", priority: "medium", assignee: "MR", tags: ["auth"], estimate: "3pt" },
    { id: "s3", columnId: "ready", title: "Add 2FA flow", priority: "high", assignee: "TK", tags: ["auth", "ux"], estimate: "8pt", comments: 4 },
    { id: "s4", columnId: "ready", title: "Audit log retention", priority: "medium", assignee: "AK", tags: ["security"], estimate: "2pt" },
    { id: "s5", columnId: "progress", title: "Realtime presence indicator", priority: "high", assignee: "JD", tags: ["realtime"], estimate: "5pt", comments: 7, attachments: 2 },
    { id: "s6", columnId: "progress", title: "Stripe portal integration", priority: "urgent", assignee: "MR", tags: ["billing"], estimate: "5pt" },
    { id: "s7", columnId: "review", title: "Org switcher dropdown", priority: "medium", assignee: "TK", tags: ["ui"], estimate: "3pt" },
    { id: "s8", columnId: "done", title: "Migrate to Vite 7", priority: "high", assignee: "AK", tags: ["build"], estimate: "5pt" },
  ],
};

const contentCalendar: KanbanTemplate = {
  title: "Content Calendar",
  description: "Editorial pipeline with swimlanes per writer.",
  complexity: "expert",
  config: {
    title: "Editorial Calendar",
    subtitle: "Grouped by writer",
    layout: "swimlane",
    swimlaneKey: "assignee",
    columns: [
      { id: "idea", title: "Ideas", color: "muted" },
      { id: "draft", title: "Drafting", color: "amber" },
      { id: "edit", title: "Editing", color: "blue" },
      { id: "scheduled", title: "Scheduled", color: "purple" },
      { id: "live", title: "Published", color: "emerald" },
    ],
    visibleFields: ["tags", "dueDate", "assignee", "progress"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: true,
  },
  cards: [
    { id: "c1", columnId: "idea", title: "10 Tailwind tips for 2026", assignee: "Sarah", tags: ["css"], dueDate: "May 2", progress: 0 },
    { id: "c2", columnId: "draft", title: "TanStack Router v2 deep dive", assignee: "Sarah", tags: ["react"], dueDate: "Apr 28", progress: 35 },
    { id: "c3", columnId: "edit", title: "Postgres index strategies", assignee: "Mike", tags: ["sql"], dueDate: "Apr 26", progress: 80 },
    { id: "c4", columnId: "scheduled", title: "Designing for accessibility", assignee: "Anna", tags: ["a11y"], dueDate: "Apr 24", progress: 100 },
    { id: "c5", columnId: "live", title: "Why we love OKLCH", assignee: "Mike", tags: ["design"], progress: 100 },
    { id: "c6", columnId: "idea", title: "Edge functions vs serverless", assignee: "Anna", tags: ["infra"], progress: 0 },
    { id: "c7", columnId: "draft", title: "Zod 4 — what's new", assignee: "Mike", tags: ["typescript"], dueDate: "May 5", progress: 20 },
  ],
};

const compactGrid: KanbanTemplate = {
  title: "Compact Grid",
  description: "Condensed 4-column responsive grid.",
  complexity: "intermediate",
  config: {
    title: "Quick Tasks",
    subtitle: "Compact responsive grid",
    layout: "compact",
    columns: [
      { id: "todo", title: "To Do", color: "amber" },
      { id: "doing", title: "Doing", color: "blue" },
      { id: "review", title: "Review", color: "purple" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee"],
    enableDnd: true,
    enableAddCard: false,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: true,
  },
  cards: [
    { id: "g1", columnId: "todo", title: "Wireframe new pricing page", priority: "medium", assignee: "AK" },
    { id: "g2", columnId: "doing", title: "Build hero animation", priority: "high", assignee: "MR" },
    { id: "g3", columnId: "review", title: "Copy review for FAQ", priority: "low", assignee: "JD" },
    { id: "g4", columnId: "done", title: "Ship onboarding email", priority: "medium", assignee: "TK" },
  ],
};

// ─── Timeline template — horizontal time-bucket columns ─────────────────────
const productRoadmap: KanbanTemplate = {
  title: "Product Roadmap (Timeline)",
  description: "Quarter-by-quarter roadmap as a horizontal timeline.",
  complexity: "advanced",
  config: {
    title: "2026 Product Roadmap",
    subtitle: "Drag features between quarters",
    layout: "timeline",
    columns: [
      { id: "q1", title: "Q1 · Jan–Mar", color: "blue" },
      { id: "q2", title: "Q2 · Apr–Jun", color: "amber" },
      { id: "q3", title: "Q3 · Jul–Sep", color: "purple" },
      { id: "q4", title: "Q4 · Oct–Dec", color: "emerald" },
    ],
    visibleFields: ["priority", "tags", "assignee", "progress", "estimate"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
    direction: "ltr",
  },
  cards: [
    { id: "r1", columnId: "q1", title: "Realtime collaboration v1", priority: "high", tags: ["realtime"], assignee: "JD", progress: 80, estimate: "M" },
    { id: "r2", columnId: "q1", title: "SAML SSO", priority: "medium", tags: ["auth", "enterprise"], assignee: "MR", progress: 100, estimate: "S" },
    { id: "r3", columnId: "q2", title: "Mobile app beta", priority: "high", tags: ["mobile"], assignee: "TK", progress: 40, estimate: "L" },
    { id: "r4", columnId: "q2", title: "Audit log export", priority: "low", tags: ["security"], assignee: "AK", progress: 20, estimate: "S" },
    { id: "r5", columnId: "q2", title: "AI assistant — phase 1", priority: "urgent", tags: ["ai"], assignee: "JD", progress: 10, estimate: "L" },
    { id: "r6", columnId: "q3", title: "Granular RBAC", priority: "medium", tags: ["enterprise"], assignee: "MR", estimate: "M" },
    { id: "r7", columnId: "q3", title: "Data residency (EU)", priority: "high", tags: ["compliance"], assignee: "AK", estimate: "M" },
    { id: "r8", columnId: "q4", title: "Marketplace v1", priority: "high", tags: ["growth"], assignee: "TK", estimate: "L" },
    { id: "r9", columnId: "q4", title: "Public API GA", priority: "medium", tags: ["api"], assignee: "JD", estimate: "M" },
  ],
};

// ─── Dense backlog template — high card count, WIP limits, swimlanes ────────
function makeBacklogCards(): KanbanCardData[] {
  const tagsPool = ["frontend", "backend", "infra", "design", "qa", "docs", "growth", "ml"];
  const assignees = ["JD", "MR", "TK", "AK", "SC", "EM"];
  const priorities: KanbanCardData["priority"][] = ["low", "medium", "high", "urgent"];
  const cols = ["backlog", "ready", "progress", "review", "done"] as const;
  const distribution: Record<typeof cols[number], number> = {
    backlog: 22, ready: 8, progress: 6, review: 4, done: 12,
  };
  const cards: KanbanCardData[] = [];
  let n = 1;
  for (const col of cols) {
    for (let i = 0; i < distribution[col]; i += 1) {
      const tag = tagsPool[(n + i) % tagsPool.length];
      cards.push({
        id: `db-${n}`,
        columnId: col,
        title: `${tag.toUpperCase()} task #${n}`,
        description: i % 3 === 0 ? "Spec details captured in linked doc." : undefined,
        priority: priorities[n % priorities.length],
        tags: [tag, n % 4 === 0 ? "blocker" : "enhancement"],
        assignee: assignees[n % assignees.length],
        comments: n % 5,
        attachments: n % 3 === 0 ? 1 : 0,
        estimate: `${(n % 8) + 1}pt`,
        progress: col === "done" ? 100 : col === "progress" ? 35 + (n % 50) : 0,
      });
      n += 1;
    }
  }
  return cards;
}

const denseBacklog: KanbanTemplate = {
  title: "Dense Backlog (50+ cards)",
  description: "Stress-test sprint board with 50+ cards and WIP limits.",
  complexity: "expert",
  config: {
    title: "Engineering Backlog",
    subtitle: "WIP limits enforced — drag to refine",
    layout: "board",
    columns: [
      { id: "backlog", title: "Backlog", color: "muted" },
      { id: "ready", title: "Ready", wipLimit: 6, color: "amber" },
      { id: "progress", title: "In Progress", wipLimit: 4, color: "blue" },
      { id: "review", title: "Review", wipLimit: 3, color: "purple" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee", "tags", "estimate", "comments", "attachments"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: true,
    showColumnTotals: true,
    compactCards: true,
    direction: "ltr",
  },
  cards: makeBacklogCards(),
};

// ─── RTL Timeline template — verifies right-to-left layouts end-to-end ──────
const rtlSprintTimeline: KanbanTemplate = {
  title: "Sprint Timeline (RTL)",
  description:
    "Right-to-left horizontal timeline. Verifies RTL column order, RTL drop-index resolution, and dialog text direction.",
  complexity: "advanced",
  config: {
    title: "خارطة الطريق · ٢٠٢٦",
    subtitle: "اسحب البطاقات بين الأرباع لتعديل الجدول الزمني",
    layout: "timeline",
    columns: [
      { id: "q1", title: "الربع الأول", color: "blue" },
      { id: "q2", title: "الربع الثاني", color: "amber" },
      { id: "q3", title: "الربع الثالث", color: "purple" },
      { id: "q4", title: "الربع الرابع", color: "emerald" },
    ],
    visibleFields: ["priority", "tags", "assignee", "progress", "estimate"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: false,
    direction: "rtl",
    reduceMotion: false,
    cardClickAction: {
      dialogTitle: "{{row.title}}",
      dialogDescription: "Owner: {{row.assignee}} · {{row.estimate}}",
      dialogWidthClass: "max-w-xl",
      dialogTemplate: `
<div class="space-y-3 text-right" dir="rtl">
  <div class="flex items-center justify-end gap-2">
    {{#each row.tags}}<span class="rounded bg-secondary px-2 py-0.5 text-[10px]">{{.}}</span>{{/each}}
  </div>
  <p class="text-sm text-muted-foreground">المسؤول: <strong>{{row.assignee}}</strong></p>
  <p class="text-sm text-muted-foreground">التقدير: <strong>{{row.estimate}}</strong></p>
  <div class="rounded-md border bg-muted/30 p-3 text-xs">
    <div class="mb-1 text-muted-foreground">نسبة الإنجاز</div>
    <div class="h-2 w-full overflow-hidden rounded bg-background">
      <div class="h-full bg-primary" style="width: {{row.progress}}%"></div>
    </div>
  </div>
</div>`.trim(),
    },
  },
  cards: [
    { id: "rtl-1", columnId: "q1", title: "إطلاق التعاون اللحظي", priority: "high", tags: ["realtime"], assignee: "JD", progress: 80, estimate: "M" },
    { id: "rtl-2", columnId: "q1", title: "تكامل الدخول الموحد", priority: "medium", tags: ["auth"], assignee: "MR", progress: 100, estimate: "S" },
    { id: "rtl-3", columnId: "q2", title: "تطبيق الجوال (تجريبي)", priority: "high", tags: ["mobile"], assignee: "TK", progress: 40, estimate: "L" },
    { id: "rtl-4", columnId: "q2", title: "سجل التدقيق", priority: "low", tags: ["security"], assignee: "AK", progress: 20, estimate: "S" },
    { id: "rtl-5", columnId: "q3", title: "صلاحيات دقيقة", priority: "medium", tags: ["enterprise"], assignee: "MR", estimate: "M" },
    { id: "rtl-6", columnId: "q3", title: "إقامة البيانات (الاتحاد الأوروبي)", priority: "high", tags: ["compliance"], assignee: "AK", estimate: "M" },
    { id: "rtl-7", columnId: "q4", title: "السوق المركزي v1", priority: "high", tags: ["growth"], assignee: "TK", estimate: "L" },
    { id: "rtl-8", columnId: "q4", title: "إصدار واجهة برمجة عامة", priority: "medium", tags: ["api"], assignee: "JD", estimate: "M" },
  ],
};

// ─── Infinite scroll demo — cursor + hasMore wired up end-to-end ─────────────
function makeInfiniteSeed(): KanbanCardData[] {
  const cols = ["new", "active", "done"] as const;
  const out: KanbanCardData[] = [];
  for (const c of cols) {
    for (let i = 0; i < 6; i += 1) {
      out.push({
        id: `inf-seed-${c}-${i}`,
        columnId: c,
        title: `${c.toUpperCase()} task #${i + 1}`,
        priority: (["low", "medium", "high", "urgent"] as const)[i % 4],
        tags: ["seed"],
        assignee: ["JD", "MR", "TK", "AK"][i % 4],
      });
    }
  }
  return out;
}

const infiniteScrollDemo: KanbanTemplate = {
  title: "Infinite Scroll (cursor + hasMore)",
  description:
    "Per-column infinite scroll. Each column starts with 6 cards and loads 5 more whenever you scroll to the bottom. Built-in cursor/hasMore handling — fetch additional pages from your backend.",
  complexity: "advanced",
  config: {
    title: "Activity Feed",
    subtitle: "Scroll to the bottom of any column to load more",
    layout: "board",
    columns: [
      { id: "new", title: "New", color: "amber" },
      { id: "active", title: "Active", color: "blue" },
      { id: "done", title: "Done", color: "emerald" },
    ],
    visibleFields: ["priority", "tags", "assignee"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: true,
    direction: "ltr",
    infiniteScroll: {
      enabled: true,
      thresholdPx: 80,
      cursorByColumn: { new: "0", active: "0", done: "0" },
      hasMoreByColumn: { new: true, active: true, done: true },
    },
  },
  cards: makeInfiniteSeed(),
};

// ─── Scrollable long-column template — columns fixed height, auto-scroll on drag
function makeLongColumnCards(): KanbanCardData[] {
  const cols = ["inbox", "triage", "active", "done"] as const;
  const tags = ["bug", "feature", "chore", "docs", "ux", "perf"];
  const owners = ["JD", "MR", "TK", "AK", "SC"];
  const out: KanbanCardData[] = [];
  let n = 1;
  for (const c of cols) {
    const count = c === "inbox" ? 28 : c === "triage" ? 16 : c === "active" ? 10 : 18;
    for (let i = 0; i < count; i += 1) {
      out.push({
        id: `lc-${c}-${n}`,
        columnId: c,
        title: `${tags[n % tags.length].toUpperCase()} · ticket #${1000 + n}`,
        priority: (["low", "medium", "high", "urgent"] as const)[n % 4],
        tags: [tags[n % tags.length]],
        assignee: owners[n % owners.length],
        comments: n % 4,
      });
      n += 1;
    }
  }
  return out;
}

const longColumns: KanbanTemplate = {
  title: "Scrollable Long Columns (auto-scroll on drag)",
  description:
    "Each column is a fixed-height scrollable list. While dragging, the column auto-scrolls when the pointer hugs the top or bottom edge so you can drop a card anywhere — including the very bottom of a long list.",
  complexity: "advanced",
  config: {
    title: "Support Queue",
    subtitle: "Drag a card to the bottom — the column auto-scrolls",
    layout: "board",
    columns: [
      { id: "inbox", title: "Inbox", color: "muted" },
      { id: "triage", title: "Triage", color: "amber" },
      { id: "active", title: "Active", color: "blue" },
      { id: "done", title: "Resolved", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee", "tags", "comments"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: true,
    direction: "ltr",
    scrollableColumns: true,
    columnMaxHeightPx: 480,
  },
  cards: makeLongColumnCards(),
};

// ─── Hiring pipeline — swimlane by role (advanced) ───────────────────────────
const hiringPipeline: KanbanTemplate = {
  title: "Hiring Pipeline (Swimlane by Role)",
  description:
    "Recruiting workflow with swimlanes per role and rich card metadata. Tracks candidates from sourced → offer.",
  complexity: "expert",
  config: {
    title: "Q2 Hiring Pipeline",
    subtitle: "Grouped by role · drag to advance candidates",
    layout: "swimlane",
    swimlaneKey: "swimlane",
    columns: [
      { id: "sourced", title: "Sourced", color: "muted" },
      { id: "screen", title: "Screen", color: "amber" },
      { id: "interview", title: "Interview", color: "blue" },
      { id: "offer", title: "Offer", color: "purple" },
      { id: "hired", title: "Hired", color: "emerald" },
    ],
    visibleFields: ["tags", "assignee", "dueDate", "progress"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: false,
    showColumnTotals: true,
    compactCards: true,
    direction: "ltr",
  },
  cards: [
    { id: "h1", columnId: "sourced", title: "Maya Chen", swimlane: "Frontend Eng", tags: ["react"], assignee: "JD", progress: 10 },
    { id: "h2", columnId: "screen", title: "Daniel Wu", swimlane: "Frontend Eng", tags: ["react", "ts"], assignee: "JD", dueDate: "May 6", progress: 30 },
    { id: "h3", columnId: "interview", title: "Sara Patel", swimlane: "Frontend Eng", tags: ["react"], assignee: "MR", dueDate: "May 9", progress: 60 },
    { id: "h4", columnId: "offer", title: "Liam Park", swimlane: "Frontend Eng", tags: ["senior"], assignee: "TK", progress: 90 },
    { id: "h5", columnId: "sourced", title: "Ana Gomez", swimlane: "Backend Eng", tags: ["go"], assignee: "MR", progress: 10 },
    { id: "h6", columnId: "screen", title: "Karim Hassan", swimlane: "Backend Eng", tags: ["go", "k8s"], assignee: "MR", dueDate: "May 4", progress: 35 },
    { id: "h7", columnId: "interview", title: "Yuki Tanaka", swimlane: "Backend Eng", tags: ["rust"], assignee: "AK", progress: 55 },
    { id: "h8", columnId: "hired", title: "Noah Smith", swimlane: "Backend Eng", tags: ["go"], assignee: "AK", progress: 100 },
    { id: "h9", columnId: "sourced", title: "Priya Rao", swimlane: "Designer", tags: ["product"], assignee: "TK", progress: 10 },
    { id: "h10", columnId: "interview", title: "Chris Vega", swimlane: "Designer", tags: ["brand"], assignee: "JD", dueDate: "May 7", progress: 50 },
    { id: "h11", columnId: "offer", title: "Sun Lee", swimlane: "Designer", tags: ["product", "senior"], assignee: "JD", progress: 85 },
  ],
};

// ─── CRM deal pipeline — board with WIP, scrollable + value tags ─────────────
const crmPipeline: KanbanTemplate = {
  title: "CRM Deal Pipeline (scrollable + WIP)",
  description:
    "Sales pipeline with deal value tags and WIP limits per stage. Columns auto-scroll while dragging long lists.",
  complexity: "expert",
  config: {
    title: "Q2 Pipeline · $2.4M target",
    subtitle: "WIP enforced · drag to progress deals",
    layout: "board",
    columns: [
      { id: "lead", title: "Lead", color: "muted" },
      { id: "qualified", title: "Qualified", wipLimit: 8, color: "amber" },
      { id: "proposal", title: "Proposal", wipLimit: 6, color: "blue" },
      { id: "negotiation", title: "Negotiation", wipLimit: 4, color: "purple" },
      { id: "won", title: "Won", color: "emerald" },
    ],
    visibleFields: ["priority", "assignee", "tags", "estimate", "comments"],
    enableDnd: true,
    enableAddCard: true,
    enableWipLimits: true,
    showColumnTotals: true,
    compactCards: true,
    direction: "ltr",
    scrollableColumns: true,
    columnMaxHeightPx: 460,
  },
  cards: (() => {
    const accounts = [
      "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Ind", "Wayne Ent", "Hooli",
      "Pied Piper", "Soylent", "Cyberdyne", "Tyrell", "Wonka", "Massive Dynamic",
      "Oscorp", "InGen", "LexCorp", "Vandelay", "Vehement",
    ];
    const owners = ["JD", "MR", "TK", "AK"];
    const cols = ["lead", "qualified", "proposal", "negotiation", "won"] as const;
    const distribution: Record<typeof cols[number], number> = {
      lead: 14, qualified: 9, proposal: 6, negotiation: 4, won: 7,
    };
    const out: KanbanCardData[] = [];
    let n = 0;
    for (const c of cols) {
      for (let i = 0; i < distribution[c]; i += 1) {
        const value = ((i + 1) * 12 + n * 3) % 200 + 20;
        out.push({
          id: `crm-${c}-${n}`,
          columnId: c,
          title: `${accounts[n % accounts.length]} · expansion`,
          priority: (["medium", "high", "urgent", "low"] as const)[n % 4],
          tags: [`$${value}k`, "saas"],
          assignee: owners[n % owners.length],
          estimate: `${value}k`,
          comments: n % 4,
        });
        n += 1;
      }
    }
    return out;
  })(),
};

export const kanbanTemplates: Record<string, KanbanTemplate> = {
  personalTasks,
  bugTracker,
  compactGrid,
  sprintBoard,
  contentCalendar,
  productRoadmap,
  denseBacklog,
  longColumns,
  rtlSprintTimeline,
  infiniteScrollDemo,
  hiringPipeline,
  crmPipeline,
};

export const defaultKanbanConfig: KanbanBuilderConfig = personalTasks.config;
export const defaultKanbanCards: KanbanCardData[] = personalTasks.cards;

export const ALL_FIELDS: { key: KanbanCardField; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "tags", label: "Tags" },
  { key: "priority", label: "Priority" },
  { key: "assignee", label: "Assignee" },
  { key: "dueDate", label: "Due date" },
  { key: "comments", label: "Comments" },
  { key: "attachments", label: "Attachments" },
  { key: "progress", label: "Progress" },
  { key: "estimate", label: "Estimate" },
];