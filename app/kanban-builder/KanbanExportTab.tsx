"use client";

/**
 * Multi-file export tab — same shape as TableExportTab. Surfaces:
 *   • The generated per-board files (component, config, data, onChange hook, types)
 *   • The shared engine files (KanbanBoard + DnD lib + dialog template engine)
 *   • Install instructions
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";
import { Code2, Download, FileCode, Package, ArrowRight } from "lucide-react";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";
import { generateKanbanFiles } from "@/kanban-builder/utils/kanbanCodeGenerator";
import { getSharedKanbanFiles, KANBAN_DEPENDENCIES } from "@/kanban-builder/utils/kanbanSharedFiles";

interface Props {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
}

export function KanbanExportTab({ config, cards }: Props) {
  const generated = useMemo(() => generateKanbanFiles(config, cards), [config, cards]);
  // `getSharedKanbanFiles(config)` prunes engine helpers (cellJsRunner /
  // rowDialogTemplate) the active board doesn't reach, and rewrites the
  // engine imports into inline no-op stubs so the displayed source still
  // compiles end-to-end.
  const sharedNeeded = useMemo(
    () => getSharedKanbanFiles(config).map(f => ({ ...f, isFixed: true })),
    [config],
  );
  const allFiles = useMemo(() => [...generated, ...sharedNeeded], [generated, sharedNeeded]);
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");

  if (config.columns.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No board to export</p>
          <p className="text-sm text-muted-foreground">Add columns in the Builder tab first</p>
        </CardContent>
      </Card>
    );
  }

  const current = allFiles.find(f => f.name === activeFile) ?? allFiles[0];
  const npmInstall = `npm install ${KANBAN_DEPENDENCIES.runtime.join(" ")}`;

  return (
    <div className="space-y-6">
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
              <div className="grid sm:grid-cols-1 gap-2">
                <InstallCommand command={npmInstall} label="Runtime deps" />
              </div>
              <ul className="text-[11px] text-muted-foreground list-disc ps-4 space-y-0.5">
                {KANBAN_DEPENDENCIES.notes.map(n => <li key={n}>{n}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <CardTitle>Generated Files</CardTitle>
          </div>
          <CardDescription className="text-xs">
            <span className="inline-flex items-center gap-1 me-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> generated per board
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
                    {file.isFixed && <Badge variant="outline" className="text-[8px] h-3.5 px-1 ms-0.5">shared</Badge>}
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
                        <Package className="h-3 w-3 me-1" /> Shared engine
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
                        <FileCode className="h-3 w-3 me-1" /> Generated per board
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