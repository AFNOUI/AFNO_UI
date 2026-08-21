"use client";

import {
  Info,
  Code2,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// import { Label } from "@/components/ui/label"; // RTL disabled for now
import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch"; // RTL disabled for now
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { VariantPicker } from "@/components/shared/VariantPicker";
import { VariantJsonConfigPanel } from "@/components/shared/VariantJsonConfigPanel";

import { ComponentInstall } from "@/components/lab/ComponentInstall";

import {
  KANBAN_DEPENDENCIES,
  getSharedKanbanFiles,
} from "@/kanban-builder/utils/kanbanSharedFiles";
import { generateKanbanCode, generateKanbanFiles } from "@/kanban-builder/utils/kanbanCodeGenerator";
import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, transportNpmDependencies, type TransportChoice } from "@/lib/codegen/transport";

import {
  kanbanTemplates,
  type KanbanCardData,
  type KanbanBuilderConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";
import { KanbanBoard } from "@/kanban/KanbanBoard";

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
  /** Registry slug, so the install command can carry the transport flags. */
  variantSlug: string;
  /** Lifted to the page: the ComponentInstall bar above shows the same command. */
  transport: TransportChoice;
  onTransportChange: (t: TransportChoice) => void;
  cards: KanbanCardData[];
  config: KanbanBuilderConfig;
  rendererSources?: import("@/kanban/types").KanbanRendererSources;
}

function FilesPanel({ config, cards, rendererSources, variantSlug, transport, onTransportChange }: FilesPanelProps) {
  const allFiles = useMemo(() => {
    const generated = generateKanbanFiles(config, cards, rendererSources, undefined, transport);
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
  }, [config, cards, rendererSources, transport]);

  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];
  const npmInstall = `npm install ${[...KANBAN_DEPENDENCIES.runtime, ...transportNpmDependencies(transport)].join(" ")}`;
  // Declared in KANBAN_DEPENDENCIES but never surfaced until the shared install panel.
  const npmInstallDev = KANBAN_DEPENDENCIES.dev.length
    ? `npm install -D ${[...KANBAN_DEPENDENCIES.dev].join(" ")}`
    : undefined;

  return (
    <div className="space-y-4">

      <BuilderInstallPanel
        transport={{
          value: transport,
          onChange: onTransportChange,
          idPrefix: `kanban-${variantSlug}-transport`,
        }}
        subject="board"
        idPrefix={`kanban-${variantSlug}-cli`}
        generatedCount={allFiles.filter((f) => !f.isFixed).length}
        sharedCount={allFiles.filter((f) => f.isFixed).length}
        runtimeCommand={npmInstall}
        devCommand={npmInstallDev}
        notes={[...KANBAN_DEPENDENCIES.notes]}
        cliScope={{
          commandId: "add",
          lockCommand: true,
          lockArgs: true,
          args: [`kanban/${variantSlug}`],
          flags: {
            axios: transport.http === "axios",
            tanstackQuery: transport.query === "tanstack",
          },
        }}
      />

      <BuilderFilesPanel
        subject="board"
        files={allFiles}
        activeFile={current.name}
        onActiveFileChange={setActiveFile}
      />

    </div>
  );
}

interface LivePreviewProps {
  config: KanbanBuilderConfig;
  initialCards: KanbanCardData[];
}

function LivePreview({ config, initialCards }: LivePreviewProps) {
  const [cards, setCards] = useState<KanbanCardData[]>(initialCards);
  const [columns, setColumns] = useState(config.columns);
  // Reset state whenever the active variant changes (initialCards changes ref).
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);
  useEffect(() => {
    setColumns(config.columns);
  }, [config.columns]);

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

  const effective = useMemo(() => ({ ...config, columns }), [config, columns]);

  return (
    <div className="space-y-4">
      <KanbanBoard
        cards={cards}
        config={effective}
        onCardsChange={setCards}
        onAddCard={handleAddCard}
        onLoadMore={handleLoadMore}
        onColumnsChange={setColumns}
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
  // RTL toggle disabled for now — uncomment alongside the switch below when
  // ready. Until then this still honours a template's own RTL default (e.g.
  // the Sprint Timeline board), just without the manual override.
  // const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const active = variants.find((v) => v.key === activeKey) ?? variants[0];
  const effectiveDirection = active.config.direction === "rtl" ? "rtl" : "ltr";
  const effectiveConfig: KanbanBuilderConfig = useMemo(
    () => ({ ...active.config, direction: effectiveDirection }),
    [active, effectiveDirection],
  );

  const activeSnippet = useMemo(
    () => generateKanbanCode(effectiveConfig, active.cards),
    [effectiveConfig, active.cards],
  );
  const activeRegistryVariant = kanbanTemplateKeyToRegistryVariant(active.key);
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);

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
            {/* RTL disabled for now — uncomment alongside the state above.
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
            */}
            <Button variant="outline" size="sm" className="gap-2 h-9" asChild>
              <a href="/kanban-builder">
                <Code2 className="h-3.5 w-3.5" /> Build your own
              </a>
            </Button>
          </div>
        </div>

        <VariantPicker
          variants={variants.map((v) => ({ key: v.key, label: v.title, complexity: v.complexity }))}
          activeKey={activeKey}
          onSelect={setActiveKey}
        />

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
          hideInstallBar
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
          <FilesPanel
            config={effectiveConfig}
            cards={active.cards}
            rendererSources={active.rendererSources}
            variantSlug={activeRegistryVariant}
            transport={transport}
            onTransportChange={setTransport}
          />
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
