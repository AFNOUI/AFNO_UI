"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Eye,
  Sun,
  Zap,
  List,
  Menu,
  Moon,
  Github,
  ChevronDown,
  Boxes,
  Code2,
  Rocket,
  Kanban,
  Layers,
  Table2,
  Trash2,
  Wrench,
  Loader2,
  Network,
  Palette,
  Database,
  Sparkles,
  Terminal,
  FileText,
  BarChart3,
  FormInput,
  GitBranch,
  Settings2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  MousePointer2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

import { siteConfig } from "@/lib/seo/config";
import { siteFaq, siteNav } from "@/lib/seo/content";
import { AfnoMark } from "@/components/brand/afno-mark";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";
import { CliInstallCommandBar } from "@/components/shared/CliInstallCommandBar";
import {
  PACKAGE_MANAGERS,
  getAfnouiCommand,
} from "@/components/shared/cliInstallCommands";
import type { PackageManager } from "@/components/shared/cliInstallCommands";

const features = [
  {
    icon: FileText,
    href: "/form-builder",
    title: "Visual Form Builder",
    badges: ["25+ Fields", "3 Form Stacks", "Export Code"],
    description:
      "Drag-and-drop form builder with 25+ field types including async, infinite scroll, and combobox variants. Export production-ready React + TypeScript for React Hook Form, TanStack Form, or Action Form.",
  },
  {
    icon: Table2,
    href: "/table-builder",
    title: "Table Builder",
    badges: ["26 Variants", "Sort & Filter", "Row Actions"],
    description:
      "Compose data tables visually — sorting, filtering, pagination, expandable rows, custom cell renderers, and a row-action API. Exports the same engine the 26 registry table variants are built on.",
  },
  {
    icon: Kanban,
    href: "/kanban-builder",
    title: "Kanban Builder",
    badges: ["16 Variants", "Zero DnD Deps", "Card Renderers"],
    description:
      "Design drag-and-drop boards with 1:1 drag previews and edge-correct drop resolution. Reusable, per-card, or JSX-dialog card renderers — and no @dnd-kit anywhere.",
  },
  {
    icon: Network,
    href: "/tree-builder",
    title: "Tree Builder",
    badges: ["30 Variants", "Auto Layout", "Node Graphs"],
    description:
      "Build hierarchies and node graphs on a pannable canvas with computed layouts, a graph toolbar, and nested drag reordering. Exports as a self-contained TreeCanvas engine.",
  },
  {
    icon: Database,
    href: "/schema-engine",
    title: "Schema Engine",
    badges: ["Visual Schema", "DDL Export", "Relations"],
    description:
      "Model tables, columns, and relations visually, then export DDL. The first piece of a wider data toolkit — JSON ↔ CSV / YAML converters are next.",
  },
  {
    icon: BarChart3,
    title: "Charts & Data Viz",
    href: "/charts",
    badges: ["17 Types", "93 Variants", "Zero Deps"],
    description:
      "17 chart types — bar, line, area, pie, radar, scatter, gauge, funnel, treemap, candlestick, waterfall, heatmap, sankey, and more — across 93 variants with full RTL/LTR support and no charting library.",
  },
  {
    icon: MousePointer2,
    href: "/dnd",
    title: "Drag & Drop",
    badges: ["9 Patterns", "Pointer Events", "No Library"],
    description:
      "Sortable lists, multi-list transfer, trash zones, nested trees, image grids, and table row reorder — built on raw pointer events, so nothing third-party ships with it.",
  },
  {
    href: "/lab",
    icon: Palette,
    title: "Component Lab",
    badges: ["Live Preview", "CSS Variables", "Theme Export"],
    description:
      "Live CSS variable editor for every component. Edit colors, spacing, typography, and see changes in real-time across the entire design system.",
  },
  {
    href: "/components",
    icon: Layers,
    title: "30+ UI Components",
    badges: ["Radix UI", "Accessible", "Themeable"],
    description:
      "Button, Card, Dialog, Tabs, Accordion, Tooltip, Combobox, Command, and many more — each with a dedicated preview page showing all variants and states.",
  },
];

