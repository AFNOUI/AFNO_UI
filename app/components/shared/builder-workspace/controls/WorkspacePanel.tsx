"use client";

/**
 * CONTROL — the saved-builds list.
 *
 * A builder's toolbar button opens this; the header decides where the button
 * lands, exactly as it does for templates, JSON and undo. Every row is one
 * saved build: open it, rename it, copy it, delete it.
 *
 * Two deliberate refusals:
 *
 * - **Delete asks first, and says what it is deleting by name.** These are
 *   builds someone spent time on, and there is no undo once localStorage is
 *   gone.
 * - **The document cap is stated, not enforced silently.** At the limit the
 *   panel says so and asks you to delete one, rather than quietly evicting the
 *   oldest build to make room.
 */

import * as React from "react";
import {
    Check,
    Copy,
    FolderOpen,
    Pencil,
    Save,
    Trash2,
    TriangleAlert,
    X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { formatSavedAgo } from "@/components/shared/builder-draft";

import { WORKSPACE_MAX_DOCS, WORKSPACE_TICK_MS, WORKSPACE_UNTITLED } from "../constants";
import { formatBytes } from "../utils";
import type { BuilderWorkspaceHeaderState, WorkspaceDocMeta } from "../types";

export interface WorkspacePanelProps {
    workspace: BuilderWorkspaceHeaderState;
    /** Default name offered when saving the current build. */
    suggestedName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

export function WorkspacePanel({
    workspace,
    suggestedName,
    open,
    onOpenChange,
    className,
}: WorkspacePanelProps) {
    const { docs, activeDocId, unavailable, restore, saveAs, rename, remove, duplicate } = workspace;

    const [internalOpen, setInternalOpen] = React.useState(false);
    const isOpen = open ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    const [now, setNow] = React.useState<number | null>(null);
    const [renamingId, setRenamingId] = React.useState<string | null>(null);
    const [renameValue, setRenameValue] = React.useState("");
    const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
    const [saveName, setSaveName] = React.useState("");

    React.useEffect(() => {
        if (!isOpen) return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), WORKSPACE_TICK_MS);
        return () => clearInterval(timer);
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen) setSaveName(suggestedName ?? WORKSPACE_UNTITLED);
    }, [isOpen, suggestedName]);

    const atCapacity = docs.length >= WORKSPACE_MAX_DOCS;

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-8 gap-1.5", className)}>
                    <FolderOpen className="h-3.5 w-3.5" />
                    Saved
                    {/* A span, not `Badge`: this is inside a <button>, whose
                        content model is phrasing content, and `Badge` is a div. */}
                    {docs.length > 0 && (
                        <span className="ms-0.5 rounded-full bg-secondary px-1.5 text-[10px] font-medium text-secondary-foreground">
                            {docs.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Saved builds</DialogTitle>
                    <DialogDescription>
                        Stored in this browser only — nothing is uploaded. Your most recent build is
                        restored automatically when you come back to this tab.
                    </DialogDescription>
                </DialogHeader>

                {unavailable ? (
                    <Notice>
                        Saving is unavailable in this browser — private mode and blocked site data
                        both switch it off. The builder works normally; nothing is being kept.
                    </Notice>
                ) : (
                    <div className="space-y-4">
                        {/* Save the current build under a name of its own. */}
                        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3">
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <label
                                    htmlFor="workspace-save-name"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Save the current build as
                                </label>
                                <Input
                                    id="workspace-save-name"
                                    value={saveName}
                                    onChange={(event) => setSaveName(event.target.value)}
                                    placeholder={WORKSPACE_UNTITLED}
                                    className="h-8"
                                />
                            </div>
                            <Button
                                size="sm"
                                className="h-8 gap-1.5"
                                disabled={atCapacity}
                                onClick={() => {
                                    saveAs(saveName);
                                    setSaveName(suggestedName ?? WORKSPACE_UNTITLED);
                                }}
                            >
                                <Save className="h-3.5 w-3.5" />
                                Save
                            </Button>
                        </div>

                        {atCapacity && (
                            <Notice>
                                You have {WORKSPACE_MAX_DOCS} saved builds, the maximum. Delete one to
                                save another — nothing is removed automatically.
                            </Notice>
                        )}

                        {docs.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                No saved builds yet. Edit anything and it is kept automatically, or
                                use Save above to name this one.
                            </p>
                        ) : (
                            <ul className="max-h-[45vh] space-y-1.5 overflow-y-auto">
                                {docs.map((doc) => (
                                    <li key={doc.id}>
                                        <DocRow
                                            doc={doc}
                                            now={now}
                                            isActive={doc.id === activeDocId}
                                            isRenaming={renamingId === doc.id}
                                            isConfirming={confirmingId === doc.id}
                                            renameValue={renameValue}
                                            atCapacity={atCapacity}
                                            onRenameValue={setRenameValue}
                                            onStartRename={() => {
                                                setRenamingId(doc.id);
                                                setRenameValue(doc.name);
                                            }}
                                            onCommitRename={() => {
                                                rename(doc.id, renameValue);
                                                setRenamingId(null);
                                            }}
                                            onCancelRename={() => setRenamingId(null)}
                                            onRestore={() => {
                                                restore(doc.id);
                                                setOpen(false);
                                            }}
                                            onDuplicate={() => duplicate(doc.id)}
                                            onAskDelete={() => setConfirmingId(doc.id)}
                                            onCancelDelete={() => setConfirmingId(null)}
                                            onConfirmDelete={() => {
                                                remove(doc.id);
                                                setConfirmingId(null);
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Notice({ children }: { children: React.ReactNode }) {
    return (
        <p className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{children}</span>
        </p>
    );
}

interface DocRowProps {
    doc: WorkspaceDocMeta;
    now: number | null;
    isActive: boolean;
    isRenaming: boolean;
    isConfirming: boolean;
    renameValue: string;
    atCapacity: boolean;
    onRenameValue: (value: string) => void;
    onStartRename: () => void;
    onCommitRename: () => void;
    onCancelRename: () => void;
    onRestore: () => void;
    onDuplicate: () => void;
    onAskDelete: () => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
}

function DocRow({
    doc,
    now,
    isActive,
    isRenaming,
    isConfirming,
    renameValue,
    atCapacity,
    onRenameValue,
    onStartRename,
    onCommitRename,
    onCancelRename,
    onRestore,
    onDuplicate,
    onAskDelete,
    onCancelDelete,
    onConfirmDelete,
}: DocRowProps) {
    if (isConfirming) {
        return (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="min-w-0 flex-1 text-xs leading-snug">
                    Delete <span className="font-medium">{doc.name}</span>? This cannot be undone.
                </p>
                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={onConfirmDelete}>
                    Delete
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancelDelete}>
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-2 rounded-lg border p-2.5 transition-colors",
                isActive ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/30",
            )}
        >
            {isRenaming ? (
                <>
                    <Input
                        autoFocus
                        value={renameValue}
                        onChange={(event) => onRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") onCommitRename();
                            if (event.key === "Escape") onCancelRename();
                        }}
                        className="h-7 min-w-0 flex-1 text-xs"
                        aria-label={`Rename ${doc.name}`}
                    />
                    <Button size="sm" className="h-7 w-7 p-0" onClick={onCommitRename}>
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancelRename}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </>
            ) : (
                <>
                    <div className="min-w-0 flex-1">
                        {/* A div, not a p: `Badge` renders a div, and a div
                            inside a p is invalid HTML — the browser closes the
                            p early and React reports a hydration mismatch. */}
                        <div className="flex items-center gap-2 truncate text-sm font-medium">
                            {doc.name}
                            {isActive && (
                                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                    current
                                </Badge>
                            )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {now !== null ? formatSavedAgo(doc.savedAt, now) : "—"} ·{" "}
                            {formatBytes(doc.bytes)}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            size="sm"
                            variant={isActive ? "ghost" : "outline"}
                            className="h-7 px-2.5 text-xs"
                            onClick={onRestore}
                            disabled={isActive}
                        >
                            {isActive ? "Open" : "Restore"}
                        </Button>
                        <IconButton label={`Rename ${doc.name}`} onClick={onStartRename}>
                            <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                            label={`Duplicate ${doc.name}`}
                            onClick={onDuplicate}
                            disabled={atCapacity}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton label={`Delete ${doc.name}`} onClick={onAskDelete} destructive>
                            <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                    </div>
                </>
            )}
        </div>
    );
}

function IconButton({
    label,
    onClick,
    disabled,
    destructive,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Button
            size="sm"
            variant="ghost"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-7 w-7 p-0 text-muted-foreground",
                destructive ? "hover:text-destructive" : "hover:text-foreground",
            )}
        >
            {children}
        </Button>
    );
}
