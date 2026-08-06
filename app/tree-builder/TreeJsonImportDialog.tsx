"use client";

/**
 * Flow-builder JSON import/export.
 *
 * Chrome comes from the shared `<BuilderJsonDialog />`; this file owns only the
 * flow-specific payload and validation — the sibling of
 * `JsonImportDialog` (form), `TableJsonImportDialog` and
 * `KanbanJsonImportDialog`.
 */
import { useCallback, useMemo } from "react";

import { toast } from "@/hooks/use-toast";

import { BuilderJsonDialog } from "@/components/shared/builder-header";

import type { TreeNode, TreeCanvasConfig } from "@/trees/types";
import { treeTemplates } from "@/tree-builder/data/treeBuilderTemplates";

/** What a flow export contains — and what an import is expected to supply. */
export interface TreeFlowPayload {
  /**
   * Template key the flow was built from. Recorded because the Export Code tab
   * generates against the *variant's* renderer sources: without it, a re-import
   * would render your tree with some other template's renderers.
   * `null` when the payload names an unknown variant.
   */
  variant: string | null;
  config?: TreeCanvasConfig;
  tree?: TreeNode;
}

interface TreeJsonImportDialogProps {
  /** Currently active template key. */
  variant: string;
  /** Active config with the user's overrides already merged in. */
  config: TreeCanvasConfig;
  tree: TreeNode;
  /** Apply a validated payload to the page's state. */
  onImport: (payload: TreeFlowPayload) => void;
}

export function TreeJsonImportDialog({
  variant,
  config,
  tree,
  onImport,
}: TreeJsonImportDialogProps) {
  const exportJson = useMemo(
    () => JSON.stringify({ variant, config, tree }, null, 2),
    [variant, config, tree],
  );

  const handleImport = useCallback(
    (text: string): string | null => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return "Invalid JSON: " + (e instanceof Error ? e.message : "Parse error");
      }

      const payload = parsed as Partial<TreeFlowPayload>;
      if (!payload?.tree && !payload?.config) {
        return "JSON must have a { config, tree } shape.";
      }
      if (payload.tree && typeof payload.tree.id !== "string") {
        return "'tree' must be a node object with a string 'id'.";
      }

      const key =
        typeof payload.variant === "string" && payload.variant in treeTemplates
          ? payload.variant
          : null;

      onImport({ variant: key, config: payload.config, tree: payload.tree });
      toast({ title: "Flow imported", description: "Flow loaded from JSON." });
      return null;
    },
    [onImport],
  );

  return (
    <BuilderJsonDialog
      title="Flow JSON"
      description="Import or export the full flow — variant, config and tree."
      exportJson={exportJson}
      onImport={handleImport}
    />
  );
}
