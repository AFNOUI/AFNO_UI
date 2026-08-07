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
    name: "Schema Engine",
    path: "/schema-engine",
    description:
      "Model database tables, columns, and relations visually and export DDL — the first tool in a wider data toolkit.",
  },
  {
    name: "Drag & Drop",
    path: "/dnd",
    description:
      "Nine drag-and-drop patterns — sortable lists, multi-list transfer, trash zones, nested trees, image grids, table row reorder — built on raw pointer events with no third-party DnD library.",
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
      "17 chart types — bar, line, area, pie, radar, scatter, gauge, funnel, treemap, candlestick, waterfall, heatmap, sankey and more — across 93 variants with full RTL/LTR support, built from scratch with zero charting dependencies.",
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
  { name: "Schema Engine", path: "/schema-engine", blurb: "Visual DB schema & DDL export" },
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
    run: "npx afnoui table init",
    summary:
      "Install the complete shared table engine — types, utils, default cell renderers, the row-action layer, and runtime deps.",
  },
  {
    run: "npx afnoui kanban init",
    summary:
      "Install the complete shared kanban engine — board and card runtime, card renderers, and the drag-and-drop primitives.",
  },
  {
    run: "npx afnoui tree init",
    summary:
      "Install the complete shared tree and node-graph engine — TreeCanvas, layout computation, graph types, and GraphToolbar.",
  },
  {
    run: "npx afnoui dnd init",
    summary:
      "Install the drag-and-drop primitives (components/dnd/*) — pointer-event based, with no third-party DnD library.",
  },
  {
    run: "npx afnoui chart init",
    summary:
      "Install the complete chart system — chart primitives plus every one of the 17 chart types in the registry.",
  },
  {
    run: "npx afnoui add forms/forms-contact",
    summary:
      "Add a ready-made variant. Works for every category: forms/, tables/, kanban/, tree/, charts/<type>/, and dnd/. The matching engine and the variant's npm dependencies are installed automatically.",
  },
  {
    run: "npx afnoui list variants",
    summary:
      "List every category and variant slug in the registry. Use `npx afnoui list` for base components, and add --json to either for scriptable output.",
  },
  {
    run: "npx afnoui update",
    summary: "Update installed components to the latest registry version.",
  },
  {
    run: "npx afnoui doctor",
    summary: "Check your setup and registry connectivity.",
  },
  {
    run: "npx afnoui diagnose",
    summary: "Repair stale install locks and expired registry cache entries.",
  },
  {
    run: "npx afnoui clean",
    summary:
      "Interactively remove UI components, the form system, form variants, and afnoui.json.",
  },
  {
    run: "npx afnoui help",
    summary:
      "Show the full command reference with a copy-pasteable example for every command. Every command also accepts --dry-run, --force, and --debug.",
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
    a: "AfnoUI is an open-source, registry-driven React + TypeScript component library and CLI. It provides accessible Radix UI + Tailwind CSS v4 components plus visual builders for forms, tables, kanban boards, trees, and database schemas, a 17-type chart library, a dependency-free drag-and-drop engine, and a live theme lab.",
  },
  {
    q: "How do I install AfnoUI?",
    a: "Run `npx afnoui init` to set up Tailwind, CSS variables, and the base design system, then `npx afnoui add button card dialog` to add components. It works with npm, pnpm, yarn, and bun (npx / pnpm dlx / yarn dlx / bunx).",
  },
  {
    q: "What CLI commands does AfnoUI have?",
    a: "Setup: `afnoui init` (design system; add --dnd for the drag-and-drop engine). Install: `afnoui add <components>` and `afnoui add <category>/<slug>` for variants. Engine systems: `afnoui form init`, `table init`, `kanban init`, `tree init`, `dnd init`, and `chart init` each install the complete shared system for that category. Discover: `afnoui list` and `afnoui list variants`. Maintain: `afnoui update`, `afnoui doctor`, `afnoui diagnose`, and `afnoui clean`. Run `afnoui help` for the full reference. Every command accepts --dry-run, --force, and --debug.",
  },
  {
    q: "Is AfnoUI free and open source?",
    a: "Yes. AfnoUI is free and open source. The CLI writes component source directly into your project, so you own and can edit the code — it is not a runtime dependency.",
  },
  {
    q: "Will the AfnoUI CLI overwrite my changes?",
    a: "No. AfnoUI records a hash of every file it writes in afnoui.json. If you have edited one of those files since it was installed, a re-install stops and asks before touching it, and only --force overwrites. Files AfnoUI never wrote are left alone entirely, and --dry-run previews every write and install without touching disk.",
  },
  {
    q: "How is AfnoUI different from shadcn/ui?",
    a: "Like shadcn/ui, AfnoUI copies source into your repo instead of shipping a black-box package. It goes further with visual builders (form, table, kanban, tree, schema), a 17-type chart library, a drag-and-drop engine with no third-party dependency, and a live theme lab, all driven by a hosted registry the CLI fetches from at install time.",
  },
  {
    q: "Which frameworks and tools does AfnoUI use?",
    a: "AfnoUI targets Next.js 15 and React 19 with TypeScript, Tailwind CSS v4, and Radix UI. Forms use Zod with React Hook Form, TanStack Form, or Action Form.",
  },
  {
    q: "Can I build forms without writing code?",
    a: "Yes. The Visual Form Builder lets you drag and drop 25+ field types, add conditional logic and dependent dropdowns, and export production-ready React + TypeScript with runtime or compile-time Zod validation.",
  },
  {
    q: "Can I save a build and come back to it later?",
    a: "Yes. Every builder has a JSON button that exports the complete build as a single JSON document — configuration, data, and any custom cell or card renderers. Paste that JSON back into the Import tab and you get the exact same build, including the template variant it started from. Nothing is stored on a server, so the JSON is yours to keep in a repo, a ticket, or a gist.",
  },
  {
    q: "Does AfnoUI check my build for mistakes before I export?",
    a: "Yes. Each builder runs a Build health check over your configuration and lists real problems with the exact fix: duplicate field names or column ids, conditional fields watching a field that no longer exists, columns whose data key is missing from the rows, kanban cards pointing at a deleted column, columns over their WIP limit, and flow nodes with a route action but no href. These are the mistakes that would otherwise surface as broken generated code in your project.",
  },
] as const;

