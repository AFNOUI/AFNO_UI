/**
 * HTML-entity escaping for user-authored text interpolated into generated JSX.
 * Kept here so that every node renderer escapes consistently. The character
 * set (angle brackets + curly braces) is intentionally narrow to avoid double-
 * escaping already-safe content such as `&amp;` that a user may have pasted.
 */
export function esc(text: string): string {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}
