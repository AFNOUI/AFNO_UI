"use client";

import {
  Eye,
  Code2,
  Undo2,
  Redo2,
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
} from "@/table-builder/data/tableBuilderTemplates";
import { useBuilderHistory } from "@/hooks/useBuilderHistory";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ColumnEditor } from "@/table-builder/ColumnEditor";
import { TablePreview } from "@/table-builder/TablePreview";
import { SettingsPanel } from "@/table-builder/SettingsPanel";
import { TableExportTab } from "@/table-builder/TableExportTab";
import { TableBuilderGuide } from "@/table-builder/TableBuilderGuide";
import { TableJsonImportDialog } from "@/table-builder/TableJsonImportDialog";

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

export default function DataTableBuilder() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    state: config,
    set: setConfig,
    reset: resetHistory,
  } = useBuilderHistory<TableBuilderConfig>(defaultTableConfig);

  const [sampleData, setSampleData] =
    useState<Record<string, unknown>[]>(defaultSampleData);
  const [activeTab, setActiveTab] = useState<
    "builder" | "preview" | "code" | "guide"
  >("builder");
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplate = useCallback(
    (templateKey: string) => {
      const template = tableTemplates[templateKey];
      if (template) {
        resetHistory(template.config);
        setSampleData(template.sampleData);
        if (
          template.config.sortMode === "api" ||
          template.config.paginationMode === "api"
        ) {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1500);
        }
        toast({ title: "Template loaded", description: template.title });
      }
    },
    [resetHistory],
  );

  const handleConfigChange = useCallback(
    (newConfig: TableBuilderConfig) => {
      setConfig(newConfig);
    },
    [setConfig],
  );

  const handleJsonImport = useCallback(
    (newConfig: TableBuilderConfig, newSample?: Record<string, unknown>[]) => {
      resetHistory(newConfig);
      if (newSample && Array.isArray(newSample)) setSampleData(newSample);
    },
    [resetHistory],
  );

  const handleSimulateLoading = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handleGenerateStressData = useCallback(() => {
    const cols = config.columns.filter(
      (c) => c.visible && c.type !== "actions",
    );
    const rows: Record<string, unknown>[] = Array.from({ length: 1000 }).map(
      (_, i) => {
        const row: Record<string, unknown> = { id: `stress-${i + 1}` };
        for (const col of cols) {
          switch (col.type) {
            case "number":
            case "currency":
            case "progress":
            case "rating":
              row[col.key] = Math.round(Math.random() * 1000);
              break;
            case "boolean":
            case "switch":
              row[col.key] = i % 2 === 0;
              break;
            case "date":
              row[col.key] =
                `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
              break;
            case "email":
              row[col.key] = `user${i + 1}@example.com`;
              break;
            case "badge":
            case "dropdown":
            case "status-dot": {
              const opts = col.options?.length
                ? col.options.map((o) => o.value)
                : Object.keys(
                    col.badgeVariants ?? { Active: 1, Pending: 1, Inactive: 1 },
                  );
              row[col.key] = opts[i % opts.length];
              break;
            }
            case "tags":
              row[col.key] = ["alpha", "beta", "gamma"].slice(0, (i % 3) + 1);
              break;
            default:
              row[col.key] = `${col.label || col.key} ${i + 1}`;
          }
        }
        return row;
      },
    );
    setSampleData(rows);

    // Production-friendly behavior: respect the user's current data-shape choice.
    // - If pagination is on  → keep it on (paginate the 1k rows). No virtualization conflict.
    // - If pagination is off → enable virtualization so 1k rows don't lag the DOM.
    // - If both off and virtualization already on → no-op, just load the rows.
    if (config.enablePagination) {
      toast({
        title: "Stress data loaded",
        description: "1,000 rows generated — paginated.",
      });
    } else if (!config.enableVirtualization) {
      setConfig({ ...config, enableVirtualization: true });
      toast({
        title: "Stress data loaded",
        description:
          "1,000 rows generated. Virtualization auto-enabled to keep rendering smooth.",
      });
    } else {
      toast({
        title: "Stress data loaded",
        description: "1,000 rows generated.",
      });
    }
  }, [config, setConfig]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px]">
          <PageBreadcrumb items={[{ label: "Table Builder" }]} />

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Table2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Data Table Builder
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Build advanced, production-ready tables visually
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <Select value="" onValueChange={loadTemplate}>
                  <SelectTrigger className="w-full sm:w-[260px] h-9">
                    <SelectValue placeholder="Load Template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tableTemplates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{template.title}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] h-4 px-1 capitalize border",
                              complexityColors[template.complexity],
                            )}
                          >
                            {template.complexity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5"
                      onClick={handleGenerateStressData}
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Generate 1k rows</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Stress-test virtualization with 1,000 generated rows
                  </TooltipContent>
                </Tooltip>
                {(config.sortMode === "api" ||
                  config.paginationMode === "api") && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={handleSimulateLoading}
                        disabled={isLoading}
                      >
                        <Loader2
                          className={cn(
                            "h-3.5 w-3.5",
                            isLoading && "animate-spin",
                          )}
                        />
                        <span className="hidden sm:inline">
                          {isLoading ? "Loading…" : "Simulate API"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Simulate API loading state</TooltipContent>
                  </Tooltip>
                )}
                <TableJsonImportDialog
                  onImport={handleJsonImport}
                  currentConfig={config}
                  currentSampleData={
                    sampleData as { id: string; [k: string]: unknown }[]
                  }
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
            onValueChange={(v) =>
              setActiveTab(v as "builder" | "preview" | "code" | "guide")
            }
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

            {/* BUILDER TAB — Settings sidebar (sticky) on left, Preview + Columns stacked on right */}
            <TabsContent value="builder" className="mt-0">
              <div className="grid lg:grid-cols-[340px_1fr] gap-4">
                {/* Sticky Settings sidebar */}
                <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-90px)]">
                  <ScrollArea className="lg:h-[calc(100vh-90px)] pe-2">
                    <SettingsPanel
                      config={config}
                      onChange={handleConfigChange}
                    />
                  </ScrollArea>
                </aside>

                {/* Right: Preview on top, Columns directly below */}
                <div className="min-w-0 space-y-4">
                  <TablePreview
                    config={config}
                    data={sampleData}
                    isLoading={isLoading}
                  />
                  <ColumnEditor config={config} onChange={handleConfigChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <TablePreview
                config={config}
                data={sampleData}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <TableExportTab config={config} />
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
