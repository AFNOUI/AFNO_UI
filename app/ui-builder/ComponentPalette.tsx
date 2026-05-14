"use client";

import { useState } from "react";
import { ChevronDown, Search, LayoutGrid, Columns2, Columns3, PanelLeft, Rows3, Square, AppWindow, LayoutPanelTop } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable } from "@/components/ui/dnd";
import { componentRegistry, categoryLabels, categoryIcons } from "@/ui-builder/data/uiBuilderRegistry";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Quick Layout Presets ───
export interface LayoutPreset {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  // Returns an array of { type, props?, styles? } to insert
  create: () => Array<{ type: string; propsOverride?: Record<string, unknown>; stylesOverride?: Record<string, string> }>;
}

export const layoutPresets: LayoutPreset[] = [
  {
    id: "1-col",
    label: "1 Column",
    icon: Square,
    description: "Single column layout",
    create: () => [{ type: "container" }],
  },
  {
    id: "2-col",
    label: "2 Columns",
    icon: Columns2,
    description: "Two equal columns",
    create: () => [{ type: "grid", propsOverride: { columns: "2" }, stylesOverride: { gridCols: "grid-cols-2" } }],
  },
  {
    id: "3-col",
    label: "3 Columns",
    icon: Columns3,
    description: "Three equal columns",
    create: () => [{ type: "grid", propsOverride: { columns: "3" }, stylesOverride: { gridCols: "grid-cols-3" } }],
  },
  {
    id: "4-col",
    label: "4 Columns",
    icon: LayoutGrid,
    description: "Four equal columns",
    create: () => [{ type: "grid", propsOverride: { columns: "4" }, stylesOverride: { gridCols: "grid-cols-4" } }],
  },
  {
    id: "sidebar-content",
    label: "Sidebar + Content",
    icon: PanelLeft,
    description: "Sidebar with main area",
    create: () => [{ type: "columns", propsOverride: { layout: "1/3-2/3" }, stylesOverride: { gridCols: "grid-cols-[280px_1fr]" } }],
  },
  {
    id: "stacked",
    label: "Stacked Rows",
    icon: Rows3,
    description: "Vertical stack of sections",
    create: () => [{ type: "section" }],
  },
  {
    id: "dashboard-shell",
    label: "Dashboard Shell",
    icon: AppWindow,
    description: "Sidebar with content workspace",
    create: () => [{ type: "columns", propsOverride: { layout: "1/4-3/4" }, stylesOverride: { gridCols: "grid-cols-[260px_minmax(0,1fr)]", gap: "gap-6", alignItems: "items-start" } }],
  },
  {
    id: "header-content",
    label: "Header + Body",
    icon: LayoutPanelTop,
    description: "Top bar followed by content area",
    create: () => [{ type: "section", stylesOverride: { gap: "gap-6" } }],
  },
];

function PaletteItem({ type, label, icon: Icon }: { type: string; label: string; icon: React.ElementType }) {
  const { dragProps, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
    preview: () => (
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs bg-card border border-primary shadow-lg">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-foreground font-medium">{label}</span>
      </div>
    ),
  });

  return (
    <div
      {...dragProps}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-grab text-xs transition-all",
        "bg-background/50 hover:bg-accent/60 border border-transparent hover:border-border/60 active:cursor-grabbing",
        isDragging && "opacity-40 ring-2 ring-primary shadow-lg"
      )}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-foreground/90 truncate font-medium">{label}</span>
    </div>
  );
}

interface ComponentPaletteProps {
  onInsertLayout?: (preset: LayoutPreset) => void;
}

export function ComponentPalette({ onInsertLayout }: ComponentPaletteProps) {
  const categories = Array.from(new Set(componentRegistry.map(c => c.category)));
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );
  const [search, setSearch] = useState("");

  const filteredRegistry = search.trim()
    ? componentRegistry.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()))
    : componentRegistry;

  const filteredCategories = categories.filter(cat =>
    filteredRegistry.some(c => c.category === cat)
  );

  return (
    <div className="h-full border-e border-border bg-card/30 flex flex-col">
      <div className="px-3 py-2.5 border-b border-border space-y-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Components</h3>
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs ps-7 bg-background/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Quick Layouts - only show when not searching */}
          {!search.trim() && onInsertLayout && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="h-3 w-3" />
                Quick Layouts
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1 py-1">
                {layoutPresets.map(preset => (
                  <Tooltip key={preset.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onInsertLayout(preset)}
                        className={cn(
                           "flex min-h-20 flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-border/50",
                          "bg-background/50 hover:bg-accent/60 hover:border-primary/30 transition-all",
                          "text-muted-foreground hover:text-foreground cursor-pointer"
                        )}
                      >
                        <preset.icon className="h-4 w-4" />
                         <span className="text-[10px] font-medium leading-tight text-center">{preset.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">{preset.description}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="mx-2 border-b border-border/50 mt-1" />
            </div>
          )}

          {filteredCategories.map(cat => {
            const CatIcon = categoryIcons[cat];
            const items = filteredRegistry.filter(c => c.category === cat);
            const isOpen = openCategories[cat] !== false;
            return (
              <Collapsible
                key={cat}
                open={isOpen}
                onOpenChange={(open) => setOpenCategories(prev => ({ ...prev, [cat]: open }))}
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                  <CatIcon className="h-3 w-3" />
                  <span className="flex-1 text-start">{categoryLabels[cat]}</span>
                  <span className="text-[9px] text-muted-foreground/50 font-normal normal-case">{items.length}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-0.5 py-0.5 ps-1">
                    {items.map(item => (
                      <PaletteItem key={item.type} type={item.type} label={item.label} icon={item.icon} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
