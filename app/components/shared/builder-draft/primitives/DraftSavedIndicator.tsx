"use client";

import * as React from "react";
import { Check, CloudOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Deep import, not the `builder-header` barrel: `<BuilderHeader />` imports
// *this* file, so going through the barrel would close an import cycle between
// the two systems. `ToolbarTip` itself depends on nothing but `ui/tooltip`.
import { ToolbarTip } from "@/components/shared/builder-header/primitives/ToolbarTip";

import { formatSavedAgo } from "../utils";
import { DRAFT_TICK_MS } from "../constants";
import type { BuilderDraftStatus } from "../types";

export interface DraftSavedIndicatorProps {
  status: BuilderDraftStatus;
  savedAt: number | null;
  className?: string;
}

/**
 * PRIMITIVE — the "saved 2m ago" caption beside the builder title.
 *
 * Borderless and muted, matching `StatChip`: this reports a fact, it is not a
 * control, and a bordered pill next to the page title would read as one.
 *
 * Owns its own 30-second tick so the relative time stays honest without the
 * autosave hook re-rendering the whole builder once a second.
 */
export function DraftSavedIndicator({
  status,
  savedAt,
  className,
}: DraftSavedIndicatorProps) {
  const [now, setNow] = React.useState<number | null>(null);

  // Starts null and is filled in on the client. The server cannot know what
  // "2m ago" means, and rendering a guess would be a hydration mismatch.
  React.useEffect(() => {
    if (savedAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), DRAFT_TICK_MS);
    return () => clearInterval(timer);
  }, [savedAt]);

  if (status === "idle") return null;

  if (status === "error") {
    return (
      <ToolbarTip tip="Autosave is unavailable — this browser blocked local storage, or the build is too large to store. Export your JSON before leaving.">
        <span
          className={cn(
            "inline-flex cursor-help items-center gap-1 whitespace-nowrap text-xs text-amber-600 dark:text-amber-400",
            className,
          )}
        >
          <CloudOff className="h-3 w-3 shrink-0" />
          Not saved
        </span>
      </ToolbarTip>
    );
  }

  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
        Saving…
      </span>
    );
  }

  return (
    <ToolbarTip tip="Saved to this browser only. Export your code or JSON to keep it.">
      <span
        className={cn(
          "inline-flex cursor-help items-center gap-1 whitespace-nowrap text-xs text-muted-foreground",
          className,
        )}
      >
        <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
        {savedAt !== null && now !== null ? `Saved ${formatSavedAgo(savedAt, now)}` : "Saved"}
      </span>
    </ToolbarTip>
  );
}
