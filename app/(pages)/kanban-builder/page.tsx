"use client";

import {
  Eye,
  Code2,
  Undo2,
  Redo2,
  Kanban,
  BookOpen,
  TextCursorInput,
} from "lucide-react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useBuilderHistory } from "@/hooks/useBuilderHistory";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { VariantJsonConfigPanel } from "@/components/shared/VariantJsonConfigPanel";

import {
  kanbanTemplates,
  defaultKanbanCards,
  defaultKanbanConfig,
  type KanbanCardData,
  type KanbanBuilderConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";
import { KanbanBoard } from "@/kanban/KanbanBoard";
import { KanbanExportTab } from "@/kanban-builder/KanbanExportTab";
import { KanbanCardEditor } from "@/kanban-builder/KanbanCardEditor";
import { KanbanBuilderGuide } from "@/kanban-builder/KanbanBuilderGuide";
import { KanbanSettingsPanel } from "@/kanban-builder/KanbanSettingsPanel";
import { KanbanJsonImportDialog } from "@/kanban-builder/KanbanJsonImportDialog";

const complexityColors: Record<string, string> = {
  basic:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  intermediate:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  advanced:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  expert:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export default function KanbanBuilder() {
  const {
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    state: config,
    set: setConfig,
  } = useBuilderHistory<KanbanBuilderConfig>(defaultKanbanConfig);
  const [cards, setCards] = useState<KanbanCardData[]>(defaultKanbanCards);
  const [activeTab, setActiveTab] = useState<
    "builder" | "preview" | "code" | "guide"
  >("builder");

  const loadTemplate = useCallback(
    (key: string) => {
      const tpl = kanbanTemplates[key];
      if (!tpl) return;
      reset(tpl.config);
      setCards(tpl.cards);
      toast({ title: "Template loaded", description: tpl.title });
    },
    [reset],
  );

  const handleImport = useCallback(
    (newConfig: KanbanBuilderConfig, newCards: KanbanCardData[]) => {
      reset(newConfig);
      setCards(newCards);
    },
    [reset],
  );

  const handleAddCard = useCallback(
    ({ columnId }: { columnId: string; lane?: string }) => {
      // The board opens an add-card dialog and appends the resulting card
      // via onCardsChange. This handler is kept as a notification hook.
      toast({
        title: "Add card",
        description: `Opening dialog for ${columnId}`,
      });
    },
    [],
  );

  // Built-in infinite-scroll demo. Appends 5 more cards per fetch up to a
  // hasMore=false cutoff at 60 cards/column, simulating cursor-based paging.
  const handleLoadMore = useCallback(
    async ({ columnId }: { columnId: string; cursor?: string }) => {
      await new Promise((r) => setTimeout(r, 350));
      setCards((prev) => {
        const existing = prev.filter((c) => c.columnId === columnId).length;
        if (existing >= 60) return prev;
        const fresh: KanbanCardData[] = Array.from({ length: 5 }).map(
          (_, i) => ({
            id: `inf-${columnId}-${existing + i}-${Date.now()}`,
            columnId,
            title: `Loaded #${existing + i + 1}`,
            priority: (["low", "medium", "high", "urgent"] as const)[
              (existing + i) % 4
            ],
            tags: ["fetched"],
          }),
        );
        return [...prev, ...fresh];
      });
    },
    [],
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px]">
          <PageBreadcrumb items={[{ label: "Kanban Builder" }]} />

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Kanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Kanban Builder
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Build production-ready kanban boards visually
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <Select value="" onValueChange={loadTemplate}>
                  <SelectTrigger className="w-full sm:w-[260px] h-9">
                    <SelectValue placeholder="Load Template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(kanbanTemplates).map(([key, tpl]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{tpl.title}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] h-4 px-1 capitalize border",
                              complexityColors[tpl.complexity],
                            )}
                          >
                            {tpl.complexity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <KanbanJsonImportDialog
                  config={config}
                  cards={cards}
                  onImport={handleImport}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={undo}
                      disabled={!canUndo}
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={redo}
                      disabled={!canRedo}
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="space-y-4"
          >
            <TabsList className="h-10">
              <TabsTrigger value="builder" className="gap-2 px-3 sm:px-4">
                <TextCursorInput className="h-4 w-4" />
                <span className="hidden sm:inline">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 px-3 sm:px-4">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2 px-3 sm:px-4">
                <Code2 className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 px-3 sm:px-4">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Guide</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="mt-0">
              <div className="grid lg:grid-cols-[340px_1fr] gap-4">
                <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-90px)]">
                  <ScrollArea className="lg:h-[calc(100vh-90px)] pe-2">
                    <KanbanSettingsPanel config={config} onChange={setConfig} />
                  </ScrollArea>
                </aside>
                <div className="min-w-0 space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-4">
                      <h2 className="text-lg font-bold">{config.title}</h2>
                      {config.subtitle && (
                        <p className="text-xs text-muted-foreground">
                          {config.subtitle}
                        </p>
                      )}
                    </div>
                    <KanbanBoard
                      config={config}
                      cards={cards}
                      onCardsChange={setCards}
                      onAddCard={handleAddCard}
                      onLoadMore={handleLoadMore}
                    />
                  </div>
                  <KanbanCardEditor
                    config={config}
                    cards={cards}
                    onCardsChange={setCards}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{config.title}</h2>
                    {config.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {config.subtitle}
                      </p>
                    )}
                  </div>
                  <KanbanBoard
                    config={config}
                    cards={cards}
                    onCardsChange={setCards}
                    onAddCard={handleAddCard}
                    onLoadMore={handleLoadMore}
                  />
                </div>

                <VariantJsonConfigPanel
                  titleMeta={`${config.columns.length} columns · ${cards.length} cards`}
                  blocks={[
                    {
                      value: { config, cards },
                      copySuccessDescription:
                        "Board configuration and cards copied to clipboard",
                    },
                  ]}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <KanbanExportTab config={config} cards={cards} />
            </TabsContent>

            <TabsContent value="guide" className="mt-0">
              <KanbanBuilderGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
