/**
 * Multi-file export tab — same shape as TableExportTab. Surfaces:
 *   • The generated per-board files (component, config, data, onChange hook, types)
 *   • The shared engine files (KanbanBoard + DnD lib + dialog template engine)
 *   • Install instructions
 */
import { useMemo, useState } from "react";
import { Code2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, transportNpmDependencies, type TransportChoice } from "@/lib/codegen/transport";

import { generateKanbanFiles } from "@/kanban-builder/utils/kanbanCodeGenerator"; 
import type { KanbanBuilderConfig, KanbanCardData, KanbanRendererSources } from "@/kanban/types"; 
import { KANBAN_DEPENDENCIES, SHARED_KANBAN_FILES } from "@/kanban-builder/utils/kanbanSharedFiles";

interface Props {
  cards: KanbanCardData[];
  config: KanbanBuilderConfig;
  rendererSources?: KanbanRendererSources;
}

export function KanbanExportTab({ config, cards, rendererSources }: Props) {
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);
  const generated = useMemo(
    () => generateKanbanFiles(config, cards, rendererSources, undefined, transport),
    [config, cards, rendererSources, transport],
  );
  const sharedNeeded = useMemo(
    () => SHARED_KANBAN_FILES.map(f => ({ ...f, isFixed: true })),
    [],
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
  // transport opt-ins are additive on top of the engine deps (R-56)
  const npmInstall = `npm install ${[...KANBAN_DEPENDENCIES.runtime, ...transportNpmDependencies(transport)].join(" ")}`;
  // Kanban declares dev dependencies but never rendered them — one of the
  // inconsistencies the shared panel exists to stop.
  const npmInstallDev = KANBAN_DEPENDENCIES.dev.length
    ? `npm install -D ${[...KANBAN_DEPENDENCIES.dev].join(" ")}`
    : undefined;

  return (
    <div className="space-y-6">

      <BuilderInstallPanel
        transport={{
          value: transport,
          onChange: setTransport,
          idPrefix: "kanban-transport",
        }}
        subject="board"
        idPrefix="kanban-builder"
        generatedCount={generated.length}
        sharedCount={sharedNeeded.length}
        runtimeCommand={npmInstall}
        devCommand={npmInstallDev}
        notes={[...KANBAN_DEPENDENCIES.notes]}
        cliScope={{ commandId: "kanban-init", lockCommand: true, lockArgs: true }}
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