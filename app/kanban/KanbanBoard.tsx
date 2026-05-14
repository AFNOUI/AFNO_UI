"use client";

/**
 * Config-driven kanban board powered by our custom Pointer DnD library
 * (`src/components/kanban/dnd`). Three layouts: "board" | "compact" | "swimlane".
 *
 * The board mounts a single <DndProvider>, then each column / lane cell is a
 * `useDropZone`, and each rendered card wraps `useDraggable`. The provider
 * pushes hover state down so a single <DropIndicator> renders per zone — no
 * per-card flicker on pointermove.
 */
import { Plus, AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  useDropZone,
  DndProvider,
  useDraggable,
  DropIndicator,
  type DropResult,
} from "@/kanban/dnd";
import { cn } from "@/lib/utils";
import { runCellJs } from "@/utils/cellJsRunner";
import type {
  KanbanCardData,
  KanbanCardField,
  KanbanColumnConfig,
  KanbanBuilderConfig,
  KanbanCardChangeEvent,
  KanbanLoadMoreEvent,
} from "@/kanban/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { KanbanCard } from "@/kanban/KanbanCard";
import { KanbanCardDialog } from "@/kanban/KanbanCardDialog";
import { KanbanAddCardDialog } from "@/kanban/KanbanAddCardDialog";


interface Props {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  onCardsChange?: (next: KanbanCardData[]) => void;
  onLoadMore?: (event: KanbanLoadMoreEvent) => void | Promise<void>;
  /** Called when the user clicks the "+ Add card" button in a column. */
  onAddCard?: (event: { columnId: string; lane?: string }) => void;
  /**
   * Optional callback fired whenever a card changes column or position via
   * drag-and-drop. The user can use this to call a backend API (PATCH /cards/:id)
   * to persist the change. Receives the moved card plus the from/to positions.
   */
  onCardChange?: (event: KanbanCardChangeEvent) => void;
}

/**
 * The board emits two event shapes — both moved to `@/kanban/types` so the
 * generated code can import them without dragging in the engine module. We
 * re-export here so existing `import { KanbanCardChangeEvent } from "@/kanban/KanbanBoard"`
 * call-sites keep resolving.
 */
export type { KanbanCardChangeEvent, KanbanLoadMoreEvent } from "@/kanban/types";

const COLUMN_ACCENT: Record<string, string> = {
  muted: "border-muted-foreground/20",
  amber: "border-amber-500/30",
  blue: "border-blue-500/30",
  purple: "border-purple-500/30",
  emerald: "border-emerald-500/30",
};

interface CardDragData extends Record<string, unknown> {
  cardId: string;
  fromColumnId: string;
  fromLane?: string;
}

interface ZoneData extends Record<string, unknown> {
  columnId: string;
  lane?: string;
}

function getZoneId(columnId: string, lane?: string) {
  return lane ? `${columnId}::${lane}` : columnId;
}

