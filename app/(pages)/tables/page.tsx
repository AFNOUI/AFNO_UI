"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Info, Sparkles, Code2, FileCode, Package, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { TablePreview } from "@/table-builder/TablePreview";
import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";
import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import { getSharedTableFiles } from "@/table-builder/utils/tableSharedFiles";
import { generateAllFiles, getDependencyReport } from "@/table-builder/utils/tableCodeGenerator";

const complexityColors: Record<string, string> = {
  expert: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  advanced: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  basic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const tableVariantSlugOverrides: Partial<Record<string, string>> = {
  serverSideCRM: "tables-server-crm",
};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function templateKeyToRegistryVariant(templateKey: string): string {
  return tableVariantSlugOverrides[templateKey] ?? `tables-${toKebabCase(templateKey)}`;
}

function CodePanel({ variantKey }: { variantKey: string }) {
  const t = tableTemplates[variantKey];
  const dataMode = (t.config.sortMode === "api" || t.config.paginationMode === "api") ? "api" : "static";

  const allFiles = useMemo(() => {
    const generated = generateAllFiles(t.config, dataMode).map(f => ({ ...f, isFixed: false }));
    // `getSharedTableFiles(config)` returns only the engine helpers this
    // variant actually reaches — `cellJsRunner.ts` / `rowDialogTemplate.ts`
    // are dropped (and the engine source rewritten with inline no-op stubs)
    // when the active table doesn't configure JS / row-dialog templates.
    const shared = getSharedTableFiles(t.config).map(f => ({
      name: f.name,
      path: f.path,
      description: f.description,
      language: f.language,
      code: f.code,
      isFixed: true,
    }));
    return [...generated, ...shared];
  }, [dataMode, t.config]);

  const depReport = useMemo(() => getDependencyReport(t.config), [t.config]);
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find(f => f.name === activeFile) ?? allFiles[0];

  return (
    <div className="space-y-4">
      {/* Install summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 px-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Required Dependencies & Files</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install packages and copy <span className="font-semibold">{allFiles.length} files</span> to get this table running.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <InstallCommand command={depReport.npmInstall} label="Runtime deps" />
            <InstallCommand command={depReport.npmInstallDev} label="Dev deps" />
          </div>
          {depReport.notes.length > 0 && (
            <ul className="text-[11px] text-muted-foreground list-disc ps-4 space-y-0.5">
              {depReport.notes.map(n => <li key={n}>{n}</li>)}
            </ul>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Variant-specific (regenerated per table)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Shared (copy once)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* File tabs (mirrors form-builder ExportTab look) */}
      <Tabs value={current.name} onValueChange={setActiveFile}>
        <ScrollArea className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {allFiles.map(file => (
              <TabsTrigger key={file.name} value={file.name} className="text-xs gap-1.5 data-[state=active]:bg-background">
                <span className={cn("h-1.5 w-1.5 rounded-full", file.isFixed ? "bg-muted-foreground" : "bg-primary")} />
                {file.isFixed ? <Package className="h-3 w-3" /> : <FileCode className="h-3 w-3" />}
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {allFiles.map(file => (
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
                <p className="text-xs text-muted-foreground">{file.description}</p>
              </div>
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> {file.path}
              </div>
              <CodeBlock code={file.code} language={file.language} filename={file.path} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function DataTableVariants() {
  const variants = useMemo(() => Object.values(tableTemplates), []);
  const [activeKey, setActiveKey] = useState(variants[0].key);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  const active = tableTemplates[activeKey] ?? variants[0];
  const activeDataMode = (active.config.sortMode === "api" || active.config.paginationMode === "api") ? "api" : "static";
  const activeSnippet = useMemo(() => {
    const files = generateAllFiles(active.config, activeDataMode);
    return files.find((f) => f.name === "DataTable.tsx")?.code ?? files[0]?.code ?? "";
  }, [active.config, activeDataMode]);
  const activeRegistryVariant = templateKeyToRegistryVariant(active.key);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px] space-y-6">
          <PageBreadcrumb items={[{ label: "Table Variants" }]} />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Data Table Variants</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {variants.length} production-ready patterns — pick one, see the live preview, copy the code
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="rtl-toggle" className="text-xs">RTL</Label>
                <Switch id="rtl-toggle" checked={direction === "rtl"} onCheckedChange={v => setDirection(v ? "rtl" : "ltr")} />
              </div>
              <Button variant="outline" size="sm" className="gap-2 h-9" asChild>
                <a href="/table-builder">
                  <Code2 className="h-3.5 w-3.5" /> Build your own
                </a>
              </Button>
            </div>
          </div>

          {/* Variant selector — desktop chips, mobile dropdown */}
          <div className="w-full">
            <div className="hidden md:block">
              <ScrollArea className="w-full">
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/50 rounded-xl border border-border">
                  {variants.map(v => (
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
                      <Badge variant="outline" className={cn("text-[9px] h-4 px-1 capitalize border", complexityColors[v.complexity], activeKey === v.key && "bg-background/20 text-primary-foreground border-primary-foreground/30")}>
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
                      <Badge variant="outline" className={cn("text-[9px] h-4 px-1 capitalize border", complexityColors[active.complexity])}>
                        {active.complexity}
                      </Badge>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md">
                  {variants.map(v => (
                    <DropdownMenuItem key={v.key} onClick={() => setActiveKey(v.key)} className={cn("text-xs", activeKey === v.key && "bg-primary/10 text-primary font-medium")}>
                      <span className="flex-1 truncate">{v.title}</span>
                      <Badge variant="outline" className={cn("text-[9px] h-4 px-1 capitalize border ms-2", complexityColors[v.complexity])}>
                        {v.complexity}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Variant description card */}
          <Card className="border-border">
            <CardContent className="py-3 px-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{active.title}</p>
                <p className="text-xs text-muted-foreground">{active.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Live preview + install command */}
          <ComponentInstall
            category="tables"
            variant={activeRegistryVariant}
            title={active.title}
            code={activeSnippet}
            fullCode={activeSnippet}
          >
            <TablePreview
              config={{ ...active.config, direction }}
              data={active.sampleData}
            />
          </ComponentInstall>

          {/* Source code */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">Source Code</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <CodePanel variantKey={activeKey} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
