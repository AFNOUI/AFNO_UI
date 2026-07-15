/**
 * Multi-file code generator for the Tree Builder. Mirrors the shape used by
 * `kanbanCodeGenerator.ts` so the variants gallery can render generated files
 * + shared engine files in a single tabbed view.
 */
import type { TreeCanvasConfig, TreeNode } from "@/trees/types";
import type { TreeRendererSources } from "@/tree-builder/data/treeBuilderTemplates";

export interface GeneratedTreeFile {
  name: string;
  path: string;
  description: string;
  isFixed: boolean;
  language: "tsx" | "ts";
  code: string;
}

function pascalize(input: string, fallback = "MyTree"): string {
  const cleaned = (input || fallback).replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned[0].toUpperCase() + cleaned.slice(1);
}

/** Walk the tree and report whether any node defines its own meta.render. */
function hasPerNodeRenderer(node: TreeNode): boolean {
  if (typeof node.meta?.render === "function") return true;
  return (node.children ?? []).some(hasPerNodeRenderer);
}

/** Strip non-serialisable function fields from a tree clone for JSON.stringify. */
function stripRenderers(node: TreeNode): TreeNode {
  const { meta, children, ...rest } = node;
  const cleanMeta = meta ? { ...meta } : undefined;
  if (cleanMeta && "render" in cleanMeta) delete (cleanMeta as Record<string, unknown>).render;
  return {
    ...rest,
    ...(cleanMeta ? { meta: cleanMeta } : {}),
    ...(children ? { children: children.map(stripRenderers) } : {}),
  } as TreeNode;
}

function emitDataFile(tree: TreeNode, perNodeIds: string[]): string {
  const cleanTree = stripRenderers(tree);
  if (perNodeIds.length === 0) {
    return `import type { TreeNode } from "@/components/tree/types";

/** Initial tree data. Swap with your own backend fetch when wiring up production. */
export const initialTree: TreeNode = ${JSON.stringify(cleanTree, null, 2)};
`;
  }
  return `import type { TreeNode } from "@/components/tree/types";
import { nodeRenderers } from "./renderers";

/**
 * Per-node renderers live in ./renderers.tsx. We attach them here after the
 * tree literal so the data file itself stays pure JSON-shaped.
 *
 * Resolution order at render time:
 *   node.meta.render   ->   config.renderNode   ->   built-in default
 */
function attachRenderers(node: TreeNode): TreeNode {
  const renderer = nodeRenderers[node.id];
  return {
    ...node,
    meta: { ...(node.meta ?? {}), ...(renderer ? { render: renderer } : {}) },
    children: node.children?.map(attachRenderers),
  };
}

/** Raw tree shape — replace with your backend fetch. */
const rawTree: TreeNode = ${JSON.stringify(cleanTree, null, 2)};

export const initialTree: TreeNode = attachRenderers(rawTree);
`;
}

function emitConfigFile(config: TreeCanvasConfig, hasReusable: boolean): string {
  const { renderNode: _, ...cleanConfig } = config;

  if (!hasReusable) {
    return `import type { TreeCanvasConfig } from "@/components/tree/types";

/** Static configuration. All fields are typed and validated. */
export const treeConfig: TreeCanvasConfig = ${JSON.stringify(cleanConfig, null, 2)};
`;
  }
  return `import type { TreeCanvasConfig } from "@/components/tree/types";
import { renderNode } from "./renderers";

/**
 * Static configuration. The single reusable \`renderNode\` lives in
 * ./renderers.tsx — every node renders through it unless that node defines
 * its own \`meta.render\` override.
 *
 * Resolution order at render time:
 *   node.meta.render   ->   config.renderNode   ->   built-in default
 */
export const treeConfig: TreeCanvasConfig = ${JSON.stringify(cleanConfig, null, 2).replace(/\n}$/, ",\n  renderNode,\n}")};
`;
}

