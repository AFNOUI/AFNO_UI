import { useMemo, useState } from "react";
import { Code2, Download, FileCode, Package, ArrowRight, Zap, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";
import { getSharedTableFiles } from "@/table-builder/utils/tableSharedFiles";
import type { TableBuilderConfig } from "@/table-builder/data/tableBuilderTemplates";
import { generateAllFiles, getDependencyReport, type DataMode } from "@/table-builder/utils/tableCodeGenerator";

interface TableExportTabProps { config: TableBuilderConfig; }

export function TableExportTab({ config }: TableExportTabProps) {
  const [dataMode, setDataMode] = useState<DataMode>("static");
  const hasColumns = config.columns.filter(c => c.visible).length > 0;

  const generated = useMemo(() => generateAllFiles(config, dataMode), [config, dataMode]);
  // `getSharedTableFiles(config)` prunes engine helpers (cellJsRunner /
  // rowDialogTemplate) the active table doesn't reach via clickAction.type
  // === "js" / row dialog config, and rewrites the engine imports into
  // inline no-op stubs so the displayed source still compiles end-to-end.
  const sharedNeeded = useMemo(
    () => getSharedTableFiles(config).map(f => ({ ...f, isFixed: true })),
    [config],
  );
  const allFiles = useMemo(() => [...generated, ...sharedNeeded], [generated, sharedNeeded]);
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const depReport = useMemo(() => getDependencyReport(config), [config]);

  if (!hasColumns) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No table to export</p>
          <p className="text-sm text-muted-foreground">Add columns in the Builder tab first</p>
        </CardContent>
      </Card>
    );
  }

  const current = allFiles.find(f => f.name === activeFile) ?? allFiles[0];

  return (
    <div className="space-y-6">
      {/* Data Source */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Data Source</CardTitle>
          <CardDescription className="text-xs">
            Choose how data is loaded — only the matching helpers are generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={dataMode} onValueChange={v => setDataMode(v as DataMode)} className="grid sm:grid-cols-2 gap-3">
            <Label htmlFor="dm-static" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="static" id="dm-static" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary" /><span className="text-sm font-semibold">Static Data</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Pass <code className="bg-muted px-1 rounded">Row[]</code> as a prop. Sort/filter/paginate happens client-side.</p>
              </div>
            </Label>
            <Label htmlFor="dm-api" className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="api" id="dm-api" className="mt-0.5" />
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

      {/* Install summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 px-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2.5">
              <div>
                <h3 className="font-semibold text-sm">Install Dependencies</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {generated.length} generated file{generated.length !== 1 ? "s" : ""} + {sharedNeeded.length} shared engine file{sharedNeeded.length !== 1 ? "s" : ""}.
                </p>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Files (uses CodeBlock) */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <CardTitle>Generated Files</CardTitle>
          </div>
          <CardDescription className="text-xs">
            <span className="inline-flex items-center gap-1 me-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> generated per table
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> shared engine — copy once
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={current.name} onValueChange={setActiveFile}>
            <ScrollArea className="w-full">
              <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                {allFiles.map(file => (
                  <TabsTrigger key={file.name} value={file.name} className="text-xs gap-1.5 data-[state=active]:bg-background">
                    <span className={`h-1.5 w-1.5 rounded-full ${file.isFixed ? "bg-muted-foreground" : "bg-primary"}`} />
                    {file.isFixed ? <Package className="h-3 w-3" /> : <FileCode className="h-3 w-3" />}
                    {file.name}
                    {file.isFixed && <Badge variant="outline" className="text-[8px] h-3.5 px-1 ml-0.5">shared</Badge>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {allFiles.map(file => (
              <TabsContent key={file.name} value={file.name} className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    {file.isFixed ? (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <Package className="h-3 w-3 mr-1" /> Shared engine
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
                        <FileCode className="h-3 w-3 mr-1" /> Generated per table
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
        </CardContent>
      </Card>
    </div>
  );
}
