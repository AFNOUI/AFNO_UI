"use client";

import {
  Eye,
  Info,
  Code2,
  Undo2,
  Redo2,
  Upload,
  Package,
  Download,
  BookOpen,
  FileCode,
  GitBranch,
  RotateCcw,
  X as XIcon,
  ArrowRight,
  HelpCircle,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  ArrowLeftRight,
  TextCursorInput,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

import {
  GraphToolbar,
  useGraphFilter,
  defaultGraphFilter,
  type GraphPredicate,
} from "@/components/ui/graph";

import { CodeBlock, InstallCommand } from "@/components/shared/CodeBlock";

import type {
  TreeNode,
  TreeNodeAction,
  TreeCanvasConfig,
} from "@/trees/types";
import { TreeCanvas } from "@/trees/TreeCanvas";
import { NodeDataTable } from "@/tree-builder/NodeDataTable";
import { generateTreeFiles } from "@/tree-builder/utils/treeCodeGenerator";
import { treeTemplates, defaultTreeKey, type TreeTemplate } from "@/tree-builder/data/treeBuilderTemplates";
import { SHARED_TREE_FILES, OPTIONAL_TREE_FILES, TREE_DEPENDENCIES } from "@/tree-builder/utils/treeSharedFiles";


/* ============================================================ */
/*  Tree utilities (pure)                                        */
/* ============================================================ */

function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}
function mapTree(root: TreeNode, fn: (n: TreeNode) => TreeNode): TreeNode {
  const next = fn(root);
  return { ...next, children: next.children?.map((c) => mapTree(c, fn)) };
}
function updateNode(
  root: TreeNode,
  id: string,
  updater: (n: TreeNode) => TreeNode,
): TreeNode {
  return mapTree(root, (n) => (n.id === id ? updater(n) : n));
}

/* ============================================================ */
/*  Files panel (Export tab)                                     */
/* ============================================================ */

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
                <span className="font-semibold">{allFiles.length} files</span>.
              </p>
            </div>
          </div>
          <InstallCommand command={npmInstall} label="Runtime deps" />
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

/* ============================================================ */
/*  Properties panel (right rail) — edits the selected node      */
/* ============================================================ */

