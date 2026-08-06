"use client";

/**
 * Kanban-builder JSON import/export.
 *
 * Chrome comes from the shared `<BuilderJsonDialog />`; this file owns only the
 * kanban-specific payload and validation.
 */
import { useCallback, useMemo } from "react";

import { toast } from "@/hooks/use-toast";

import { BuilderJsonDialog } from "@/components/shared/builder-header";

import type { KanbanRendererSources } from "@/kanban/types";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban-builder/data/kanbanBuilderTemplates";

interface Props {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  /**
   * Custom card-renderer sources of the loaded template. Plain strings, so they
   * ride along in the export and the exported JSON restores the *whole*
   * variant — generated renderer code included — after a refresh.
   */
  rendererSources?: KanbanRendererSources;
  onImport: (
    config: KanbanBuilderConfig,
    cards: KanbanCardData[],
    rendererSources?: KanbanRendererSources,
  ) => void;
}

export function KanbanJsonImportDialog({ config, cards, rendererSources, onImport }: Props) {
  const exportJson = useMemo(
    () => JSON.stringify({ config, cards, rendererSources }, null, 2),
    [config, cards, rendererSources],
  );

  const handleImport = useCallback(
    (text: string): string | null => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return "Invalid JSON: " + (e instanceof Error ? e.message : "Parse error");
      }

      const payload = parsed as {
        config?: KanbanBuilderConfig;
        cards?: KanbanCardData[];
        rendererSources?: KanbanRendererSources;
      };
      if (!payload?.config || !Array.isArray(payload.cards)) {
        return "JSON must have a { config, cards } shape.";
      }
      if (!Array.isArray(payload.config.columns)) {
        return "'config.columns' must be an array.";
      }

      onImport(payload.config, payload.cards, payload.rendererSources);
      toast({ title: "Kanban imported", description: `Loaded "${payload.config.title || "Untitled"}"` });
      return null;
    },
    [onImport],
  );

  return (
    <BuilderJsonDialog
      title="Kanban JSON"
      description="Import or export the full board — config, cards and custom renderers."
      exportJson={exportJson}
      onImport={handleImport}
    />
  );
}