/** Headline registry numbers — kept in sync with `public/registry/**`. */
const registryStats = [
  { value: "350+", label: "Variants" },
  { value: "30+", label: "Components" },
  { value: "17", label: "Chart types" },
  { value: "9", label: "DnD patterns" },
  { value: "6", label: "Engine systems" },
];

/** Builder pages, for the header dropdown and the mobile menu. */
const builderNav = [
  {
    icon: FileText,
    href: "/form-builder",
    name: "Form Builder",
    blurb: "25+ field types, 3 form stacks",
  },
  {
    icon: Table2,
    href: "/table-builder",
    name: "Table Builder",
    blurb: "Sorting, filtering, row actions",
  },
  {
    icon: Kanban,
    href: "/kanban-builder",
    name: "Kanban Builder",
    blurb: "Drag-and-drop boards",
  },
  {
    icon: Network,
    href: "/tree-builder",
    name: "Tree Builder",
    blurb: "Trees and node graphs",
  },
  {
    icon: Database,
    href: "/schema-engine",
    name: "Schema Engine",
    blurb: "Visual schema design and DDL",
  },
  {
    icon: Palette,
    href: "/lab",
    name: "UI Lab",
    blurb: "Live theme editor and previews",
  },
];

/** Flat header links rendered after the two dropdowns. */
const headerLinks = [
  { name: "Components", href: "/components" },
  { name: "CLI", href: "#installation" },
  { name: "How it works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
];

/**
 * The registry, category by category — counts come from `public/registry/**`
 * and link to the gallery page for each one.
 */
const registryCategories = [
  {
    icon: FormInput,
    href: "/forms",
    count: "10",
    name: "Form templates",
    desc: "Contact, login, payment, survey, multi-step, and more — one JSON field config across three form stacks.",
  },
  {
    icon: Table2,
    href: "/tables",
    count: "26",
    name: "Table variants",
    desc: "From simple lists to server-driven CRM grids with row actions and custom cell renderers.",
  },
  {
    icon: Kanban,
    href: "/kanban",
    count: "16",
    name: "Kanban boards",
    desc: "Sprint boards, pipelines, and swimlanes with drag-and-drop already wired up.",
  },
  {
    icon: Network,
    href: "/trees",
    count: "30",
    name: "Trees & graphs",
    desc: "Org charts, file trees, mind maps, and node graphs on a pannable canvas.",
  },
  {
    icon: BarChart3,
    href: "/charts",
    count: "93",
    name: "Charts",
    desc: "17 types — bar, line, area, pie, radar, gauge, sankey, candlestick, and more.",
  },
  {
    icon: MousePointer2,
    href: "/dnd",
    count: "9",
    name: "Drag & drop",
    desc: "Sortable lists, multi-list transfer, trash zones, nested trees, and table row reorder.",
  },
];

const formCapabilities = [
  {
    icon: Layers,
    title: "4 Layouts",
    desc: "Single, Multi-Tab, Wizard, Compact",
  },
  {
    icon: RefreshCw,
    title: "Dependent Options",
    desc: "Cascading dropdowns (Country → State)",
  },
  {
    icon: Loader2,
    title: "Async & Infinite",
    desc: "API-fetched and paginated field types",
  },
  {
    icon: Code2,
    title: "Dual Schema",
    desc: "Runtime or compile-time Zod validation",
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "Test validation and submit in real-time",
  },
  {
    icon: Database,
    title: "Form Hydration",
    desc: "Load dropdown options from backend APIs",
  },
  {
    icon: Zap,
    title: "Auto-Populate",
    desc: "Watch fields with transform constraints",
  },
  {
    icon: GitBranch,
    title: "Conditional Logic",
    desc: "Show/hide fields based on other field values",
  },
];

const techStack = [
  { name: "Next.js 15", desc: "App Router framework" },
  { name: "React 19", desc: "UI runtime" },
  { name: "TypeScript", desc: "Type safety" },
  { name: "Tailwind CSS v4", desc: "Utility-first styling" },
  { name: "Radix UI", desc: "Accessible primitives" },
  { name: "React Hook Form", desc: "Form state management" },
  { name: "TanStack Form", desc: "Alternative form stack" },
  { name: "Zod", desc: "Schema validation" },
  { name: "Lucide", desc: "Icon library" },
];

/**
 * Every command shown on this page, grouped the way `afnoui help` groups them.
 * The install section renders one group at a time, so the page never dumps
 * ~25 terminal blocks on the reader at once.
 */
const cliGroups = [
  {
    id: "setup",
    icon: Rocket,
    label: "Setup",
    heading: "Get AfnoUI into your project",
    blurb:
      "Three commands take you from an empty project to components you own the source of. Run them in order the first time.",
    items: [
      {
        cmd: "init",
        icon: Sparkles,
        label: "Initialize the design system",
        note: "Scaffolds afnoui.json, sets up Tailwind CSS v4, CSS variables, and the cn helper. Add --dnd to include the drag-and-drop engine up front.",
      },
      {
        cmd: "add button card dialog tabs",
        icon: Layers,
        label: "Add UI components",
        note: "Writes component source, types, and variants into your project. Nothing becomes a runtime dependency.",
      },
      {
        cmd: "add button/variants",
        icon: Palette,
        label: "Add a single variant",
        note: "Pull one variant instead of a whole component — styles, sizes, states, and layout presets.",
      },
    ],
  },
  {
    id: "engines",
    icon: Boxes,
    label: "Engine systems",
    heading: "Install a complete system",
    blurb:
      "Each init installs the entire shared system for its category — engine files, types, and every runtime dependency its variants can need. Reach for one when you want the system before picking a variant; add already pulls the right engine in on its own.",
    items: [
      {
        cmd: "form init",
        icon: FormInput,
        label: "Form system",
        note: "Shared form types, hooks, and utils plus one stack. Defaults to React Hook Form — pass --tanstack, --action, or --stack rhf|tanstack|action. Installs Zod and the matching deps.",
      },
      {
        cmd: "table init",
        icon: Table2,
        label: "Table system",
        note: "Table engine, types, utils, default cell renderers, and the row-action layer.",
      },
      {
        cmd: "kanban init",
        icon: Kanban,
        label: "Kanban system",
        note: "Board and card runtime, card-renderer glue, and the drag-and-drop primitives it builds on.",
      },
      {
        cmd: "tree init",
        icon: Network,
        label: "Tree system",
        note: "TreeCanvas engine, layout computation, graph types, and the GraphToolbar.",
      },
      {
        cmd: "dnd init",
        icon: MousePointer2,
        label: "Drag-and-drop primitives",
        note: "The whole components/dnd/* engine — built on raw pointer events, with no third-party DnD library.",
      },
      {
        cmd: "chart init",
        icon: BarChart3,
        label: "Chart system",
        note: "Chart primitives plus every one of the 17 chart types in the registry.",
      },
    ],
  },
  {
    id: "variants",
    icon: Sparkles,
    label: "Variants",
    heading: "Add a ready-made variant",
    blurb:
      "350+ variants across every category. The matching engine and any npm packages the variant imports are installed alongside it, so a single command lands something that already compiles.",
    items: [
      {
        cmd: "add forms/forms-contact",
        icon: FormInput,
        label: "Form template",
        note: "10 templates — contact, login, payment, survey, multi-step, and more.",
      },
      {
        cmd: "add tables/tables-server-crm",
        icon: Table2,
        label: "Data table",
        note: "26 table variants, from simple lists to server-driven CRM grids.",
      },
      {
        cmd: "add kanban/kanban-sprint-board",
        icon: Kanban,
        label: "Kanban board",
        note: "16 board variants with drag-and-drop wired up out of the box.",
      },
      {
        cmd: "add tree/tree-org",
        icon: Network,
        label: "Tree & node graph",
        note: "30 tree variants — org charts, file trees, mind maps, flow graphs.",
      },
      {
        cmd: "add charts/bar/charts-bar-grouped",
        icon: BarChart3,
        label: "Chart",
        note: "93 chart variants across 17 types. The path is charts/<type>/<slug>.",
      },
      {
        cmd: "add dnd/sortable-list",
        icon: MousePointer2,
        label: "Drag-and-drop pattern",
        note: "9 patterns — sortable lists, multi-list transfer, trash zones, nested trees, and more.",
      },
    ],
  },
  {
    id: "maintain",
    icon: Wrench,
    label: "Discover & maintain",
    heading: "Browse the registry and keep it healthy",
    blurb:
      "Find what exists, upgrade what you have installed, and repair a project when something drifts.",
    items: [
      {
        cmd: "list",
        icon: List,
        label: "List components",
        note: "Every base component in the registry. Add --json for scriptable output.",
      },
      {
        cmd: "list variants",
        icon: Layers,
        label: "List variants",
        note: "Every category and variant slug across forms, tables, kanban, tree, charts, and dnd.",
      },
      {
        cmd: "update button input",
        icon: RefreshCw,
        label: "Update components",
        note: "Re-fetch and overwrite installed components from the registry.",
      },
      {
        cmd: "doctor",
        icon: Stethoscope,
        label: "Check your setup",
        note: "Verifies Tailwind, globals.css, the cn helper, and registry connectivity.",
      },
      {
        cmd: "diagnose",
        icon: Wrench,
        label: "Repair the install",
        note: "Clears stale install locks and expired registry cache entries.",
      },
      {
        cmd: "clean",
        icon: Trash2,
        label: "Remove AfnoUI",
        note: "Interactively removes components, the form system, variants, and afnoui.json.",
      },
    ],
  },
] as const;

type CliGroupId = (typeof cliGroups)[number]["id"];

/** Flags accepted by every command. */
const globalFlags = [
  {
    flag: "--dry-run",
    icon: Eye,
    note: "Preview every write and install without touching disk or your package manager.",
  },
  {
    flag: "--force",
    icon: ShieldCheck,
    note: "Overwrite managed files even where you have edited them.",
  },
  {
    flag: "--debug",
    icon: Terminal,
    note: "Print stack traces, registry fetch URLs, and the detected package manager.",
  },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
  const [activeGroup, setActiveGroup] = useState<CliGroupId>("setup");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const group = cliGroups.find((g) => g.id === activeGroup) ?? cliGroups[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <AfnoMark size={30} />
            <span className="text-lg font-black tracking-tight">
              Afno<span className="text-primary">UI</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="ms-2 hidden items-center gap-1 text-sm lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground">
                Builders <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {builderNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="gap-3 py-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.blurb}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground">
                Variants <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {registryCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <DropdownMenuItem key={cat.href} asChild>
                      <Link href={cat.href} className="gap-3 py-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {cat.name}
                          </span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {cat.count}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {headerLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          <div className="ms-auto flex items-center gap-1.5">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 sm:inline-flex"
            >
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                aria-label="AfnoUI on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label={
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/lab">Get Started</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <SheetTitle className="text-start">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  AfnoUI navigation
                </SheetDescription>

                <div className="mt-6 space-y-6">
                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Builders
                    </p>
                    {builderNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Variants
                    </p>
                    {registryCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={() => setMobileNavOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="flex-1">{cat.name}</span>
                          <span className="text-xs tabular-nums">
                            {cat.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      More
                    </p>
                    {headerLinks.map((link) =>
                      link.href.startsWith("#") ? (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileNavOpen(false)}
                          className="block rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileNavOpen(false)}
                          className="block rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          {link.name}
                        </Link>
                      )
                    )}
                    <a
                      href={siteConfig.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/lab" onClick={() => setMobileNavOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
            Open Source · React + TypeScript
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            Build Forms, Tables
            <br />
            &amp; Boards <span className="text-primary">Visually</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete React component system with five visual builders — forms,
            tables, kanban, trees, and schemas — plus a 17-type chart library, a
            drag-and-drop engine with no third-party dependency, a live theme
            lab, and a CLI that writes production TypeScript straight into your
            project. Built on Radix UI and Tailwind CSS v4.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2">
              <Link href="/form-builder">
                Form Builder <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2">
              <Link href="/table-builder">
                Table Builder <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base gap-2"
            >
              <a href="#installation">
                <Terminal className="h-4 w-4" /> Install via CLI
              </a>
            </Button>
          </div>
          {/* Quick install — the same bar every variant install guide uses */}
          <div className="mx-auto max-w-lg text-start">
            <CliInstallCommandBar
              packageManager={pkgManager}
              onPackageManagerChange={setPkgManager}
              resolveCommand={(pm) => getAfnouiCommand(pm, "init")}
              description="Sets up Tailwind CSS v4, CSS variables, the cn helper, and the base design system. Add --dnd to include the drag-and-drop engine up front."
            />
          </div>

          {/* Registry at a glance */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {registryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card/60 px-3 py-4 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-black tracking-tight text-primary md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Installation / CLI Section */}
      <section
        id="installation"
        className="relative scroll-mt-20 border-y border-border bg-muted/20"
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Terminal className="me-1 h-3 w-3" /> CLI
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Install Into Your Project
            </h2>
            <p className="text-lg text-muted-foreground">
              Pick your package manager, then browse the commands by what you
              are trying to do. Source is written into your project — never
              added as a runtime dependency.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            {/* Package manager selector */}
            <div className="mb-4 flex justify-center">
              <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
                {PACKAGE_MANAGERS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPkgManager(pm)}
                    aria-pressed={pkgManager === pm}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors sm:px-5",
                      pkgManager === pm
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Command group selector */}
            <div
              role="tablist"
              aria-label="Command groups"
              className="mb-8 flex flex-wrap justify-center gap-2"
            >
              {cliGroups.map((group) => {
                const Icon = group.icon;
                const isActive = group.id === activeGroup;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveGroup(group.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all sm:px-4",
                      isActive
                        ? "border-primary/50 bg-primary/10 text-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {group.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active group panel */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
              <div className="mb-7 border-b border-border pb-6">
                <h3 className="mb-2 text-xl font-bold tracking-tight">
                  {group.heading}
                </h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {group.blurb}
                </p>
              </div>

              {/* The package manager is chosen once above, so each bar hides
                  its own tabs and follows the section-level selection. */}
              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((item) => (
                  <CliInstallCommandBar
                    key={item.cmd}
                    icon={item.icon}
                    title={item.label}
                    description={item.note}
                    packageManager={pkgManager}
                    showPackageManagers={false}
                    resolveCommand={(pm) => getAfnouiCommand(pm, item.cmd)}
                  />
                ))}
              </div>
            </div>

            {/* Flags + consent model */}
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
                <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Settings2 className="h-4 w-4 text-primary" /> Flags that work
                  on any command
                </h3>
                <p className="mb-5 text-xs text-muted-foreground">
                  Append these to any command above.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {globalFlags.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.flag} className="space-y-1.5">
                        <code
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {f.flag}
                        </code>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {f.note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Your edits
                  stay yours
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  AfnoUI records a hash of every file it writes in{" "}
                  <code dir="ltr" className="text-[11px]">
                    afnoui.json
                  </code>
                  . If you have changed one of those files since, a re-install
                  stops and asks before touching it — and only{" "}
                  <code dir="ltr" className="text-[11px]">
                    --force
                  </code>{" "}
                  overwrites. Files AfnoUI never wrote are left alone entirely.
                </p>
              </div>
            </div>

            {/* Full reference pointer */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-5 text-center sm:flex-row sm:text-start">
              <p className="text-sm text-muted-foreground">
                Every command, flag, and example in one place:
              </p>
              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <CliInstallCommandBar
                  packageManager={pkgManager}
                  showPackageManagers={false}
                  resolveCommand={(pm) => getAfnouiCommand(pm, "help")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Grid */}
      <section
        id="features"
        className="container mx-auto scroll-mt-20 px-4 py-16 md:py-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Five visual builders, a chart library, a drag-and-drop engine, and a
            themeable component set — one registry behind all of it.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Explore the registry — category galleries with real counts */}
      <section className="border-y border-border bg-muted/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Layers className="me-1 h-3 w-3" /> Registry
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              350+ Variants, Ready to Install
            </h2>
            <p className="text-lg text-muted-foreground">
              Every variant is a real, working page you can preview here first —
              then pull into your project with a single command.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {registryCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.href} href={cat.href} className="group">
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-2xl font-black tabular-nums tracking-tight text-primary/80">
                        {cat.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-1.5 font-semibold transition-colors group-hover:text-primary">
                        {cat.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {cat.desc}
                      </p>
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                      Browse all
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Builder Capabilities */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Form Builder
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Powerful Form System
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            JSON-driven forms with validation, conditional logic, and hydration
            — all configurable through a visual interface.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{cap.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <Button asChild variant="default" size="lg" className="gap-2">
              <Link href="/form-builder">
                <FileText className="h-4 w-4" /> Open Form Builder
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/forms">
                <Eye className="h-4 w-4" /> View Form Examples
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section
        id="how-it-works"
        className="container mx-auto scroll-mt-20 px-4 py-16 md:py-24"
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Design it here, install it there, then it is simply your code.
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Connector line behind the step markers (large screens only) */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Pick a starting point",
                desc: "Open one of the five builders, or browse 350+ variants. Every one is a live, working page here — not a screenshot.",
                icon: Sparkles,
              },
              {
                step: "2",
                title: "Design visually",
                desc: "Fields, columns, cards, nodes, relations. Conditional logic, validation, custom renderers, and row actions — all configured in the UI.",
                icon: Settings2,
              },
              {
                step: "3",
                title: "Export or install",
                desc: "Copy the generated TypeScript, or run one add command and the CLI writes the variant, its engine, and its npm deps into your project.",
                icon: Terminal,
              },
              {
                step: "4",
                title: "Own the code",
                desc: "It is your source from that moment — no runtime dependency, and re-installs never overwrite what you have edited without --force.",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 ring-8 ring-background">
                    {item.step}
                  </div>
                  <div className="mt-5 flex justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Built With
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium">{tech.name}</span>
              <span className="text-xs text-muted-foreground">
                · {tech.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — same source as the FAQPage JSON-LD, so the visible copy and the
          structured data can never drift apart. */}
      <section
        id="faq"
        className="scroll-mt-20 border-y border-border bg-muted/20"
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              FAQ
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Common Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              What AfnoUI is, how the CLI behaves, and how it compares.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {siteFaq.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-5 last:border-b"
                >
                  <AccordionTrigger className="text-start text-sm font-semibold hover:no-underline sm:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Ready to Build?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start in the UI Lab, open a builder, or install straight from the
            CLI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/lab">
                Open the UI Lab <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/form-builder">Form Builder</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="gap-2">
              <a href="#installation">CLI Installation</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer — descriptive sitewide links to every builder (sitelinks signal + UX) */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <AfnoMark size={26} />
                <span className="font-black text-base tracking-tight">
                  Afno<span className="text-primary">UI</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Open-source React + TypeScript component library with visual
                builders, charts, and a theme lab.
              </p>
            </div>

            <nav aria-label="Builders" className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Builders
              </h3>
              <ul className="space-y-2 text-sm">
                {siteNav.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Explore" className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Explore
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/lab" className="text-muted-foreground hover:text-foreground transition-colors">Component Lab</Link></li>
                <li><Link href="/components" className="text-muted-foreground hover:text-foreground transition-colors">All Components</Link></li>
                <li><Link href="/forms" className="text-muted-foreground hover:text-foreground transition-colors">Form Templates</Link></li>
                <li><Link href="/tables" className="text-muted-foreground hover:text-foreground transition-colors">Table Variants</Link></li>
                <li><Link href="/kanban" className="text-muted-foreground hover:text-foreground transition-colors">Kanban Variants</Link></li>
                <li><Link href="/trees" className="text-muted-foreground hover:text-foreground transition-colors">Tree Variants</Link></li>
                <li><Link href="/charts" className="text-muted-foreground hover:text-foreground transition-colors">Chart Variants</Link></li>
                <li><Link href="/dnd" className="text-muted-foreground hover:text-foreground transition-colors">Drag & Drop</Link></li>
                <li><Link href="/schema-engine" className="text-muted-foreground hover:text-foreground transition-colors">Schema Engine</Link></li>
                {/* Dashboard page not yet complete — re-enable when implemented.
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li> */}
              </ul>
            </nav>

            <nav aria-label="Resources" className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Resources
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href={siteConfig.npm} className="text-muted-foreground hover:text-foreground transition-colors">npm package</a></li>
                <li><a href={siteConfig.github} className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href={siteConfig.social.reddit} className="text-muted-foreground hover:text-foreground transition-colors">Reddit</a></li>
                <li><a href={siteConfig.social.instagram} className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
            © {siteConfig.name} · Open-source React UI component library, form
            builder, table builder, kanban builder, tree builder, and chart
            builder.
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
