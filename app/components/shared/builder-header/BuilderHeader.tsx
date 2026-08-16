"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

import {
  WorkspacePanel,
  WorkspaceSavedIndicator,
  type BuilderWorkspaceHeaderState,
} from "@/components/shared/builder-workspace";

import { BuilderToolbar } from "./controls/BuilderToolbar";
import { BuilderIdentity } from "./controls/BuilderIdentity";
import { BuilderHistoryControls } from "./controls/BuilderHistoryControls";
import type { BuilderHistoryState } from "./types";

export interface BuilderHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Pills rendered beside the title (e.g. a template count). */
  meta?: React.ReactNode;

  /** Slot 1 — `<BuilderTemplatePicker />`. */
  templatePicker?: React.ReactNode;
  /** Slot 2 — builder-specific extras ("Generate 1k rows", "Simulate API"). */
  actions?: React.ReactNode;
  /** Slot 3 — `<BuilderJsonDialog />` (or a builder's thin wrapper around it). */
  jsonActions?: React.ReactNode;
  /** Slot 4 — undo / redo. Spread `useBuilderHistory()` in directly. */
  history?: BuilderHistoryState;


  /**
   * Saved builds. Pass `useBuilderWorkspace(...).header`; the header places the
   * "Saved (N)" button in the toolbar, so all four builders present saved work
   * identically.
   *
   * Save state is reported here too — the "Unsaved changes" / "Saved 2m ago"
   * caption beside the title comes from the same state, so a builder has one
   * place that says whether the work is safe. Nothing autosaves, which is
   * exactly why that caption is not decoration.
   */
  workspace?: BuilderWorkspaceHeaderState;
  /** Default name offered when saving the current build. */
  workspaceName?: string;

  className?: string;
}

/**
 * HEADER — the header shared by the form, table, kanban and tree builders.
 *
 * The four toolbar slots are *ordered by the header*, not by the caller:
 * templates → builder-specific actions → JSON → history. That ordering is the
 * whole point — a user who learns one builder's header knows all four. Pages
 * decide which slots to fill; they never decide where they land.
 */
export function BuilderHeader({
  icon,
  title,
  description,
  meta,
  templatePicker,
  actions,
  jsonActions,
  history,
  workspace,
  workspaceName,
  className,
}: BuilderHeaderProps) {
  const hasToolbar = Boolean(templatePicker || actions || jsonActions || history || workspace);


  return (
    <header
      className={cn(
        "mb-4 rounded-xl border border-border/60 bg-card/40 p-3 shadow-sm backdrop-blur-sm sm:mb-6 sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <BuilderIdentity
          icon={icon}
          title={title}
          description={description}
          meta={
            <>
              {meta}
              {workspace ? <WorkspaceSavedIndicator workspace={workspace} /> : null}
            </>
          }
        />

        {hasToolbar ? (
          <BuilderToolbar>
            {templatePicker}
            {actions}
            {jsonActions}
            {workspace ? (
              <WorkspacePanel workspace={workspace} suggestedName={workspaceName} />
            ) : null}
            {history ? (
              <>
                <Separator
                  orientation="vertical"
                  className="hidden h-6 lg:block"
                  aria-hidden="true"
                />
                <BuilderHistoryControls {...history} />
              </>
            ) : null}
          </BuilderToolbar>
        ) : null}
      </div>
    </header>
  );
}
