/**
 * Kanban Builder page — same shape as DataTableBuilder.
 * Tabs: Builder · Preview · Export · Guide.
 */
"use client";

import {
  Eye,
  Code2,
  Kanban,
  BookOpen,
  TextCursorInput,
} from "lucide-react";
import { useState, useCallback } from "react";

import { toast } from "@/hooks/use-toast";

import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  BuilderHeader,
  useBuilderHistory,
  useTemplateOptions,
  BuilderTemplatePicker,
} from "@/components/shared/builder-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

import {
  kanbanTemplates,
  defaultKanbanCards,
  defaultKanbanConfig,
  defaultKanbanTemplateKey,
  defaultKanbanRendererSources,
  type KanbanCardData,
  type KanbanBuilderConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";
import { KanbanBoard } from "@/kanban/KanbanBoard";
import { KanbanExportTab } from "@/kanban-builder/KanbanExportTab";
import { KanbanCardEditor } from "@/kanban-builder/KanbanCardEditor";
import { KanbanBuilderGuide } from "@/kanban-builder/KanbanBuilderGuide";
import { KanbanSettingsPanel } from "@/kanban-builder/KanbanSettingsPanel";
import { KanbanJsonImportDialog } from "@/kanban-builder/KanbanJsonImportDialog";

export default function KanbanBuilder() {
  const { state: config, set: setConfig, reset, history } =
    useBuilderHistory<KanbanBuilderConfig>(defaultKanbanConfig);
  const templateOptions = useTemplateOptions(kanbanTemplates);
  // Seeded with the template the builder boots with, so the header picker
  // shows what is actually on screen instead of an empty placeholder.
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | undefined>(defaultKanbanTemplateKey);
  const [cards, setCards] = useState<KanbanCardData[]>(defaultKanbanCards);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "code" | "guide">("builder");
  const [rendererSources, setRendererSources] = useState<
    import("@/kanban/types").KanbanRendererSources | undefined
  >(defaultKanbanRendererSources);

  const loadTemplate = useCallback((key: string) => {
    const tpl = kanbanTemplates[key];
    if (!tpl) return;
    setSelectedTemplateKey(key);
    reset(tpl.config);
    setCards(tpl.cards);
    setRendererSources(tpl.rendererSources);
    toast({ title: "Template loaded", description: tpl.title });
  }, [reset]);

  const handleImport = useCallback((
    newConfig: KanbanBuilderConfig,
    newCards: KanbanCardData[],
    newRendererSources?: import("@/kanban/types").KanbanRendererSources,
  ) => {
    setSelectedTemplateKey(undefined);
    reset(newConfig);
    setCards(newCards);
    // Restored from the payload — an exported board pastes back complete,
    // custom card renderers included.
    setRendererSources(newRendererSources);
  }, [reset]);

  const handleAddCard = useCallback(
    ({ columnId }: { columnId: string; lane?: string }) => {
      // The board opens an add-card dialog and appends the resulting card
      // via onCardsChange. This handler is kept as a notification hook.
      toast({ title: "Add card", description: `Opening dialog for ${columnId}` });
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
        const fresh: KanbanCardData[] = Array.from({ length: 5 }).map((_, i) => ({
          id: `inf-${columnId}-${existing + i}-${Date.now()}`,
          columnId,
          title: `Loaded #${existing + i + 1}`,
          priority: (["low", "medium", "high", "urgent"] as const)[(existing + i) % 4],
          tags: ["fetched"],
        }));
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

          <BuilderHeader
            icon={Kanban}
            title="Kanban Builder"
            description="Build production-ready kanban boards visually"
            templatePicker={
              <BuilderTemplatePicker
                options={templateOptions}
                value={selectedTemplateKey}
                onSelect={loadTemplate}
              />
            }
            jsonActions={
              <KanbanJsonImportDialog
                config={config}
                cards={cards}
                rendererSources={rendererSources}
                onImport={handleImport}
              />
            }
            history={history}
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
            <TabsList className="h-10">
              <TabsTrigger value="builder" className="gap-2 px-3 sm:px-4"><TextCursorInput className="h-4 w-4" /><span className="hidden sm:inline">Builder</span></TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 px-3 sm:px-4"><Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span></TabsTrigger>
              <TabsTrigger value="code" className="gap-2 px-3 sm:px-4"><Code2 className="h-4 w-4" /><span className="hidden sm:inline">Export</span></TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 px-3 sm:px-4"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Guide</span></TabsTrigger>
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
                      {config.subtitle && <p className="text-xs text-muted-foreground">{config.subtitle}</p>}
                    </div>
                    <KanbanBoard config={config} cards={cards} onCardsChange={setCards} onColumnsChange={(cols) => setConfig({ ...config, columns: cols })} onAddCard={handleAddCard} onLoadMore={handleLoadMore} />
                  </div>
                  <KanbanCardEditor config={config} cards={cards} onCardsChange={setCards} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{config.title}</h2>
                    {config.subtitle && <p className="text-sm text-muted-foreground">{config.subtitle}</p>}
                  </div>
                  <KanbanBoard config={config} cards={cards} onCardsChange={setCards} onColumnsChange={(cols) => setConfig({ ...config, columns: cols })} onAddCard={handleAddCard} onLoadMore={handleLoadMore} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <KanbanExportTab config={config} cards={cards} rendererSources={rendererSources} />
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