/**
 * Per-route SEO copy — the single place to edit page titles, descriptions, and
 * keywords. Each route's `layout.tsx` just calls `routeMeta("/path")`.
 *
 * Descriptions are written to be specific and keyword-rich (what the tool does,
 * the tech it uses, and the outcome) so they read well as Google snippets and
 * as answers quoted by AI search engines.
 */
export type PageSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export const pageSeo = {
  "/form-builder": {
    title: "Visual Form Builder",
    description:
      "Build React forms visually — drag and drop 25+ field types including async, infinite-scroll, combobox, and dependent dropdowns. Add conditional logic and Zod validation, preview live, then export production-ready React + TypeScript for React Hook Form, TanStack Form, or Action Form.",
    keywords: [
      "visual form builder",
      "React form builder",
      "drag and drop form builder",
      "form generator React TypeScript",
      "conditional logic forms",
      "dependent dropdowns",
      "Zod form validation",
      "React Hook Form builder",
      "TanStack Form builder",
    ],
  },
  "/ui-builder": {
    title: "UI Builder",
    description:
      "Compose and configure accessible React interfaces visually, then export clean TypeScript. The AfnoUI UI Builder is built on Radix UI primitives and Tailwind CSS v4, so every layout you design ships as themeable, accessible production code.",
    keywords: [
      "UI builder React",
      "visual UI builder",
      "React interface builder",
      "Radix UI builder",
      "Tailwind CSS v4 UI builder",
      "no-code UI React",
    ],
  },
  "/table-builder": {
    title: "Table Builder",
    description:
      "Design production React data tables visually — column sorting, filtering, expandable rows, and pagination — then export type-safe React + TypeScript. Part of AfnoUI's registry-driven component system, installable with npx afnoui add.",
    keywords: [
      "table builder React",
      "React data table generator",
      "data grid builder",
      "sortable filterable table React",
      "expandable rows table",
      "TypeScript data table",
    ],
  },
  "/kanban-builder": {
    title: "Kanban Builder",
    description:
      "Build drag-and-drop kanban boards visually and export production React + TypeScript — with a custom drag-and-drop engine and no @dnd-kit dependency. Configure columns, cards, and drag behavior, then install into your project with the afnoui CLI.",
    keywords: [
      "kanban builder React",
      "React kanban board",
      "drag and drop board React",
      "kanban board generator",
      "no dnd-kit kanban",
      "React board TypeScript",
    ],
  },
  "/tree-builder": {
    title: "Tree Builder",
    description:
      "Create interactive tree and node-graph structures visually — hierarchies, org charts, and flow-style diagrams — and export React + TypeScript. Built on AfnoUI's accessible, themeable component system.",
    keywords: [
      "tree builder React",
      "node graph editor React",
      "React tree component",
      "hierarchy diagram builder",
      "org chart React",
      "flow diagram React",
    ],
  },
  "/lab": {
    title: "Component Lab",
    description:
      "Theme every AfnoUI component in real time. The Component Lab is a live CSS-variable editor for colors, spacing, radius, and typography, with instant preview across the whole design system and one-click design-token export.",
    keywords: [
      "React theme editor",
      "CSS variables editor",
      "design token export",
      "live component theming",
      "Tailwind theme customizer",
      "design system playground",
    ],
  },
  "/forms": {
    title: "Form Variants & Templates",
    description:
      "Ready-made React form templates — contact, login, registration, payment, survey, and multi-step wizards — from a single JSON field config. Works with React Hook Form, TanStack Form, or Action Form plus Zod. Add any template with npx afnoui add forms/…",
    keywords: [
      "React form templates",
      "contact form React",
      "login form React",
      "multi-step form React",
      "payment form template",
      "survey form React",
      "React Hook Form templates",
    ],
  },
  "/dashboard": {
    title: "Dashboard",
    description:
      "A responsive analytics dashboard example built entirely from AfnoUI components — stat cards, a data table, a recent-activity feed, quick actions, and charts. Copy the layout as a starting point for your own admin panel.",
    keywords: [
      "React dashboard template",
      "admin dashboard React",
      "analytics dashboard UI",
      "stats cards React",
      "dashboard components",
      "Tailwind dashboard",
    ],
  },
  "/schema-engine": {
    title: "Schema Engine",
    description:
      "Drive forms and validation from a single JSON schema. AfnoUI's Schema Engine supports runtime or compile-time Zod, dependent options, conditional visibility, and backend hydration — the core that powers the visual form builder.",
    keywords: [
      "JSON schema forms React",
      "schema-driven forms",
      "Zod schema engine",
      "runtime validation React",
      "dependent options forms",
      "form hydration React",
    ],
  },
  "/tables": {
    title: "Table Variants",
    description:
      "Explore production-ready React data table variants — sorting, filtering, expandable rows, selection, and pagination — each with copy-paste TypeScript source. Install any variant with npx afnoui add.",
    keywords: [
      "React data table variants",
      "data table examples React",
      "sortable table React",
      "filterable table",
      "expandable row table",
      "TypeScript table components",
    ],
  },
  "/kanban": {
    title: "Kanban Variants",
    description:
      "Browse drag-and-drop React kanban board variants built on AfnoUI's custom drag engine — no @dnd-kit dependency. Each variant ships copy-paste TypeScript source you install with the afnoui CLI.",
    keywords: [
      "React kanban variants",
      "kanban board examples React",
      "drag and drop board",
      "trello-style board React",
      "no dnd-kit board",
      "TypeScript kanban",
    ],
  },
  "/trees": {
    title: "Tree Variants",
    description:
      "Interactive React tree and node-graph variants — hierarchies, org charts, and flow diagrams — with accessible, themeable TypeScript source you can install via npx afnoui add.",
    keywords: [
      "React tree variants",
      "tree view examples React",
      "node graph React",
      "org chart component",
      "hierarchy tree React",
      "TypeScript tree component",
    ],
  },
  "/charts": {
    title: "Chart Builder",
    description:
      "Build React charts with zero dependencies — no charting library required. Bar, Line, Pie, and Area with 25+ variants including gradient fills, sparklines, hover tooltips, exploded slices, and full RTL/LTR support. Copy-paste TypeScript source, installable with npx afnoui add.",
    keywords: [
      "React chart builder",
      "React chart library",
      "dependency-free charts React",
      "charts without library React",
      "bar chart React",
      "line chart React",
      "pie chart React",
      "area chart React",
      "data visualization React",
      "Recharts alternative",
      "sparkline React",
    ],
  },
  "/dnd": {
    title: "Drag & Drop Builder",
    description:
      "Add drag-and-drop to React with AfnoUI's own DnD engine — no third-party library, no @dnd-kit. Sortable lists, multi-list transfer, kanban, file/image grids, table row reordering, and trees. Copy-paste TypeScript variants, installable with npx afnoui add.",
    keywords: [
      "React drag and drop",
      "drag and drop without library React",
      "dnd without third-party library",
      "drag and drop builder React",
      "sortable list React",
      "dnd-kit alternative",
      "react dnd without dnd-kit",
      "kanban drag drop React",
      "reorderable list React",
    ],
  },
  "/components": {
    title: "Components",
    description:
      "30+ accessible, themeable React components built on Radix UI and Tailwind CSS v4 — Button, Card, Dialog, Tabs, Accordion, Tooltip, Combobox, Command, and more. Each has a live preview of every variant and state, and installs with npx afnoui add.",
    keywords: [
      "React components library",
      "accessible React components",
      "Radix UI components",
      "Tailwind CSS v4 components",
      "shadcn alternative",
      "copy paste React components",
      "themeable UI components",
    ],
  },
} as const satisfies Record<string, PageSeo>;

export type PageSeoPath = keyof typeof pageSeo;