/**
 * Per-tool guides — the steps for using each builder plus questions specific to
 * it. Emitted as a page-level `HowTo` and `FAQPage` on that tool's route, so
 * each builder can rank and be quoted on its own terms rather than relying on
 * the homepage graph. Keyed by route.
 */
export const toolGuides = {
  "/form-builder": {
    howToName: "How to build a React form with the AfnoUI Form Builder",
    steps: [
      "Pick a starting point — choose a template from the header dropdown, or start from the blank form.",
      "Drag field types from the palette onto the canvas. 25+ types are available, including async selects, infinite-scroll comboboxes, and dependent dropdowns.",
      "Select any field to edit its label, name, validation, conditional visibility, and watch bindings in the properties panel.",
      "Open the Preview tab to fill the form in with React Hook Form, TanStack Form, or Action Form, and read the Build health panel for anything that needs fixing.",
      "Open the Export Code tab and copy the generated React + TypeScript, or install the engine with `npx afnoui form init`.",
    ],
    faq: [
      {
        q: "Which form libraries can the AfnoUI Form Builder export to?",
        a: "The same form config exports to React Hook Form, TanStack Form, and React's useActionState (Action Form). You can switch libraries in the Preview tab and compare before exporting; the Zod schema is shared across all three.",
      },
      {
        q: "How does conditional field logic work in the AfnoUI Form Builder?",
        a: "Each field can declare a condition naming another field, an operator (equals, notEquals, contains, notEmpty, empty, in, isTrue, isFalse) and a value. The field renders only when the condition passes. The Build health panel flags any condition that points at a field which no longer exists, so a broken rule cannot ship silently.",
      },
    ],
  },
  "/table-builder": {
    howToName: "How to build a React data table with the AfnoUI Table Builder",
    steps: [
      "Choose a template from the header dropdown to start from a realistic table, or begin with the default.",
      "Define your columns in the Columns editor — key, type, sorting, filtering, pinning, aggregation, and per-column cell renderers.",
      "Toggle table features in the Settings panel: search, pagination, virtualization, row selection, expandable rows, inline edit, grouping, and nested headers.",
      "Load your own rows via JSON → Sample data, or press Generate 1k rows to stress-test virtualization.",
      "Check the Build health panel, then export from the Export tab or install the engine with `npx afnoui table init`.",
    ],
    faq: [
      {
        q: "Can I load my own data into the AfnoUI Table Builder?",
        a: "Yes. The JSON dialog has a Sample data tab that takes a plain array of row objects and swaps the rows without touching your column definitions or settings. Rows missing an id, or sharing one, are repaired automatically and reported.",
      },
      {
        q: "How does the AfnoUI table handle very large datasets?",
        a: "Enable virtualization to render only the visible rows using TanStack Virtual, or enable pagination to page through them. The Build health panel warns when both are on at once (a page is small enough that virtualizing adds cost without benefit) and when hundreds of rows are rendering with neither enabled.",
      },
    ],
  },
  "/kanban-builder": {
    howToName: "How to build a React kanban board with the AfnoUI Kanban Builder",
    steps: [
      "Pick a board template from the header dropdown — sprint board, bug tracker, CRM pipeline, hiring pipeline, and more.",
      "Edit columns in the settings panel: title, accent colour, and an optional WIP limit.",
      "Choose a layout — classic board, compact grid, swimlanes, timeline, or calendar — and select which optional card fields to surface.",
      "Add and edit cards in the Cards editor, or drag them between columns on the board itself.",
      "Read the Build health panel, then export from the Export tab or install the engine with `npx afnoui kanban init`.",
    ],
    faq: [
      {
        q: "Does the AfnoUI kanban board use @dnd-kit or react-beautiful-dnd?",
        a: "Neither. Drag and drop is built directly on pointer events, so it works with mouse, touch, and pen with no third-party drag library in your dependency tree. It includes axis-aware autoscroll, an activation distance so plain clicks still fire, and Escape to cancel a drag.",
      },
      {
        q: "What are WIP limits in the AfnoUI Kanban Builder?",
        a: "A WIP (work-in-progress) limit caps how many cards a column should hold. Turn on WIP limits in settings and set a limit per column; the board renders an over-limit column in its warning state, and the Build health panel lists exactly which columns are over and by how much.",
      },
    ],
  },
  "/tree-builder": {
    howToName: "How to build a React flow diagram with the AfnoUI Flow Builder",
    steps: [
      "Choose one of 30+ workflow templates from the searchable header dropdown.",
      "Select any node to edit its label, badge, icon, colour, edge label, and per-node dataset.",
      "Set what each node does when clicked — open a dialog, drawer, or panel, navigate to a route, or show a data table.",
      "Pick a layout and connector style, and enable pan and zoom for larger flows.",
      "Review the Build health panel, then export the generated files from the Export Code tab or install the engine with `npx afnoui tree init`.",
    ],
    faq: [
      {
        q: "What can a node do when clicked in the AfnoUI Flow Builder?",
        a: "Each node declares a click action: none, a dialog, a drawer, a side panel, a route navigation, or a data table rendered in a dialog or panel. Dialog, drawer, and panel actions carry their own title and body. The Build health panel flags route actions with no href and dialogs with neither a title nor a body.",
      },
      {
        q: "Can the AfnoUI Flow Builder attach data to individual nodes?",
        a: "Yes. Every node can carry its own dataset, surfaced through the node data table, alongside tags used by the graph toolbar's chip filters and a sort key for custom ordering.",
      },
    ],
  },
} as const;

export type ToolGuidePath = keyof typeof toolGuides;
