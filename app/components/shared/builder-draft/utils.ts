/**
 * Pure helpers for the builder draft system. No React.
 *
 * Every storage call is wrapped: localStorage throws on quota exhaustion, and
 * simply reading it throws outright in Safari's private mode and in any
 * embedded context with third-party storage blocked. A builder must not crash
 * because autosave is unavailable, so every failure degrades to "no draft".
 */

import {
  DRAFT_KEY_PREFIX,
  DRAFT_MAX_AGE_MS,
  DRAFT_MAX_BYTES,
  DRAFT_SCHEMA_VERSION,
} from "./constants";
import type { BuilderDraftEnvelope, BuilderDraftId, BuilderDraftOffer } from "./types";

/** localStorage key for a builder. */
export function draftKey(id: BuilderDraftId): string {
  return `${DRAFT_KEY_PREFIX}${id}`;
}

/** `localStorage`, or `null` when it is unavailable for any reason. */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Serialize a snapshot, or `null` when it is not JSON-representable. */
export function serializeDraft<T>(
  value: T,
  label?: string,
  savedAt = 0,
): string | null {
  const envelope: BuilderDraftEnvelope<T> = {
    version: DRAFT_SCHEMA_VERSION,
    savedAt,
    label,
    value,
  };
  try {
    return JSON.stringify(envelope);
  } catch {
    // A cyclic or non-serializable snapshot. Silently skipping is right: the
    // alternative is a toast on every keystroke for a bug the user cannot fix.
    return null;
  }
}

/**
 * Write a draft. Returns `false` when nothing was stored — an oversized
 * payload, an unserializable snapshot, or a storage error.
 */
export function writeDraft<T>(
  id: BuilderDraftId,
  value: T,
  savedAt: number,
  label?: string,
): boolean {
  const store = storage();
  if (!store) return false;

  const payload = serializeDraft(value, label, savedAt);
  if (payload === null || payload.length > DRAFT_MAX_BYTES) return false;

  try {
    store.setItem(draftKey(id), payload);
    return true;
  } catch {
    // Quota exceeded. Drop our own slot and retry once — a stale draft from
    // another builder is the likeliest thing standing between us and space.
    try {
      store.removeItem(draftKey(id));
      store.setItem(draftKey(id), payload);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Read a stored draft, or `null` when there is nothing worth offering:
 * no draft, unparseable JSON, a retired schema version, or one older than
 * `DRAFT_MAX_AGE_MS`.
 *
 * `validate` is the caller's chance to reject a payload whose *shape* is wrong
 * even though its version matches — a build that shipped between two version
 * bumps, say. Rejected drafts are removed, not left to be re-offered forever.
 */
export function readDraft<T>(
  id: BuilderDraftId,
  now: number,
  validate?: (value: unknown) => value is T,
): BuilderDraftOffer<T> | null {
  const store = storage();
  if (!store) return null;

  let raw: string | null = null;
  try {
    raw = store.getItem(draftKey(id));
  } catch {
    return null;
  }
  if (!raw) return null;

  const drop = () => {
    clearDraft(id);
    return null;
  };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return drop();
  }

  if (!parsed || typeof parsed !== "object") return drop();
  const envelope = parsed as Partial<BuilderDraftEnvelope<unknown>>;

  if (envelope.version !== DRAFT_SCHEMA_VERSION) return drop();
  if (typeof envelope.savedAt !== "number") return drop();
  if (now - envelope.savedAt > DRAFT_MAX_AGE_MS) return drop();
  if (validate && !validate(envelope.value)) return drop();

  return {
    savedAt: envelope.savedAt,
    label: typeof envelope.label === "string" ? envelope.label : undefined,
    value: envelope.value as T,
  };
}

/** Remove a builder's stored draft. Never throws. */
export function clearDraft(id: BuilderDraftId): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(draftKey(id));
  } catch {
    /* nothing to do — the draft is unreachable either way */
  }
}

/**
 * "just now" / "2m ago" / "3h ago" / "yesterday" / "12 Mar".
 *
 * Coarse on purpose. A per-second countdown next to a title is a distraction,
 * and the only question this caption answers is "did my work get saved?".
 */
export function formatSavedAgo(savedAt: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - savedAt) / 1000));
  if (seconds < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(savedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
