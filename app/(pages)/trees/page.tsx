"use client";

import {
  Info,
  Code2,
  Workflow,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// import { Label } from "@/components/ui/label"; // RTL disabled for now
import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch"; // RTL disabled for now
import { Card, CardContent } from "@/components/ui/card";

import { toast } from "@/hooks/use-toast";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { VariantPicker } from "@/components/shared/VariantPicker";

import {
  GraphToolbar,
  useGraphFilter,
  defaultGraphFilter,
  type GraphPredicate,
} from "@/components/ui/graph";

import {
  treeTemplates,
  defaultTreeKey,
  type TreeTemplate,
} from "@/tree-builder/data/treeBuilderTemplates";
import type { TreeNode } from "@/trees/types";
import { TreeCanvas } from "@/trees/TreeCanvas";
import { NodeDataTable } from "@/tree-builder/NodeDataTable";
import { generateTreeFiles } from "@/tree-builder/utils/treeCodeGenerator";
import { BuilderFilesPanel, BuilderInstallPanel } from "@/components/shared/builder-export";
import { DEFAULT_TRANSPORT, transportNpmDependencies, type TransportChoice } from "@/lib/codegen/transport";
import { SHARED_TREE_FILES, OPTIONAL_TREE_FILES, TREE_DEPENDENCIES } from "@/tree-builder/utils/treeSharedFiles";

/** Mirrors `treeTemplateKeyToVariantSlug` in scripts/build-variants-registry.ts. */
function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function FilesPanel({
  template,
  tree,
  variantSlug,
}: {
  template: TreeTemplate;
  tree: TreeNode;
  /** Registry slug, so the install command can carry the transport flags. */
  variantSlug: string;
}) {
  const [transport, setTransport] = useState<TransportChoice>(DEFAULT_TRANSPORT);
  const allFiles = useMemo(() => {
    const generated = generateTreeFiles(
      template.config,
      tree,
      template.rendererSources,
      undefined,
      transport,
    );
    const shared = SHARED_TREE_FILES.map((f) => ({
      name: f.name,
      path: f.path,
      description: f.description,
      language: f.language,
      code: f.code,
      isFixed: true,
    }));
    const toolbar =
      template.config.showToolbar !== false
        ? OPTIONAL_TREE_FILES.map((f) => ({
            name: f.name,
            path: f.path,
            description: f.description,
            language: f.language,
            code: f.code,
            isFixed: true,
          }))
        : [];
    return [...generated, ...shared, ...toolbar];
  }, [template, tree, transport]);

  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];
  const npmInstall = `npm install ${[...TREE_DEPENDENCIES.runtime, ...transportNpmDependencies(transport)].join(" ")}`;
  // Declared in TREE_DEPENDENCIES but never surfaced until the shared install panel.
  const npmInstallDev = TREE_DEPENDENCIES.dev.length
    ? `npm install -D ${[...TREE_DEPENDENCIES.dev].join(" ")}`
    : undefined;

  return (
    <div className="space-y-4">

      <BuilderInstallPanel
        transport={{
          value: transport,
          onChange: setTransport,
          idPrefix: `trees-${variantSlug}-transport`,
        }}
        subject="tree"
        idPrefix={`trees-${variantSlug}-cli`}
        generatedCount={allFiles.filter((f) => !f.isFixed).length}
        sharedCount={allFiles.filter((f) => f.isFixed).length}
        runtimeCommand={npmInstall}
        devCommand={npmInstallDev}
        notes={[...TREE_DEPENDENCIES.notes]}
        cliScope={{
          commandId: "add",
          lockCommand: true,
          lockArgs: true,
          args: [`tree/${variantSlug}`],
          flags: {
            axios: transport.http === "axios",
            tanstackQuery: transport.query === "tanstack",
          },
        }}
      />

      <BuilderFilesPanel
        subject="tree"
        files={allFiles}
        activeFile={current.name}
        onActiveFileChange={setActiveFile}
      />

    </div>
  );
}

