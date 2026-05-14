"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, FileCode, FileJson, FileSpreadsheet, Wand2, ArrowRightLeft, Menu, Library, Download } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import type { VirtualSchema } from "@/schema-engine/types/types";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { parseInput, type SchemaSourceKind } from "@/schema-engine/index";
import { schemaEngineStore } from "@/schema-engine/store/schemaEngineStore";
import { SAMPLE_DDL, SCHEMA_TEMPLATES, CATEGORY_LABELS, type SchemaTemplateCategory } from "@/schema-engine/constants/constants";

import { SchemaCanvas } from "@/schema-engine/SchemaCanvas";
import { exportSchemaToDdl } from "@/schema-engine/lib/exportDdl";
import { InspectorSidebar } from "@/schema-engine/InspectorSidebar";
import { RelationsSummary } from "@/schema-engine/RelationsSummary";

const CATEGORY_ORDER: SchemaTemplateCategory[] = ["simple", "intermediate", "advanced", "complex"];

const SOURCE_META: Record<SchemaSourceKind, { label: string; Icon: typeof Database; placeholder: string }> = {
  ddl:  { label: "SQL DDL",   Icon: FileCode,        placeholder: "CREATE TABLE users (\n  id INT PRIMARY KEY,\n  ...\n);" },
  json: { label: "JSON",      Icon: FileJson,        placeholder: '{ "users": [{ "id": 1, "name": "Ada" }] }' },
  csv:  { label: "CSV",       Icon: FileSpreadsheet, placeholder: "id,name,email\n1,Ada,ada@example.com" },
};

