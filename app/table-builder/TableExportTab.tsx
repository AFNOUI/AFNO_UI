import { useMemo, useState } from "react";
import { Code2, Zap, Clock } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BuilderFilesPanel,
  BuilderInstallPanel,
} from "@/components/shared/builder-export";
import {
  DEFAULT_TRANSPORT,
  type TransportChoice,
} from "@/lib/codegen/transport";

import type { TableBuilderConfig } from "@/table-builder/data/tableBuilderTemplates";
import {
  getOptionalEngineFiles,
  SHARED_TABLE_FILES,
} from "@/table-builder/utils/tableSharedFiles";
import {
  generateAllFiles,
  generatesDataLayer,
  getDependencyReport,
  TableRendererSources,
  type DataMode,
} from "@/table-builder/utils/tableCodeGenerator";

interface TableExportTabProps {
  config: TableBuilderConfig;
  rendererSources?: TableRendererSources;
}

export function TableExportTab({
  config,
  rendererSources,
}: TableExportTabProps) {
  const [dataMode, setDataMode] = useState<DataMode>("static");
  const [transport, setTransport] =
    useState<TransportChoice>(DEFAULT_TRANSPORT);
  const hasColumns = config.columns.filter((c) => c.visible).length > 0;

  // Picking "API / Server-side" here is meant to be the one switch that
  // matters — force sort to source from the API rather than requiring a
  // separate trip to Builder tab → Settings → Data Source first. `sort` has
  // no "enabled" gate (`resolveSource`), so this alone is always enough to
  // make `generatesDataLayer` true; it doesn't touch anything the Builder
  // tab's own per-feature overrides (`config.sources`) already set.
  const effectiveConfig = useMemo(
    () =>
      dataMode === "api" && config.sortMode !== "api"
        ? { ...config, sortMode: "api" as const }
        : config,
    [config, dataMode],
  );

  const generated = useMemo(
    () =>
      generateAllFiles(effectiveConfig, dataMode, {
        rendererSources,
        transport,
      }),
    [effectiveConfig, dataMode, rendererSources, transport],
  );
  const sharedNeeded = useMemo(
    () =>
      [...SHARED_TABLE_FILES, ...getOptionalEngineFiles(effectiveConfig)].map(
        (f) => ({ ...f, isFixed: true }),
      ),
    [effectiveConfig],
  );
  const allFiles = useMemo(
    () => [...generated, ...sharedNeeded],
    [generated, sharedNeeded],
  );
  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  // A client-side table emits no services.ts, so the transport opt-ins would be
  // dependencies nothing imports. Report what the generated code actually needs.
  const hasDataLayer = generatesDataLayer(effectiveConfig, dataMode);
  const effectiveTransport = hasDataLayer ? transport : DEFAULT_TRANSPORT;
  const depReport = useMemo(
    () => getDependencyReport(effectiveConfig, effectiveTransport),
    [effectiveConfig, effectiveTransport],
  );

  if (!hasColumns) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No table to export
          </p>
          <p className="text-sm text-muted-foreground">
            Add columns in the Builder tab first
          </p>
        </CardContent>
      </Card>
    );
  }

  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Data Source</CardTitle>
          <CardDescription className="text-xs">
            Choose how data is loaded — only the matching helpers are generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={dataMode}
            onValueChange={(v) => setDataMode(v as DataMode)}
            className="grid sm:grid-cols-2 gap-3"
          >
            <Label
              htmlFor="dm-static"
              className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <RadioGroupItem
                value="static"
                id="dm-static"
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold">Static Data</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pass <code className="bg-muted px-1 rounded">Row[]</code> as a
                  prop. Sort/filter/paginate happens client-side.
                </p>
              </div>
            </Label>
            <Label
              htmlFor="dm-api"
              className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <RadioGroupItem value="api" id="dm-api" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold">
                    API / Server-side
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Generates{" "}
                  <code className="bg-muted px-1 rounded">useTableData</code>{" "}
                  with refetch + feature-aware mutators.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <BuilderInstallPanel
        subject="table"
        notes={depReport.notes}
        idPrefix="table-builder"
        cliScope={{
          lockArgs: true,
          lockCommand: true,
          commandId: "table-init",
        }}
        generatedCount={generated.length}
        sharedCount={sharedNeeded.length}
        devCommand={depReport.npmInstallDev}
        runtimeCommand={depReport.npmInstall}
        transport={
          hasDataLayer
            ? {
                value: transport,
                onChange: setTransport,
                idPrefix: "table-transport",
              }
            : undefined
        }
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
