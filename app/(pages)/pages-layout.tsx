"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  Flag, Folder, Trash2, ArrowLeftRight,
  ChevronRight, ChevronDown, Menu, Home, Search,
  Table2, Table, Database, MoveHorizontal, ListOrdered,
  ChevronsRight, MousePointer2, CreditCard, List, Globe,
  AlertCircle, Square, AlertTriangle, PanelLeft, BarChart3,
  LayoutDashboard, FormInput, Sparkles, Sun, Moon, ToggleRight,
  GalleryHorizontal, Layers, Info, TextCursorInput, ToggleLeft,
  SlidersHorizontal, PanelTop, Command, ListFilter, Navigation,
  ChevronsLeft, Image as ImageIcon, FileText, CheckSquare, CircleDot,
  PanelLeftClose, Maximize2, Loader2, ScrollText, Minus, PanelRightOpen, Kanban,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";

type SidebarItem = { id: string; name: string; icon: ReactNode; path: string };

/** DnD sidebar + `/dnd/*` breadcrumb labels (single source with `NAV_SECTIONS`). */
export const DND_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "sortable-list", name: "Sortable list", icon: <ListOrdered size={16} />, path: "/dnd/sortable-list" },
  { id: "horizontal-reorder", name: "Horizontal pill reorder", icon: <MoveHorizontal size={16} />, path: "/dnd/horizontal-reorder" },
  { id: "multi-list", name: "Multi-list transfer", icon: <ArrowLeftRight size={16} />, path: "/dnd/multi-list" },
  { id: "image-grid", name: "Image grid sort", icon: <ImageIcon size={16} />, path: "/dnd/image-grid" },
  { id: "trash", name: "Trash zone", icon: <Trash2 size={16} />, path: "/dnd/trash" },
  { id: "buckets", name: "Priority buckets", icon: <Flag size={16} />, path: "/dnd/buckets" },
  { id: "tree", name: "Nested tree reorder", icon: <Layers size={16} />, path: "/dnd/tree" },
  { id: "files", name: "File → folder drop", icon: <Folder size={16} />, path: "/dnd/files" },
  { id: "table-reorder", name: "Table row reorder", icon: <Table2 size={16} />, path: "/dnd/table-reorder" },
];

/** Charts sidebar + `/charts/*` breadcrumb labels. */
export const CHARTS_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "charts-bar", name: "Bar chart", icon: <BarChart3 size={16} />, path: "/charts/bar" },
  { id: "charts-line", name: "Line chart", icon: <PanelTop size={16} />, path: "/charts/line" },
  { id: "charts-pie", name: "Pie chart", icon: <CircleDot size={16} />, path: "/charts/pie" },
  { id: "charts-area", name: "Area chart", icon: <SlidersHorizontal size={16} />, path: "/charts/area" },
  { id: "charts-radar", name: "Radar chart", icon: <SlidersHorizontal size={16} />, path: "/charts/radar" },
  { id: "charts-scatter", name: "Scatter chart", icon: <Sparkles size={16} />, path: "/charts/scatter" },
  { id: "charts-gauge", name: "Gauge chart", icon: <ToggleRight size={16} />, path: "/charts/gauge" },
  { id: "charts-funnel", name: "Funnel chart", icon: <ChevronDown size={16} />, path: "/charts/funnel" },
  { id: "charts-treemap", name: "Treemap chart", icon: <LayoutDashboard size={16} />, path: "/charts/treemap" },
  { id: "charts-candlestick", name: "Candlestick chart", icon: <PanelTop size={16} />, path: "/charts/candlestick" },
  { id: "charts-waterfall", name: "Waterfall chart", icon: <BarChart3 size={16} />, path: "/charts/waterfall" },
  { id: "charts-heatmap", name: "Heatmap chart", icon: <LayoutDashboard size={16} />, path: "/charts/heatmap" },
  { id: "charts-polar-area", name: "Polar area chart", icon: <CircleDot size={16} />, path: "/charts/polar-area" },
  { id: "charts-radial-bar", name: "Radial bar chart", icon: <ToggleLeft size={16} />, path: "/charts/radial-bar" },
  { id: "charts-bump", name: "Bump chart", icon: <ChevronsRight size={16} />, path: "/charts/bump" },
  { id: "charts-sankey", name: "Sankey chart", icon: <LayoutDashboard size={16} />, path: "/charts/sankey" },
  { id: "charts-donut-progress", name: "Donut progress chart", icon: <LayoutDashboard size={16} />, path: "/charts/donut-progress" },
];

