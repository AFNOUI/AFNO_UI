"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Eye,
  Sun,
  Zap,
  Copy,
  Moon,
  Code2,
  Image,
  Layers,
  Loader2,
  Palette,
  Database,
  Terminal,
  Sparkles,
  FileText,
  FormInput,
  GitBranch,
  Settings2,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  MousePointer2,
  LayoutDashboard,
} from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";

const features = [
  {
    icon: FileText,
    href: "/form-builder",
    title: "Visual Form Builder",
    badges: ["25+ Fields", "Export Code", "Multi-Layout"],
    description:
      "Drag-and-drop form builder with 25+ field types including async, infinite scroll, and combobox variants. Export production-ready React + TypeScript code.",
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
    href: "/forms",
    icon: FormInput,
    title: "Form Variants",
    badges: ["10 Templates", "Validation", "Conditional"],
    description:
      "Pre-built form examples: contact, login, payment, survey, multi-step, and more — same JSON field config with React Hook Form, TanStack Form, or ActionForm (`npx afnoui form init --stack …`).",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    badges: ["Stats Cards", "Data Table", "Activity"],
    description:
      "Analytics dashboard with stats cards, data tables, recent activity feed, and quick actions. Complete with responsive layout and charts.",
  },
  {
    icon: Image,
    title: "Charts & Data Viz",
    href: "/components/bar-chart",
    badges: ["4 Chart Types", "25+ Variants", "RTL/LTR"],
    description:
      "Bar, Line, Pie, and Area charts with 25+ variants — hover tooltips, gradient fills, sparklines, exploded slices, and full RTL/LTR support.",
  },
  {
    href: "/lab",
    icon: MousePointer2,
    title: "30+ UI Components",
    badges: ["Radix UI", "Accessible", "Themeable"],
    description:
      "Button, Card, Dialog, Tabs, Accordion, Tooltip, and many more — each with a dedicated preview page showing all variants and states.",
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
  { name: "Next", desc: "Component framework" },
  { name: "TypeScript", desc: "Type safety" },
  { name: "Radix UI", desc: "Accessible primitives" },
  { name: "Tailwind CSS", desc: "Utility-first styling" },
  { name: "React Hook Form", desc: "Form state management" },
  { name: "Zod", desc: "Schema validation" },
  { name: "Lucide", desc: "Icon library" },
];

const cliCommands = {
  npm: {
    init: "npx afnoui init",
    formInit: "npx afnoui form init",
    addVariants: "npx afnoui add button/variants",
    formAdd: "npx afnoui add forms/forms-contact",
    addComponent: "npx afnoui add button card dialog tabs",
  },
  bun: {
    init: "bunx afnoui init",
    formInit: "bunx afnoui form init",
    addVariants: "bunx afnoui add button/variants",
    formAdd: "bunx afnoui add forms/forms-contact",
    addComponent: "bunx afnoui add button card dialog tabs",
  },
  yarn: {
    init: "yarn dlx afnoui init",
    formInit: "yarn dlx afnoui form init",
    addVariants: "yarn dlx afnoui add button/variants",
    formAdd: "yarn dlx afnoui add forms/forms-contact",
    addComponent: "yarn dlx afnoui add button card dialog tabs",
  },
  pnpm: {
    init: "pnpm dlx afnoui init",
    formInit: "pnpm dlx afnoui form init",
    addVariants: "pnpm dlx afnoui add button/variants",
    formAdd: "pnpm dlx afnoui add forms/forms-contact",
    addComponent: "pnpm dlx afnoui add button card dialog tabs",
  },
};

type PkgManager = keyof typeof cliCommands;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function CLIBlock({ command }: { command: string }) {
  return (
    <div
      dir="ltr"
      className="group relative font-mono text-sm bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground"
    >
      <span className="text-primary select-none">$ </span>
      {command}
      <CopyButton text={command} />
    </div>
  );
}

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [pkgManager, setPkgManager] = useState<PkgManager>("npm");

  const cmds = cliCommands[pkgManager];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
              <Sparkles size={18} />
            </div>
            <span className="font-black text-lg tracking-tight">Afno UI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/form-builder"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Form Builder
            </Link>
            <Link
              href="/lab"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Components
            </Link>
            <a
              href="#installation"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Installation
            </a>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button asChild size="sm">
              <Link href="/form-builder">Get Started</Link>
            </Button>
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
            Build Forms & UIs
            <br />
            <span className="text-primary">Visually</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete React component system with visual form builder, ui
            builder, chart library, theme customization lab, and
            production-ready code export. Built with Radix UI primitives and
            Tailwind CSS.
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
            {/* <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
              <Link href="/lab">
                Explore Components <ChevronRight className="h-4 w-4" />
              </Link>
            </Button> */}
          </div>
          {/* Quick install */}
          <div className="max-w-md mx-auto">
            <CLIBlock command={cmds.init} />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Installation / CLI Section */}
      <section
        id="installation"
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Terminal className="h-3 w-3 me-1" /> CLI
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Install Into Your Project
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Add components and forms directly to your project using the Afno UI
            CLI. Works with npm, pnpm, yarn, and bun.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs
            value={pkgManager}
            onValueChange={(v) => setPkgManager(v as PkgManager)}
            className="space-y-6"
          >
            <TabsList className="h-10 mx-auto w-fit">
              <TabsTrigger value="npm" className="px-5 text-sm">
                npm
              </TabsTrigger>
              <TabsTrigger value="pnpm" className="px-5 text-sm">
                pnpm
              </TabsTrigger>
              <TabsTrigger value="yarn" className="px-5 text-sm">
                yarn
              </TabsTrigger>
              <TabsTrigger value="bun" className="px-5 text-sm">
                bun
              </TabsTrigger>
            </TabsList>

            {(["npm", "pnpm", "yarn", "bun"] as PkgManager[]).map((pm) => (
              <TabsContent key={pm} value={pm} className="space-y-6">
                <div className="grid gap-6">
                  {/* Init */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                        1
                      </Badge>
                      <p className="text-sm font-medium">
                        Initialize Afno UI in your project
                      </p>
                    </div>
                    <CLIBlock command={cliCommands[pm].init} />
                    <p className="text-xs text-muted-foreground ms-8">
                      Sets up Tailwind CSS, CSS variables, utility functions,
                      and the base design system.
                    </p>
                  </div>

                  {/* Add components */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                        2
                      </Badge>
                      <p className="text-sm font-medium">Add UI components</p>
                    </div>
                    <CLIBlock command={cliCommands[pm].addComponent} />
                    <p className="text-xs text-muted-foreground ms-8">
                      Install individual components. Each component includes its
                      source code, types, and variants.
                    </p>
                  </div>

                  {/* Component variants */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                        3
                      </Badge>
                      <p className="text-sm font-medium">
                        Add specific variants (optional)
                      </p>
                    </div>
                    <CLIBlock command={cliCommands[pm].addVariants} />
                    <p className="text-xs text-muted-foreground ms-8">
                      Install specific component variant styles, sizes, and
                      configurations.
                    </p>
                  </div>

                  <Separator />

                  {/* Form init */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        <FormInput className="h-3 w-3" />
                      </Badge>
                      <p className="text-sm font-medium">
                        Initialize the Form System
                      </p>
                    </div>
                    <CLIBlock command={cliCommands[pm].formInit} />
                    <p className="text-xs text-muted-foreground ms-8">
                      Installs shared types, hooks, and utils, then one stack
                      from the registry (default: React Hook Form with{" "}
                      <code dir="ltr" className="text-[11px]">
                        ReactHookForm
                      </code>{" "}
                      /{" "}
                      <code dir="ltr" className="text-[11px]">
                        ReactHookFormField
                      </code>{" "}
                      and field components). Use{" "}
                      <code dir="ltr" className="text-[11px]">
                        --tanstack
                      </code>
                      ,{" "}
                      <code dir="ltr" className="text-[11px]">
                        --action
                      </code>
                      , or{" "}
                      <code dir="ltr" className="text-[11px]">
                        --stack tanstack|action
                      </code>{" "}
                      for the other stacks. Adds Zod and the matching runtime
                      deps (e.g.{" "}
                      <code dir="ltr" className="text-[11px]">
                        react-hook-form
                      </code>
                      ,{" "}
                      <code dir="ltr" className="text-[11px]">
                        @tanstack/react-form
                      </code>
                      ).
                    </p>
                  </div>

                  {/* Form add */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        <FileText className="h-3 w-3" />
                      </Badge>
                      <p className="text-sm font-medium">Add a form template</p>
                    </div>
                    <CLIBlock command={cliCommands[pm].formAdd} />
                    <p className="text-xs text-muted-foreground ms-8">
                      Adds a registry form variant (under{" "}
                      <code dir="ltr" className="text-[11px]">
                        components/ui/forms/
                      </code>
                      ). If the form system is not installed yet, the CLI
                      installs the stack first (default RHF; pass the same{" "}
                      <code dir="ltr" className="text-[11px]">
                        --stack
                      </code>{" "}
                      /{" "}
                      <code dir="ltr" className="text-[11px]">
                        --tanstack
                      </code>{" "}
                      /{" "}
                      <code dir="ltr" className="text-[11px]">
                        --action
                      </code>{" "}
                      flags as with{" "}
                      <code dir="ltr" className="text-[11px]">
                        form init
                      </code>
                      ).
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Separator />

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From form building to component theming — a complete toolkit for
            React developers.
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

      <Separator />

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
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Design Visually",
              desc: "Add fields, configure properties, set up conditional logic and validation rules — all through the visual builder interface.",
              icon: Settings2,
            },
            {
              step: "2",
              title: "Preview & Test",
              desc: "See your form live with full validation. Test conditional visibility, dependent dropdowns, and auto-populate transforms.",
              icon: Eye,
            },
            {
              step: "3",
              title: "Export & Ship",
              desc: "Copy the generated TypeScript code into your project. Choose runtime or compile-time schema. Add hydration for backend data.",
              icon: Code2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  {item.step}
                </div>
                <div className="h-10 w-10 mx-auto flex items-center justify-center">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
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

      {/* Footer CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Ready to Build?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start with the form builder, explore components, or install via CLI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/form-builder">
                Form Builder <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/lab">Component Lab</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="gap-2">
              <a href="#installation">CLI Installation</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="border-t border-border py-6">
      </footer> */}

      <ScrollToTopButton />
    </div>
  );
}