export function KanbanBoard({ config, cards, onCardsChange, onCardChange, onLoadMore, onAddCard }: Props) {
  const swimlaneKey = config.swimlaneKey ?? "assignee";
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [addTarget, setAddTarget] = useState<{ columnId: string; lane?: string } | null>(null);

  const handleAddClick = useCallback((event: { columnId: string; lane?: string }) => {
    setAddTarget(event);
    onAddCard?.(event);
  }, [onAddCard]);

  const sampleForAdd = useMemo(() => {
    if (!addTarget) return undefined;
    return cards.find((c) => c.columnId === addTarget.columnId) ?? cards[0];
  }, [addTarget, cards]);

  const handleAddSubmit = useCallback((card: KanbanCardData) => {
    if (onCardsChange) onCardsChange([...cards, card]);
  }, [cards, onCardsChange]);

  const getLaneValue = useCallback(
    (card: KanbanCardData) => String(card[swimlaneKey] ?? "—"),
    [swimlaneKey],
  );

  // O(n) bucketing of cards per column / per (column,lane) zone.
  const cardsByColumn = useMemo(() => {
    const map = new Map<string, KanbanCardData[]>();
    for (const column of config.columns) map.set(column.id, []);
    for (const card of cards) {
      const bucket = map.get(card.columnId);
      if (bucket) bucket.push(card);
    }
    return map;
  }, [cards, config.columns]);

  const cardsByZone = useMemo(() => {
    const map = new Map<string, KanbanCardData[]>();
    for (const card of cards) {
      const zoneId = getZoneId(
        card.columnId,
        config.layout === "swimlane" ? getLaneValue(card) : undefined,
      );
      const bucket = map.get(zoneId);
      if (bucket) bucket.push(card);
      else map.set(zoneId, [card]);
    }
    return map;
  }, [cards, config.layout, getLaneValue]);

  const lanes = useMemo(() => {
    if (config.layout !== "swimlane") return [] as string[];
    const set = new Set<string>();
    for (const card of cards) set.add(getLaneValue(card));
    return Array.from(set).sort();
  }, [cards, config.layout, getLaneValue]);

  /**
   * Pure reordering function. Operates on a flat array.
   * O(n) — single filter + single splice.
   */
  const moveCard = useCallback(
    (cardId: string, toColumnId: string, toLane: string | undefined, toIndex: number) => {
      if (!onCardsChange) return;
      const dragged = cards.find((c) => c.id === cardId);
      if (!dragged) return;
      const fromIndex = cards.indexOf(dragged);
      const fromColumnId = dragged.columnId;

      const currentLane = config.layout === "swimlane" ? getLaneValue(dragged) : undefined;
      const nextLane = config.layout === "swimlane" ? (toLane ?? currentLane) : undefined;

      const without = cards.filter((c) => c.id !== cardId);
      const targetIndices: number[] = [];
      for (let i = 0; i < without.length; i += 1) {
        const c = without[i];
        if (c.columnId !== toColumnId) continue;
        if (nextLane !== undefined && getLaneValue(c) !== nextLane) continue;
        targetIndices.push(i);
      }

      const clamped = Math.max(0, Math.min(toIndex, targetIndices.length));
      let insertAt = without.length;
      if (targetIndices.length > 0) {
        insertAt = clamped < targetIndices.length
          ? targetIndices[clamped]
          : targetIndices[targetIndices.length - 1] + 1;
      }

      const moved =
        config.layout === "swimlane"
          ? ({ ...dragged, columnId: toColumnId, [swimlaneKey]: nextLane } as KanbanCardData)
          : dragged.columnId === toColumnId
            ? dragged
            : { ...dragged, columnId: toColumnId };

      const next = [...without];
      next.splice(insertAt, 0, moved);

      // Skip the state update if nothing actually changed (same id, column, lane order).
      const unchanged = next.every((c, i) => {
        const orig = cards[i];
        if (!orig) return false;
        if (orig.id !== c.id || orig.columnId !== c.columnId) return false;
        return config.layout !== "swimlane" || getLaneValue(orig) === getLaneValue(c);
      });
      if (!unchanged) {
        onCardsChange(next);
        // Notify the host & run the user-defined snippet so callers can
        // persist the change (PATCH /cards/:id, etc.) with one round-trip.
        const evt: KanbanCardChangeEvent = {
          card: moved,
          fromColumnId,
          toColumnId,
          fromIndex,
          toIndex: insertAt,
          cards: next,
        };
        onCardChange?.(evt);
        if (config.onCardChangeJs?.trim()) {
          try {
            runCellJs(config.onCardChangeJs, { row: evt as unknown as Record<string, unknown>, value: undefined });
          } catch (err) {
            console.error("[kanban] onCardChangeJs threw:", err);
          }
        }
      }
    },
    [cards, config.layout, config.onCardChangeJs, getLaneValue, onCardChange, onCardsChange, swimlaneKey],
  );

  const handleDrop = useCallback((result: DropResult<CardDragData, ZoneData>) => {
    moveCard(result.item.data.cardId, result.zoneData.columnId, result.zoneData.lane, result.index);
  }, [moveCard]);

  const board = (
    <BoardInner
      config={config}
      cardsByColumn={cardsByColumn}
      cardsByZone={cardsByZone}
      lanes={lanes}
      onDrop={handleDrop}
      onCardClick={setSelectedCard}
      onLoadMore={onLoadMore}
      onAddCard={handleAddClick}
    />
  );

  // Disable DnD entirely when the consumer hasn't enabled it OR didn't pass
  // an onCardsChange — there's nowhere to put the result.
  const dir = config.direction ?? "ltr";
  const wrapped = (
    <>
      <div dir={dir} style={{ direction: dir }} className="w-full">
        {board}
      </div>
      <KanbanCardDialog
        card={selectedCard}
        action={config.cardClickAction}
        onOpenChange={(open) => { if (!open) setSelectedCard(null); }}
      />
      {addTarget && (
        <KanbanAddCardDialog
          open={!!addTarget}
          onOpenChange={(open) => { if (!open) setAddTarget(null); }}
          config={config}
          sample={sampleForAdd}
          columnId={addTarget.columnId}
          lane={addTarget.lane}
          onSubmit={handleAddSubmit}
        />
      )}
    </>
  );
  if (!config.enableDnd || !onCardsChange) return <DndProvider reduceMotion={config.reduceMotion}>{wrapped}</DndProvider>;
  return <DndProvider reduceMotion={config.reduceMotion}>{wrapped}</DndProvider>;
}

