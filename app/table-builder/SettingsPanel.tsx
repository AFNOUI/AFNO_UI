import {
  Zap,
  Info,
  Layers,
  Layout,
  Database,
  Sparkles,
  Settings2,
  ListOrdered,
  PanelTopOpen,
  MousePointerClick,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ExpandableLayout,
  PaginationLayout,
  TableBuilderConfig,
  TableRowClickConfig,
  ExpandableIconStyle,
  ExpandableIconPosition,
} from "@/table-builder/data/tableBuilderTemplates";
import { ApiConfigPanel } from "@/table-builder/ApiConfigPanel";
import { ColumnGroupsEditor } from "@/table-builder/ColumnGroupsEditor";

interface SettingsPanelProps {
  config: TableBuilderConfig;
  onChange: (c: TableBuilderConfig) => void;
}

type FeatureItem = readonly [keyof TableBuilderConfig, string, string];

const featureGroups: {
  label: string;
  icon: typeof Sparkles;
  items: readonly FeatureItem[];
}[] = [
  {
    label: "Core Features",
    icon: Sparkles,
    items: [
      ["enableSearch", "Search", "Global search bar in header"],
      ["enablePagination", "Pagination", "Split rows across pages"],
      [
        "enableRowSelection",
        "Row Selection",
        "Checkboxes per row + select all",
      ],
      [
        "enableBulkActions",
        "Bulk Actions",
        "Show toolbar when rows selected (needs Selection)",
      ],
      [
        "enableExport",
        "Export to CSV",
        "Header button to download filtered rows",
      ],
      [
        "enableColumnVisibility",
        "Column Visibility",
        "Toggle which columns appear",
      ],
    ],
  },
  {
    label: "Advanced",
    icon: Zap,
    items: [
      [
        "enableMultiSort",
        "Multi-Column Sort",
        "Shift+click headers to add sort priorities",
      ],
      [
        "enableColumnFilters",
        "Column Filters",
        "Inline filter input under each header",
      ],
      [
        "enableColumnResize",
        "Column Resize",
        "Drag right edge of header to resize",
      ],
      ["enableDnD", "Drag & Drop Rows", "Grab handle to reorder rows"],
      [
        "enableExpandableRows",
        "Expandable Rows",
        "Click chevron to reveal row details",
      ],
      [
        "enableInlineEdit",
        "Inline Edit",
        "Edit switches/dropdowns directly in cell",
      ],
      ["enableRowGrouping", "Row Grouping", "Group rows by 'Group by' column"],
      [
        "enableAggregation",
        "Aggregation",
        "Compute sum/avg/min/max per column",
      ],
      [
        "enableFooter",
        "Footer Row",
        "Show aggregated values in footer (needs Aggregation)",
      ],
      [
        "enablePinnedColumns",
        "Pinned Columns",
        "Stick selected columns to start/end while scrolling",
      ],
      [
        "enableNestedHeaders",
        "Grouped Headers",
        "Render super-header row from columnGroups",
      ],
      [
        "enableVirtualization",
        "Row Virtualization",
        "Only render visible rows — handles 10k+ rows smoothly",
      ],
    ],
  },
  {
    label: "Appearance",
    icon: Layout,
    items: [
      ["enableStriped", "Striped Rows", "Alternating row backgrounds"],
      ["enableHover", "Hover Effect", "Highlight row on mouse over"],
      ["enableBordered", "Bordered Cells", "Cell borders + table ring"],
      [
        "enableStickyHeader",
        "Sticky Header",
        "Header stays when scrolling (only effective without pagination)",
      ],
    ],
  },
];

