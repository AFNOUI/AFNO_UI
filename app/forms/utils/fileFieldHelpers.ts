/**
 * Shared pure helpers for the `FileField` component across all form stacks.
 *
 * - `formatFileSize` is the human-readable size formatter that was previously
 *   duplicated (with cosmetic name differences) in all three FileField.tsx files.
 * - `matchesAcceptedType` is the predicate used by the RHF + TanStack stacks
 *   when validating a file's MIME type / extension against the configured
 *   `acceptedTypes` list. (The Action stack uses a stripped-down validator and
 *   intentionally does not call into this helper.)
 */

const FILE_SIZE_UNITS = ["Bytes", "KB", "MB", "GB"] as const;

/** Convert a byte count into a human-readable string (e.g. `1.5 MB`). */
export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = FILE_SIZE_UNITS[Math.min(i, FILE_SIZE_UNITS.length - 1)];
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${unit}`;
}

/**
 * Return `true` if `file` matches the `accept` spec.
 * `accept` follows the standard HTML semantics:
 *   - leading dot → file-name extension match (case-insensitive)
 *   - otherwise   → exact MIME match, or wildcard prefix match (`image/*`)
 */
export function matchesAcceptedType(file: File, accept: string): boolean {
  if (accept.startsWith(".")) {
    return file.name.toLowerCase().endsWith(accept.toLowerCase());
  }
  return file.type === accept || file.type.startsWith(accept.replace("*", ""));
}
