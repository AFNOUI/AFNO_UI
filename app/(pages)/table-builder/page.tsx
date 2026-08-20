"use client";

import {
  Eye,
  Code2,
  Table2,
  Loader2,
  Database,
  BookOpen,
  TextCursorInput,
} from "lucide-react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  tableTemplates,
  defaultSampleData,
  TableBuilderConfig,
  defaultTableConfig,
  defaultTableTemplateKey,
  defaultTableRendererSources,
} from "@/table-builder/data/tableBuilderTemplates";

import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  BuilderHeader,
  ToolbarButton,
  useBuilderHistory,
  useTemplateOptions,
  BuilderTemplatePicker,
} from "@/components/shared/builder-header";
import {
  BuilderInsightsPanel,
  useBuilderInsights,
} from "@/components/shared/builder-insights";
import { useBuilderWorkspace } from "@/components/shared/builder-workspace";
import { BuilderPreviewFrame } from "@/components/shared/builder-preview";
import {
  BuilderDiffPanel,
  useBuilderDiff,
  resetDiffEntry,
  resetAllDiffEntries,
  type BuilderDiffEntry,
} from "@/components/shared/builder-diff";
import { getTableInsights } from "@/table-builder/utils/tableInsights";
import { isTableDraft, type TableDraft } from "@/table-builder/utils/tableDraft";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColumnEditor } from "@/table-builder/ColumnEditor";
import { TablePreview } from "@/table-builder/TablePreview";
import { SettingsPanel } from "@/table-builder/SettingsPanel";
import { TableExportTab } from "@/table-builder/TableExportTab";
import { TableBuilderGuide } from "@/table-builder/TableBuilderGuide";
import { TableJsonImportDialog } from "@/table-builder/TableJsonImportDialog";