const NAV_SECTIONS = [
  {
    title: "Lab",
    items: [
      { id: "lab", name: "UI Lab", icon: <Home size={16} />, path: "/lab" },
      // { id: "ui-builder", name: "UI Builder", icon: <LayoutPanelTop size={16} />, path: "/ui-builder" },
      { id: "form-builder", name: "Form Builder", icon: <FileText size={16} />, path: "/form-builder" },
      { id: "table-builder", name: "Table Builder", icon: <Table2 size={16} />, path: "/table-builder" },
      {id:"kanban-builder", name: "Kanban Builder", icon: <Kanban size={16} />, path: "/kanban-builder" },
    ],
  },
  {
    title: "Layouts",
    items: [
      { id: "forms", name: "Form Variants", icon: <FormInput size={16} />, path: "/forms" },
      { id: "tables", name: "Table Variants", icon: <Table size={16} />, path: "/tables" },
      { id: "kanban", name: "Kanban Variants", icon: <Kanban size={16} />, path: "/kanban" },
      { id: "schema-engine", name: "Schema Engine", icon: <Database size={16} />, path: "/schema-engine" },
      { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/dashboard" },
      { id: "galleries", name: "Galleries", icon: <ImageIcon size={16} />, path: "/galleries" },
    ],
  },
  {
    title: "DnD Variants",
    items: DND_SIDEBAR_ITEMS,
  },
  {
    title: "Charts",
    items: CHARTS_SIDEBAR_ITEMS,
  },
  {
    title: "Components",
    items: [
      { id: "accordion", name: "Accordion", icon: <List size={16} />, path: "/components/accordion" },
      { id: "alert", name: "Alert", icon: <AlertCircle size={16} />, path: "/components/alert" },
      { id: "alert-dialog", name: "Alert Dialog", icon: <AlertTriangle size={16} />, path: "/components/alert-dialog" },
      { id: "async-fields", name: "Async Fields", icon: <Globe size={16} />, path: "/components/async-fields" },
      { id: "badge", name: "Badge", icon: <Square size={16} />, path: "/components/badge" },
      { id: "breadcrumb", name: "Breadcrumb", icon: <Navigation size={16} />, path: "/components/breadcrumb" },
      { id: "button", name: "Button", icon: <MousePointer2 size={16} />, path: "/components/button" },
      { id: "card", name: "Card", icon: <CreditCard size={16} />, path: "/components/card" },
      { id: "carousel", name: "Carousel", icon: <GalleryHorizontal size={16} />, path: "/components/carousel" },
      { id: "checkbox", name: "Checkbox", icon: <CheckSquare size={16} />, path: "/components/checkbox" },
      { id: "collapsible", name: "Collapsible", icon: <PanelLeftClose size={16} />, path: "/components/collapsible" },
      { id: "combobox", name: "Combobox", icon: <ListFilter size={16} />, path: "/components/combobox" },
      { id: "command", name: "Command", icon: <Command size={16} />, path: "/components/command" },
      { id: "composite-input", name: "Composite Input", icon: <Search size={16} />, path: "/components/composite-input" },
      { id: "dialog", name: "Dialog", icon: <Layers size={16} />, path: "/components/dialog" },
      { id: "dropdown", name: "Dropdown", icon: <ChevronDown size={16} />, path: "/components/dropdown" },
      { id: "form", name: "Form", icon: <FileText size={16} />, path: "/components/form" },
      { id: "infinite-fields", name: "Infinite Fields", icon: <Loader2 size={16} />, path: "/components/infinite-fields" },
      { id: "input", name: "Input", icon: <TextCursorInput size={16} />, path: "/components/input" },
      { id: "menubar", name: "Menubar", icon: <Menu size={16} />, path: "/components/menubar" },
      { id: "navigation-menu", name: "Navigation Menu", icon: <PanelLeft size={16} />, path: "/components/navigation-menu" },
      { id: "popover", name: "Popover", icon: <Maximize2 size={16} />, path: "/components/popover" },
      { id: "progress", name: "Progress", icon: <Loader2 size={16} />, path: "/components/progress" },
      { id: "radio", name: "Radio Group", icon: <CircleDot size={16} />, path: "/components/radio" },
      { id: "scroll-area", name: "Scroll Area", icon: <ScrollText size={16} />, path: "/components/scroll-area" },
      { id: "select", name: "Select", icon: <ChevronDown size={16} />, path: "/components/select" },
      { id: "separator", name: "Separator", icon: <Minus size={16} />, path: "/components/separator" },
      { id: "sheet", name: "Sheet", icon: <PanelRightOpen size={16} />, path: "/components/sheet" },
      { id: "slider", name: "Slider", icon: <SlidersHorizontal size={16} />, path: "/components/slider" },
      { id: "switch", name: "Switch", icon: <ToggleLeft size={16} />, path: "/components/switch" },
      { id: "tabs", name: "Tabs", icon: <PanelTop size={16} />, path: "/components/tab" },
      { id: "toggle", name: "Toggle", icon: <ToggleRight size={16} />, path: "/components/toggle" },
      { id: "tooltip", name: "Tooltip", icon: <Info size={16} />, path: "/components/tooltip" },
    ],
  },
];

type SidebarContentProps = {
  collapsed?: boolean;
  /** Desktop only: pill toggle straddling the rail, centered on the logo row */
  railCollapse?: {
    collapsed: boolean;
    onToggle: () => void;
  };
};

function SidebarContent({ collapsed = false, railCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Lab", "Layouts", "DnD Variants", "Charts", "Components"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Logo + rail toggle (toggle vertically centered on this row) */}
      <div
        className={cn(
          "relative mb-6 flex shrink-0 items-center",
          collapsed ? "justify-center px-0" : "gap-3 px-2"
        )}
      >
        <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shrink-0 ring-1 ring-primary/20">
          <Sparkles size={collapsed ? 16 : 20} aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 pr-1">
            <h1 className="truncate text-xl font-black tracking-tight">Afno UI</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Component System
            </p>
          </div>
        )}
        {railCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={railCollapse.onToggle}
                className={cn(
                  "ltr:-translate-x-1/2 rtl:translate-x-1/2",
                  collapsed ? "ltr:-right-8 rtl:-left-8" : "ltr:-right-9 rtl:-left-9",
                  "ring-4 ring-card transition-colors hover:bg-muted hover:text-foreground",
                  "rounded-full border border-border bg-card text-muted-foreground shadow-md",
                  "absolute top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-expanded={!railCollapse.collapsed}
                aria-label={railCollapse.collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {railCollapse.collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium max-w-[12rem] text-center">
              {railCollapse.collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className={cn("space-y-4", collapsed ? "pb-0" : "pb-2")}>
          {NAV_SECTIONS.map((section) => (
            collapsed ? (
              // Collapsed: just icons with tooltips
              <div key={section.title} className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.path}
                          className={cn(
                            "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {item.icon}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                <Separator />
              </div>
            ) : (
              <Collapsible
                key={section.title}
                open={openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger className="flex items-center gap-1 px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-full">
                  {openSections.includes(section.title) ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                  {section.title}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>)
          ))}
        </nav>
      </div>

      {/* Theme Toggle - deferred until mount to avoid hydration mismatch */}
      <div className="mt-auto shrink-0 border-t border-border/80 bg-card/30 pt-2 backdrop-blur-[2px]">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all"
              >
                {theme === "dark" ? (
                  <Sun size={16} className="text-amber-500" />
                ) : (
                  <Moon size={16} className="text-primary" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all"
          >
            <div className="flex items-center gap-3">
              {!mounted ? (
                <span className="w-4 h-4 shrink-0" aria-hidden />
              ) : theme === "dark" ? (
                <Sun size={16} className="text-amber-500" />
              ) : (
                <Moon size={16} className="text-primary" />
              )}
              <span className="text-xs font-medium">
                {!mounted ? "Theme" : theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function PagesLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-[100dvh] w-full bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "sticky top-0 z-30 hidden h-[100dvh] max-h-[100dvh] shrink-0 flex-col border-e border-border bg-card",
            "transition-[width,min-width,padding] duration-300 ease-out motion-reduce:transition-none lg:flex",
            collapsed ? "w-[68px] min-w-[68px] p-2 pt-3" : "w-64 min-w-64 p-4"
          )}
        >
          <SidebarContent
            collapsed={collapsed}
            railCollapse={{
              collapsed,
              onToggle: () => setCollapsed((c) => !c),
            }}
          />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="flex h-full w-72 flex-col overflow-hidden p-4">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Navigation</SheetDescription>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:min-h-0">
          {/* Mobile Header */}
          <header className="flex h-14 shrink-0 items-center border-b border-border bg-card/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 lg:hidden">
            <Button
              size="sm"
              variant="ghost"
              className="p-2 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <span className="ml-3 font-semibold">UI Lab</span>
          </header>

          {/* Page Content */}
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <PagesLayoutInner>{children}</PagesLayoutInner>;
}
