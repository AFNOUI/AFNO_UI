"use client";

import {
  Info,
  Code2,
  Zap,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TooltipProvider } from "@/components/ui/tooltip";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";

import {
  generateAllFiles,
  generatesDataLayer,
  getDependencyReport,
  type DataMode,
} from "@/table-builder/utils/tableCodeGenerator";
import { TablePreview } from "@/table-builder/TablePreview";
import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";

import {
  SHARED_TABLE_FILES,
  getOptionalEngineFiles,
} from "@/table-builder/utils/tableSharedFiles";

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

/**
 * Mirrors `TABLE_VARIANT_SLUG_OVERRIDES` + `tableTemplateKeyToVariantSlug` in
 * scripts/build-variants-registry.ts. The template record key is camelCase
 * (`simpleList`); the registry slug is kebab-case (`tables-simple-list`).
 * Printing the raw key here produced an install command that 404s.
 */
const tableVariantSlugOverrides: Partial<Record<string, string>> = {
  serverSideCRM: "tables-server-crm",
};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function tableTemplateKeyToRegistryVariant(key: string): string {
  return tableVariantSlugOverrides[key] ?? `tables-${toKebabCase(key)}`;
}

function CodePanel({ variantKey }: { variantKey: string }) {
  const t = tableTemplates[variantKey];
  // Seeded from the template, but user-selectable — same Data Source choice
  // as the table builder. `key={variantKey}` on the call site remounts this
  // (and resets the choice) whenever the active variant changes.
  const [dataMode, setDataMode] = useState<DataMode>(
    t.config.sortMode === "api" || t.config.paginationMode === "api" ? "api" : "static",
  );
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);

  // Picking "API / Server-side" is meant to be the one switch that matters —
  // force sort to source from the API rather than requiring a separate trip
  // to Builder tab → Settings → Data Source first (same reasoning as
  // `TableExportTab`).
  const effectiveConfig = useMemo(
    () =>
      dataMode === "api" && t.config.sortMode !== "api"
        ? { ...t.config, sortMode: "api" as const }
        : t.config,
    [t.config, dataMode],
  );

  const generatedFiles = generateAllFiles(effectiveConfig, dataMode, {
    rendererSources: t.rendererSources,
    transport,
  }).map((f) => ({ ...f, isFixed: false }));
  const sharedFiles = [
    ...SHARED_TABLE_FILES,
    ...getOptionalEngineFiles(effectiveConfig),
  ].map((f) => ({
    code: f.code,
    name: f.name,
    path: f.path,
    isFixed: true,
    language: f.language,
    description: f.description,
  }));
  const allFiles = [...generatedFiles, ...sharedFiles];

  const hasDataLayer = generatesDataLayer(effectiveConfig, dataMode);
  const effectiveTransport = hasDataLayer ? transport : DEFAULT_TRANSPORT;
  const depReport = useMemo(
    () => getDependencyReport(effectiveConfig, effectiveTransport),
    [effectiveConfig, effectiveTransport],
  );
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];

  return (
    <div className="space-y-4">

      <BuilderInstallPanel
        // Static variants generate no services.ts / useTableData.ts, so
        // transport would change neither the command nor a generated file —
        // omit the slot rather than show a control that no-ops.
        transport={
          hasDataLayer
            ? { value: transport, onChange: setTransport, idPrefix: `tables-${variantKey}-transport` }
            : undefined
        }
        subject="table"
        idPrefix={`tables-${variantKey}-cli`}
        generatedCount={allFiles.filter((f) => !f.isFixed).length}
        sharedCount={allFiles.filter((f) => f.isFixed).length}
        runtimeCommand={depReport.npmInstall}
        devCommand={depReport.npmInstallDev}
        notes={depReport.notes}
        cliScope={{
          commandId: "add",
          lockCommand: true,
          lockArgs: true,
          args: [`tables/${tableTemplateKeyToRegistryVariant(variantKey)}`],
          flags: {
            axios: effectiveTransport.http === "axios",
            tanstackQuery: effectiveTransport.query === "tanstack",
          },
        }}
      />

      {/* Data Source only changes what's generated below — `add` already
          carries axios/tanstack-query as flags (above), but the static/API
          choice itself isn't a flag on any command, so it lives next to the
          file browser it affects instead of inside the install card. */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Data Source</CardTitle>
          <CardDescription className="text-xs">
            Choose how data is loaded — only the matching helpers are generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={dataMode} onValueChange={(v) => setDataMode(v as DataMode)} className="grid sm:grid-cols-2 gap-3">
            <Label htmlFor={`tables-${variantKey}-dm-static`} className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="static" id={`tables-${variantKey}-dm-static`} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary" /><span className="text-sm font-semibold">Static Data</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Pass <code className="bg-muted px-1 rounded">Row[]</code> as a prop. Sort/filter/paginate happens client-side.</p>
              </div>
            </Label>
            <Label htmlFor={`tables-${variantKey}-dm-api`} className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="api" id={`tables-${variantKey}-dm-api`} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /><span className="text-sm font-semibold">API / Server-side</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Generates <code className="bg-muted px-1 rounded">useTableData</code> with refetch + feature-aware mutators.</p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <BuilderFilesPanel
        subject="table"
        files={allFiles}
        activeFile={current.name}
        onActiveFileChange={setActiveFile}
      />

    </div>
  );
}

export default function DataTableVariants() {
  const variants = useMemo(() => Object.values(tableTemplates), []);
  const [activeKey, setActiveKey] = useState(variants[0].key);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  const active = tableTemplates[activeKey] ?? variants[0];

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
                <h1 className="text-xl sm:text-2xl font-bold">
                  Data Table Variants
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {variants.length} production-ready patterns — pick one, see
                  the live preview, copy the code
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

          {/* Variant description card */}
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

          {/* Live preview */}
          <TablePreview
            data={active.sampleData}
            config={{ ...active.config, direction }}
          />

          {/* Source code */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
                Source Code
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <CodePanel key={activeKey} variantKey={activeKey} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