function emitRenderersFile(sources: TreeRendererSources): string {
  const importsBlock = sources.imports ? sources.imports + "\n" : `import type { NodeRenderer } from "@/components/tree/types";\n`;

  const parts: string[] = [importsBlock];

  if (sources.reusable) {
    parts.push(`/**
 * Case 1 — single reusable renderer.
 * Every node uses this body unless it defines its own \`meta.render\`.
 */
export const renderNode: NodeRenderer = ${sources.reusable};
`);
  }

  if (sources.perNode && Object.keys(sources.perNode).length > 0) {
    const entries = Object.entries(sources.perNode)
      .map(([id, body]) => `  ${JSON.stringify(id)}: ${body},`)
      .join("\n");
    parts.push(`/**
 * Case 2 — per-node renderers keyed by node id.
 * \`data.ts\` attaches these onto \`node.meta.render\` during load.
 */
export const nodeRenderers: Record<string, NodeRenderer> = {
${entries}
};
`);
  }

  return parts.join("\n");
}

function emitHandlersFile(componentName: string): string {
  return `import { useCallback } from "react";
import type {
  TreeNodeAddEvent,
  TreeNodeUpdateEvent,
  TreeNodeRemoveEvent,
  TreeNodeMoveEvent,
} from "@/components/tree/types";

/**
 * One handler per mutation — wire each to your backend.
 */
export function use${componentName}Handlers() {
  const handleNodeAdd = useCallback((event: TreeNodeAddEvent) => {
    console.log("[tree] node added", event);
  }, []);

  const handleNodeUpdate = useCallback((event: TreeNodeUpdateEvent) => {
    console.log("[tree] node updated", event);
  }, []);

  const handleNodeRemove = useCallback((event: TreeNodeRemoveEvent) => {
    console.log("[tree] node removed", event);
  }, []);

  const handleNodeMove = useCallback((event: TreeNodeMoveEvent) => {
    console.log("[tree] node moved", event);
  }, []);

  return { handleNodeAdd, handleNodeUpdate, handleNodeRemove, handleNodeMove };
}
`;
}

function emitComponentFile(componentName: string, hasToolbar: boolean): string {
  if (!hasToolbar) {
    return `import { useState } from "react";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import type { TreeNode } from "@/components/tree/types";
import { initialTree } from "./data";
import { treeConfig } from "./config";
import { use${componentName}Handlers } from "./handlers";

/**
 * ${componentName} — a fully-typed, self-contained tree.
 *
 * Drop into any page:
 *   <${componentName} />
 *
 * To plug into a backend, edit the handlers in \`./handlers.ts\`.
 */
export function ${componentName}() {
  const [tree, setTree] = useState<TreeNode>(initialTree);
  const { handleNodeAdd, handleNodeUpdate, handleNodeRemove, handleNodeMove } = use${componentName}Handlers();

  return (
    <TreeCanvas
      config={treeConfig}
      tree={tree}
      onTreeChange={setTree}
      onNodeAdd={handleNodeAdd}
      onNodeUpdate={handleNodeUpdate}
      onNodeRemove={handleNodeRemove}
      onNodeMove={handleNodeMove}
    />
  );
}
`;
  }

  return `import { useState } from "react";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import type { TreeNode } from "@/components/tree/types";
import { GraphToolbar, useGraphFilter, defaultGraphFilter } from "@/components/graph";
import { initialTree } from "./data";
import { treeConfig } from "./config";
import { use${componentName}Handlers } from "./handlers";

/**
 * ${componentName} — a fully-typed, self-contained tree with a search / sort /
 * filter toolbar above the canvas.
 *
 * Drop into any page:
 *   <${componentName} />
 *
 * To plug into a backend, edit the handlers in \`./handlers.ts\`. To remove the
 * toolbar, delete the \`GraphToolbar\`/\`useGraphFilter\` wiring below and set
 * \`showToolbar: false\` in \`./config.ts\`.
 */
export function ${componentName}() {
  const [tree, setTree] = useState<TreeNode>(initialTree);
  const [filter, setFilter] = useState(defaultGraphFilter);
  const { handleNodeAdd, handleNodeUpdate, handleNodeRemove, handleNodeMove } = use${componentName}Handlers();
  const { tree: filteredTree, matches, stats, allTags } = useGraphFilter(tree, filter);

  return (
    <div className="flex flex-col gap-2">
      <GraphToolbar
        filter={filter}
        onChange={setFilter}
        allTags={allTags}
        matched={stats.matched}
        total={stats.total}
      />
      <TreeCanvas
        config={treeConfig}
        tree={filter.mode === "hide" ? filteredTree : tree}
        onTreeChange={setTree}
        highlightIds={filter.mode === "dim" ? matches : undefined}
        onNodeAdd={handleNodeAdd}
        onNodeUpdate={handleNodeUpdate}
        onNodeRemove={handleNodeRemove}
        onNodeMove={handleNodeMove}
      />
    </div>
  );
}
`;
}

