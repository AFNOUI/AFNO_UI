"use client";

import { Undo2, Redo2 } from "lucide-react";

import { ToolbarGroup } from "../primitives/ToolbarGroup";
import { ToolbarIconButton } from "../primitives/ToolbarIconButton";
import type { BuilderHistoryState } from "../types";

export interface BuilderHistoryControlsProps extends BuilderHistoryState {
  className?: string;
}

/**
 * CONTROL — the undo / redo pair, welded into one segmented control.
 *
 * Takes exactly the shape `useBuilderHistory()` returns, so a page can spread
 * the hook straight into it.
 */
export function BuilderHistoryControls({
  undo,
  redo,
  canUndo,
  canRedo,
  className,
}: BuilderHistoryControlsProps) {
  return (
    <ToolbarGroup variant="segmented" className={className}>
      <ToolbarIconButton icon={Undo2} label="Undo" onClick={undo} disabled={!canUndo} />
      <ToolbarIconButton icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo} />
    </ToolbarGroup>
  );
}
