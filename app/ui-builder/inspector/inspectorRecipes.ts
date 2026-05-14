import type { Breakpoint } from "@/ui-builder/data/uiBuilderRegistry";

/**
 * One-click "layout recipes" the inspector renders as preset buttons, plus
 * responsive recipes that apply styles at a specific breakpoint.
 *
 * Kept next to `inspectorOptions.ts` so everything the UI needs to render
 * dropdowns + preset grids lives in `./inspector/` rather than the top of
 * `InspectorPanel.tsx`.
 */

export const LAYOUT_RECIPES = [
    { label: "Stack", description: "Vertical sections", display: "block" },
    {
        label: "Row",
        description: "Same line",
        display: "flex",
        flexDirection: "flex-row",
        flexWrap: "flex-wrap",
        gap: "gap-4",
        alignItems: "items-start",
    },
    {
        label: "2 Col",
        description: "Two equal columns",
        display: "grid",
        gridCols: "grid-cols-2",
        gap: "gap-4",
    },
    {
        label: "3 Col",
        description: "Three equal columns",
        display: "grid",
        gridCols: "grid-cols-3",
        gap: "gap-4",
    },
    {
        label: "4 Col",
        description: "Four cards in one line",
        display: "grid",
        gridCols: "grid-cols-4",
        gap: "gap-4",
    },
];

export const RESPONSIVE_RECIPES: Array<{
    label: string;
    description: string;
    applyTo: Breakpoint;
    styles: Record<string, string>;
}> = [
    {
        label: "Auto Stack on Mobile",
        description: "Grid on desktop, stack on small",
        applyTo: "sm",
        styles: { gridCols: "grid-cols-1" },
    },
    {
        label: "2 Col on Tablet",
        description: "Switch to 2 columns on tablet",
        applyTo: "md",
        styles: { gridCols: "grid-cols-2" },
    },
    {
        label: "Full Width Mobile",
        description: "Full width on small screens",
        applyTo: "sm",
        styles: { width: "w-full", padding: "px-2" },
    },
];
