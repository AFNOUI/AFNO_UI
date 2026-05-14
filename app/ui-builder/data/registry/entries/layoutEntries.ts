import {
    Box, Columns3, Grid3X3, Layers, LayoutGrid, Layout, PanelLeft, Square,
} from "lucide-react";

import type { ComponentRegistryEntry } from "../types";

/** Layout category: containers, grids, cards, and tab/accordion shells. */
export const LAYOUT_ENTRIES: ComponentRegistryEntry[] = [
    {
        type: "container",
        label: "Container",
        icon: Box,
        category: "layout",
        isContainer: true,
        defaultProps: {},
        defaultStyles: { base: { padding: "p-6", maxWidth: "max-w-7xl", margin: "mx-auto" } },
        editableProps: [],
    },
    {
        type: "section",
        label: "Section",
        icon: Layout,
        category: "layout",
        isContainer: true,
        defaultProps: {},
        defaultStyles: { base: { padding: "py-12 px-6" } },
        editableProps: [],
    },
    {
        type: "grid",
        label: "Grid",
        icon: Grid3X3,
        category: "layout",
        isContainer: true,
        defaultProps: { columns: "3" },
        defaultStyles: { base: { display: "grid", gridCols: "grid-cols-3", gap: "gap-6" }, sm: { gridCols: "grid-cols-1" } },
        editableProps: [
            { key: "columns", label: "Columns", type: "select", options: [
                { label: "1", value: "1" }, { label: "2", value: "2" },
                { label: "3", value: "3" }, { label: "4", value: "4" },
                { label: "5", value: "5" }, { label: "6", value: "6" },
            ]},
        ],
    },
    {
        type: "flex",
        label: "Flex Row",
        icon: Columns3,
        category: "layout",
        isContainer: true,
        defaultProps: {},
        defaultStyles: { base: { display: "flex", flexWrap: "flex-wrap", gap: "gap-4", alignItems: "items-center" } },
        editableProps: [],
    },
    {
        type: "card",
        label: "Card",
        icon: Square,
        category: "layout",
        isContainer: true,
        defaultProps: { variant: "default" },
        defaultStyles: { base: { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm" } },
        editableProps: [
            { key: "variant", label: "Variant", type: "select", options: [
                { label: "Default", value: "default" },
                { label: "Elevated", value: "elevated" },
                { label: "Outline", value: "outline" },
                { label: "Ghost", value: "ghost" },
                { label: "Metric", value: "metric" },
            ]},
        ],
    },
    {
        type: "tabs-container",
        label: "Tabs Container",
        icon: Layers,
        category: "layout",
        isContainer: true,
        defaultProps: { tabs: "Tab 1\nTab 2\nTab 3", activeTab: "0" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "tabs", label: "Tab labels (one per line)", type: "textarea" },
            { key: "activeTab", label: "Active Tab Index", type: "number" },
        ],
    },
    {
        type: "accordion-container",
        label: "Accordion",
        icon: PanelLeft,
        category: "layout",
        isContainer: false,
        defaultProps: { items: "What is this?\nA page builder component\nHow does it work?\nDrag and drop components\nIs it free?\nYes, completely free" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "items", label: "Q&A pairs (alternating lines)", type: "textarea" },
        ],
    },
    {
        type: "columns",
        label: "Columns",
        icon: LayoutGrid,
        category: "layout",
        isContainer: true,
        defaultProps: { layout: "1/2-1/2" },
        defaultStyles: { base: { display: "grid", gridCols: "grid-cols-2", gap: "gap-6" }, sm: { gridCols: "grid-cols-1" } },
        editableProps: [
            { key: "layout", label: "Layout", type: "select", options: [
                { label: "50/50", value: "1/2-1/2" },
                { label: "33/67", value: "1/3-2/3" },
                { label: "67/33", value: "2/3-1/3" },
                { label: "25/75", value: "1/4-3/4" },
                { label: "33/33/33", value: "1/3-1/3-1/3" },
                { label: "25/25/25/25", value: "1/4-1/4-1/4-1/4" },
            ]},
        ],
    },
];
