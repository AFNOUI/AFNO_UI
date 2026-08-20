"use client";

/**
 * The workspace engine: a list of saved builds per builder, written **only when
 * asked**.
 *
 * There is no autosave. An earlier version debounced every edit into the open
 * document, which meant switching template quietly rewrote the build you had
 * saved under the old one — you would open "Invoice calculator" and get the
 * order summary back. Saving is now the one thing that writes:
 *
 * - **Working is free.** Edit, switch template, undo, start over — nothing
 *   touches storage until you press a button. The cost is the honest one: an
 *   unsaved build does not survive a refresh, and the header says so.
 * - **Two ways to save.** `update()` writes into the build you have open —
 *   the checkpoint you already named. `saveAs()` branches it off as a new one.
 *   Nothing else writes a payload.
 * - **Opening a build is what makes it yours to update.** Until you open one,
 *   `update()` is unavailable and your work belongs to no document.
 * - **Switching what you build detaches.** Loading a different template is
 *   starting over, not editing the thing you opened, so the open document is
 *   released rather than left waiting to be overwritten by a stray Update.
 * - **Coming back reopens.** Refresh, new tab or same-tab return: the builder
 *   opens on the build you were last in, else the newest readable one, else its
 *   own defaults.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WORKSPACE_DIRTY_DEBOUNCE_MS, WORKSPACE_MAX_DOCS, WORKSPACE_UNTITLED } from "./constants";
import {
    deleteDoc,
    migrateLegacyDraft,
    newDocId,
    readDoc,
    readIndex,
    serializeDoc,
    storageAvailable,
    uniqueName,
    writeDoc,
    writeIndex,
} from "./utils";
import type {
    BuilderWorkspaceApi,
    UseBuilderWorkspaceOptions,
    WorkspaceDocMeta,
    WorkspaceIdentity,
} from "./types";

/**
 * `undefined` on a document means "written before identities existed" — those
 * are adopted rather than orphaned. Normalizing here keeps that meaning free
 * for the storage layer while letting a builder pass `undefined` (the form
 * builder starts with no template selected) as a real value.
 */
function normalizeIdentity(identity: WorkspaceIdentity): string | null {
    return identity === undefined || identity === null ? null : String(identity);
}

