import {
  PanelTopOpen, Star, ToggleLeft,
  BookOpen, MousePointer2, Eye, Code2, Settings2,
  Download, Filter, Layers, Calculator, Maximize2,
  GripVertical, ArrowRight, Info, Zap, Table2, Columns3, ArrowUpDown,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const steps = [
  {
    icon: MousePointer2,
    title: "1. Pick a template",
    description: "Start from one of 7 production-ready templates ranging from basic to expert complexity.",
    details: [
      "**Simple Contact List** — basic search + pagination (basic)",
      "**Team Members** — avatars, dropdowns, switches, status dots (intermediate)",
      "**Invoice Tracker** — currency, multi-sort, footer totals (intermediate)",
      "**Product Catalog** — DnD, resize, footer aggregation, ratings (advanced)",
      "**Order Management** — row grouping, totals (advanced)",
      "**Task Tracker** — Asana-style tasks with status dots, priorities (advanced)",
      "**CRM Dashboard** — server-side, multi-sort, expandable rows (expert)",
      "**Real Estate Listings** — full feature mix (expert)",
    ],
    tip: "Each template loads its own configuration AND sample data — start close, then customize.",
  },
  {
    icon: Settings2,
    title: "2. Configure global settings",
    description: "The Settings panel groups options into Core, Advanced, and Appearance.",
    details: [
      "**Direction** — switch LTR ↔ RTL; all alignment, scrollbars and icons flip automatically",
      "**Density** — compact / comfortable / spacious row heights",
      "**Page size** — 5 to 100 rows per page",
      "**Sort mode** — client-side or API (server-side)",
      "**Pagination mode** — client-side or API (server-side)",
    ],
    tip: "Switch any toggle and the preview updates immediately — every setting is live.",
  },
  {
    icon: Columns3,
    title: "3. Build your columns",
    description: "The Column Editor lets you add/reorder columns and configure each one in detail.",
    details: [
      "**Drag & drop** — grab the grip handle to reorder columns",
      "**18 column types** — text, number, email, link, date, currency, boolean, badge, status-dot, dropdown, switch, radio, rating, progress, avatar, avatar-image, tags, actions",
      "**Per-column** — width, alignment, sortable, filterable, resizable, groupable, aggregation",
      "**Options** — for dropdown/radio/status-dot, set comma-separated values",
    ],
    tip: "Open 'Advanced' on each column card to see all the per-column knobs.",
  },
  {
    icon: Eye,
    title: "4. Preview & test",
    description: "The Preview tab renders an interactive table with every feature you enabled.",
    details: [
      "**Sort** — click any sortable header (Shift+click for multi-sort)",
      "**Filter** — global search and per-column filter inputs",
      "**Group** — collapsible group sections when grouping is enabled",
      "**Resize** — drag the right edge of any header",
      "**Expand** — click the chevron to see expanded row details",
      "**Edit** — toggle switches, change dropdowns directly in cells",
    ],
    tip: "Try API mode to see the skeleton loading state.",
  },
  {
    icon: Code2,
    title: "5. Export production code",
    description: "The Export tab generates clean, copy-pasteable React + shadcn/ui code.",
    details: [
      "**Static** — pass data as props, client-side everything",
      "**API** — includes a fetch hook with loading + pagination",
      "**Config file** — separate `tableConfig.ts` with all settings",
      "**Type definitions** — full TypeScript types",
    ],
    tip: "Generated files use the same shadcn primitives — your theme, your colors, your radius.",
  },
];

const features = [
  { icon: ArrowUpDown, title: "Multi-Column Sort", description: "Hold Shift and click multiple headers to sort by several columns at once. Active sorts shown as removable chips." },
  { icon: Filter, title: "Global + Column Filters", description: "Header search filters across all columns, plus per-column inline filter inputs that compose with each other." },
  { icon: Layers, title: "Row Grouping", description: "Group rows by any column value. Each group becomes a collapsible section with row counts." },
  { icon: Calculator, title: "Aggregation Footer", description: "Sum, avg, min, max, count — set per column. Footer row aggregates the visible/filtered data." },
  { icon: Maximize2, title: "Column Resize", description: "Hover any header edge and drag to resize. Widths persist while you work." },
  { icon: PanelTopOpen, title: "Expandable Rows", description: "Click the chevron to reveal a detail panel with every field of the row." },
  { icon: GripVertical, title: "Drag & Drop Rows", description: "Reorder rows by dragging the grip handle. Powered by the project's custom Pointer DnD library — no external dependency." },
  { icon: Star, title: "Rich Cell Types", description: "Avatars, ratings, progress bars, status dots, switches, dropdowns, badges, currency — pick the right one for each field." },
  { icon: ToggleLeft, title: "Inline Editing", description: "Switches and dropdowns can be edited directly in the cell when inline edit is enabled." },
  { icon: Download, title: "Real CSV Export", description: "Export button downloads a real CSV of the currently filtered/sorted data." },
  { icon: Table2, title: "Full RTL Support", description: "Toggle direction in settings — every alignment, icon, and scrollbar flips correctly." },
  { icon: Zap, title: "Server-side Ready", description: "Switch to API mode to see the skeleton loading state and generate fetch-hook code." },
];

export function TableBuilderGuide() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="walkthrough">
        <TabsList className="h-auto gap-1">
          <TabsTrigger value="walkthrough" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" /> Walkthrough
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" /> Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="walkthrough" className="mt-4">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <Card key={i} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{step.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: d.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                  {step.tip && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                      <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-[11px] text-primary">{step.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <Card key={i} className="border-border">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{feat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
