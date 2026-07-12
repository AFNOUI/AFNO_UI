/**
 * Default expandable-row body. Renders one of seven preset layouts based on
 * `config.expandableLayout`. Engine fallback when the variant does not supply
 * a typed JSX `renderExpandedRow` function.
 *
 * Resolution order (built into TablePreview):
 *   config.renderExpandedRow(ctx)   →   <DefaultExpandedRow layout={...} />
 *
 * This component is purposely standalone so user-supplied renderers can
 * compose with it, e.g.:
 *
 *   renderExpandedRow: (ctx) => (
 *     <>
 *       <DefaultExpandedRow {...ctx} layout="card" />
 *       <MyExtraChart row={ctx.row} />
 *     </>
 *   )
 */
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import type { TableRow, ExpandableLayout, TableColumnConfig } from "./types";

export interface DefaultExpandedRowProps<T extends TableRow = TableRow> {
  row: T;
  layout?: ExpandableLayout;
  /** Reserved for future layouts that need column metadata. Currently unused. */
  columns?: TableColumnConfig[];
  rowIndex?: number;
}

interface Milestone {
  date: string;
  label: string;
  done: boolean;
}

const EXCLUDED_KEYS = new Set<string>(["id", "milestones", "assets"]);
const KPI_KEYS = ["calls", "demos", "win", "deals", "revenue", "quota"];

function getEntries(row: TableRow): Array<[string, unknown]> {
  return Object.entries(row).filter(([k]) => !EXCLUDED_KEYS.has(k));
}

export function DefaultExpandedRow<T extends TableRow = TableRow>({
  row,
  layout = "details",
}: DefaultExpandedRowProps<T>) {
  const entries = getEntries(row);

  switch (layout) {
    case "card":
      return (
        <div className="px-4 py-4 bg-gradient-to-br from-muted/40 to-muted/20">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Full Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map(([k, v]) => (
                  <div
                    key={k}
                    className="space-y-0.5 p-2.5 rounded-md bg-muted/30 border border-border/40"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {k}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "grid":
      return (
        <div className="px-4 py-4 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {entries.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-background border border-border/60"
              >
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  {k}
                </div>
                <div className="text-sm font-bold tabular-nums truncate w-full">
                  {String(v)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "tabs":
      return (
        <div className="px-4 py-3 bg-muted/20">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="h-8">
              <TabsTrigger value="details" className="text-xs h-6 px-3">
                Details
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs h-6 px-3">
                Raw JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-2">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 px-2">
                {entries.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {k}:
                    </span>
                    <span className="font-medium truncate ms-2">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="raw" className="mt-2">
              <pre className="text-[10px] bg-background border border-border rounded p-2 overflow-x-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      );

    case "timeline": {
      const milestones = (row.milestones as Milestone[] | undefined) ?? [];
      return (
        <div className="px-6 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Milestones
          </p>
          <div className="relative ms-2">
            <div className="absolute start-1.5 top-1 bottom-1 w-px bg-border" />
            <div className="space-y-3">
              {milestones.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No milestones available.
                </p>
              ) : (
                milestones.map((m, i) => (
                  <div key={i} className="relative flex items-start gap-3 ps-5">
                    <div className="absolute start-0 top-0.5">
                      {m.done ? (
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.date}
                      </div>
                    </div>
                    {m.done && (
                      <Badge variant="secondary" className="text-[9px]">
                        Done
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    case "gallery": {
      const assets = (row.assets as string[] | undefined) ?? [];
      return (
        <div className="px-4 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Asset Preview ({assets.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {assets.map((cls, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm",
                  cls,
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "stats": {
      const kpis = KPI_KEYS.filter((k) => row[k] !== undefined).map((k) => ({
        key: k,
        value: row[k],
      }));
      return (
        <div className="px-4 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Performance Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {kpis.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-full">
                No KPI fields available.
              </p>
            ) : (
              kpis.map(({ key, value }) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-background border border-border/60"
                >
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {key}
                  </div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">
                    {String(value)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    case "details":
    default:
      return (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            Row Details
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {entries.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">{k}:</span>
                <span className="font-medium truncate ms-2">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}
