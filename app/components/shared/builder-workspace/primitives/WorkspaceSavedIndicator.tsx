"use client";

import * as React from "react";
import { Check, CloudOff, PencilLine } from "lucide-react";

import { cn } from "@/lib/utils";

// Deep import, not the `builder-header` barrel: `<BuilderHeader />` imports
// *this* file, so going through the barrel would close an import cycle between
// the two systems. `ToolbarTip` itself depends on nothing but `ui/tooltip`.
import { ToolbarTip } from "@/components/shared/builder-header/primitives/ToolbarTip";

import { formatSavedAgo } from "@/components/shared/builder-draft";

import { WORKSPACE_TICK_MS } from "../constants";
import type { BuilderWorkspaceHeaderState } from "../types";

export interface WorkspaceSavedIndicatorProps {
    workspace: BuilderWorkspaceHeaderState;
    className?: string;
}

/**
 * PRIMITIVE — the save-state caption beside the builder title.
 *
 * Since nothing autosaves, this is the only thing standing between someone and
 * closing a tab on an hour of work, so "unsaved changes" is stated plainly and
 * in a colour that carries: a muted grey caption is what people learn to stop
 * reading.
 *
 * Borderless and muted otherwise, matching `StatChip` — it reports a fact, it
 * is not a control, and a bordered pill beside the page title would read as
 * one. Owns its own 30-second tick so relative time stays honest without the
 * workspace hook re-rendering the whole builder once a second.
 */
export function WorkspaceSavedIndicator({ workspace, className }: WorkspaceSavedIndicatorProps) {
    const { dirty, error, unavailable, savedAt, activeName } = workspace;
    const [now, setNow] = React.useState<number | null>(null);

    // Starts null and is filled in on the client. The server cannot know what
    // "2m ago" means, and rendering a guess would be a hydration mismatch.
    React.useEffect(() => {
        if (savedAt === null) return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), WORKSPACE_TICK_MS);
        return () => clearInterval(timer);
    }, [savedAt]);

    if (unavailable || error) {
        return (
            <Caption
                tone="warn"
                className={className}
                tip={
                    unavailable
                        ? "Saving is unavailable — this browser blocked local storage. Export your code or JSON to keep this build."
                        : "The last save was refused — storage is full, or this build is past the size cap. Export your code or JSON to keep it."
                }
            >
                <CloudOff className="h-3 w-3 shrink-0" />
                {unavailable ? "Can't save" : "Save failed"}
            </Caption>
        );
    }

    if (dirty) {
        return (
            <Caption
                tone="warn"
                className={className}
                tip={
                    activeName
                        ? `Changes since you last saved "${activeName}". Nothing is stored until you save.`
                        : "This build is not saved anywhere yet. Nothing is stored until you save."
                }
            >
                <PencilLine className="h-3 w-3 shrink-0" />
                Unsaved changes
            </Caption>
        );
    }

    if (savedAt === null) return null;

    return (
        <Caption tone="muted" className={className} tip="Saved to this browser only. Export your code or JSON to keep it.">
            <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
            {now !== null ? `Saved ${formatSavedAgo(savedAt, now)}` : "Saved"}
        </Caption>
    );
}

function Caption({
    tip,
    tone,
    className,
    children,
}: {
    tip: string;
    tone: "warn" | "muted";
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <ToolbarTip tip={tip}>
            <span
                className={cn(
                    "inline-flex cursor-help items-center gap-1 whitespace-nowrap text-xs",
                    tone === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground",
                    className,
                )}
            >
                {children}
            </span>
        </ToolbarTip>
    );
}
