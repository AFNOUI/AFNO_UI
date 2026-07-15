"use client";

import {
  Info,
  Package,
  Sparkles,
  FileCode,
  Workflow,
  RotateCcw,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";

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
import { SHARED_TREE_FILES, OPTIONAL_TREE_FILES, TREE_DEPENDENCIES } from "@/tree-builder/utils/treeSharedFiles";

const complexityColors: Record<string, string> = {
  basic:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  intermediate:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  advanced:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  expert:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

function FilesPanel({
  template,
  tree,
}: {
  template: TreeTemplate;
  tree: TreeNode;
}) {
  const allFiles = useMemo(() => {
    const generated = generateTreeFiles(
      template.config,
      tree,
      template.rendererSources,
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
  }, [template, tree]);

  const [activeFile, setActiveFile] = useState<string>(allFiles[0]?.name ?? "");
  const current = allFiles.find((f) => f.name === activeFile) ?? allFiles[0];
  const npmInstall = `npm install ${TREE_DEPENDENCIES.runtime.join(" ")}`;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 px-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                Required Dependencies & Files
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install packages and copy{" "}
                <span className="font-semibold">{allFiles.length} files</span>{" "}
                to get this tree running.
              </p>
            </div>
          </div>
          <InstallCommand command={npmInstall} label="Runtime deps" />
          {TREE_DEPENDENCIES.notes.length > 0 && (
            <ul className="text-[11px] text-muted-foreground list-disc ps-4 space-y-0.5">
              {TREE_DEPENDENCIES.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />{" "}
              Variant-specific (regenerated per tree)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />{" "}
              Shared engine (copy once)
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={current.name} onValueChange={setActiveFile}>
        <ScrollArea className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {allFiles.map((file) => (
              <TabsTrigger
                key={file.name}
                value={file.name}
                className="text-xs gap-1.5 data-[state=active]:bg-background"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    file.isFixed ? "bg-muted-foreground" : "bg-primary",
                  )}
                />
                {file.isFixed ? (
                  <Package className="h-3 w-3" />
                ) : (
                  <FileCode className="h-3 w-3" />
                )}
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {allFiles.map((file) => (
          <TabsContent key={file.name} value={file.name} className="mt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2 flex-wrap">
                {file.isFixed ? (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    <Package className="h-3 w-3 mr-1" /> Shared engine
                  </Badge>
                ) : (
                  <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
                    <FileCode className="h-3 w-3 mr-1" /> Variant-specific
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  {file.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> {file.path}
              </div>
              <CodeBlock
                code={file.code}
                language={file.language}
                filename={file.path}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
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
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> No external graph library
          </Badge>
        </div>

        <div className="w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-[360px] justify-between"
              >
                <span className="flex items-center gap-2 truncate">
                  {active.title}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] h-4 px-1 capitalize border",
                      complexityColors[active.complexity],
                    )}
                  >
                    {active.complexity}
                  </Badge>
                </span>
                <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md max-h-[60vh] overflow-y-auto">
              {variants.map((v) => (
                <DropdownMenuItem
                  key={v.key}
                  onClick={() => setActiveKey(v.key)}
                  className={cn(
                    "text-xs",
                    activeKey === v.key &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                >
                  <span className="flex-1 truncate">{v.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] h-4 px-1 capitalize border ms-2",
                      complexityColors[v.complexity],
                    )}
                  >
                    {v.complexity}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
          <FilesPanel template={active} tree={active.tree} />
        </div>
      </div>
    </div>
  );
}
