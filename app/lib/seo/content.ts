/**
 * Human-readable SEO content: product features, CLI commands, and FAQ.
 * Kept as plain data so it can feed JSON-LD, /llms.txt, and (later) the UI
 * from one place.
 */

/**
 * Product capabilities — feeds JSON-LD `featureList` / `ItemList` so search
 * and AI engines get an explicit, structured inventory of what AfnoUI does.
 */
export const siteFeatures = [
  {
    name: "Visual Form Builder",
    path: "/form-builder",
    description:
      "Drag-and-drop form builder with 25+ field types (async, infinite-scroll, combobox, dependent dropdowns), conditional logic, and Zod validation. Exports production React + TypeScript.",
  },
  // UI Builder not complete yet — re-enable when implemented.
  // {
  //   name: "UI Builder",
  //   path: "/ui-builder",
  //   description:
  //     "Compose and configure accessible components visually and export clean TypeScript, built on Radix UI and Tailwind CSS v4.",
  // },
  {
    name: "Table Builder",
    path: "/table-builder",
    description:
      "Build production data tables with sorting, filtering, expandable rows, and pagination, then export React + TypeScript.",
  },
  {
    name: "Kanban Builder",
    path: "/kanban-builder",
    description:
      "Design drag-and-drop kanban boards visually with no @dnd-kit dependency, and export production React + TypeScript.",
  },
  {
    name: "Tree Builder",
    path: "/tree-builder",
    description:
      "Build interactive tree and node-graph structures visually and export React + TypeScript.",
  },
  {
    name: "Component Lab",
    path: "/lab",
    description:
      "Live CSS-variable theme editor for every component with design-token export across the whole system.",
  },
  {
    name: "Chart Library",
    path: "/charts",
    description:
      "Bar, Line, Pie, and Area charts with 25+ variants and full RTL/LTR support — built from scratch with zero dependencies (no charting library).",
  },
  {
    name: "30+ UI Components",
    path: "/components",
    description:
      "Accessible, themeable components — Button, Card, Dialog, Tabs, Accordion, Tooltip, Combobox, Command, and more.",
  },
] as const;

/**
 * Primary navigation — the pages we want Google to consider for sitelinks and
 * that AI engines should treat as the main sections. Emitted as
 * `SiteNavigationElement` JSON-LD and rendered in the homepage footer, so the
 * same set is reinforced by both structured data and real sitewide links.
 */
export const siteNav = [
  { name: "Form Builder", path: "/form-builder", blurb: "Visual React form builder" },
  { name: "Table Builder", path: "/table-builder", blurb: "React data table builder" },
  { name: "Kanban Builder", path: "/kanban-builder", blurb: "Drag-and-drop kanban boards" },
  { name: "Tree Builder", path: "/tree-builder", blurb: "Tree & node-graph builder" },
  { name: "Drag & Drop", path: "/dnd", blurb: "DnD without any third-party library" },
  { name: "Chart Builder", path: "/charts", blurb: "React charts & data viz" },
  // { name: "UI Builder", path: "/ui-builder", blurb: "Compose UIs visually" }, // not complete yet
  { name: "Components", path: "/components", blurb: "30+ accessible components" },
] as const;

/**
 * The `afnoui` CLI commands. Surfaced in JSON-LD (a HowTo install guide) and
 * /llms.txt so both Google and AI-search engines can explain exactly how to
 * install and use AfnoUI. `run` uses npx; equivalents work with
 * pnpm dlx / yarn dlx / bunx.
 */
export const siteCommands = [
  {
    run: "npx afnoui init",
    summary:
      "Initialize AfnoUI in a project — sets up Tailwind CSS, CSS variables, utilities, and the base design system.",
  },
  {
    run: "npx afnoui add button card dialog tabs",
    summary:
      "Add UI components. Each component is written into your project with its source, types, and variants.",
  },
  {
    run: "npx afnoui add button/variants",
    summary: "Add specific component variants (styles, sizes, states).",
  },
  {
    run: "npx afnoui form init",
    summary:
      "Initialize the form system. Defaults to React Hook Form; use --tanstack or --action for other stacks. Adds Zod and matching deps.",
  },
  {
    run: "npx afnoui add forms/forms-contact",
    summary:
      "Add a ready-made form template (contact, login, payment, survey, multi-step, and more).",
  },
  {
    run: "npx afnoui list",
    summary: "List every component and variant available in the registry.",
  },
  {
    run: "npx afnoui update",
    summary: "Update installed components to the latest registry version.",
  },
  {
    run: "npx afnoui doctor",
    summary: "Check your setup and registry connectivity.",
  },
] as const;

/**
 * FAQ — rendered as JSON-LD FAQPage. Google shows these as rich results and
 * AI answer engines quote them directly, so they're written as clear,
 * self-contained answers.
 */
export const siteFaq = [
  {
    q: "What is AfnoUI?",
    a: "AfnoUI is an open-source, registry-driven React + TypeScript component library and CLI. It provides accessible Radix UI + Tailwind CSS v4 components plus visual builders for forms, UIs, tables, kanban boards, and trees, a chart library, and a live theme lab.",
  },
  {
    q: "How do I install AfnoUI?",
    a: "Run `npx afnoui init` to set up Tailwind, CSS variables, and the base design system, then `npx afnoui add button card dialog` to add components. It works with npm, pnpm, yarn, and bun (npx / pnpm dlx / yarn dlx / bunx).",
  },
  {
    q: "What CLI commands does AfnoUI have?",
    a: "The main commands are `afnoui init` (set up the design system), `afnoui add <components>` (add components or variants), `afnoui form init` (set up the form system), `afnoui add forms/<template>` (add a form template), `afnoui list` (browse the registry), `afnoui update` (upgrade installed components), and `afnoui doctor` (diagnose setup).",
  },
  {
    q: "Is AfnoUI free and open source?",
    a: "Yes. AfnoUI is free and open source. The CLI writes component source directly into your project, so you own and can edit the code — it is not a runtime dependency.",
  },
  {
    q: "How is AfnoUI different from shadcn/ui?",
    a: "Like shadcn/ui, AfnoUI copies source into your repo instead of shipping a black-box package. It goes further with visual builders (form, UI, table, kanban, tree), a chart library, and a live theme lab, all driven by a hosted registry the CLI fetches from at install time.",
  },
  {
    q: "Which frameworks and tools does AfnoUI use?",
    a: "AfnoUI targets Next.js 15 and React 19 with TypeScript, Tailwind CSS v4, and Radix UI. Forms use Zod with React Hook Form, TanStack Form, or Action Form.",
  },
  {
    q: "Can I build forms without writing code?",
    a: "Yes. The Visual Form Builder lets you drag and drop 25+ field types, add conditional logic and dependent dropdowns, and export production-ready React + TypeScript with runtime or compile-time Zod validation.",
  },
] as const;