interface InnerProps {
  config: KanbanBuilderConfig;
  cardsByColumn: Map<string, KanbanCardData[]>;
  cardsByZone: Map<string, KanbanCardData[]>;
  lanes: string[];
  onDrop: (result: DropResult<CardDragData, ZoneData>) => void;
  onCardClick: (card: KanbanCardData) => void;
  onLoadMore?: (event: KanbanLoadMoreEvent) => void | Promise<void>;
  onAddCard?: (event: { columnId: string; lane?: string }) => void;
}

function BoardInner({ config, cardsByColumn, cardsByZone, lanes, onDrop, onCardClick, onLoadMore, onAddCard }: InnerProps) {
  const dir = config.direction ?? "ltr";
  const dirStyle: React.CSSProperties = { direction: dir };
  if (config.layout === "timeline") {
    // Horizontal time-bucket timeline. Each "column" is a time slice (week,
    // sprint, quarter, …). Cards are dropped into a slice by drag-and-drop.
    return (
      <ScrollArea className="w-full">
        <div className="flex min-w-[900px] items-stretch gap-3 pb-4" style={dirStyle}>
          {config.columns.map((column, idx) => {
            const cols = cardsByColumn.get(column.id) ?? [];
            const isLast = idx === config.columns.length - 1;
            return (
              <div key={column.id} className="flex w-[260px] flex-col">
                <div
                  className={cn(
                    "mb-2 flex items-center justify-between rounded-md border-l-4 bg-card px-2 py-1.5 shadow-sm",
                    COLUMN_ACCENT[column.color ?? "muted"],
                  )}
                >
                  <span className="text-xs font-semibold">{column.title}</span>
                  {config.showColumnTotals && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {cols.length}
                    </Badge>
                  )}
                </div>
                <div className="relative flex-1">
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className="absolute end-[-14px] top-6 h-0.5 w-3 bg-muted-foreground/30"
                    />
                  )}
                  <Zone
                    columnId={column.id}
                    cards={cols}
                    compact={config.compactCards}
                    visibleFields={config.visibleFields}
                    enableDnd={config.enableDnd}
                    onDrop={onDrop}
                    className="h-full min-h-[200px] space-y-2 rounded-lg border border-dashed bg-muted/20 p-2"
                    footer={config.enableAddCard ? <AddCardButton onClick={() => onAddCard?.({ columnId: column.id })} /> : null}
                    onCardClick={onCardClick}
                    reduceMotion={config.reduceMotion}
                    onLoadMore={onLoadMore}
                    infiniteScroll={config.infiniteScroll}
                    axis="y"
                    scrollable={config.scrollableColumns}
                    maxHeightPx={config.columnMaxHeightPx}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  if (config.layout === "calendar") {
    // Month-style calendar. Each card is bucketed by `dueDate` into a column
    // representing a day-of-week (Mon-Sun). When dueDate is missing the card
    // sits in an "Unscheduled" pseudo-column.
    const dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <ScrollArea className="w-full">
        <div className="grid min-w-[900px] gap-2" style={{ gridTemplateColumns: "repeat(7, minmax(120px, 1fr))", ...dirStyle }}>
          {dows.map((dow) => (
            <div key={dow} className="rounded-lg border bg-muted/20 p-2">
              <div className="mb-2 px-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{dow}</div>
              <Zone
                columnId={dow}
                cards={cardsByColumn.get(dow) ?? []}
                compact
                visibleFields={config.visibleFields}
                enableDnd={config.enableDnd}
                onDrop={onDrop}
                className="min-h-[140px] space-y-1.5"
                onCardClick={onCardClick}
                reduceMotion={config.reduceMotion}
                    onLoadMore={onLoadMore}
                    infiniteScroll={config.infiniteScroll}
                    scrollable={config.scrollableColumns}
                    maxHeightPx={config.columnMaxHeightPx}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  if (config.layout === "compact") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={dirStyle}>
        {config.columns.map((column) => {
          const cols = cardsByColumn.get(column.id) ?? [];
          const overWip =
            config.enableWipLimits &&
            column.wipLimit !== undefined &&
            cols.length > column.wipLimit;
          return (
            <Zone
              key={column.id}
              columnId={column.id}
              cards={cols}
              compact
              visibleFields={config.visibleFields}
              enableDnd={config.enableDnd}
              onDrop={onDrop}
              className={cn(
                "min-h-[160px] space-y-2 rounded-lg border bg-card p-3",
                COLUMN_ACCENT[column.color ?? "muted"],
                overWip && "border-destructive/60",
              )}
              header={
                <ColumnHeader
                  col={column}
                  count={cols.length}
                  overWip={!!overWip}
                  showWip={config.enableWipLimits}
                  showTotal={config.showColumnTotals}
                />
              }
              footer={config.enableAddCard ? <AddCardButton onClick={() => onAddCard?.({ columnId: column.id })} /> : null}
              onCardClick={onCardClick}
              reduceMotion={config.reduceMotion}
                    onLoadMore={onLoadMore}
                    infiniteScroll={config.infiniteScroll}
                    scrollable={config.scrollableColumns}
                    maxHeightPx={config.columnMaxHeightPx}
            />
          );
        })}
      </div>
    );
  }

  if (config.layout === "swimlane") {
    const gridColumns = `120px repeat(${config.columns.length}, minmax(180px, 1fr))`;
    return (
      <ScrollArea className="w-full">
        <div className="min-w-[900px] space-y-2 pb-2" style={dirStyle}>
          <div className="grid gap-2" style={{ gridTemplateColumns: gridColumns }}>
            <div />
            {config.columns.map((column) => {
              const total = cardsByColumn.get(column.id)?.length ?? 0;
              return (
                <div key={column.id} className="flex items-center gap-2 px-2 py-1.5">
                  <span className="text-xs font-semibold">{column.title}</span>
                  {config.showColumnTotals && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                      {total}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
          {lanes.map((lane) => (
            <div key={lane} className="grid gap-2" style={{ gridTemplateColumns: gridColumns }}>
              <div className="flex items-center gap-2 border-t border-border px-2 py-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                    {lane.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-xs font-medium">{lane}</span>
              </div>
              {config.columns.map((column) => {
                const zoneId = getZoneId(column.id, lane);
                const zoneCards = cardsByZone.get(zoneId) ?? [];
                return (
                  <Zone
                    key={zoneId}
                    columnId={column.id}
                    lane={lane}
                    cards={zoneCards}
                    compact={config.compactCards}
                    visibleFields={config.visibleFields}
                    enableDnd={config.enableDnd}
                    onDrop={onDrop}
                    className="min-h-[60px] space-y-1.5 rounded border-t border-border p-1.5"
                    onCardClick={onCardClick}
                    reduceMotion={config.reduceMotion}
                    onLoadMore={onLoadMore}
                    infiniteScroll={config.infiniteScroll}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  // Default: "board"
  return (
    <ScrollArea className="w-full">
      <div className="flex min-w-[900px] items-start gap-4 pb-4" style={dirStyle}>
        {config.columns.map((column) => {
          const cols = cardsByColumn.get(column.id) ?? [];
          const overWip =
            config.enableWipLimits &&
            column.wipLimit !== undefined &&
            cols.length > column.wipLimit;
          return (
            <div key={column.id} className="max-w-[300px] min-w-[240px] flex-1">
              <ColumnHeader
                col={column}
                count={cols.length}
                overWip={!!overWip}
                showWip={config.enableWipLimits}
                showTotal={config.showColumnTotals}
              />
              <Zone
                columnId={column.id}
                cards={cols}
                compact={config.compactCards}
                visibleFields={config.visibleFields}
                enableDnd={config.enableDnd}
                onDrop={onDrop}
                className={cn(
                  "min-h-[200px] space-y-2 rounded-lg border border-dashed bg-muted/30 p-2",
                  COLUMN_ACCENT[column.color ?? "muted"],
                  overWip && "border-destructive/60 bg-destructive/5",
                )}
                footer={config.enableAddCard ? <AddCardButton onClick={() => onAddCard?.({ columnId: column.id })} /> : null}
                onCardClick={onCardClick}
                reduceMotion={config.reduceMotion}
                    onLoadMore={onLoadMore}
                    infiniteScroll={config.infiniteScroll}
                    scrollable={config.scrollableColumns}
                    maxHeightPx={config.columnMaxHeightPx}
              />
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

interface ZoneProps {
  columnId: string;
  lane?: string;
  cards: KanbanCardData[];
  compact?: boolean;
  visibleFields: KanbanCardField[];
  enableDnd: boolean;
  onDrop: (result: DropResult<CardDragData, ZoneData>) => void;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Layout axis for index resolution + sibling-translation direction. */
  axis?: "x" | "y";
  /** When true, the DropIndicator/animations are disabled (reduce motion). */
  reduceMotion?: boolean;
  /** Click handler — opens the card-detail dialog. */
  onCardClick?: (card: KanbanCardData) => void;
  onLoadMore?: (event: KanbanLoadMoreEvent) => void | Promise<void>;
  infiniteScroll?: KanbanBuilderConfig["infiniteScroll"];
  /** Constrain this zone to a fixed max-height with overflow-auto. */
  scrollable?: boolean;
  /** Max-height in px when scrollable. Defaults to 520. */
  maxHeightPx?: number;
}

function Zone({
  columnId,
  lane,
  cards,
  compact,
  visibleFields,
  enableDnd,
  onDrop,
  className,
  header,
  footer,
  axis = "y",
  reduceMotion = false,
  onCardClick,
  onLoadMore,
  infiniteScroll,
  scrollable,
  maxHeightPx,
}: ZoneProps) {
  const zoneId = getZoneId(columnId, lane);
  const zoneData = useMemo<ZoneData>(() => ({ columnId, lane }), [columnId, lane]);
  const loadMoreLockRef = useRef(0);
  const { zoneProps, hoverIndex, isOver, slotSize, animationsEnabled } = useDropZone<ZoneData, CardDragData>({
    id: zoneId,
    data: zoneData,
    onDrop,
    disabled: !enableDnd,
    axis,
    getItemIndex: (drag) => cards.findIndex((card) => card.id === drag.data.cardId),
  });

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (!infiniteScroll?.enabled || !onLoadMore) return;
    const el = event.currentTarget;
    const threshold = infiniteScroll.thresholdPx ?? 96;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > threshold) return;
    if (infiniteScroll.hasMoreByColumn?.[columnId] === false) return;
    const now = Date.now();
    if (now - loadMoreLockRef.current < 900) return;
    loadMoreLockRef.current = now;
    void onLoadMore({ columnId, lane, cursor: infiniteScroll.cursorByColumn?.[columnId] });
  }, [columnId, infiniteScroll, lane, onLoadMore]);

  // Render an inline drop indicator at the active hover index. Because the
  // drag source collapses to height 0 (DraggableCardItem handles that), the
  // surrounding cards close up naturally and the indicator opens a clean,
  // real-sized gap exactly where the card will land — no overlapping/faded
  // duplicate, no two-cards-in-the-same-row artifact.
  const items: React.ReactElement[] = [];
  const showIndicatorAt = isOver && hoverIndex != null ? hoverIndex : -1;
  cards.forEach((card, idx) => {
    if (showIndicatorAt === idx) {
      items.push(
        <DropIndicator
          key={`${zoneId}-ind-${idx}`}
          axis={axis}
          size={slotSize}
          animated={animationsEnabled && !reduceMotion}
        />,
      );
    }
    items.push(
      <DraggableCardItem
        key={card.id}
        card={card}
        columnId={columnId}
        lane={lane}
        compact={!!compact}
        visibleFields={visibleFields}
        enabled={enableDnd}
        onClick={onCardClick}
      />,
    );
  });
  if (showIndicatorAt === cards.length) {
    items.push(
      <DropIndicator
        key={`${zoneId}-ind-end`}
        axis={axis}
        size={slotSize}
        animated={animationsEnabled && !reduceMotion}
      />,
    );
  }

  return (
    <div
      className={cn(
        className,
        (infiniteScroll?.enabled || scrollable) && "overflow-y-auto overscroll-contain pr-1",
      )}
      style={
        infiniteScroll?.enabled || scrollable
          ? { maxHeight: maxHeightPx ?? 520 }
          : undefined
      }
      onScroll={handleScroll}
    >
      {header}
      <div
        {...zoneProps}
        className={cn(
          "relative",
          axis === "x" ? "flex flex-row gap-2 transition-colors" : "space-y-2 transition-colors",
          isOver && "bg-accent/30 rounded",
        )}
        style={
          axis !== "x" && isOver
            ? { paddingBottom: Math.max(slotSize.height, 24) }
            : undefined
        }
      >
        {items.length === 0 ? <div className="min-h-[40px]" /> : items}
      </div>
      {footer}
    </div>
  );
}

interface DraggableCardItemProps {
  card: KanbanCardData;
  columnId: string;
  lane?: string;
  compact: boolean;
  visibleFields: KanbanCardField[];
  enabled: boolean;
  onClick?: (card: KanbanCardData) => void;
}

function DraggableCardItem({
  card,
  columnId,
  lane,
  compact,
  visibleFields,
  enabled,
  onClick,
}: DraggableCardItemProps) {
  const { dragProps, isDragging } = useDraggable<CardDragData>({
    id: card.id,
    data: useMemo(() => ({ cardId: card.id, fromColumnId: columnId, fromLane: lane }), [card.id, columnId, lane]),
    disabled: !enabled,
    preview: () => (
      <div className="w-[260px]">
        <KanbanCard card={card} visibleFields={visibleFields} compact={compact} />
      </div>
    ),
  });

  return (
    <div
      {...dragProps}
      style={{
        ...dragProps.style,
        // While this card is the active drag source, collapse it out of the
        // layout so the floating preview/ghost is the ONLY visible instance.
        // This matches the behaviour in the reference video — no faded
        // duplicate left behind, no overlapping text.
        ...(isDragging
          ? {
              height: 0,
              minHeight: 0,
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0,
              opacity: 0,
              overflow: "hidden",
              pointerEvents: "none" as const,
            }
          : null),
      }}
      onClick={() => onClick?.(card)}
      className={cn(
        "select-none transition-opacity duration-100",
        enabled && "cursor-grab active:cursor-grabbing",
        onClick && "cursor-pointer",
      )}
    >
      <KanbanCard card={card} visibleFields={visibleFields} compact={compact} />
    </div>
  );
}

function ColumnHeader({
  col,
  count,
  overWip,
  showWip,
  showTotal,
}: {
  col: KanbanColumnConfig;
  count: number;
  overWip: boolean;
  showWip: boolean;
  showTotal: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{col.title}</span>
        {showTotal && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {count}
          </Badge>
        )}
        {showWip && col.wipLimit !== undefined && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              overWip
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
          >
            {count}/{col.wipLimit}
          </span>
        )}
      </div>
      {overWip && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
    </div>
  );
}

function AddCardButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-full justify-start gap-1.5 text-xs text-muted-foreground"
      onClick={onClick}
    >
      <Plus className="h-3.5 w-3.5" /> Add card
    </Button>
  );
}