export default function DataTableBuilder() {
  const { state: config, set: setConfig, reset: resetHistory, history } = useBuilderHistory<TableBuilderConfig>(defaultTableConfig);
  const templateOptions = useTemplateOptions(tableTemplates);
  // Seeded with the template the builder boots with, so the header picker
  // shows what is actually on screen instead of an empty placeholder.
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | undefined>(defaultTableTemplateKey);
  const [sampleData, setSampleData] = useState<Record<string, unknown>[]>(defaultSampleData);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "code" | "guide">("builder");
  const [isLoading, setIsLoading] = useState(false);
  const [rendererSources, setRendererSources] = useState<
    import("@/table-builder/data/tableBuilderTemplates").TableTemplate["rendererSources"]
  >(defaultTableRendererSources);

  const insights = useBuilderInsights(
    () => getTableInsights(config, sampleData as { id: string; [k: string]: unknown }[]),
    [config, sampleData],
  );

  const activeTemplate = selectedTemplateKey ? tableTemplates[selectedTemplateKey] : undefined;
  const diff = useBuilderDiff({
    current: config,
    template: activeTemplate?.config,
    templateName: activeTemplate?.title,
    // Columns and their groups are edited as a unit in the Columns editor, so
    // a per-column row here would be both unreadable and un-resettable.
    options: { atomic: ["columns", "columnGroups"] },
  });

  const handleResetSetting = useCallback((entry: BuilderDiffEntry) => {
    setConfig((prev) => resetDiffEntry(prev, entry));
  }, [setConfig]);

  const handleResetAllSettings = useCallback((entries: BuilderDiffEntry[]) => {
    setConfig((prev) => resetAllDiffEntries(prev, entries));
    toast({ title: "Reset to template", description: `${entries.length} settings restored.` });
  }, [setConfig]);

  // Names a new saved build after the template it started from, so a
  // workspace reads "Sprint Board" rather than "Untitled 3".
  const workspaceLabel = selectedTemplateKey
    ? tableTemplates[selectedTemplateKey]?.title
    : undefined;

  const workspace = useBuilderWorkspace<TableDraft>({
    id: "table",
    deps: [config, sampleData, rendererSources, selectedTemplateKey],
    snapshot: () => ({ config, sampleData, rendererSources, templateKey: selectedTemplateKey }),
    label: workspaceLabel,
    // Picking a different template is starting over, so the saved build you
    // had open is released rather than left open to a stray Update.
    identity: selectedTemplateKey,
    validate: isTableDraft,
    onRestore: (saved, source) => {
      setSelectedTemplateKey(saved.templateKey);
      resetHistory(saved.config);
      setSampleData(saved.sampleData);
      setRendererSources(saved.rendererSources);
      // Reopening the last build is how the page loads now — only a click in
      // the saved list is worth announcing.
      if (source === "user") {
        toast({ title: "Build opened", description: "Picked up where you left off." });
      }
    },
  });

  const loadTemplate = useCallback((templateKey: string) => {
    const template = tableTemplates[templateKey];
    if (template) {
      setSelectedTemplateKey(templateKey);
      resetHistory(template.config);
      setSampleData(template.sampleData);
      setRendererSources(template.rendererSources);
      if (template.config.sortMode === "api" || template.config.paginationMode === "api") {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
      }
      toast({ title: "Template loaded", description: template.title });
    }
  }, [resetHistory]);

  const handleConfigChange = useCallback((newConfig: TableBuilderConfig) => {
    setConfig(newConfig);
  }, [setConfig]);

  const handleJsonImport = useCallback((
    newConfig: TableBuilderConfig,
    newSample?: Record<string, unknown>[],
    newRendererSources?: import("@/table-builder/utils/tableCodeGenerator").TableRendererSources,
  ) => {
    setSelectedTemplateKey(undefined);
    resetHistory(newConfig);
    // Restored from the payload — an exported table pastes back complete,
    // custom cell renderers included.
    setRendererSources(newRendererSources);
    if (newSample && Array.isArray(newSample)) setSampleData(newSample);
  }, [resetHistory]);

  /** Rows-only import from the JSON dialog's "Sample data" tab. */
  const handleSampleDataImport = useCallback((rows: Record<string, unknown>[]) => {
    setSampleData(rows);
  }, []);

  const handleSimulateLoading = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handleGenerateStressData = useCallback(() => {
    const cols = config.columns.filter(c => c.visible && c.type !== "actions");
    const rows: Record<string, unknown>[] = Array.from({ length: 1000 }).map((_, i) => {
      const row: Record<string, unknown> = { id: `stress-${i + 1}` };
      for (const col of cols) {
        switch (col.type) {
          case "number":
          case "currency":
          case "progress":
          case "rating":
            row[col.key] = Math.round(Math.random() * 1000); break;
          case "boolean":
          case "switch":
            row[col.key] = i % 2 === 0; break;
          case "date":
            row[col.key] = `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`; break;
          case "email":
            row[col.key] = `user${i + 1}@example.com`; break;
          case "badge":
          case "dropdown":
          case "status-dot": {
            const opts = col.options?.length
              ? col.options.map(o => o.value)
              : Object.keys(col.badgeVariants ?? { Active: 1, Pending: 1, Inactive: 1 });
            row[col.key] = opts[i % opts.length]; break;
          }
          case "tags":
            row[col.key] = ["alpha", "beta", "gamma"].slice(0, (i % 3) + 1); break;
          default:
            row[col.key] = `${col.label || col.key} ${i + 1}`;
        }
      }
      return row;
    });
    setSampleData(rows);

    // Production-friendly behavior: respect the user's current data-shape choice.
    // - If pagination is on  → keep it on (paginate the 1k rows). No virtualization conflict.
    // - If pagination is off → enable virtualization so 1k rows don't lag the DOM.
    // - If both off and virtualization already on → no-op, just load the rows.
    if (config.enablePagination) {
      toast({ title: "Stress data loaded", description: "1,000 rows generated — paginated." });
    } else if (!config.enableVirtualization) {
      setConfig({ ...config, enableVirtualization: true });
      toast({ title: "Stress data loaded", description: "1,000 rows generated. Virtualization auto-enabled to keep rendering smooth." });
    } else {
      toast({ title: "Stress data loaded", description: "1,000 rows generated." });
    }
  }, [config, setConfig]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px]">
          <PageBreadcrumb items={[{ label: "Table Builder" }]} />

          <BuilderHeader
            icon={Table2}
            title="Data Table Builder"
            description="Build advanced, production-ready tables visually"
            templatePicker={
              <BuilderTemplatePicker
                options={templateOptions}
                value={selectedTemplateKey}
                onSelect={loadTemplate}
              />
            }
            actions={
              <>
                <ToolbarButton
                  icon={Database}
                  onClick={handleGenerateStressData}
                  tip="Stress-test virtualization with 1,000 generated rows"
                  collapseLabel
                >
                  Generate 1k rows
                </ToolbarButton>
                {(config.sortMode === "api" || config.paginationMode === "api") && (
                  <ToolbarButton
                    icon={Loader2}
                    onClick={handleSimulateLoading}
                    disabled={isLoading}
                    tip="Simulate API loading state"
                    className={cn(isLoading && "[&_svg]:animate-spin")}
                    collapseLabel
                  >
                    {isLoading ? "Loading…" : "Simulate API"}
                  </ToolbarButton>
                )}
              </>
            }
            jsonActions={
              <TableJsonImportDialog
                onImport={handleJsonImport}
                onImportSampleData={handleSampleDataImport}
                currentConfig={config}
                currentSampleData={sampleData as { id: string; [k: string]: unknown }[]}
                currentRendererSources={rendererSources}
              />
            }
            history={history}
            workspace={workspace.header}
            workspaceName={workspaceLabel}
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "preview" | "code" | "guide")} className="space-y-4">
            <TabsList className="h-10">
              <TabsTrigger value="builder" className="gap-2 px-3 sm:px-4"><TextCursorInput className="h-4 w-4" /><span className="hidden sm:inline">Builder</span></TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 px-3 sm:px-4"><Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span></TabsTrigger>
              <TabsTrigger value="code" className="gap-2 px-3 sm:px-4"><Code2 className="h-4 w-4" /><span className="hidden sm:inline">Export</span></TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 px-3 sm:px-4"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Guide</span></TabsTrigger>
            </TabsList>

            {/* BUILDER TAB — Settings sidebar (sticky) on left, Preview + Columns stacked on right */}
            <TabsContent value="builder" className="mt-0">
              <div className="grid lg:grid-cols-[340px_1fr] gap-4">
                {/* Sticky Settings sidebar */}
                <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-90px)]">
                  <ScrollArea className="lg:h-[calc(100vh-90px)] pe-2">
                    <SettingsPanel config={config} onChange={handleConfigChange} />
                  </ScrollArea>
                </aside>

                {/* Right: Preview on top, Columns directly below */}
                <div className="min-w-0 space-y-4">
                  <TablePreview config={config} data={sampleData} isLoading={isLoading} />
                  <ColumnEditor config={config} onChange={handleConfigChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <BuilderPreviewFrame>
                  <TablePreview config={config} data={sampleData} isLoading={isLoading} />
                </BuilderPreviewFrame>
                <BuilderInsightsPanel
                  insights={insights}
                  emptyMessage="No issues found — this table is ready to export."
                />
                <BuilderDiffPanel
                  diff={diff}
                  onReset={handleResetSetting}
                  onResetAll={handleResetAllSettings}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <TableExportTab config={config} rendererSources={rendererSources} />
            </TabsContent>

            <TabsContent value="guide" className="mt-0">
              <TableBuilderGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