export default function SchemaEnginePage() {
  const [kind, setKind] = useState<SchemaSourceKind>("ddl");
  const [raw, setRaw] = useState(SAMPLE_DDL);
  const [csvTable, setCsvTable] = useState("table_1");
  const [direction, setDirection] = useState<"LR" | "TB">("LR");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const result = useMemo(
    () => parseInput({ kind, raw, tableName: csvTable }),
    [kind, raw, csvTable],
  );
  const schema: VirtualSchema = result.schema;

  useEffect(() => { setErrors(result.errors); }, [result.errors]);
  useEffect(() => () => { schemaEngineStore.setSelected(null); schemaEngineStore.setHover(null); }, []);

  const onParse = useCallback(() => {
    if (result.errors.length === 0) toast.success(`Parsed ${schema.tables.length} table(s)`);
    else toast.error(result.errors[0]);
  }, [result.errors, schema.tables.length]);

  const onSampleLoad = useCallback(() => {
    setKind("ddl"); setRaw(SAMPLE_DDL); toast.success("Sample schema loaded");
  }, []);

  const onExportDdl = useCallback(() => {
    if (schema.tables.length === 0) {
      toast.error("No tables to export — paste a schema first.");
      return;
    }
    const ddl = exportSchemaToDdl(schema);
    const blob = new Blob([ddl], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.sql";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${schema.tables.length} table(s) as DDL`);
  }, [schema]);

  const onCopyDdl = useCallback(() => {
    if (schema.tables.length === 0) return;
    void navigator.clipboard.writeText(exportSchemaToDdl(schema));
    toast.success("DDL copied to clipboard");
  }, [schema]);

  const loadTemplate = useCallback((id: string) => {
    const tpl = SCHEMA_TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    setKind(tpl.kind);
    setRaw(tpl.payload);
    if (tpl.kind !== "ddl" && tpl.tableName) setCsvTable(tpl.tableName);
    toast.success(`Loaded "${tpl.name}" — ${tpl.features.join(" • ")}`);
  }, []);

  const InputPanel = (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-card">
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Database size={14} className="text-primary" /> Schema input
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-[11px]">
                <Library size={11} className="mr-1" /> Templates
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-[360px] p-0">
              <div className="p-3 border-b border-border">
                <h4 className="text-xs font-semibold flex items-center gap-1.5">
                  <Library size={12} className="text-primary" /> Schema templates
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Pick a ready-made model — from a 2-table mini blog to a 10-table e-commerce shop.
                </p>
              </div>
              <ScrollArea className="h-[420px]">
                <div className="p-2 space-y-3">
                  {CATEGORY_ORDER.map(cat => {
                    const items = SCHEMA_TEMPLATES.filter(t => t.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="px-1 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                          {CATEGORY_LABELS[cat].label}
                          <span className="ml-1 text-muted-foreground/60 normal-case font-normal">— {CATEGORY_LABELS[cat].hint}</span>
                        </div>
                        {items.map(t => (
                          <button
                            key={t.id}
                            onClick={() => loadTemplate(t.id)}
                            className="w-full text-left p-2 rounded border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold">{t.name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">{t.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {t.features.map(f => (
                                <span key={f} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
        <Tabs value={kind} onValueChange={v => setKind(v as SchemaSourceKind)}>
          <TabsList className="h-7 w-full">
            {(Object.keys(SOURCE_META) as SchemaSourceKind[]).map(k => {
              const Icon = SOURCE_META[k].Icon;
              return (
                <TabsTrigger key={k} value={k} className="h-6 text-[11px] px-2 gap-1 flex-1">
                  <Icon size={10} /> {SOURCE_META[k].label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        {kind === "csv" && (
          <input
            value={csvTable}
            onChange={e => setCsvTable(e.target.value || "table_1")}
            placeholder="Table name"
            className="w-full h-7 text-xs px-2 rounded border border-border bg-background"
          />
        )}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <Textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={SOURCE_META[kind].placeholder}
          spellCheck={false}
          className="min-h-[180px] w-full min-w-0 max-w-full flex-1 resize-none rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
        />
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 p-2">
        <span className="text-[10px] text-muted-foreground">
          {schema.tables.length} table{schema.tables.length === 1 ? "" : "s"} parsed
        </span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCopyDdl} disabled={schema.tables.length === 0} title="Copy generated DDL to clipboard">
            <FileCode size={11} className="mr-1" /> Copy DDL
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExportDdl} disabled={schema.tables.length === 0} title="Download generated DDL as schema.sql">
            <Download size={11} className="mr-1" /> Export
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onParse}>
            <Wand2 size={11} className="mr-1" /> Re-parse
          </Button>
        </div>
      </div>
      {errors.length > 0 && (
        <ScrollArea className="max-h-32 border-t border-border bg-destructive/5">
          <ul className="text-[10px] p-2 space-y-0.5">
            {/* Errors may contain multi-line messages (line-numbered CSV section
                validation). Split on newlines so each one renders as a bullet. */}
            {errors.flatMap(e => e.split("\n")).filter(Boolean).map((line, i) => (
              <li key={i} className="text-destructive whitespace-pre-wrap">• {line}</li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );

  const Canvas = (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-col overflow-x-hidden bg-muted/20">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <SchemaCanvas schema={schema} direction={direction} onSelectTable={setSelectedTable} />
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card border border-border rounded-md shadow-md p-1">
          <Button size="sm" variant={direction === "LR" ? "default" : "ghost"} className="h-7 text-[10px] px-2" onClick={() => setDirection("LR")} title="Left → Right">
            <ArrowRightLeft size={11} />
          </Button>
          <Button size="sm" variant={direction === "TB" ? "default" : "ghost"} className="h-7 text-[10px] px-2" onClick={() => setDirection("TB")} title="Top → Bottom">
            <ArrowRightLeft size={11} className="rotate-90" />
          </Button>
        </div>
        {schema.tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <Database size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tables to visualize</p>
              <p className="text-[11px] mt-1">Paste DDL / JSON / CSV on the left.</p>
            </div>
          </div>
        )}
      </div>
      <RelationsSummary schema={schema} />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-w-0 flex-col overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8"><Menu size={14} /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] sm:w-[420px] p-0">
                <SheetTitle className="sr-only">Schema input</SheetTitle>
                <SheetDescription className="sr-only">Paste DDL, JSON, or CSV to visualize the schema.</SheetDescription>
                {InputPanel}
              </SheetContent>
            </Sheet>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Database size={16} className="text-primary" /> Schema Engine
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
              Visualize any database schema — DDL, JSON, or CSV — with auto-layout and column-level relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      {isMobile ? (
        <div className="flex-1 min-h-0">{Canvas}</div>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <ResizablePanel defaultSize={25} minSize={18} className="min-w-0">
            {InputPanel}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75} minSize={40} className="min-w-0">
            {Canvas}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <InspectorSidebar schema={schema} selectedTable={selectedTable} onClose={() => { setSelectedTable(null); schemaEngineStore.setSelected(null); }} />
    </div>
  );
}
