"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

import {
  BuilderDraftPrompt,
  DraftSavedIndicator,
  type BuilderDraftHeaderState,
} from "@/components/shared/builder-draft";

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
   * Autosave. Pass `useBuilderDraft(...).header`; the header places both of its
   * surfaces — the "Saved 2m ago" caption beside the title, and the "Restore
   * last session" strip below — so all four builders report autosave the same
   * way, same as they do templates and undo.
   */
  draft?: BuilderDraftHeaderState;

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
  draft,
  className,
}: BuilderHeaderProps) {
  const hasToolbar = Boolean(templatePicker || actions || jsonActions || history);

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
              {draft ? (
                <DraftSavedIndicator status={draft.status} savedAt={draft.savedAt} />
              ) : null}
            </>
          }
        />

        {hasToolbar ? (
          <BuilderToolbar>
            {templatePicker}
            {actions}
            {jsonActions}
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

      {/* Full width, below the identity/toolbar row — a restore offer concerns
          the whole build, so it should not have to compete with the toolbar for
          horizontal space. Renders nothing when there is no draft to offer. */}
      {draft ? <BuilderDraftPrompt draft={draft} /> : null}
    </header>
  );
}