export function SettingsPanel({ config, onChange }: SettingsPanelProps) {
  const groupableCols = config.columns.filter(
    (c) =>
      c.groupable ||
      c.type === "badge" ||
      c.type === "dropdown" ||
      c.type === "status-dot",
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Title</Label>
          <Input
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">
            Description
          </Label>
          <Input
            value={config.description}
            onChange={(e) =>
              onChange({ ...config, description: e.target.value })
            }
            className="h-8 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">
              Direction
            </Label>
            <Select
              value={config.direction}
              onValueChange={(v) =>
                onChange({ ...config, direction: v as "ltr" | "rtl" })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ltr" className="text-xs">
                  LTR
                </SelectItem>
                <SelectItem value="rtl" className="text-xs">
                  RTL
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Density</Label>
            <Select
              value={config.density}
              onValueChange={(v) =>
                onChange({
                  ...config,
                  density: v as "comfortable" | "compact" | "spacious",
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact" className="text-xs">
                  Compact
                </SelectItem>
                <SelectItem value="comfortable" className="text-xs">
                  Comfortable
                </SelectItem>
                <SelectItem value="spacious" className="text-xs">
                  Spacious
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">
            Default Page Size
          </Label>
          <Select
            value={String(config.pageSize)}
            onValueChange={(v) => onChange({ ...config, pageSize: Number(v) })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 8, 10, 15, 20, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">
                  {n} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["features"]}
          className="space-y-1"
        >
          <AccordionItem value="features" className="border-border">
            <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
              Features
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-3">
                {featureGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <group.icon className="h-3 w-3" /> {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.items.map(([key, label, desc]) => (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>
                            <label className="flex items-center justify-between gap-2 text-xs py-1 cursor-pointer">
                              <span className="flex items-center gap-1">
                                {label}
                                <Info className="h-2.5 w-2.5 text-muted-foreground/60" />
                              </span>
                              <Switch
                                checked={Boolean(config[key])}
                                onCheckedChange={(v) =>
                                  onChange({
                                    ...config,
                                    [key]: v,
                                  } as TableBuilderConfig)
                                }
                                className="scale-75"
                              />
                            </label>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="max-w-[220px] text-[11px]"
                          >
                            {desc}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {config.enableRowGrouping && (
            <AccordionItem value="grouping" className="border-border">
              <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
                Group by Column
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <Select
                  value={config.groupBy || ""}
                  onValueChange={(v) => onChange({ ...config, groupBy: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupableCols.map((c) => (
                      <SelectItem key={c.id} value={c.key} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Pick a column with categorical values (badge, status-dot,
                  dropdown).
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {config.enableExpandableRows && (
            <AccordionItem value="expandable" className="border-border">
              <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <PanelTopOpen className="h-3 w-3" /> Expandable Row UI
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-2 space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    Layout
                  </Label>
                  <Select
                    value={config.expandableLayout || "details"}
                    onValueChange={(v) =>
                      onChange({
                        ...config,
                        expandableLayout: v as ExpandableLayout,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="details" className="text-xs">
                        Details (key/value list)
                      </SelectItem>
                      <SelectItem value="card" className="text-xs">
                        Card
                      </SelectItem>
                      <SelectItem value="grid" className="text-xs">
                        Grid (KPI tiles)
                      </SelectItem>
                      <SelectItem value="tabs" className="text-xs">
                        Tabs (Details + JSON)
                      </SelectItem>
                      <SelectItem value="timeline" className="text-xs">
                        Timeline (milestones)
                      </SelectItem>
                      <SelectItem value="gallery" className="text-xs">
                        Gallery (assets)
                      </SelectItem>
                      <SelectItem value="stats" className="text-xs">
                        Stats (KPI cards)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">
                      Icon
                    </Label>
                    <Select
                      value={config.expandableIconStyle || "chevron"}
                      onValueChange={(v) =>
                        onChange({
                          ...config,
                          expandableIconStyle: v as ExpandableIconStyle,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chevron" className="text-xs">
                          Chevron ›
                        </SelectItem>
                        <SelectItem value="caret" className="text-xs">
                          Caret ›
                        </SelectItem>
                        <SelectItem value="plus" className="text-xs">
                          Plus / Minus
                        </SelectItem>
                        <SelectItem value="arrow" className="text-xs">
                          Arrow →
                        </SelectItem>
                        <SelectItem value="eye" className="text-xs">
                          Eye
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">
                      Position
                    </Label>
                    <Select
                      value={config.expandableIconPosition || "first"}
                      onValueChange={(v) =>
                        onChange({
                          ...config,
                          expandableIconPosition: v as ExpandableIconPosition,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first" className="text-xs">
                          First
                        </SelectItem>
                        <SelectItem value="before-checkbox" className="text-xs">
                          Before checkbox
                        </SelectItem>
                        <SelectItem value="after-checkbox" className="text-xs">
                          After checkbox
                        </SelectItem>
                        <SelectItem value="last" className="text-xs">
                          Last
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {config.enablePagination && (
            <AccordionItem value="pagination" className="border-border">
              <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <ListOrdered className="h-3 w-3" /> Pagination UI
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-2 space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    Layout
                  </Label>
                  <Select
                    value={config.paginationLayout || "full"}
                    onValueChange={(v) =>
                      onChange({
                        ...config,
                        paginationLayout: v as PaginationLayout,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full" className="text-xs">
                        Full (first/last + prev/next)
                      </SelectItem>
                      <SelectItem value="compact" className="text-xs">
                        Compact (X/Y + arrows)
                      </SelectItem>
                      <SelectItem value="minimal" className="text-xs">
                        Minimal (Prev/Next)
                      </SelectItem>
                      <SelectItem value="numbered" className="text-xs">
                        Numbered (1 2 3 …)
                      </SelectItem>
                      <SelectItem value="infoOnly" className="text-xs">
                        Info only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center justify-between gap-2 text-xs py-1 cursor-pointer">
                  <span>Page size selector</span>
                  <Switch
                    checked={Boolean(config.showPageSizeSelector)}
                    onCheckedChange={(v) =>
                      onChange({ ...config, showPageSizeSelector: v })
                    }
                    className="scale-75"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs py-1 cursor-pointer">
                  <span>Show "Showing X–Y of Z"</span>
                  <Switch
                    checked={config.showPageInfo !== false}
                    onCheckedChange={(v) =>
                      onChange({ ...config, showPageInfo: v })
                    }
                    className="scale-75"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs py-1 cursor-pointer">
                  <span>First / Last buttons</span>
                  <Switch
                    checked={config.showFirstLastButtons !== false}
                    onCheckedChange={(v) =>
                      onChange({ ...config, showFirstLastButtons: v })
                    }
                    className="scale-75"
                  />
                </label>
                {config.showPageSizeSelector && (
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">
                      Page size options (comma-separated)
                    </Label>
                    <Input
                      value={(config.pageSizeOptions || [5, 10, 20, 50]).join(
                        ", ",
                      )}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          pageSizeOptions: e.target.value
                            .split(",")
                            .map((s) => Number(s.trim()))
                            .filter((n) => !isNaN(n) && n > 0),
                        })
                      }
                      className="h-8 text-xs"
                      placeholder="10, 20, 50, 100"
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {config.enableNestedHeaders && (
            <AccordionItem value="column-groups" className="border-border">
              <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3" /> Column Groups
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <ColumnGroupsEditor config={config} onChange={onChange} />
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="row-click" className="border-border">
            <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="h-3 w-3" /> Row Click
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2 space-y-2">
              <p className="text-[10px] text-muted-foreground leading-snug">
                Make every row clickable. Per-column{" "}
                <span className="font-medium text-foreground">Cell click</span>{" "}
                overrides the row action for that cell.
              </p>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  Action
                </Label>
                <Select
                  value={
                    config.rowClickAction?.type === "dialog"
                      ? "none"
                      : (config.rowClickAction?.type ?? "none")
                  }
                  onValueChange={(v) => {
                    const next: TableRowClickConfig = {
                      code: config.rowClickAction?.code,
                      type: v as TableRowClickConfig["type"],
                      urlTemplate: config.rowClickAction?.urlTemplate,
                    };
                    onChange({ ...config, rowClickAction: next });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">
                      None
                    </SelectItem>
                    <SelectItem value="route-same" className="text-xs">
                      Route — same tab
                    </SelectItem>
                    <SelectItem value="route-new" className="text-xs">
                      Route — new tab
                    </SelectItem>
                    <SelectItem value="js" className="text-xs">
                      Run custom JS (sandboxed)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(config.rowClickAction?.type === "route-same" ||
                config.rowClickAction?.type === "route-new") && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    URL template
                  </Label>
                  <Input
                    value={config.rowClickAction?.urlTemplate ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        rowClickAction: {
                          type: config.rowClickAction!.type,
                          urlTemplate: e.target.value,
                        },
                      })
                    }
                    placeholder="/users/{id}"
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground/80 leading-snug">
                    Tokens: <code className="text-[10px]">{"{id}"}</code>,{" "}
                    <code className="text-[10px]">{"{<field>}"}</code>.
                  </p>
                </div>
              )}
              {false && config.rowClickAction?.type === "dialog" && null}
              {config.rowClickAction?.type === "js" && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    JS snippet (sandboxed)
                  </Label>
                  <textarea
                    value={config.rowClickAction?.code ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        rowClickAction: {
                          type: "js",
                          code: e.target.value,
                          urlTemplate: config.rowClickAction?.urlTemplate,
                        },
                      })
                    }
                    placeholder={`helpers.toast('Opened row ' + row.id);`}
                    rows={5}
                    className="w-full text-[11px] font-mono p-2 rounded border border-border bg-background resize-y"
                  />
                  <p className="text-[10px] text-muted-foreground/80 leading-snug">
                    Sandboxed. Available: <code>row</code>,{" "}
                    <code>helpers.toast / copy / open</code>. No DOM / network
                    access.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data" className="border-border">
            <AccordionTrigger className="py-2 text-xs font-semibold hover:no-underline">
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3" /> Data Source
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2 space-y-3">
              <p className="text-[10px] text-muted-foreground leading-snug">
                Pick which features run on the client vs. delegate to your
                backend API. Any feature set to{" "}
                <span className="font-medium text-foreground">API</span>{" "}
                triggers the generated{" "}
                <code className="text-[9px]">useTableData</code> hook to refetch
                with the corresponding query param.
              </p>

              {(
                [
                  ["search", "Search", config.enableSearch],
                  ["filter", "Column Filters", config.enableColumnFilters],
                  ["sort", "Sorting", true],
                  ["pagination", "Pagination", config.enablePagination],
                ] as const
              ).map(([key, label, enabled]) => {
                const fallback =
                  key === "pagination"
                    ? config.paginationMode
                    : config.sortMode;
                const value = (config.sources?.[key] ?? fallback) as
                  | "client"
                  | "api";
                return (
                  <div
                    key={key}
                    className={cn(
                      "space-y-1.5",
                      !enabled && "opacity-50 pointer-events-none",
                    )}
                  >
                    <Label className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{label}</span>
                      {!enabled && (
                        <span className="text-[9px] italic">
                          feature disabled
                        </span>
                      )}
                    </Label>
                    <Select
                      value={value}
                      onValueChange={(v) => {
                        const nextSources = {
                          ...(config.sources ?? {}),
                          [key]: v as "client" | "api",
                        };
                        const next: TableBuilderConfig = {
                          ...config,
                          sources: nextSources,
                        };
                        // Keep deprecated top-level fields in sync so tableCodeGenerator + useTablePreview stay correct.
                        if (key === "sort")
                          next.sortMode = v as "client" | "api";
                        if (key === "pagination")
                          next.paginationMode = v as "client" | "api";
                        onChange(next);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client" className="text-xs">
                          Client-side
                        </SelectItem>
                        <SelectItem value="api" className="text-xs">
                          API (server)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}

              {(() => {
                const s = config.sources ?? {};
                const anyApi =
                  s.search === "api" ||
                  s.filter === "api" ||
                  (s.sort ?? config.sortMode) === "api" ||
                  (s.pagination ?? config.paginationMode) === "api";
                if (!anyApi) return null;
                return (
                  <div className="pt-2 border-t border-border/40">
                    <ApiConfigPanel config={config} onChange={onChange} />
                  </div>
                );
              })()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
