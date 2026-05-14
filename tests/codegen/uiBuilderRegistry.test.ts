import { describe, expect, it } from "vitest";

import {
    CARD_VARIANT_CLASS_MAP,
    categoryIcons,
    categoryLabels,
    COLUMN_LAYOUT_CLASS_MAP,
    componentRegistry,
    createNode,
    generateId,
    getCardVariantClass,
    getDerivedLayoutStyles,
    getStatCardVariantClass,
    GRID_COLUMN_CLASS_MAP,
    STAT_CARD_VARIANT_CLASS_MAP,
    type ComponentRegistryEntry,
} from "@/ui-builder/data/uiBuilderRegistry";

/**
 * Characterization tests for the UI Builder component registry.
 *
 * The registry is consumed by `ComponentPalette`, `InspectorPanel`,
 * `RenderNode`, `LayerPanel`, and the code generator — all of which rely on
 * entry ORDER (for palette sort order) and on every entry keeping its shape.
 *
 * These tests lock down: order, counts per category, helper return values,
 * and a trimmed-down serialization of every entry (icon function identity is
 * excluded because module bundling may break function reference equality).
 */

function serializeEntry(entry: ComponentRegistryEntry) {
    return {
        type: entry.type,
        label: entry.label,
        category: entry.category,
        isContainer: entry.isContainer,
        isComposite: entry.isComposite ?? false,
        defaultProps: entry.defaultProps,
        defaultStyles: entry.defaultStyles,
        defaultChildrenTypes: entry.defaultChildren?.map((c) => c.type) ?? null,
        editablePropKeys: entry.editableProps.map((p) => p.key),
    };
}

describe("uiBuilderRegistry — shape", () => {
    it("exposes exactly five categories with labels and icons", () => {
        expect(Object.keys(categoryLabels).sort()).toEqual(["basic", "data", "forms", "layout", "marketing"]);
        expect(Object.keys(categoryIcons).sort()).toEqual(["basic", "data", "forms", "layout", "marketing"]);
        expect(categoryLabels.data).toBe("Data & Charts");
    });

    it("preserves the documented category counts", () => {
        const counts: Record<string, number> = {};
        for (const e of componentRegistry) counts[e.category] = (counts[e.category] ?? 0) + 1;
        expect(counts).toEqual({
            layout: 8,
            basic: 14,
            marketing: 9,
            forms: 8,
            data: 18,
        });
    });

    it("starts with `container` and ends with `metric-widget`", () => {
        expect(componentRegistry[0]!.type).toBe("container");
        expect(componentRegistry.at(-1)!.type).toBe("metric-widget");
    });

    it("produces a stable, ordered list of every entry's type", () => {
        expect(componentRegistry.map((e) => e.type)).toMatchSnapshot();
    });

    it("every entry has a non-empty `editableProps` array (backfilled when missing)", () => {
        for (const e of componentRegistry) {
            expect(Array.isArray(e.editableProps), `${e.type} editableProps`).toBe(true);
        }
    });

    it("locks down the full (icon-less) shape of every entry", () => {
        expect(componentRegistry.map(serializeEntry)).toMatchSnapshot();
    });
});

describe("uiBuilderRegistry — variant class maps", () => {
    it("GRID_COLUMN_CLASS_MAP covers 1–6 columns", () => {
        expect(GRID_COLUMN_CLASS_MAP).toMatchSnapshot();
    });

    it("COLUMN_LAYOUT_CLASS_MAP covers the documented layout presets", () => {
        expect(COLUMN_LAYOUT_CLASS_MAP).toMatchSnapshot();
    });

    it("CARD_VARIANT_CLASS_MAP covers the documented variants", () => {
        expect(CARD_VARIANT_CLASS_MAP).toMatchSnapshot();
    });

    it("STAT_CARD_VARIANT_CLASS_MAP covers the documented variants", () => {
        expect(STAT_CARD_VARIANT_CLASS_MAP).toMatchSnapshot();
    });

    it("getCardVariantClass / getStatCardVariantClass fall back to default on unknown input", () => {
        expect(getCardVariantClass("elevated")).toBe(CARD_VARIANT_CLASS_MAP.elevated);
        expect(getCardVariantClass("not-a-variant")).toBe(CARD_VARIANT_CLASS_MAP.default);
        expect(getCardVariantClass()).toBe(CARD_VARIANT_CLASS_MAP.default);
        expect(getStatCardVariantClass("highlight")).toBe(STAT_CARD_VARIANT_CLASS_MAP.highlight);
        expect(getStatCardVariantClass("???")).toBe(STAT_CARD_VARIANT_CLASS_MAP.default);
    });

    it("getDerivedLayoutStyles resolves grid + columns and returns {} for unknown types", () => {
        expect(getDerivedLayoutStyles("grid", { columns: "4" })).toEqual({
            display: "grid",
            gridCols: "grid-cols-4",
        });
        expect(getDerivedLayoutStyles("grid", {})).toEqual({
            display: "grid",
            gridCols: "grid-cols-3",
        });
        expect(getDerivedLayoutStyles("columns", { layout: "1/3-2/3" })).toEqual({
            display: "grid",
            gridCols: "grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]",
        });
        expect(getDerivedLayoutStyles("columns", {})).toEqual({
            display: "grid",
            gridCols: "grid-cols-2",
        });
        expect(getDerivedLayoutStyles("not-a-layout", { anything: true })).toEqual({});
    });
});

describe("uiBuilderRegistry — factories", () => {
    it("generateId returns unique, stable-prefixed ids", () => {
        const a = generateId();
        const b = generateId();
        expect(a).not.toBe(b);
        expect(a).toMatch(/^node_\d+_\d+$/);
    });

    it("createNode returns null for unknown types", () => {
        expect(createNode("not-a-real-type")).toBeNull();
    });

    it("createNode clones default styles (so mutations don't bleed into the registry)", () => {
        const card = createNode("card");
        expect(card).not.toBeNull();
        expect(card!.type).toBe("card");
        expect(card!.props.variant).toBe("default");
        card!.styles.base.padding = "p-1";
        const second = createNode("card");
        expect(second!.styles.base.padding).not.toBe("p-1");
    });

    it("createNode expands defaultChildren with fresh ids", () => {
        const hero = createNode("hero");
        expect(hero).not.toBeNull();
        expect(hero!.children.length).toBeGreaterThan(0);
        const ids = hero!.children.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
