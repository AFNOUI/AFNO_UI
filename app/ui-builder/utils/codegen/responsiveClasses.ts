import type { BreakpointStyles } from "@/ui-builder/data/uiBuilderRegistry";

/**
 * Flatten a `BreakpointStyles` bag into a space-separated Tailwind class list,
 * prefixing `sm` and `md` entries with their breakpoint. Order is `base → sm → md`
 * because snapshots / downstream JSX assume that ordering.
 */
export function resolveResponsiveClasses(styles: BreakpointStyles): string {
    const parts: string[] = [];
    const base = styles.base || {};
    for (const val of Object.values(base)) { if (val) parts.push(val); }
    const sm = styles.sm || {};
    for (const val of Object.values(sm)) { if (val) parts.push(`sm:${val}`); }
    const md = styles.md || {};
    for (const val of Object.values(md)) { if (val) parts.push(`md:${val}`); }
    return parts.join(" ");
}
