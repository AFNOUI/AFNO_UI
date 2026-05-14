/**
 * Cardinality-aware edge.
 *
 * The visual encoding mirrors classic ER notation but stays React-Flow native:
 *
 *   - **One side** (PK / UNIQUE) → a single solid line ending in a small bar
 *     (the "one" tick).
 *   - **Many side** (plain FK)   → THREE faintly-fanned parallel lines
 *     ending in a crow's-foot (three diverging strokes).
 *   - **Partial participation** (FK column is NULLABLE) → that side's stroke
 *     becomes dashed.
 *   - **Total participation**  (FK column is NOT NULL) → solid stroke.
 *
 * On hover/select of either endpoint the whole bundle lights up in primary
 * colour and the animated dash overlay scrolls along the centre line.
 */
import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "reactflow";

import { cn } from "@/lib/utils";

import type { RelationEdgeData } from "@/schema-engine/index";
import { useSchemaEngineState } from "@/schema-engine/store/schemaEngineStore";

export const RelationEdge = memo(function RelationEdge(props: EdgeProps<RelationEdgeData>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, source, target } = props;
  const pulsingEdges = useSchemaEngineState(s => s.pulsingEdges);
  const hoveredTable = useSchemaEngineState(s => s.hoveredTable);
  const selectedTable = useSchemaEngineState(s => s.selectedTable);
  const isActive =
    pulsingEdges.has(id) ||
    hoveredTable === source || hoveredTable === target ||
    selectedTable === source || selectedTable === target;

  const cardinality = data?.cardinality ?? "N-1";
  const sourcePartial = data?.sourceNullable ?? false;
  const targetPartial = data?.targetNullable ?? false;

  // "many" sides: source is many in N-1 / N-N; target is many in 1-N / N-N.
  const sourceIsMany = cardinality === "N-1" || cardinality === "N-N";
  const targetIsMany = cardinality === "1-N" || cardinality === "N-N";

  const [centerPath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 14,
  });

  // For the "many" side we draw two extra parallel paths offset along Y.
  // We compute them by deriving slightly nudged source/target Y values.
  const offset = 5;
  const [topPath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceY - (sourceIsMany ? offset : 0),
    sourcePosition,
    targetX,
    targetY: targetY - (targetIsMany ? offset : 0),
    targetPosition,
    borderRadius: 14,
  });
  const [bottomPath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceY + (sourceIsMany ? offset : 0),
    sourcePosition,
    targetX,
    targetY: targetY + (targetIsMany ? offset : 0),
    targetPosition,
    borderRadius: 14,
  });

  const baseStroke = isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.55)";
  const baseWidth = isActive ? 1.8 : 1.2;
  const sourceDash = sourcePartial ? "4 3" : undefined;
  const targetDash = targetPartial ? "4 3" : undefined;
  // For visual continuity, the centre line uses the "stronger" dash style.
  const centerDash = sourcePartial && targetPartial ? "4 3" : undefined;

  return (
    <>
      {/* Centre line — always present, carries the animated pulse on hover. */}
      <BaseEdge
        id={id}
        path={centerPath}
        style={{
          stroke: baseStroke,
          strokeWidth: baseWidth + 0.4,
          strokeDasharray: centerDash,
          transition: "stroke 150ms, stroke-width 150ms",
        }}
      />
      {/* Extra fan lines for "many" side(s). */}
      {(sourceIsMany || targetIsMany) && (
        <>
          <path
            d={topPath} fill="none"
            stroke={baseStroke} strokeWidth={baseWidth}
            strokeDasharray={sourcePartial || targetPartial ? "4 3" : undefined}
            opacity={isActive ? 0.85 : 0.55}
          />
          <path
            d={bottomPath} fill="none"
            stroke={baseStroke} strokeWidth={baseWidth}
            strokeDasharray={sourcePartial || targetPartial ? "4 3" : undefined}
            opacity={isActive ? 0.85 : 0.55}
          />
        </>
      )}

      {/* Endpoint markers — crow's foot for many, bar tick for one. */}
      <EndpointMarker
        x={sourceX} y={sourceY} side="source" position={sourcePosition}
        many={sourceIsMany} partial={sourcePartial} active={isActive}
      />
      <EndpointMarker
        x={targetX} y={targetY} side="target" position={targetPosition}
        many={targetIsMany} partial={targetPartial} active={isActive}
      />

      {/* Animated pulse overlay when the relation is in focus. */}
      {isActive && (
        <path
          d={centerPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeDasharray="6 8"
          className="schema-engine-edge-pulse"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.5))" }}
        />
      )}

      {/* Cardinality + participation chip in the middle of the line. */}
      <EdgeLabelRenderer>
        <div
          className={cn(
            "absolute pointer-events-none px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold",
            "bg-card border shadow-sm flex items-center gap-1",
            isActive ? "text-primary border-primary/50" : "text-muted-foreground border-border",
          )}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          title={describeCardinality(cardinality, sourcePartial, targetPartial)}
        >
          <span>{prettyCardinality(cardinality)}</span>
          {(sourcePartial || targetPartial) && (
            <span className="text-[8px] uppercase opacity-70">{sourcePartial && targetPartial ? "partial" : "opt"}</span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

/* ───────────────────────── helpers ───────────────────────── */

function EndpointMarker({
  x, y, side, position, many, partial, active,
}: {
  x: number; y: number;
  side: "source" | "target";
  position: EdgeProps["sourcePosition"] | EdgeProps["targetPosition"];
  many: boolean; partial: boolean; active: boolean;
}) {
  // Direction the foot/bar points — outward from the node.
  // For Position.Left we point left (-1), Right → +1, Top/Bottom we keep horizontal.
  const dir = position === "left" ? -1 : 1;
  const stroke = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.7)";
  const sw = active ? 1.6 : 1.2;
  const dash = partial ? "3 2" : undefined;

  // Anchor a hair away from the handle so it doesn't sit on top of it.
  const ax = x + dir * 2;
  const fanLen = 9;
  const fanSpread = 6;
  const tickLen = 9;

  const key = `${side}-${many ? "many" : "one"}`;

  if (many) {
    return (
      <g key={key}>
        {/* Crow's-foot: three diverging lines. */}
        <line x1={ax} y1={y} x2={ax + dir * fanLen} y2={y - fanSpread} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
        <line x1={ax} y1={y} x2={ax + dir * fanLen} y2={y}             stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
        <line x1={ax} y1={y} x2={ax + dir * fanLen} y2={y + fanSpread} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
        {/* The required-vs-optional ring */}
        {partial
          ? <circle cx={ax + dir * 3} cy={y} r={2.2} fill="hsl(var(--background))" stroke={stroke} strokeWidth={1} />
          : null}
      </g>
    );
  }

  // "one" side: short perpendicular bar. Optional → small ring before the bar.
  return (
    <g key={key}>
      <line
        x1={ax + dir * 4} y1={y - tickLen / 2}
        x2={ax + dir * 4} y2={y + tickLen / 2}
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      />
      {partial && (
        <circle cx={ax + dir * 1.5} cy={y} r={2.2} fill="hsl(var(--background))" stroke={stroke} strokeWidth={1} />
      )}
    </g>
  );
}

function prettyCardinality(c: RelationEdgeData["cardinality"]): string {
  switch (c) {
    case "1-1": return "1 ── 1";
    case "1-N": return "1 ──< N";
    case "N-1": return "N >── 1";
    case "N-N": return "N >──< N";
  }
}

function describeCardinality(
  c: RelationEdgeData["cardinality"],
  sourcePartial: boolean,
  targetPartial: boolean,
): string {
  const part = sourcePartial && targetPartial
    ? " (partial participation)"
    : sourcePartial || targetPartial
      ? " (optional)"
      : "";
  switch (c) {
    case "1-1": return `One-to-one${part}`;
    case "1-N": return `One-to-many${part}`;
    case "N-1": return `Many-to-one${part}`;
    case "N-N": return `Many-to-many${part}`;
  }
}