function LivePreview({ template }: { template: TreeTemplate }) {
  const [tree, setTree] = useState<TreeNode>(template.tree);
  // Reset the working tree when the selected template changes.
  useEffect(() => { setTree(template.tree); }, [template]);

  const [filter, setFilter] = useState(defaultGraphFilter);
  const [openDataset, setOpenDataset] = useState<TreeNode | null>(null);

  const predicates = useMemo(
    () =>
      [
        {
          id: "leaves",
          label: "Leaf nodes only",
          test: (c: { meta: unknown }) =>
            !(c.meta as { children?: unknown[] })?.children?.length,
        },
        {
          id: "starts-a",
          label: "Label starts with 'A'",
          test: (c: { label: string }) => /^a/i.test(c.label.trim()),
        },
        {
          id: "tagged",
          label: "Has any tag",
          test: (c: { tags: string[] }) => c.tags.length > 0,
        },
      ] as GraphPredicate[],
    [],
  );

  const {
    tree: filteredTree,
    matches,
    stats,
    allTags,
  } = useGraphFilter(tree, filter, predicates);

  const onNodeAdd = useCallback(
    ({ parent, newNode }: { parent: TreeNode; newNode: TreeNode }) => {
      toast({
        title: "Node added",
        description: `Added "${newNode.label}" under "${parent.label}"`,
      });
    },
    [],
  );
  const onNodeUpdate = useCallback(
    ({ node, prev }: { node: TreeNode; prev: TreeNode }) => {
      if (node.label !== prev.label) {
        toast({
          title: "Node renamed",
          description: `"${prev.label}" → "${node.label}"`,
        });
      }
    },
    [],
  );
  const onNodeRemove = useCallback(({ node }: { node: TreeNode }) => {
    toast({ title: "Node removed", description: `"${node.label}"` });
  }, []);
  const onNodeMove = useCallback(
    ({ node, next }: { node: TreeNode; next: { mode: string } }) => {
      toast({
        title: "Node moved",
        description: `"${node.label}" → ${next.mode}`,
      });
    },
    [],
  );
  const onNodeClick = useCallback((node: TreeNode) => {
    if (node.meta?.dataset) setOpenDataset(node);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTree(template.tree)}
          className="h-7 gap-1.5"
        >
          <RotateCcw className="h-3 w-3" /> Reset tree
        </Button>
      </div>
      <GraphToolbar
        filter={filter}
        onChange={setFilter}
        allTags={allTags}
        predicates={predicates}
        matched={stats.matched}
        total={stats.total}
      />
      <TreeCanvas
        config={template.config}
        tree={filter.mode === "hide" ? filteredTree : tree}
        onTreeChange={setTree}
        highlightIds={filter.mode === "dim" ? matches : undefined}
        onNodeAdd={onNodeAdd}
        onNodeUpdate={onNodeUpdate}
        onNodeRemove={onNodeRemove}
        onNodeMove={onNodeMove}
        onNodeClick={onNodeClick}
      />
      <NodeDataTable
        open={!!openDataset}
        onOpenChange={(o) => !o && setOpenDataset(null)}
        dataset={openDataset?.meta?.dataset ?? null}
        nodeLabel={openDataset?.label}
      />
    </div>
  );
}

export default function TreeBuilder() {
  const variants = useMemo(
    () => Object.entries(treeTemplates).map(([key, t]) => ({ key, ...t })),
    [],
  );
  const [activeKey, setActiveKey] = useState(defaultTreeKey);
  // RTL disabled for now — uncomment alongside the toggle below when ready.
  // const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const active = variants.find((v) => v.key === activeKey) ?? variants[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px] space-y-6">
        <PageBreadcrumb items={[{ label: "Tree Builder" }]} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Tree & Flow Variants
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {variants.length} dynamic, zero-dependency tree canvases — add,
                edit, remove nodes and copy the source
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* RTL disabled for now — uncomment alongside the state above.
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
            */}
            <Button variant="outline" size="sm" className="gap-2 h-9" asChild>
              <a href="/tree-builder">
                <Code2 className="h-3.5 w-3.5" /> Build your own
              </a>
            </Button>
          </div>
        </div>

        <VariantPicker
          variants={variants.map((v) => ({ key: v.key, label: v.title, complexity: v.complexity }))}
          activeKey={activeKey}
          onSelect={setActiveKey}
        />

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
              <p className="text-[11px] text-muted-foreground mt-1">
                Hover any node to add a child, rename or remove it. Drag the
                grip handle on draggable variants to reparent or reorder.
                Read-only variants disable every affordance.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-border p-3 sm:p-4 bg-background">
          {/* `config: { ...active.config, dir: direction }` once the RTL toggle is back. */}
          <LivePreview key={active.key} template={active} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
              Source Code
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <FilesPanel template={active} tree={active.tree} variantSlug={`tree-${toKebabCase(active.key)}`} />
        </div>
      </div>
    </div>
  );
}
