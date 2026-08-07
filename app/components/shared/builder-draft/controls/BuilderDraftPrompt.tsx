"use client";

import * as React from "react";
import { History, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { formatSavedAgo } from "../utils";
import { DRAFT_TICK_MS } from "../constants";
import type { BuilderDraftHeaderState } from "../types";

export interface BuilderDraftPromptProps {
  draft: BuilderDraftHeaderState;
  className?: string;
}

/**
 * CONTROL — "Restore last session?" strip.
 *
 * Sits inside the builder header rather than floating over the canvas: it is
 * about the build as a whole, and a toast would expire before a user who just
 * reopened the tab has finished reading it.
 *
 * Restoring is opt-in by design. The draft is offered, never applied — quietly
 * replacing whatever is on screen is how autosave turns from a rescue into a
 * way to lose work.
 */
export function BuilderDraftPrompt({ draft, className }: BuilderDraftPromptProps) {
  const { offer, restore, dismiss } = draft;
  const [now, setNow] = React.useState<number | null>(null);

  // Client-only: the server has no "14m ago" to render, and guessing one is a
  // hydration mismatch.
  React.useEffect(() => {
    if (!offer) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), DRAFT_TICK_MS);
    return () => clearInterval(timer);
  }, [offer]);

  if (!offer) return null;

  const when = now !== null ? formatSavedAgo(offer.savedAt, now) : null;

  return (
    <div
      role="status"
      className={cn(
        "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-(--radius) border",
        "border-primary/30 bg-primary/5 px-3 py-2",
        className,
      )}
    >
      <History className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />

      <p className="min-w-0 flex-1 text-xs leading-snug">
        <span className="font-medium">Unsaved work from your last session</span>
        <span className="text-muted-foreground">
          {offer.label ? ` · ${offer.label}` : ""}
          {when ? ` · ${when}` : ""}
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button size="sm" className="h-7 px-2.5 text-xs" onClick={restore}>
          Restore
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={dismiss}
          aria-label="Discard the saved draft"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
