"use client";

import {
  Info,
  Code2,
  Package,
  Sparkles,
  FileCode,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { VariantJsonConfigPanel } from "@/components/shared/VariantJsonConfigPanel";
import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  getSharedKanbanFiles,
  KANBAN_DEPENDENCIES,
} from "@/kanban-builder/utils/kanbanSharedFiles";
import { generateKanbanCode, generateKanbanFiles } from "@/kanban-builder/utils/kanbanCodeGenerator";

import {
  kanbanTemplates,
  type KanbanCardData,
  type KanbanBuilderConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";
import { KanbanBoard } from "@/kanban/KanbanBoard";

const complexityColors: Record<string, string> = {
  intermediate:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  expert:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  advanced:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  basic:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

/** Maps camelCase template keys to `afnoui add kanban/<slug>` (mirrors `tables/tables-*` on Table Variants). */
const kanbanVariantSlugOverrides: Partial<Record<string, string>> = {};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function kanbanTemplateKeyToRegistryVariant(templateKey: string): string {
  return kanbanVariantSlugOverrides[templateKey] ?? `kanban-${toKebabCase(templateKey)}`;
}

interface FilesPanelProps {
  cards: KanbanCardData[];
  config: KanbanBuilderConfig;
}

function FilesPanel({ config, cards }: FilesPanelProps) {
  const allFiles = useMemo(() => {
    const generated = generateKanbanFiles(config, cards);
    // `getSharedKanbanFiles(config)` returns only the engine helpers this
    // variant actually reaches — `cellJsRunner.ts` / `rowDialogTemplate.ts`
    // are dropped (and the engine source rewritten with inline no-op stubs)
    // when the active board doesn't configure JS / dialog templates.
    const shared = getSharedKanbanFiles(config).map((f) => ({
      name: f.name,
      path: f.path,
      description: f.description,
      language: f.language,
      code: f.code,
      isFixed: true,
    }));
    return [...generated, ...shared];
  }, [config, cards]);

  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];
  const npmInstall = `npm install ${KANBAN_DEPENDENCIES.runtime.join(" ")}`;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 px-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                Required Dependencies & Files
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install packages and copy{" "}
                <span className="font-semibold">{allFiles.length} files</span>{" "}
                to get this kanban running.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-1 gap-2">
            <InstallCommand command={npmInstall} label="Runtime deps" />
          </div>
          {KANBAN_DEPENDENCIES.notes.length > 0 && (
            <ul className="text-[11px] text-muted-foreground list-disc ps-4 space-y-0.5">
              {KANBAN_DEPENDENCIES.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />{" "}
              Variant-specific (regenerated per board)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />{" "}
              Shared engine (copy once)
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={current.name} onValueChange={setActiveFile}>
        <ScrollArea className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {allFiles.map((file) => (
              <TabsTrigger
                key={file.name}
                value={file.name}
                className="text-xs gap-1.5 data-[state=active]:bg-background"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    file.isFixed ? "bg-muted-foreground" : "bg-primary",
                  )}
                />
                {file.isFixed ? (
                  <Package className="h-3 w-3" />
                ) : (
                  <FileCode className="h-3 w-3" />
                )}
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {allFiles.map((file) => (
          <TabsContent key={file.name} value={file.name} className="mt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2 flex-wrap">
                {file.isFixed ? (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    <Package className="h-3 w-3 mr-1" /> Shared engine
                  </Badge>
                ) : (
                  <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
                    <FileCode className="h-3 w-3 mr-1" /> Variant-specific
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  {file.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> {file.path}
              </div>
              <CodeBlock
                code={file.code}
                language={file.language}
                filename={file.path}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface LivePreviewProps {
  config: KanbanBuilderConfig;
  initialCards: KanbanCardData[];
}

function LivePreview({ config, initialCards }: LivePreviewProps) {
  const [cards, setCards] = useState<KanbanCardData[]>(initialCards);
  // Reset cards whenever the active variant changes (initialCards changes ref).
  // Using useEffect instead of useMemo — setting state from useMemo can trigger
  // an infinite render loop (its callback re-runs on every render where deps look
  // unchanged after the state update).
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Infinite scroll handler — append synthetic next page when needed.
  const handleLoadMore = useCallback(
    ({ columnId }: { columnId: string; lane?: string; cursor?: string }) => {
      if (!config.infiniteScroll?.enabled) return;
      setCards((prev) => {
        const nextStart = prev.filter((c) => c.columnId === columnId).length;
        const batch: KanbanCardData[] = Array.from({ length: 5 }, (_, i) => ({
          id: `${columnId}-load-${nextStart + i}-${Date.now()}-${i}`,
          columnId,
          title: `${columnId.toUpperCase()} task #${nextStart + i + 1}`,
          priority: (["low", "medium", "high", "urgent"] as const)[i % 4],
          tags: ["loaded"],
          assignee: ["JD", "MR", "TK", "AK"][i % 4],
        }));
        return [...prev, ...batch];
      });
    },
    [config.infiniteScroll?.enabled],
  );

  const handleAddCard = useCallback(() => {
    // The board now opens a dialog and appends new cards via onCardsChange.
  }, []);

  return (
    <div className="space-y-4">
      <KanbanBoard
        config={config}
        cards={cards}
        onCardsChange={setCards}
        onLoadMore={handleLoadMore}
        onAddCard={handleAddCard}
      />
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
  );
}

export default function KanbanVariants() {
  const variants = useMemo(
    () => Object.entries(kanbanTemplates).map(([key, t]) => ({ key, ...t })),
    [],
  );
  const [activeKey, setActiveKey] = useState(variants[0].key);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const active = variants.find((v) => v.key === activeKey) ?? variants[0];
  // Honour template direction (e.g. RTL Sprint Timeline) but allow manual override.
  const effectiveDirection =
    active.config.direction === "rtl" || direction === "rtl" ? "rtl" : "ltr";
  const effectiveConfig: KanbanBuilderConfig = useMemo(
    () => ({ ...active.config, direction: effectiveDirection }),
    [active, effectiveDirection],
  );

  const activeSnippet = useMemo(
    () => generateKanbanCode(effectiveConfig, active.cards),
    [effectiveConfig, active.cards],
  );
  const activeRegistryVariant = kanbanTemplateKeyToRegistryVariant(active.key);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px] space-y-6">
        <PageBreadcrumb items={[{ label: "Kanban Variants" }]} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Kanban & Board Variants
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {variants.length} production-ready boards — pick one, see the
                live preview, copy the code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="rtl-toggle" className="text-xs">
                RTL
              </Label>
              <Switch
                id="rtl-toggle"
                checked={direction === "rtl"}
                onCheckedChange={(v) => setDirection(v ? "rtl" : "ltr")}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-9" asChild>
              <a href="/kanban-builder">
                <Code2 className="h-3.5 w-3.5" /> Build your own
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full">
          <div className="hidden md:block">
            <ScrollArea className="w-full">
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/50 rounded-xl border border-border">
                {variants.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setActiveKey(v.key)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2",
                      activeKey === v.key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {v.title}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4 px-1 capitalize border",
                        complexityColors[v.complexity],
                        activeKey === v.key &&
                          "bg-background/20 text-primary-foreground border-primary-foreground/30",
                      )}
                    >
                      {v.complexity}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2 truncate">
                    {active.title}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4 px-1 capitalize border",
                        complexityColors[active.complexity],
                      )}
                    >
                      {active.complexity}
                    </Badge>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md">
                {variants.map((v) => (
                  <DropdownMenuItem
                    key={v.key}
                    onClick={() => setActiveKey(v.key)}
                    className={cn(
                      "text-xs",
                      activeKey === v.key &&
                        "bg-primary/10 text-primary font-medium",
                    )}
                  >
                    <span className="flex-1 truncate">{v.title}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4 px-1 capitalize border ms-2",
                        complexityColors[v.complexity],
                      )}
                    >
                      {v.complexity}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="border-border">
          <CardContent className="py-3 px-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{active.title}</p>
              <p className="text-xs text-muted-foreground">
                {active.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <ComponentInstall
          category="kanban"
          variant={activeRegistryVariant}
          title={active.title}
          code={activeSnippet}
          fullCode={activeSnippet}
        >
          <LivePreview
            key={active.key}
            config={effectiveConfig}
            initialCards={active.cards}
          />
        </ComponentInstall>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
              Source Code
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <FilesPanel config={effectiveConfig} cards={active.cards} />
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
