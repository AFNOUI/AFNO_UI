"use client";

/**
 * The workspace engine: autosave into the active document, plus save-as,
 * rename, duplicate and delete across a list of them.
 *
 * Behaviour worth knowing, most of it inherited from `builder-draft` because it
 * was right there:
 *
 * - **The boot state is never written.** Opening a builder and touching nothing
 *   creates no document, so browsing to a builder cannot litter the workspace
 *   with empty builds.
 * - **Writes are debounced and de-duplicated** against the last serialization,
 *   so undo → redo back to the same config is one write, not three.
 * - **A document from a previous session is offered, never applied.** Silently
 *   replacing what someone is looking at is how autosave stops being a rescue.
 * - **Returning within the same tab restores silently.** Navigating away
 *   unmounts the builder and destroys its in-memory state, so coming back shows
 *   a *default* build — there is nothing on screen worth protecting, and
 *   prompting to restore work you never finished is friction, not safety. The
 *   distinction is a `sessionStorage` bit that dies with the tab.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WORKSPACE_DEBOUNCE_MS, WORKSPACE_MAX_DOCS, WORKSPACE_UNTITLED } from "./constants";
import {
    deleteDoc,
    markSessionVisited,
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
    BuilderWorkspaceStatus,
    UseBuilderWorkspaceOptions,
    WorkspaceDocMeta,
    WorkspaceOffer,
} from "./types";

export function useBuilderWorkspace<T>({
    id,
    snapshot,
    deps,
    label,
    onRestore,
    validate,
    disabled = false,
}: UseBuilderWorkspaceOptions<T>): BuilderWorkspaceApi<T> {
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller by design
    const value = useMemo(snapshot, deps);

    const [docs, setDocs] = useState<WorkspaceDocMeta[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const [offer, setOffer] = useState<WorkspaceOffer | null>(null);
    const [status, setStatus] = useState<BuilderWorkspaceStatus>("idle");
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [unavailable, setUnavailable] = useState(false);

    /**
     * Last payload written or adopted as the baseline. `null` means "adopt the
     * next snapshot without writing it" — the state at boot.
     */
    const lastWrittenRef = useRef<string | null>(null);

    // These are almost always inline arrows. Reading them through refs keeps the
    // mount effect running exactly once.
    const validateRef = useRef(validate);
    validateRef.current = validate;
    const onRestoreRef = useRef(onRestore);
    onRestoreRef.current = onRestore;
    const labelRef = useRef(label);
    labelRef.current = label;

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

        const active = stored.find((doc) => doc.active) ?? stored[0];
        const seenThisSession = markSessionVisited(id);

        if (seenThisSession) {
            // Same tab, second visit: the builder just booted to defaults, so
            // there is nothing to overwrite. Put the work back.
            const restored = readDoc<T>(id, active.id, validateRef.current);
            if (restored !== null) {
                setActiveDocId(active.id);
                setSavedAt(active.savedAt);
                setStatus("saved");
                onRestoreRef.current(restored);
                return;
            }
        }

        // A new session — ask before replacing anything.
        setOffer({ docId: active.id, name: active.name, savedAt: active.savedAt });
    }, [id, disabled]);

    const savedAtRef = useRef<number | null>(null);
    savedAtRef.current = savedAt;
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

    // ── Autosave into the active document ───────────────────────────────────
    useEffect(() => {
        if (disabled || unavailable) return;

        // Adopt the boot snapshot as the baseline without writing it.
        if (lastWrittenRef.current === null) {
            lastWrittenRef.current = serializeDoc(value, 0) ?? "";
            return;
        }

        setStatus("pending");
        const timer = setTimeout(() => {
            // Serializing inside the debounce means a burst of keystrokes costs
            // one stringify, not one per character.
            const payload = serializeDoc(value, 0);
            if (payload === null) {
                setStatus("error");
                return;
            }
            if (payload === lastWrittenRef.current) {
                // Edited and undone back to the stored state — nothing to write.
                setStatus(savedAtRef.current === null ? "idle" : "saved");
                return;
            }

            const now = Date.now();
            const current = docsRef.current;
            let docId = activeDocIdRef.current;

            if (docId === null) {
                if (current.length >= WORKSPACE_MAX_DOCS) {
                    // Refuse rather than evict someone's oldest build.
                    setStatus("error");
                    return;
                }
                docId = newDocId();
            }

            const result = writeDoc(id, docId, value, now);
            if (!result.ok) {
                setStatus("error");
                return;
            }

            lastWrittenRef.current = payload;
            setActiveDocId(docId);

            const existing = current.find((doc) => doc.id === docId);
            const meta: WorkspaceDocMeta = existing
                ? { ...existing, savedAt: now, bytes: result.bytes, active: true }
                : {
                      id: docId,
                      name: uniqueName(current, labelRef.current ?? WORKSPACE_UNTITLED),
                      savedAt: now,
                      createdAt: now,
                      bytes: result.bytes,
                      active: true,
                  };

            commitDocs([
                meta,
                ...current.filter((doc) => doc.id !== docId).map((doc) => ({ ...doc, active: false })),
            ]);
            setSavedAt(now);
            setStatus("saved");
        }, WORKSPACE_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [id, value, disabled, unavailable, commitDocs]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const restore = useCallback(
        (docId: string) => {
            const restored = readDoc<T>(id, docId, validateRef.current);
            setOffer(null);
            if (restored === null) return;

            const meta = docsRef.current.find((doc) => doc.id === docId);
            setActiveDocId(docId);
            setSavedAt(meta?.savedAt ?? null);
            setStatus("saved");
            commitDocs(docsRef.current.map((doc) => ({ ...doc, active: doc.id === docId })));
            // The restored value flows back through `deps`, so the autosave
            // effect re-adopts it on the next tick. No special-casing.
            onRestoreRef.current(restored);
        },
        [id, commitDocs],
    );

    /** Keep the document, stop advertising it. Deleting is a separate act. */
    const dismissOffer = useCallback(() => setOffer(null), []);

    const saveAs = useCallback(
        (name: string) => {
            if (docsRef.current.length >= WORKSPACE_MAX_DOCS) return;
            const now = Date.now();
            const docId = newDocId();
            const result = writeDoc(id, docId, value, now);
            if (!result.ok) {
                setStatus("error");
                return;
            }
            lastWrittenRef.current = serializeDoc(value, 0);
            setActiveDocId(docId);
            setSavedAt(now);
            setStatus("saved");
            commitDocs([
                {
                    id: docId,
                    name: uniqueName(docsRef.current, name),
                    savedAt: now,
                    createdAt: now,
                    bytes: result.bytes,
                    active: true,
                },
                ...docsRef.current.map((doc) => ({ ...doc, active: false })),
            ]);
        },
        [id, value, commitDocs],
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
            const next = commitDocs(docsRef.current.filter((doc) => doc.id !== docId));
            setOffer((current) => (current?.docId === docId ? null : current));
            if (activeDocIdRef.current === docId) {
                // The next edit starts a fresh document rather than silently
                // writing into someone else's.
                setActiveDocId(null);
                setSavedAt(null);
                setStatus(next.length === 0 ? "idle" : "saved");
                lastWrittenRef.current = null;
            }
        },
        [id, commitDocs],
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
            if (!result.ok) return;

            commitDocs([
                {
                    id: copyId,
                    name: uniqueName(docsRef.current, source.name),
                    savedAt: now,
                    createdAt: now,
                    bytes: result.bytes,
                },
                ...docsRef.current,
            ]);
        },
        [id, commitDocs],
    );

    const clearAll = useCallback(() => {
        for (const doc of docsRef.current) deleteDoc(id, doc.id);
        commitDocs([]);
        setOffer(null);
        setActiveDocId(null);
        setSavedAt(null);
        setStatus("idle");
        lastWrittenRef.current = null;
    }, [id, commitDocs]);

    const header = useMemo(
        () => ({
            status,
            savedAt,
            docs,
            activeDocId,
            offer,
            unavailable,
            restore,
            dismissOffer,
            saveAs,
            rename,
            remove,
            duplicate,
        }),
        [
            status,
            savedAt,
            docs,
            activeDocId,
            offer,
            unavailable,
            restore,
            dismissOffer,
            saveAs,
            rename,
            remove,
            duplicate,
        ],
    );

    return useMemo(() => ({ ...header, clearAll, header }), [header, clearAll]);
}
