import { useMemo, useState } from "react";
import { Code2, Zap, Clock } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";

import type { TableBuilderConfig } from "@/table-builder/data/tableBuilderTemplates";
import { getOptionalEngineFiles, SHARED_TABLE_FILES } from "@/table-builder/utils/tableSharedFiles";
import { generateAllFiles, generatesDataLayer, getDependencyReport, TableRendererSources, type DataMode } from "@/table-builder/utils/tableCodeGenerator";

interface TableExportTabProps {
  config: TableBuilderConfig;
  rendererSources?: TableRendererSources;
}

export function TableExportTab({ config, rendererSources }: TableExportTabProps) {
  const [dataMode, setDataMode] = useState<DataMode>("static");
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);
  const hasColumns = config.columns.filter(c => c.visible).length > 0;

  const generated = useMemo(
    () => generateAllFiles(config, dataMode, { rendererSources, transport }),
    [config, dataMode, rendererSources, transport],
  );
  const sharedNeeded = useMemo(
    () => [...SHARED_TABLE_FILES, ...getOptionalEngineFiles(config)].map(f => ({ ...f, isFixed: true })),
    [config],
  );
  const allFiles = useMemo(() => [...generated, ...sharedNeeded], [generated, sharedNeeded]);
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  // A client-side table emits no services.ts, so the transport opt-ins would be
  // dependencies nothing imports. Report what the generated code actually needs.
  const effectiveTransport = generatesDataLayer(config, dataMode) ? transport : DEFAULT_TRANSPORT;
  const depReport = useMemo(() => getDependencyReport(config, effectiveTransport), [config, effectiveTransport]);

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


      <BuilderInstallPanel
        transport={{
          value: transport,
          onChange: setTransport,
          idPrefix: "table-transport",
          inactiveReason: generatesDataLayer(config, dataMode)
            ? undefined
            : "This table is fully client-side, so no services.ts / useTableData.ts is generated. Choose API / Server-side above and set at least one feature (search, sort, filter or pagination) to load from the API.",
        }}
        subject="table"
        idPrefix="table-builder"
        generatedCount={generated.length}
        sharedCount={sharedNeeded.length}
        runtimeCommand={depReport.npmInstall}
        devCommand={depReport.npmInstallDev}
        notes={depReport.notes}
        cliScope={{ commandId: "table-init", lockCommand: true, lockArgs: true }}
      />

      <BuilderFilesPanel
        subject="table"
        files={allFiles}
        activeFile={current.name}
        onActiveFileChange={setActiveFile}
      />

    </div>
  );
}
