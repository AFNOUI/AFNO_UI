/**
 * Builder workspace — many saved builds per builder, written only on request.
 *
 * Layered like `builder-header/`:
 *   primitives/ — the save-state caption
 *   controls/   — the saved-builds dialog, where saving actually happens
 *
 * There is no assembled component at the folder root on purpose: both surfaces
 * are placed by `<BuilderHeader />`, which keeps owning *where* builder chrome
 * lands.
 *
 * Nothing autosaves. `builder-draft/` — the system this replaced — debounced
 * every edit to storage; what survives of it here is `formatSavedAgo`, so both
 * report time the same way, and the legacy reader used once for migration.
 */

// ── Primitives ────────────────────────────────────────────────────────────
export {
    WorkspaceSavedIndicator,
    type WorkspaceSavedIndicatorProps,
} from "./primitives/WorkspaceSavedIndicator";

// ── Controls ──────────────────────────────────────────────────────────────
export { WorkspacePanel, type WorkspacePanelProps } from "./controls/WorkspacePanel";

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
    migrateLegacyDraft,
} from "./utils";
export {
    WORKSPACE_KEY_PREFIX,
    WORKSPACE_MAX_DOCS,
    WORKSPACE_MAX_BYTES,
    WORKSPACE_DIRTY_DEBOUNCE_MS,
    WORKSPACE_SCHEMA_VERSION,
    WORKSPACE_UNTITLED,
} from "./constants";
export type {
    WorkspaceIndex,
    WorkspaceIdentity,
    WorkspaceDocMeta,
    WorkspaceRestoreSource,
    BuilderWorkspaceId,
    BuilderWorkspaceApi,
    WorkspaceDocEnvelope,
    BuilderWorkspaceHeaderState,
    UseBuilderWorkspaceOptions,
} from "./types";
