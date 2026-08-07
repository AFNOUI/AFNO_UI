"use client";

/**
 * Stateful logic for the builder draft (autosave) system.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DRAFT_DEBOUNCE_MS } from "./constants";
import { clearDraft, readDraft, serializeDraft, writeDraft } from "./utils";
import type {
  BuilderDraftApi,
  BuilderDraftOffer,
  BuilderDraftStatus,
  UseBuilderDraftOptions,
} from "./types";

/**
 * Persists a builder's working state to localStorage and offers it back on the
 * next visit.
 *
 * Behaviour worth knowing:
 *
 * - **The boot state is never written.** Opening a builder and touching
 *   nothing leaves storage alone, so a stray page visit cannot manufacture a
 *   "restore last session" prompt for work that does not exist. The first
 *   snapshot is adopted as a baseline; only a *change* from it starts saving.
 * - **A found draft is offered, never applied.** Silently replacing what the
 *   user is looking at is the one behaviour that turns autosave from a rescue
 *   into a hazard. The page decides what "apply" means for its own state shape.
 * - **The offer survives being overwritten.** Its payload is held in React
 *   state, so a user who ignores the prompt and starts editing (which writes a
 *   new draft over the old one) can still click Restore.
 * - **Writes are debounced and de-duplicated** against the last serialization,
 *   so undo → redo back to the same config is one write, not three.
 */
export function useBuilderDraft<T>({
  id,
  snapshot,
  deps,
  label,
  onRestore,
  validate,
  disabled = false,
}: UseBuilderDraftOptions<T>): BuilderDraftApi<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller by design
  const value = useMemo(snapshot, deps);

  const [status, setStatus] = useState<BuilderDraftStatus>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [offer, setOffer] = useState<BuilderDraftOffer<T> | null>(null);

  /**
   * Last payload we either wrote or adopted as the baseline. `null` means
   * "adopt the next snapshot without writing it" — the state on boot and after
   * `clear()`.
   */
  const lastWrittenRef = useRef<string | null>(null);

  // `validate` and `onRestore` are almost always inline arrows. Reading them
  // through refs is what keeps the mount effect running exactly once and
  // `restore` referentially stable enough to memoize the header bundle.
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  // ── Look for a previous session, once, on the client ────────────────────
  useEffect(() => {
    if (disabled) return;
    const found = readDraft<T>(id, Date.now(), validateRef.current);
    // Deliberately does not set `savedAt`: the header caption means "your
    // current work is safe", and an unrestored draft from Tuesday is not that.
    if (found) setOffer(found);
  }, [id, disabled]);

  // Lets the debounced write report an accurate resting state without taking
  // `savedAt` as a dependency (which would restart the timer on every save).
  const savedAtRef = useRef<number | null>(null);
  savedAtRef.current = savedAt;

  // ── Autosave ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (disabled) return;

    // Adopt the boot snapshot as the baseline without writing it. This is the
    // one place serialization happens outside the debounce window — it is a
    // single call at mount, and having the baseline early is what lets the
    // first real edit be recognised as a change.
    if (lastWrittenRef.current === null) {
      lastWrittenRef.current = serializeDraft(value, label) ?? "";
      return;
    }

    setStatus("pending");
    const timer = setTimeout(() => {
      // Serializing here rather than in the effect body means a burst of
      // keystrokes costs one stringify, not one per character — which is what
      // keeps a 1,000-row table's autosave off the typing path.
      const payload = serializeDraft(value, label);
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
      const ok = writeDraft(id, value, now, label);
      lastWrittenRef.current = payload;
      if (ok) {
        setSavedAt(now);
        setStatus("saved");
      } else {
        setStatus("error");
      }
    }, DRAFT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [id, value, label, disabled]);

  const restore = useCallback(() => {
    if (!offer) return;
    setOffer(null);
    // The restored value flows back through `deps`, so the autosave effect
    // re-writes it as the current draft on the next tick. No special-casing.
    onRestoreRef.current(offer.value);
  }, [offer]);

  const dismiss = useCallback(() => {
    setOffer(null);
    clearDraft(id);
  }, [id]);

  const clear = useCallback(() => {
    setOffer(null);
    clearDraft(id);
    setSavedAt(null);
    setStatus("idle");
    lastWrittenRef.current = null;
  }, [id]);

  // Payload-free, so the header re-renders only when the caption or the
  // presence of an offer actually changes — not on every keystroke.
  const header = useMemo(
    () => ({
      status,
      savedAt,
      offer: offer ? { savedAt: offer.savedAt, label: offer.label } : null,
      restore,
      dismiss,
    }),
    [status, savedAt, offer, restore, dismiss],
  );

  return useMemo(
    () => ({ status, savedAt, offer, restore, dismiss, clear, header }),
    [status, savedAt, offer, restore, dismiss, clear, header],
  );
}