export function useBuilderWorkspace<T>({
    id,
    snapshot,
    deps,
    label,
    identity,
    onRestore,
    validate,
    disabled = false,
}: UseBuilderWorkspaceOptions<T>): BuilderWorkspaceApi<T> {
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller by design
    const value = useMemo(snapshot, deps);
    const docIdentity = normalizeIdentity(identity);

    const [docs, setDocs] = useState<WorkspaceDocMeta[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(false);
    const [unavailable, setUnavailable] = useState(false);

    /**
     * Serialization of the last state that was saved or opened. Everything
     * `dirty` means is "the build on screen no longer matches this". `null` is
     * the pre-boot state: adopt the next snapshot without calling it a change.
     */
    const baselineRef = useRef<string | null>(null);
    /** Set when a restore supplies the next value, so it is not read as an edit. */
    const baselineIsIncomingRef = useRef(false);

    // These are almost always inline arrows. Reading them through refs keeps the
    // mount effect running exactly once.
    const validateRef = useRef(validate);
    validateRef.current = validate;
    const onRestoreRef = useRef(onRestore);
    onRestoreRef.current = onRestore;
    const labelRef = useRef(label);
    labelRef.current = label;

    // ── Track whether the build on screen has drifted from the saved one ────
    // Declared *before* the loader on purpose. Both run in the mount commit,
    // and this one has to claim the boot snapshot as its baseline before the
    // loader replaces it — otherwise this effect consumes the loader's
    // "the value is on its way" flag a commit early, and a page that merely
    // reopened its last build announces unsaved changes.
    useEffect(() => {
        if (disabled || unavailable) return;

        // Boot: adopt the first snapshot as the baseline, silently.
        if (baselineRef.current === null) {
            baselineRef.current = serializeDoc(value, 0) ?? "";
            return;
        }

        // A restore set the baseline and handed the page the value that matches
        // it. This is that value landing, not an edit.
        const incoming = baselineIsIncomingRef.current;
        baselineIsIncomingRef.current = false;

        // Optimistic: a new snapshot almost always means a real edit, and the
        // caption should answer to a keystroke rather than to a timer.
        if (!incoming) setDirty(true);

        // …then confirm it. Serializing a thousand-row table per keystroke is
        // the lag this debounce exists to prevent, and undo-back-to-saved has
        // to stop reading as unsaved.
        const timer = setTimeout(() => {
            setDirty(serializeDoc(value, 0) !== baselineRef.current);
        }, WORKSPACE_DIRTY_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [value, disabled, unavailable]);

    // ── Load the workspace, once, on the client ─────────────────────────────
    useEffect(() => {
        if (disabled) return;

        if (!storageAvailable()) {
            setUnavailable(true);
            return;
        }

        let stored = readIndex(id);

        // First run after the workspace shipped: adopt whatever the old
        // single-slot autosave was holding, so nobody's in-progress build
        // disappears on upgrade.
        if (stored.length === 0) {
            const migrated = migrateLegacyDraft<T>(
                id,
                Date.now(),
                labelRef.current ?? WORKSPACE_UNTITLED,
                validateRef.current,
            );
            if (migrated) {
                stored = [migrated];
                writeIndex(id, stored);
            }
        }

        setDocs(stored);
        if (stored.length === 0) return;

        // The one you were last in, then the rest newest-first — a document
        // written by an older build fails `validate`, and that must not strand
        // you on defaults when there is a readable one behind it.
        const active = stored.find((doc) => doc.active);
        const order = active ? [active, ...stored.filter((doc) => doc.id !== active.id)] : stored;

        for (const doc of order) {
            const restored = readDoc<T>(id, doc.id, validateRef.current);
            if (restored === null) continue;

            setActiveDocId(doc.id);
            setSavedAt(doc.savedAt);
            setDirty(false);
            baselineRef.current = serializeDoc(restored, 0);
            baselineIsIncomingRef.current = true;
            onRestoreRef.current(restored, "mount");
            return;
        }
    }, [id, disabled]);

    const activeDocIdRef = useRef<string | null>(null);
    activeDocIdRef.current = activeDocId;
    const docsRef = useRef<WorkspaceDocMeta[]>([]);
    docsRef.current = docs;

    /** Persist the index, keeping React state and storage in step. */
    const commitDocs = useCallback(
        (next: WorkspaceDocMeta[]) => {
            const sorted = [...next].sort((a, b) => b.savedAt - a.savedAt);
            setDocs(sorted);
            writeIndex(id, sorted);
            return sorted;
        },
        [id],
    );

    /**
     * Release the open document. The build on screen stays exactly as it is —
     * it simply belongs to no saved document now, so the next save has to say
     * where it goes.
     */
    const detach = useCallback(() => {
        setActiveDocId(null);
        setSavedAt(null);
        setDirty(true);
    }, []);

    // ── Detach when the build changes wholesale ─────────────────────────────
    // Opening a document sets `activeDocId` and calls `onRestore` in one batch,
    // so the identity compared here is already the opened document's.
    useEffect(() => {
        if (disabled || unavailable || activeDocId === null) return;
        const open = docsRef.current.find((doc) => doc.id === activeDocId);
        if (open && open.identity !== undefined && open.identity !== docIdentity) detach();
    }, [docIdentity, activeDocId, disabled, unavailable, detach]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const restore = useCallback(
        (docId: string) => {
            const restored = readDoc<T>(id, docId, validateRef.current);
            if (restored === null) return;

            const meta = docsRef.current.find((doc) => doc.id === docId);
            setActiveDocId(docId);
            setSavedAt(meta?.savedAt ?? null);
            setDirty(false);
            setError(false);
            commitDocs(docsRef.current.map((doc) => ({ ...doc, active: doc.id === docId })));
            baselineRef.current = serializeDoc(restored, 0);
            baselineIsIncomingRef.current = true;
            onRestoreRef.current(restored, "user");
        },
        [id, commitDocs],
    );

    /** Write the build on screen into the document it came from. */
    const update = useCallback(() => {
        const docId = activeDocIdRef.current;
        if (docId === null) return;
        const open = docsRef.current.find((doc) => doc.id === docId);
        if (!open) return;

        const now = Date.now();
        const result = writeDoc(id, docId, value, now);
        if (!result.ok) {
            setError(true);
            return;
        }

        baselineRef.current = serializeDoc(value, 0);
        setDirty(false);
        setError(false);
        setSavedAt(now);
        commitDocs(
            docsRef.current.map((doc) =>
                doc.id === docId
                    ? { ...doc, savedAt: now, bytes: result.bytes, identity: docIdentity, active: true }
                    : { ...doc, active: false },
            ),
        );
    }, [id, value, docIdentity, commitDocs]);

    /** Branch the build on screen off as a document of its own. */
    const saveAs = useCallback(
        (name: string) => {
            if (docsRef.current.length >= WORKSPACE_MAX_DOCS) return;

            const now = Date.now();
            const docId = newDocId();
            const result = writeDoc(id, docId, value, now);
            if (!result.ok) {
                setError(true);
                return;
            }

            baselineRef.current = serializeDoc(value, 0);
            setDirty(false);
            setError(false);
            setActiveDocId(docId);
            setSavedAt(now);
            commitDocs([
                {
                    id: docId,
                    name: uniqueName(docsRef.current, name),
                    savedAt: now,
                    createdAt: now,
                    bytes: result.bytes,
                    identity: docIdentity,
                    active: true,
                },
                ...docsRef.current.map((doc) => ({ ...doc, active: false })),
            ]);
        },
        [id, value, docIdentity, commitDocs],
    );

    const rename = useCallback(
        (docId: string, name: string) => {
            const others = docsRef.current.filter((doc) => doc.id !== docId);
            commitDocs(
                docsRef.current.map((doc) =>
                    doc.id === docId ? { ...doc, name: uniqueName(others, name) } : doc,
                ),
            );
        },
        [commitDocs],
    );

    const remove = useCallback(
        (docId: string) => {
            deleteDoc(id, docId);
            commitDocs(docsRef.current.filter((doc) => doc.id !== docId));
            // The build stays on screen; it just has nowhere to go back to now.
            if (activeDocIdRef.current === docId) detach();
        },
        [id, commitDocs, detach],
    );

    const duplicate = useCallback(
        (docId: string) => {
            if (docsRef.current.length >= WORKSPACE_MAX_DOCS) return;
            const source = docsRef.current.find((doc) => doc.id === docId);
            const payload = readDoc<T>(id, docId, validateRef.current);
            if (!source || payload === null) return;

            const now = Date.now();
            const copyId = newDocId();
            const result = writeDoc(id, copyId, payload, now);
            if (!result.ok) {
                setError(true);
                return;
            }

            commitDocs([
                {
                    id: copyId,
                    name: uniqueName(docsRef.current, source.name),
                    savedAt: now,
                    createdAt: now,
                    bytes: result.bytes,
                    identity: source.identity,
                },
                ...docsRef.current,
            ]);
        },
        [id, commitDocs],
    );

    const clearAll = useCallback(() => {
        for (const doc of docsRef.current) deleteDoc(id, doc.id);
        commitDocs([]);
        detach();
    }, [id, commitDocs, detach]);

    const activeName = useMemo(
        () => docs.find((doc) => doc.id === activeDocId)?.name ?? null,
        [docs, activeDocId],
    );

    const header = useMemo(
        () => ({
            docs,
            activeDocId,
            activeName,
            savedAt,
            dirty,
            error,
            unavailable,
            atCapacity: docs.length >= WORKSPACE_MAX_DOCS,
            restore,
            update,
            saveAs,
            rename,
            remove,
            duplicate,
        }),
        [
            docs,
            activeDocId,
            activeName,
            savedAt,
            dirty,
            error,
            unavailable,
            restore,
            update,
            saveAs,
            rename,
            remove,
            duplicate,
        ],
    );

    return useMemo(() => ({ ...header, clearAll, header }), [header, clearAll]);
}
