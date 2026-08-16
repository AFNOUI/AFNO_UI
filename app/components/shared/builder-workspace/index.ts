/**
 * Builder workspace — many saved builds per builder.
 *
 * Layered like `builder-header/` and `builder-draft/`:
 *   controls/   — the saved-builds dialog and the restore strip
 *
 * There is no assembled component at the folder root on purpose: both surfaces
 * are placed by `<BuilderHeader />`, which keeps owning *where* builder chrome
 * lands.
 *
 * Relationship to `builder-draft/`: the draft system keeps one autosaved
 * snapshot per builder, which is enough to survive a refresh but means the
 * second thing you build overwrites the first. The workspace keeps a list, and
 * reuses the draft system's `formatSavedAgo` so both report time the same way.
 */

// ── Controls ──────────────────────────────────────────────────────────────
export { WorkspacePanel, type WorkspacePanelProps } from "./controls/WorkspacePanel";
export {
    WorkspaceRestorePrompt,
    type WorkspaceRestorePromptProps,
} from "./controls/WorkspaceRestorePrompt";

// ── Logic & contracts ─────────────────────────────────────────────────────
export { useBuilderWorkspace } from "./hooks";
export {
    docKey,
    indexKey,
    readDoc,
    readIndex,
    writeDoc,
    writeIndex,
    deleteDoc,
    newDocId,
    uniqueName,
    formatBytes,
    serializeDoc,
    storageAvailable,
    markSessionVisited,
    migrateLegacyDraft,
} from "./utils";
export {
    WORKSPACE_KEY_PREFIX,
    WORKSPACE_MAX_DOCS,
    WORKSPACE_MAX_BYTES,
    WORKSPACE_DEBOUNCE_MS,
    WORKSPACE_SCHEMA_VERSION,
    WORKSPACE_SESSION_PREFIX,
    WORKSPACE_UNTITLED,
} from "./constants";
export type {
    WorkspaceIndex,
    WorkspaceOffer,
    WorkspaceDocMeta,
    BuilderWorkspaceId,
    BuilderWorkspaceApi,
    WorkspaceDocEnvelope,
    BuilderWorkspaceStatus,
    BuilderWorkspaceHeaderState,
    UseBuilderWorkspaceOptions,
} from "./types";
