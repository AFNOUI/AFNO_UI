"use client";

/**
 * CONTROL — "Pick up where you left off?" strip.
 *
 * Sits inside the builder header rather than floating over the canvas: it
 * concerns the whole build, and a toast would expire before someone who just
 * reopened the tab has finished reading it.
 *
 * Only ever shown for a *new* session — a same-tab return restores silently, so
 * seeing this means real time has passed and naming the document is the point.
 */

import * as React from "react";
import { History, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { formatSavedAgo } from "@/components/shared/builder-draft";

import { WORKSPACE_TICK_MS } from "../constants";
import type { BuilderWorkspaceHeaderState } from "../types";

export interface WorkspaceRestorePromptProps {
    workspace: BuilderWorkspaceHeaderState;
    /** Opens the full list. Rendered only when there is more than one document. */
    onBrowse?: () => void;
    className?: string;
}

export function WorkspaceRestorePrompt({
    workspace,
    onBrowse,
    className,
}: WorkspaceRestorePromptProps) {
    const { offer, docs, restore, dismissOffer } = workspace;
    const [now, setNow] = React.useState<number | null>(null);

    // Client-only: the server has no "14m ago" to render, and guessing one is a
    // hydration mismatch.
    React.useEffect(() => {
        if (!offer) return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), WORKSPACE_TICK_MS);
        return () => clearInterval(timer);
    }, [offer]);

    if (!offer) return null;

    const when = now !== null ? formatSavedAgo(offer.savedAt, now) : null;
    const others = docs.length - 1;

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
                <span className="font-medium">Pick up where you left off</span>
                <span className="text-muted-foreground">
                    {` · ${offer.name}`}
                    {when ? ` · ${when}` : ""}
                </span>
            </p>

            <div className="flex shrink-0 items-center gap-1.5">
                <Button
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => restore(offer.docId)}
                >
                    Restore
                </Button>
                {others > 0 && onBrowse && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs"
                        onClick={onBrowse}
                    >
                        {others} more saved
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissOffer}
                    aria-label="Dismiss — the save is kept"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
