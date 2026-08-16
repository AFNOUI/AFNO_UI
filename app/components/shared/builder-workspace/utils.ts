/**
 * Pure storage helpers for the builder workspace. No React.
 *
 * Every storage call is wrapped. `localStorage` throws on quota exhaustion, and
 * merely *reading* it throws outright in Safari's private mode and in any
 * embedded context with third-party storage blocked. A builder must never crash
 * because saving is unavailable, so each failure degrades to "no workspace" and
 * the UI says so rather than pretending the save worked.
 */

import { clearDraft, readDraft } from "@/components/shared/builder-draft";

import {
    WORKSPACE_KEY_PREFIX,
    WORKSPACE_MAX_BYTES,
    WORKSPACE_SCHEMA_VERSION,
    WORKSPACE_SESSION_PREFIX,
    WORKSPACE_UNTITLED,
} from "./constants";
import type {
    BuilderWorkspaceId,
    WorkspaceDocEnvelope,
    WorkspaceDocMeta,
    WorkspaceIndex,
} from "./types";

export function indexKey(id: BuilderWorkspaceId): string {
    return `${WORKSPACE_KEY_PREFIX}${id}:index`;
}

export function docKey(id: BuilderWorkspaceId, docId: string): string {
    return `${WORKSPACE_KEY_PREFIX}${id}:doc:${docId}`;
}

function storage(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function session(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

/** Is persistence available at all? Drives the panel's "not available" notice. */
export function storageAvailable(): boolean {
    return storage() !== null;
}

/**
 * Has this tab already opened this builder?
 *
 * Returns the answer *and* records the visit, so the first mount in a tab reads
 * `false` and every later one reads `true`. That single bit is what lets a
 * same-tab return restore silently while a genuine new session still asks.
 */
export function markSessionVisited(id: BuilderWorkspaceId): boolean {
    const store = session();
    if (!store) return false;
    const key = `${WORKSPACE_SESSION_PREFIX}${id}`;
    try {
        const seen = store.getItem(key) !== null;
        store.setItem(key, "1");
        return seen;
    } catch {
        return false;
    }
}

/** `crypto.randomUUID` where available, with a plain fallback. */
export function newDocId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `d${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function readIndex(id: BuilderWorkspaceId): WorkspaceDocMeta[] {
    const store = storage();
    if (!store) return [];

    let raw: string | null = null;
    try {
        raw = store.getItem(indexKey(id));
    } catch {
        return [];
    }
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as Partial<WorkspaceIndex>;
        if (parsed.version !== WORKSPACE_SCHEMA_VERSION) return [];
        if (!Array.isArray(parsed.docs)) return [];
        return parsed.docs.filter(isDocMeta).sort((a, b) => b.savedAt - a.savedAt);
    } catch {
        return [];
    }
}

function isDocMeta(value: unknown): value is WorkspaceDocMeta {
    if (!value || typeof value !== "object") return false;
    const meta = value as Partial<WorkspaceDocMeta>;
    return (
        typeof meta.id === "string" &&
        typeof meta.name === "string" &&
        typeof meta.savedAt === "number" &&
        typeof meta.createdAt === "number"
    );
}

export function writeIndex(id: BuilderWorkspaceId, docs: WorkspaceDocMeta[]): boolean {
    const store = storage();
    if (!store) return false;
    const payload: WorkspaceIndex = { version: WORKSPACE_SCHEMA_VERSION, docs };
    try {
        store.setItem(indexKey(id), JSON.stringify(payload));
        return true;
    } catch {
        return false;
    }
}

/** Serialize a document, or `null` when the snapshot is not JSON-representable. */
export function serializeDoc<T>(value: T, savedAt: number): string | null {
    const envelope: WorkspaceDocEnvelope<T> = {
        version: WORKSPACE_SCHEMA_VERSION,
        savedAt,
        value,
    };
    try {
        return JSON.stringify(envelope);
    } catch {
        // Cyclic or otherwise unserializable. Skipping silently is right: the
        // alternative is an error toast per keystroke for a bug the user cannot
        // act on.
        return null;
    }
}

export interface WriteDocResult {
    ok: boolean;
    bytes: number;
    /** Why the write was refused, for the UI to show verbatim. */
    reason?: "unserializable" | "too-large" | "storage";
}

export function writeDoc<T>(
    id: BuilderWorkspaceId,
    docId: string,
    value: T,
    savedAt: number,
): WriteDocResult {
    const store = storage();
    if (!store) return { ok: false, bytes: 0, reason: "storage" };

    const payload = serializeDoc(value, savedAt);
    if (payload === null) return { ok: false, bytes: 0, reason: "unserializable" };

    const bytes = payload.length;
    if (bytes > WORKSPACE_MAX_BYTES) return { ok: false, bytes, reason: "too-large" };

    try {
        store.setItem(docKey(id, docId), payload);
        return { ok: true, bytes };
    } catch {
        return { ok: false, bytes, reason: "storage" };
    }
}

export function readDoc<T>(
    id: BuilderWorkspaceId,
    docId: string,
    validate?: (value: unknown) => value is T,
): T | null {
    const store = storage();
    if (!store) return null;

    let raw: string | null = null;
    try {
        raw = store.getItem(docKey(id, docId));
    } catch {
        return null;
    }
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<WorkspaceDocEnvelope<unknown>>;
        if (parsed.version !== WORKSPACE_SCHEMA_VERSION) return null;
        if (validate && !validate(parsed.value)) return null;
        return parsed.value as T;
    } catch {
        return null;
    }
}

export function deleteDoc(id: BuilderWorkspaceId, docId: string): void {
    const store = storage();
    if (!store) return;
    try {
        store.removeItem(docKey(id, docId));
    } catch {
        // Nothing useful to do — the index entry is removed either way.
    }
}

/**
 * A name that does not collide with an existing one: "Sprint Board",
 * "Sprint Board 2", "Sprint Board 3". Copying a document should never produce
 * two rows a user cannot tell apart.
 */
export function uniqueName(existing: WorkspaceDocMeta[], base: string): string {
    const trimmed = base.trim() || WORKSPACE_UNTITLED;
    const taken = new Set(existing.map((doc) => doc.name));
    if (!taken.has(trimmed)) return trimmed;

    for (let suffix = 2; suffix < 1000; suffix += 1) {
        const candidate = `${trimmed} ${suffix}`;
        if (!taken.has(candidate)) return candidate;
    }
    return `${trimmed} ${Date.now()}`;
}

/** Human-readable size for the panel. */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Adopt a pre-workspace autosave draft as the first document.
 *
 * Builders autosaved to a single `afnoui:builder-draft:<id>` slot before the
 * workspace existed. Ignoring that key would look, to anyone mid-build when
 * this shipped, exactly like their work being deleted — so it is imported once
 * and then removed, which also stops the two systems writing past each other.
 *
 * Returns the imported document's metadata, or `null` when there was nothing to
 * take.
 */
export function migrateLegacyDraft<T>(
    id: BuilderWorkspaceId,
    now: number,
    fallbackName: string,
    validate?: (value: unknown) => value is T,
): WorkspaceDocMeta | null {
    const legacy = readDraft<T>(id, now, validate);
    if (!legacy) return null;

    const docId = newDocId();
    const result = writeDoc(id, docId, legacy.value, legacy.savedAt);
    if (!result.ok) return null;

    // Only drop the old key once the new copy is safely written.
    clearDraft(id);

    return {
        id: docId,
        name: legacy.label?.trim() || fallbackName,
        savedAt: legacy.savedAt,
        createdAt: legacy.savedAt,
        bytes: result.bytes,
        active: true,
    };
}
