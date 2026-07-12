/**
 * Default rich cell renderer for the table engine.
 *
 * This contains every built-in `col.type` visual (badge, progress, currency,
 * date, email, link, boolean, switch, radio, dropdown, rating, status-dot,
 * tags, avatar, avatar-image, actions, number, text). It used to live inline
 * inside `TablePreview.tsx` — extracting it makes the engine slimmer and lets
 * variants opt out per-column or per-table via `column.renderCell` /
 * `config.renderCell` (which already short-circuit this fallback).
 *
 * Resolution order at render time:
 *   column.renderCell  ->  config.renderCell  ->  defaultRichCellRenderer  ->  raw text
 */
import { MoreHorizontal, RefreshCw, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TableColumnConfig } from "./types";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface DefaultCellRowAction {
  id: string;
  title: string;
  onClick: () => void;
}

export interface DefaultCellRendererProps {
  val: unknown;
  inlineEdit: boolean;
  col: TableColumnConfig;
  onCellClick?: () => void;
  row: Record<string, unknown>;
  rowActionButtons?: DefaultCellRowAction[];
  density: "comfortable" | "compact" | "spacious";
  onUpdate: (rowId: string, key: string, value: unknown) => void;
}

function getInitials(name: string) {
  return String(name)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DefaultCellRenderer({
  col,
  row,
  val,
  density,
  onUpdate,
  inlineEdit,
  onCellClick,
  rowActionButtons,
}: DefaultCellRendererProps) {
  const sizeClass =
    density === "compact"
      ? "text-[11px]"
      : density === "spacious"
        ? "text-sm"
        : "text-xs";
  const underlineClass = col.underline
    ? "underline underline-offset-4 decoration-solid decoration-current"
    : "";
  const clickable = !!onCellClick;
  const interactiveClass = clickable
    ? "cursor-pointer hover:text-primary hover:decoration-primary transition-colors"
    : "";
  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.stopPropagation();
    onCellClick?.();
  };

  switch (col.type) {
    case "badge":
      return (
        <Badge
          variant={
            (col.badgeVariants?.[String(val)] || "secondary") as
              | "default"
              | "secondary"
              | "outline"
              | "destructive"
          }
          className={cn(sizeClass, underlineClass, interactiveClass)}
          onClick={handleClick}
        >
          {String(val)}
        </Badge>
      );

    case "progress":
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <Progress value={Number(val) || 0} className="h-1.5 flex-1" />
          <span
            className={cn(sizeClass, "text-muted-foreground w-9 tabular-nums")}
          >
            {Number(val) || 0}%
          </span>
        </div>
      );

    case "currency":
      return (
        <span
          className={cn(
            sizeClass,
            "font-medium tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {col.format || "$"}
          {Number(val).toLocaleString()}
        </span>
      );

    case "date":
      return (
        <span
          className={cn(
            sizeClass,
            "text-muted-foreground tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {String(val ?? "—")}
        </span>
      );

    case "email":
      return clickable ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[180px] text-start",
            underlineClass,
          )}
        >
          {String(val ?? "—")}
        </button>
      ) : (
        <a
          href={`mailto:${val}`}
          data-noclick="true"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[180px]",
            underlineClass,
          )}
        >
          {String(val ?? "—")}
        </a>
      );

    case "link":
      return clickable ? (
        <button
          type="button"
          data-noclick="true"
          onClick={handleClick}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[220px] text-start",
            underlineClass,
          )}
        >
          {String(val)}
        </button>
      ) : (
        <a
          target="_blank"
          rel="noreferrer"
          href={String(val)}
          data-noclick="true"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            sizeClass,
            "text-primary hover:underline",
            underlineClass,
          )}
        >
          {String(val)}
        </a>
      );

    case "boolean":
      return (
        <Badge
          variant={val ? "default" : "secondary"}
          className={cn(sizeClass)}
        >
          {val ? "Yes" : "No"}
        </Badge>
      );

    case "switch":
      return (
        <Switch
          data-noclick="true"
          checked={Boolean(val)}
          onCheckedChange={(v) => onUpdate(row.id as string, col.key, v)}
          onClick={(e) => e.stopPropagation()}
          className="scale-90"
          disabled={!inlineEdit}
        />
      );

    case "radio":
      return (
        <RadioGroup
          data-noclick="true"
          value={String(val ?? "")}
          onValueChange={(v) => onUpdate(row.id as string, col.key, v)}
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
          disabled={!inlineEdit}
        >
          {(col.options || []).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1 text-xs cursor-pointer"
            >
              <RadioGroupItem value={opt.value} className="h-3 w-3" />
              <span>{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      );

    case "dropdown":
      if (!inlineEdit) {
        return (
          <Badge variant="outline" className={cn(sizeClass)}>
            {String(val ?? "—")}
          </Badge>
        );
      }
      return (
        <Select
          value={String(val ?? "")}
          onValueChange={(v) => onUpdate(row.id as string, col.key, v)}
        >
          <SelectTrigger
            data-noclick="true"
            className="h-7 text-xs w-32 border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(col.options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "rating": {
      const n = Number(val) || 0;
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      );
    }

    case "status-dot": {
      const opt = col.options?.find((o) => o.value === val);
      const color = opt?.color || "hsl(var(--muted-foreground))";
      return (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className={cn(sizeClass, "font-medium")}>
            {opt?.label || String(val ?? "—")}
          </span>
        </div>
      );
    }

    case "tags": {
      const tags = Array.isArray(val) ? val : [];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((t, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {String(t)}
            </Badge>
          ))}
        </div>
      );
    }

    case "avatar":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(String(val))}
            </AvatarFallback>
          </Avatar>
          <span className={cn(sizeClass, "font-medium truncate")}>
            {String(val ?? "—")}
          </span>
        </div>
      );

    case "avatar-image":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={String(row.avatarUrl || "")} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(String(val))}
            </AvatarFallback>
          </Avatar>
          <span className={cn(sizeClass, "font-medium truncate")}>
            {String(val ?? "—")}
          </span>
        </div>
      );

    case "actions":
      return (
        <div
          data-noclick="true"
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {rowActionButtons?.map((b) => (
            <Button
              key={b.id}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={b.title}
              onClick={(e) => {
                e.stopPropagation();
                b.onClick();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

    case "number":
      return (
        <span
          className={cn(
            sizeClass,
            "tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {val == null ? "—" : Number(val).toLocaleString()}
        </span>
      );

    default:
      return (
        <span
          className={cn(
            sizeClass,
            "truncate block",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {String(val ?? "—")}
        </span>
      );
  }
}