function NodePropertiesPanel({
  node,
  onChange,
  onClose,
}: {
  node: TreeNode | null;
  onChange: (id: string, updater: (n: TreeNode) => TreeNode) => void;
  onClose: () => void;
}) {
  if (!node) {
    return (
      <Card className="border-border">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Node properties</p>
          Click a node in the canvas to edit its label, edge text, child limit,
          and click action.
        </CardContent>
      </Card>
    );
  }
  const meta = node.meta ?? {};
  const action: TreeNodeAction = meta.action ?? { kind: "none" };

  const setAction = (next: TreeNodeAction) =>
    onChange(node.id, (n) => ({ ...n, meta: { ...n.meta, action: next } }));

  return (
    <Card className="border-border">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Selected node
          </p>
          <button
            onClick={onClose}
            className="h-5 w-5 grid place-items-center rounded hover:bg-muted"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input
            value={node.label}
            onChange={(e) =>
              onChange(node.id, (n) => ({ ...n, label: e.target.value }))
            }
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            Badge text
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Small uppercase label shown above the node — use it for
                  category, status, or type (e.g. COURSE, DRAFT, NEW).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            value={meta.badge ?? ""}
            placeholder="e.g. COURSE"
            onChange={(e) =>
              onChange(node.id, (n) => ({
                ...n,
                meta: { ...n.meta, badge: e.target.value || undefined },
              }))
            }
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">
            Edge label (text shown on the line from parent → this node)
          </Label>
          <Input
            value={meta.edgeLabel ?? ""}
            placeholder="e.g. More than $50K"
            onChange={(e) =>
              onChange(node.id, (n) => ({
                ...n,
                meta: { ...n.meta, edgeLabel: e.target.value || undefined },
              }))
            }
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            Used by the connector line and the &quot;Has edge label&quot; filter
            predicate.
          </p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            Tags
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Comma-separated tags. Used by the toolbar&apos;s tag chips and the
                  &quot;Has any tag&quot; filter.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            value={(meta.tags ?? []).join(", ")}
            placeholder="auth, critical, billing"
            onChange={(e) => {
              const tags = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              onChange(node.id, (n) => ({
                ...n,
                meta: { ...n.meta, tags: tags.length ? tags : undefined },
              }));
            }}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            Custom sort key
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  When the toolbar&apos;s Sort is &quot;Custom (meta.sortKey)&quot; each parent
                  orders its children by this value.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            value={meta.sortKey === undefined ? "" : String(meta.sortKey)}
            placeholder="e.g. 1 or A"
            onChange={(e) => {
              const v = e.target.value;
              const parsed: number | string | undefined =
                v === ""
                  ? undefined
                  : Number.isFinite(Number(v))
                    ? Number(v)
                    : v;
              onChange(node.id, (n) => ({
                ...n,
                meta: { ...n.meta, sortKey: parsed },
              }));
            }}
            className="h-8 text-sm w-32"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Max children (blank = unlimited)</Label>
          <Input
            type="number"
            min={0}
            value={meta.maxChildren ?? ""}
            placeholder="∞"
            onChange={(e) => {
              const v = e.target.value;
              onChange(node.id, (n) => ({
                ...n,
                meta: {
                  ...n.meta,
                  maxChildren:
                    v === "" ? null : Math.max(0, parseInt(v, 10) || 0),
                },
              }));
            }}
            className="h-8 text-sm w-24"
          />
        </div>

        {/* Lock — disables every interaction on this node. */}
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2 py-1.5">
          <div>
            <Label className="text-xs">Lock node</Label>
            <p className="text-[10px] text-muted-foreground">
              Disables add / edit / delete / drag for this node.
            </p>
          </div>
          <Switch
            checked={meta.locked === true}
            onCheckedChange={(c) =>
              onChange(node.id, (n) => ({
                ...n,
                meta: { ...n.meta, locked: c || undefined },
              }))
            }
          />
        </div>

        {/* Per-node permission overrides */}
        <div className="space-y-1.5">
          <Label className="text-xs">Per-node permissions</Label>
          <p className="text-[10px] text-muted-foreground">
            Off here = forbidden, even if the flow allows it.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(["add", "edit", "delete", "drag"] as const).map((k) => {
              const perm = meta.permissions ?? {};
              const checked = perm[k] !== false;
              return (
                <label
                  key={k}
                  className={cn(
                    "flex items-center justify-between rounded border border-border px-2 py-1 text-xs",
                    meta.locked && "opacity-50",
                  )}
                >
                  <span className="capitalize">{k}</span>
                  <Switch
                    disabled={meta.locked === true}
                    checked={checked}
                    onCheckedChange={(c) =>
                      onChange(node.id, (n) => ({
                        ...n,
                        meta: {
                          ...n.meta,
                          permissions: {
                            ...(n.meta?.permissions ?? {}),
                            [k]: c,
                          },
                        },
                      }))
                    }
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Per-node drag-mode overrides */}
        <div className="space-y-1.5">
          <Label className="text-xs">Per-node drop modes</Label>
          <p className="text-[10px] text-muted-foreground">
            Which drop positions other nodes can use when dragged onto this one.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(["child", "before", "after"] as const).map((k) => {
              const dm = meta.dragModes ?? {};
              const checked = dm[k] !== false;
              return (
                <label
                  key={k}
                  className={cn(
                    "flex items-center justify-between rounded border border-border px-2 py-1 text-xs",
                    meta.locked && "opacity-50",
                  )}
                >
                  <span className="capitalize">{k}</span>
                  <Switch
                    disabled={meta.locked === true}
                    checked={checked}
                    onCheckedChange={(c) =>
                      onChange(node.id, (n) => ({
                        ...n,
                        meta: {
                          ...n.meta,
                          dragModes: { ...(n.meta?.dragModes ?? {}), [k]: c },
                        },
                      }))
                    }
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">On click (Preview)</Label>
          <p className="text-[10px] text-muted-foreground">
            Pick <em>None</em> for an informational node, or open a dialog /
            drawer / panel / table when clicked in Preview. Drives the &quot;Has an
            action&quot; filter predicate.
          </p>
          <Select
            value={action.kind}
            onValueChange={(v) => {
              const k = v as TreeNodeAction["kind"];
              if (k === "none") setAction({ kind: "none" });
              else if (k === "route")
                setAction({ kind: "route", href: "/", label: node.label });
              else if (k === "dialog")
                setAction({
                  kind: "dialog",
                  title: node.label,
                  body: "Configure dialog body…",
                });
              else if (k === "drawer")
                setAction({
                  kind: "drawer",
                  title: node.label,
                  body: "Configure drawer body…",
                });
              else if (k === "panel")
                setAction({
                  kind: "panel",
                  title: node.label,
                  body: "Configure inline panel body…",
                });
              else if (k === "table-dialog")
                setAction({
                  kind: "table-dialog",
                  title: `${node.label} — data`,
                });
              else if (k === "table-panel")
                setAction({
                  kind: "table-panel",
                  title: `${node.label} — data`,
                });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">
                None (informational)
              </SelectItem>
              <SelectItem value="dialog" className="text-xs">
                Open dialog
              </SelectItem>
              <SelectItem value="drawer" className="text-xs">
                Open side drawer
              </SelectItem>
              <SelectItem value="panel" className="text-xs">
                Show panel below flow
              </SelectItem>
              <SelectItem value="route" className="text-xs">
                Route to a page
              </SelectItem>
              <SelectItem value="table-dialog" className="text-xs">
                Table builder in dialog
              </SelectItem>
              <SelectItem value="table-panel" className="text-xs">
                Table builder below flow
              </SelectItem>
            </SelectContent>
          </Select>

          {(action.kind === "dialog" ||
            action.kind === "drawer" ||
            action.kind === "panel") && (
            <>
              <Input
                placeholder="Title"
                value={action.title ?? ""}
                onChange={(e) =>
                  setAction({ ...action, title: e.target.value })
                }
                className="h-7 text-xs"
              />
              <Input
                placeholder="Body"
                value={action.body ?? ""}
                onChange={(e) => setAction({ ...action, body: e.target.value })}
                className="h-7 text-xs"
              />
            </>
          )}
          {action.kind === "route" && (
            <>
              <Input
                placeholder="Route (e.g. /table-builder)"
                value={action.href}
                onChange={(e) => setAction({ ...action, href: e.target.value })}
                className="h-7 text-xs"
              />
              <Input
                placeholder="Link label"
                value={action.label ?? ""}
                onChange={(e) =>
                  setAction({ ...action, label: e.target.value })
                }
                className="h-7 text-xs"
              />
            </>
          )}
          {action.kind === "table-dialog" || action.kind === "table-panel" ? (
            <p className="text-[10px] text-muted-foreground">
              Reuses the existing Data Table Builder. Hook in your dataset via{" "}
              <code>meta.dataset</code> on the node.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================ */
/*  Builder tab — variant picker + canvas + properties panel     */
/* ============================================================ */

function BuilderTab({
  variants,
  activeKey,
  setActiveKey,
  template,
  tree,
  setTree,
  selectedId,
  setSelectedId,
  layout,
  setLayout,
  config,
  setConfigOverride,
}: {
  variants: (TreeTemplate & { key: string })[];
  activeKey: string;
  setActiveKey: (k: string) => void;
  template: TreeTemplate;
  tree: TreeNode;
  setTree: (n: TreeNode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  layout: TreeCanvasConfig["layout"];
  setLayout: (l: TreeCanvasConfig["layout"]) => void;
  config: TreeCanvasConfig;
  setConfigOverride: (patch: Partial<TreeCanvasConfig>) => void;
}) {
  const selectedNode = selectedId ? findNode(tree, selectedId) : null;

  const handleNodeChange = (id: string, updater: (n: TreeNode) => TreeNode) => {
    setTree(updateNode(tree, id, updater));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      {(() => {
        void variants;
        void activeKey;
        void setActiveKey;
        return null;
      })()}
      <div className="space-y-3">
        {/* Toolbar */}
        <TooltipProvider delayDuration={200}>
          <Card className="border-border">
            <CardContent className="p-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                <button
                  onClick={() => setLayout("horizontal")}
                  className={cn(
                    "px-2 py-1 rounded text-xs flex items-center gap-1.5",
                    layout === "horizontal"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ArrowLeftRight className="h-3 w-3" /> Horizontal
                </button>
                <button
                  onClick={() => setLayout("vertical")}
                  className={cn(
                    "px-2 py-1 rounded text-xs flex items-center gap-1.5",
                    layout === "vertical"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ArrowUpDown className="h-3 w-3" /> Vertical
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                <button
                  onClick={() => setConfigOverride({ dir: "ltr" })}
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    (config.dir ?? "ltr") === "ltr"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  LTR
                </button>
                <button
                  onClick={() => setConfigOverride({ dir: "rtl" })}
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    config.dir === "rtl"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  RTL
                </button>
              </div>

              <Select
                value={config.background ?? "none"}
                onValueChange={(v) =>
                  setConfigOverride({
                    background: v as TreeCanvasConfig["background"],
                  })
                }
              >
                <SelectTrigger className="h-7 w-[120px] text-xs">
                  <SelectValue placeholder="Background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    No bg
                  </SelectItem>
                  <SelectItem value="dots" className="text-xs">
                    Dots
                  </SelectItem>
                  <SelectItem value="grid" className="text-xs">
                    Grid
                  </SelectItem>
                  <SelectItem value="cross" className="text-xs">
                    Cross
                  </SelectItem>
                  <SelectItem value="diagonal" className="text-xs">
                    Diagonal
                  </SelectItem>
                  <SelectItem value="blueprint" className="text-xs">
                    Blueprint
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="h-5 w-px bg-border" />

              <Tip
                label="Drag"
                hint="Free-position drag. When on, drop on another node to reparent / reorder, or drop on empty space to keep an absolute offset (whole subtree moves with the dragged node)."
              >
                <Switch
                  checked={config.draggable === true}
                  onCheckedChange={(c) => setConfigOverride({ draggable: c })}
                />
              </Tip>
              <Tip
                label="Invert axis"
                hint="Flip the drop indicator axis: horizontal flows show top/bottom drop zones; vertical flows show left/right."
              >
                <Switch
                  checked={config.siblingDndAxisInverted === true}
                  onCheckedChange={(c) =>
                    setConfigOverride({ siblingDndAxisInverted: c })
                  }
                />
              </Tip>
              <Tip
                label="Position controls"
                hint="Show ◀ ▶ / ▲ ▼ chevrons on every node so users can re-order siblings without dragging."
              >
                <Switch
                  checked={config.showPositionControls === true}
                  onCheckedChange={(c) =>
                    setConfigOverride({ showPositionControls: c })
                  }
                />
              </Tip>
              <div className="h-5 w-px bg-border" />

              <Tip
                label="Add"
                hint="Allow users to add child nodes via the + button on hover."
              >
                <Switch
                  checked={config.allowAdd !== false}
                  onCheckedChange={(c) => setConfigOverride({ allowAdd: c })}
                />
              </Tip>
              <Tip
                label="Edit"
                hint="Allow inline rename of a node via the pencil button on hover."
              >
                <Switch
                  checked={config.allowEdit !== false}
                  onCheckedChange={(c) => setConfigOverride({ allowEdit: c })}
                />
              </Tip>
              <Tip
                label="Delete"
                hint="Allow removing a node (and its subtree) via the trash button on hover."
              >
                <Switch
                  checked={config.allowDelete !== false}
                  onCheckedChange={(c) => setConfigOverride({ allowDelete: c })}
                />
              </Tip>

              <div className="h-5 w-px bg-border" />

              {/* Global drop-mode toggles — apply to whole flow. Per-node overrides live in the properties panel. */}
              {(["child", "before", "after"] as const).map((k) => (
                <Tip
                  key={k}
                  label={`Drop ${k}`}
                  hint={
                    k === "child"
                      ? "Allow dropping a dragged node INTO another node (becomes its child)."
                      : k === "before"
                        ? "Allow dropping a dragged node BEFORE another node (sibling, higher index)."
                        : "Allow dropping a dragged node AFTER another node (sibling, lower index)."
                  }
                >
                  <Switch
                    checked={(config.dragModes?.[k] ?? true) !== false}
                    onCheckedChange={(c) =>
                      setConfigOverride({
                        dragModes: { ...(config.dragModes ?? {}), [k]: c },
                      })
                    }
                  />
                </Tip>
              ))}

              <div className="h-5 w-px bg-border" />

              <Tip
                label="Toolbar"
                hint="Show the search / sort / filter / tags toolbar above the canvas in Preview."
              >
                <Switch
                  checked={config.showToolbar !== false}
                  onCheckedChange={(c) => setConfigOverride({ showToolbar: c })}
                />
              </Tip>
              <Tip
                label="Read-only flow"
                hint="Hide every interactive affordance. Same behaviour the Preview tab shows by default."
              >
                <Switch
                  checked={config.readOnly === true}
                  onCheckedChange={(c) => setConfigOverride({ readOnly: c })}
                />
              </Tip>

              <div className="ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTree(template.tree)}
                      className="h-7 gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Reload the original template — discards every edit.
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

        <div className="rounded-xl border border-border p-3 bg-card">
          <TreeCanvas
            config={{ ...config, layout, editable: true }}
            tree={tree}
            onTreeChange={setTree}
            onNodeClick={(n) =>
              setSelectedId(n.id === selectedId ? null : n.id)
            }
            onNodeAdd={(e) =>
              toast({
                title: "Node added",
                description: `"${e.newNode.label}" → "${e.parent.label}"`,
              })
            }
            onNodeRemove={(e) =>
              toast({ title: "Node removed", description: `"${e.node.label}"` })
            }
            onNodeMove={(e) =>
              toast({
                title: "Node moved",
                description: `"${e.node.label}" → ${e.next.mode}`,
              })
            }
          />
        </div>
      </div>

      <NodePropertiesPanel
        node={selectedNode}
        onChange={handleNodeChange}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

/* ============================================================ */
/*  Preview tab — read-only canvas + action dispatcher           */
/* ============================================================ */

type PanelState =
  | { node: TreeNode; action: Extract<TreeNodeAction, { kind: "panel" }> }
  | { node: TreeNode; action: Extract<TreeNodeAction, { kind: "table-panel" }> }
  | null;

function PreviewTab({
  template,
  tree,
  setTree,
  layout,
  config,
}: {
  template: TreeTemplate;
  tree: TreeNode;
  setTree: (n: TreeNode) => void;
  layout: TreeCanvasConfig["layout"];
  config: TreeCanvasConfig;
}) {
  void template;
  const navigate = useRouter();
  const [dialogState, setDialogState] = useState<{
    node: TreeNode;
    action: Extract<TreeNodeAction, { kind: "dialog" | "table-dialog" }>;
  } | null>(null);
  const [drawerState, setDrawerState] = useState<{
    node: TreeNode;
    action: Extract<TreeNodeAction, { kind: "drawer" }>;
  } | null>(null);
  const [panelState, setPanelState] = useState<PanelState>(null);
  const [datasetNode, setDatasetNode] = useState<TreeNode | null>(null);

  const [filter, setFilter] = useState(defaultGraphFilter);
  const predicates = useMemo(
    () =>
      [
        {
          id: "with-action",
          label: "Has an action",
          test: (c: { meta: unknown }) => {
            const a = (c.meta as { action?: TreeNodeAction })?.action;
            return !!a && a.kind !== "none";
          },
        },
        {
          id: "with-edge-label",
          label: "Has edge label",
          test: (c: { meta: unknown }) =>
            !!(c.meta as { edgeLabel?: string })?.edgeLabel,
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

  const handleNodeClick = useCallback(
    (node: TreeNode) => {
      const action: TreeNodeAction = node.meta?.action ?? { kind: "none" };
      if (action.kind === "none") return; // respect explicit "none"; no dataset fallback
      if (action.kind === "table-dialog") {
        setDatasetNode(node);
        return;
      }
      if (action.kind === "dialog") setDialogState({ node, action });
      else if (action.kind === "drawer") setDrawerState({ node, action });
      else if (action.kind === "panel") setPanelState({ node, action });
      else if (action.kind === "table-panel") setPanelState({ node, action });
      else if (action.kind === "route") navigate.push(action.href);
    },
    [navigate],
  );

  // Find a single "route" target if the selected dataset node has one
  const routeTargetForNode = (n: TreeNode | null) => {
    const a = n?.meta?.action;
    return a?.kind === "route" ? a : null;
  };

  return (
    <div className="space-y-3">
      {config.showToolbar !== false && (
        <GraphToolbar
          filter={filter}
          onChange={setFilter}
          allTags={allTags}
          predicates={predicates}
          matched={stats.matched}
          total={stats.total}
        />
      )}

      <div className="rounded-xl border border-border p-3 bg-card">
        <TreeCanvas
          config={{ ...config, layout }}
          tree={filteredTree}
          highlightIds={filter.mode === "dim" ? matches : undefined}
          onNodeClick={handleNodeClick}
          onTreeChange={setTree}
        />
      </div>

      {/* Inline panel below the flow */}
      {panelState && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Panel
                </p>
                <h3 className="text-sm font-semibold">
                  {(panelState.action.kind === "panel"
                    ? panelState.action.title
                    : panelState.action.title) ?? panelState.node.label}
                </h3>
              </div>
              <button
                onClick={() => setPanelState(null)}
                className="h-7 w-7 grid place-items-center rounded hover:bg-muted"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            {panelState.action.kind === "panel" ? (
              <p className="text-sm text-muted-foreground">
                {panelState.action.body}
              </p>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Plug in any table from the{" "}
                  <Link href="/table-builder" className="text-primary underline">
                    Data Table Builder
                  </Link>
                  . Bind the dataset on this node via <code>meta.dataset</code>.
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog
        open={!!dialogState}
        onOpenChange={(o) => !o && setDialogState(null)}
      >
        <DialogContent className="max-w-lg">
          {dialogState && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {dialogState.action.title ?? dialogState.node.label}
                </DialogTitle>
                {dialogState.action.kind === "dialog" &&
                  dialogState.action.body && (
                    <DialogDescription>
                      {dialogState.action.body}
                    </DialogDescription>
                  )}
              </DialogHeader>
              {dialogState.action.kind === "table-dialog" && (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Plug in any table from the{" "}
                    <Link
                      href="/table-builder"
                      className="text-primary underline"
                    >
                      Data Table Builder
                    </Link>
                    .
                  </CardContent>
                </Card>
              )}
              {routeTargetForNode(dialogState.node) && (
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={routeTargetForNode(dialogState.node)!.href}>
                    Open linked page <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Drawer */}
      <Sheet
        open={!!drawerState}
        onOpenChange={(o) => !o && setDrawerState(null)}
      >
        <SheetContent>
          {drawerState && (
            <SheetHeader>
              <SheetTitle>
                {drawerState.action.title ?? drawerState.node.label}
              </SheetTitle>
              <SheetDescription>{drawerState.action.body}</SheetDescription>
            </SheetHeader>
          )}
        </SheetContent>
      </Sheet>

      {/* Per-node dataset table (existing helper) */}
      <NodeDataTable
        open={!!datasetNode}
        onOpenChange={(o) => !o && setDatasetNode(null)}
        dataset={datasetNode?.meta?.dataset ?? null}
        nodeLabel={datasetNode?.label}
      />

      {/* Route actions render as small floating link cards under the canvas */}
      <RouteHints tree={tree} />
    </div>
  );
}

function RouteHints({ tree }: { tree: TreeNode }) {
  const routes: { node: TreeNode; href: string; label: string }[] = [];
  const walk = (n: TreeNode) => {
    const a = n.meta?.action;
    if (a?.kind === "route")
      routes.push({ node: n, href: a.href, label: a.label ?? n.label });
    n.children?.forEach(walk);
  };
  walk(tree);
  if (!routes.length) return null;
  return (
    <Card className="border-border">
      <CardContent className="p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" /> Route actions in this flow
        </p>
        <div className="flex flex-wrap gap-2">
          {routes.map((r) => (
            <Button
              key={r.node.id}
              asChild
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            >
              <Link href={r.href}>
                {r.node.label} → {r.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================ */
/*  Guide tab                                                    */
/* ============================================================ */

function GuideTab() {
  const sections = [
    {
      title: "Builder tab",
      body: "Pick a variant on the left, edit nodes in the canvas, and tune properties on the right. Toggle horizontal/vertical, drag, invert axis, and position controls from the toolbar.",
    },
    {
      title: "Edge labels",
      body: "Set Edge label on a node to render text on the connector from its parent. Useful for decision branches (Good / Bad / Unknown).",
    },
    {
      title: "Child limits",
      body: "Set Max children to cap how many children a node accepts. The + Add button disables when the limit is hit.",
    },
    {
      title: "Custom node renderer",
      body: "Provide a per-node render function via `meta.render`, or a flow-wide reusable one via `config.renderNode` — like shadcn DataTable column-def `cell`. When neither is set, the built-in label + description body is used.",
    },
    {
      title: "Position controls",
      body: "Enable ◀ ▶ / ▲ ▼ chevrons on each node for click-to-reorder without dragging. Great for touch and accessibility.",
    },
    {
      title: "Node actions",
      body: "Choose what happens when a user clicks a node in Preview: none, dialog, side drawer, inline panel below the flow, route navigation, or table in a dialog/panel that reuses the Data Table Builder.",
    },
    {
      title: "Preview tab",
      body: "Read-only render of the flow. Click any node to fire its action. Filter the diagram with the search/predicate toolbar above the canvas.",
    },
    {
      title: "Export Code tab",
      body: "Generated source for the active variant + the shared engine files. Copy, install the listed deps, and you're set.",
    },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {sections.map((s) => (
        <Card key={s.title} className="border-border">
          <CardContent className="p-4 space-y-1">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {s.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================ */
/*  Page shell                                                   */
/* ============================================================ */

export default function FlowBuilder() {
  const variants = useMemo(
    () => Object.entries(treeTemplates).map(([key, t]) => ({ key, ...t })),
    [],
  );
  const [activeKey, setActiveKey] = useState(
    defaultTreeKey in treeTemplates ? defaultTreeKey : variants[0].key,
  );
  const active = variants.find((v) => v.key === activeKey) ?? variants[0];

  // Per-variant tree state — reset whenever the active variant changes.
  const [tree, setTree] = useState<TreeNode>(active.tree);
  const [layout, setLayout] = useState<TreeCanvasConfig["layout"]>(
    active.config.layout,
  );
  const [configPatch, setConfigPatch] = useState<Partial<TreeCanvasConfig>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "builder" | "preview" | "code" | "guide"
  >("builder");

  // Lightweight undo/redo history for { tree, configPatch, layout }.
  type Snapshot = {
    tree: TreeNode;
    configPatch: Partial<TreeCanvasConfig>;
    layout: TreeCanvasConfig["layout"];
  };
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const skipHistoryRef = useRef(false);
  // Undo/redo availability is state (not a render-time read of the history refs)
  // so the toolbar re-renders correctly and we never read refs during render.
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const syncHistoryFlags = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };
  const snapshot = (): Snapshot => ({ tree, configPatch, layout });
  const recordHistory = (next: Snapshot) => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    pastRef.current = [...pastRef.current, snapshot()].slice(-50);
    futureRef.current = [];
    setTree(next.tree);
    setConfigPatch(next.configPatch);
    setLayout(next.layout);
    syncHistoryFlags();
  };
  const setTreeWithHistory = (n: TreeNode) =>
    recordHistory({ tree: n, configPatch, layout });
  const setConfigWithHistory = (patch: Partial<TreeCanvasConfig>) =>
    recordHistory({ tree, configPatch: { ...configPatch, ...patch }, layout });
  const setLayoutWithHistory = (l: TreeCanvasConfig["layout"]) =>
    recordHistory({ tree, configPatch, layout: l });
  const undo = () => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current = [...futureRef.current, snapshot()];
    skipHistoryRef.current = true;
    setTree(prev.tree);
    setConfigPatch(prev.configPatch);
    setLayout(prev.layout);
    syncHistoryFlags();
  };
  const redo = () => {
    const nxt = futureRef.current.pop();
    if (!nxt) return;
    pastRef.current = [...pastRef.current, snapshot()];
    skipHistoryRef.current = true;
    setTree(nxt.tree);
    setConfigPatch(nxt.configPatch);
    setLayout(nxt.layout);
    syncHistoryFlags();
  };

  const [ioOpen, setIoOpen] = useState<null | "import" | "export">(null);
  const [ioText, setIoText] = useState("");

  // Reset when variant changes
  useEffect(() => {
    setTree(active.tree);
    setLayout(active.config.layout);
    setConfigPatch({});
    setSelectedId(null);
    pastRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, [active.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const mergedConfig: TreeCanvasConfig = {
    ...active.config,
    ...configPatch,
    layout,
  };
  const handleExport = () => {
    setIoText(JSON.stringify({ config: mergedConfig, tree }, null, 2));
    setIoOpen("export");
  };
  const handleImport = () => {
    setIoText("");
    setIoOpen("import");
  };
  const applyImport = () => {
    try {
      const parsed = JSON.parse(ioText) as {
        config?: TreeCanvasConfig;
        tree?: TreeNode;
      };
      if (parsed.tree) setTreeWithHistory(parsed.tree);
      if (parsed.config) {
        setConfigWithHistory({ ...parsed.config });
        if (parsed.config.layout) setLayoutWithHistory(parsed.config.layout);
      }
      setIoOpen(null);
      toast({ title: "Imported", description: "Flow loaded from JSON." });
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px] space-y-4">
        <PageBreadcrumb items={[{ label: "Flow Builder" }]} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Flow Builder</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {variants.length} workflow templates — edit nodes, set edge
                labels, configure click actions, export code.
              </p>
            </div>
          </div>
          <BuilderShellBar
            variants={variants}
            activeKey={activeKey}
            onPick={setActiveKey}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onImport={handleImport}
            onExport={handleExport}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="space-y-4"
        >
          <TabsList className="h-10">
            <TabsTrigger value="builder" className="gap-2 px-4">
              <TextCursorInput className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2 px-4">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2 px-4">
              <Code2 className="h-4 w-4" />
              Export Code
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2 px-4">
              <BookOpen className="h-4 w-4" />
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-0">
            <BuilderTab
              variants={variants}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              template={active}
              tree={tree}
              setTree={setTreeWithHistory}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              layout={layout}
              setLayout={setLayoutWithHistory}
              config={mergedConfig}
              setConfigOverride={setConfigWithHistory}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <PreviewTab
              template={active}
              tree={tree}
              setTree={setTreeWithHistory}
              layout={layout}
              config={mergedConfig}
            />
          </TabsContent>

          <TabsContent value="code" className="mt-0">
            <FilesPanel template={active} tree={tree} />
          </TabsContent>

          <TabsContent value="guide" className="mt-0">
            <GuideTab />
          </TabsContent>
        </Tabs>

        <Dialog
          open={ioOpen !== null}
          onOpenChange={(o) => !o && setIoOpen(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {ioOpen === "export" ? "Export flow JSON" : "Import flow JSON"}
              </DialogTitle>
              <DialogDescription>
                {ioOpen === "export"
                  ? "Copy this JSON to save your flow — paste it back via Import to restore."
                  : "Paste a previously-exported flow JSON to load it."}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={ioText}
              onChange={(e) => setIoText(e.target.value)}
              className="font-mono text-xs h-80"
            />
            <div className="flex justify-end gap-2">
              {ioOpen === "export" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(ioText);
                    toast({ title: "Copied" });
                  }}
                >
                  Copy
                </Button>
              ) : (
                <Button size="sm" onClick={applyImport}>
                  Apply
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function BuilderShellBar({
  variants,
  activeKey,
  onPick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onImport,
  onExport,
}: {
  variants: (TreeTemplate & { key: string })[];
  activeKey: string;
  onPick: (k: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onImport: () => void;
  onExport: () => void;
}) {
  const active = variants.find((v) => v.key === activeKey);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 min-w-[180px] justify-between"
          >
            <span className="truncate text-xs">
              {active?.title ?? "Load Template…"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[60vh] overflow-y-auto w-[240px]"
        >
          {variants.map((v) => (
            <DropdownMenuItem
              key={v.key}
              onClick={() => onPick(v.key)}
              className={cn(
                "text-xs",
                v.key === activeKey && "bg-primary/10 text-primary font-medium",
              )}
            >
              {v.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onImport}
      >
        <Upload className="h-3 w-3" /> Import
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onExport}
      >
        <Download className="h-3 w-3" /> Export
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
      >
        <Redo2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

/* ============================================================ */
/*  Tip — labelled tooltip wrapper for compact toolbar switches  */
/* ============================================================ */

function Tip({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="flex items-center gap-1.5 text-xs cursor-help">
          {children}
          <span>{label}</span>
        </label>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs leading-snug">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}
