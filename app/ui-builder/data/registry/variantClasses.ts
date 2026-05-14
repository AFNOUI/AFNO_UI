/**
 * Tailwind class maps and derived-style helpers used by the builder canvas,
 * the inspector panel, and the code generator.
 *
 * Every map is exported verbatim (not wrapped in a function) so downstream
 * inspectors can enumerate keys for dropdown options.
 */

export const GRID_COLUMN_CLASS_MAP: Record<string, string> = {
    "1": "grid-cols-1",
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
    "5": "grid-cols-5",
    "6": "grid-cols-6",
};

export const COLUMN_LAYOUT_CLASS_MAP: Record<string, string> = {
    "1/2-1/2": "grid-cols-2",
    "1/3-2/3": "grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]",
    "2/3-1/3": "grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]",
    "1/4-3/4": "grid-cols-[minmax(220px,1fr)_minmax(0,3fr)]",
    "1/3-1/3-1/3": "grid-cols-3",
    "1/4-1/4-1/4-1/4": "grid-cols-4",
};

export const CARD_VARIANT_CLASS_MAP: Record<string, string> = {
    default: "bg-card border shadow-sm",
    elevated: "bg-card border shadow-lg",
    outline: "bg-background border-2 shadow-none",
    ghost: "bg-background/60 border border-dashed shadow-none",
    metric: "bg-gradient-to-b from-card to-muted/40 border border-primary/15 shadow-sm",
};

export const STAT_CARD_VARIANT_CLASS_MAP: Record<string, string> = {
    default: "bg-card border",
    outline: "bg-background border-2 shadow-none",
    highlight: "bg-primary/5 border border-primary/20 shadow-sm",
};

export function getDerivedLayoutStyles(type: string, props: Record<string, unknown>): Record<string, string> {
    switch (type) {
        case "grid": {
            const columns = String(props.columns || "3");
            return {
                display: "grid",
                gridCols: GRID_COLUMN_CLASS_MAP[columns] || GRID_COLUMN_CLASS_MAP["3"],
            };
        }
        case "columns": {
            const layout = String(props.layout || "1/2-1/2");
            return {
                display: "grid",
                gridCols: COLUMN_LAYOUT_CLASS_MAP[layout] || COLUMN_LAYOUT_CLASS_MAP["1/2-1/2"],
            };
        }
        default:
            return {};
    }
}

export function getCardVariantClass(variant?: string): string {
    return CARD_VARIANT_CLASS_MAP[variant || "default"] || CARD_VARIANT_CLASS_MAP.default;
}

export function getStatCardVariantClass(variant?: string): string {
    return STAT_CARD_VARIANT_CLASS_MAP[variant || "default"] || STAT_CARD_VARIANT_CLASS_MAP.default;
}