export function generateTreeFiles(
  config: TreeCanvasConfig,
  tree: TreeNode,
  rendererSources?: TreeRendererSources,
  componentNameOverride?: string,
): GeneratedTreeFile[] {
  const componentName = componentNameOverride
    ? pascalize(componentNameOverride)
    : pascalize(config.title || "MyTree");
  const hasReusable =
    typeof config.renderNode === "function" || !!rendererSources?.reusable;
  const perNodeIds = rendererSources?.perNode
    ? Object.keys(rendererSources.perNode)
    : (hasPerNodeRenderer(tree) ? collectRendererIds(tree) : []);
  const hasPerNode = perNodeIds.length > 0;
  const hasToolbar = config.showToolbar !== false;

  const files: GeneratedTreeFile[] = [
    {
      name: `${componentName}.tsx`,
      path: `src/components/tree-instances/${componentName}.tsx`,
      description: hasToolbar
        ? "The composed component — drop into any page. Includes the GraphToolbar search/sort/filter bar."
        : "The composed component — drop into any page.",
      isFixed: false,
      language: "tsx",
      code: emitComponentFile(componentName, hasToolbar),
    },
    {
      name: "config.ts",
      path: `src/components/tree-instances/config.ts`,
      description: hasReusable
        ? "Static config — imports the single reusable `renderNode` from ./renderers."
        : "Layout, connector, shape and behaviour configuration.",
      isFixed: false,
      language: "ts",
      code: emitConfigFile(config, hasReusable),
    },
    {
      name: "data.ts",
      path: `src/components/tree-instances/data.ts`,
      description: hasPerNode
        ? "Initial tree — attaches per-node renderers from ./renderers."
        : "Initial tree shape — replace with your fetch.",
      isFixed: false,
      language: "ts",
      code: emitDataFile(tree, perNodeIds),
    },
    {
      name: "handlers.ts",
      path: `src/components/tree-instances/handlers.ts`,
      description: "Separate handlers fired on add / update / remove operations.",
      isFixed: false,
      language: "ts",
      code: emitHandlersFile(componentName),
    },
  ];

  if (rendererSources && (rendererSources.reusable || (rendererSources.perNode && Object.keys(rendererSources.perNode).length > 0))) {
    files.splice(1, 0, {
      name: "renderers.tsx",
      path: `src/components/tree-instances/renderers.tsx`,
      description: hasReusable && hasPerNode
        ? "Reusable + per-node renderers. config.ts uses the reusable; data.ts attaches per-node by id."
        : hasReusable
          ? "Single reusable renderer used by every node (referenced from config.ts)."
          : "Per-node renderers keyed by node id (attached in data.ts).",
      isFixed: false,
      language: "tsx",
      code: emitRenderersFile(rendererSources),
    });
  }

  return files;
}

function collectRendererIds(node: TreeNode, acc: string[] = []): string[] {
  if (typeof node.meta?.render === "function") acc.push(node.id);
  (node.children ?? []).forEach((c) => collectRendererIds(c, acc));
  return acc;
}
