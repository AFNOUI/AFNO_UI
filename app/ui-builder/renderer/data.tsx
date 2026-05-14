import { Activity, Minus as MinusIcon, TrendingDown, TrendingUp } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { CategoryRenderer } from "./types";

/**
 * Renders data-display nodes: stat cards, data tables, and metric widgets.
 * Markup is byte-identical to the original switch cases in `RenderNode.tsx`.
 */
export const renderDataNode: CategoryRenderer = (node, classes) => {
  const p = node.props;

  switch (node.type) {
    case "stat-card": {
      const changeType = p.changeType as string;
      return (
        <div>
          <div className="text-sm text-muted-foreground mb-1">{p.title as string}</div>
          <div className="text-2xl font-bold text-foreground">{p.value as string}</div>
          <div
            className={cn(
              "text-xs mt-1 flex items-center gap-1",
              changeType === "positive"
                ? "text-emerald-500"
                : changeType === "negative"
                ? "text-red-500"
                : "text-muted-foreground",
            )}
          >
            {changeType === "positive" ? (
              <TrendingUp className="h-3 w-3" />
            ) : changeType === "negative" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <MinusIcon className="h-3 w-3" />
            )}
            {p.change as string}
          </div>
        </div>
      );
    }
    case "data-table": {
      const headers = ((p.headers as string) || "").split("\n").filter(Boolean);
      const cells = ((p.rows as string) || "").split("\n").filter(Boolean);
      const colCount = headers.length || 1;
      const rows: string[][] = [];
      for (let i = 0; i < cells.length; i += colCount) {
        rows.push(cells.slice(i, i + colCount));
      }
      return (
        <div className={classes}>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h, i) => (
                  <TableHead key={i}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    case "metric-widget": {
      const trend = p.trend as string;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{p.label as string}</div>
            <div className="text-lg font-bold text-foreground">{p.value as string}</div>
          </div>
          <div className="ms-auto">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <MinusIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
};
