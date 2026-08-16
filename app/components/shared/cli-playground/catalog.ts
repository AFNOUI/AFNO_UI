/**
 * What the CLI knows how to install, as data the playground can offer.
 *
 * Both indexes are imported straight from `public/registry/` — the exact files
 * `afnoui add` fetches at runtime. Importing rather than hand-listing means a
 * variant added by a registry rebuild shows up in the playground with no second
 * edit, and a variant that does not exist can never be offered. (That is the
 * bug the tables gallery shipped once: it printed the camelCase *template key*
 * instead of the registry slug, and every printed command 404'd.)
 *
 * The two files are string arrays and together weigh ~12 KB, so this is a
 * static import rather than a fetch — the picker renders on the server with
 * real options in it.
 */

import baseComponentIndex from "../../../../public/registry/index.json";
import variantIndex from "../../../../public/registry/variants/index.json";

export interface VariantCategory {
    id: string;
    /** Display name in the picker's group header. */
    label: string;
    /** Where `add` writes the bundle, in terms of `afnoui.json` aliases. */
    installRoot: string;
    /** Extra things the CLI pulls in on the first install of this category. */
    sideEffects: string[];
    /** Accepts `--stack rhf|tanstack|action`. */
    formStack?: boolean;
    /** Has a data layer, so the transport axes apply. */
    transportCapable?: boolean;
    /** Slug shape is `charts/<type>/<slug>` rather than `<category>/<slug>`. */
    nested?: boolean;
}

/**
 * Categories with real routing rules of their own. Everything else is a lab
 * primitive demo and falls through to `PRIMITIVE_CATEGORY`.
 *
 * Source of truth for these rows: `afnoui-cli/src/cli/commands/add.ts`'s
 * category-routing block and `.ai-brain/CLI_REFERENCE.md § 4`.
 */
const EXPLICIT_CATEGORIES: Record<string, Omit<VariantCategory, "id">> = {
    forms: {
        label: "Forms",
        installRoot: "aliases.formVariants (default `forms/`)",
        sideEffects: [
            "the shared form engine + field components",
            "the React Hook Form stack, unless --stack says otherwise",
        ],
        formStack: true,
        transportCapable: true,
    },
    tables: {
        label: "Tables",
        installRoot: "aliases.tableVariants (default `tables/`)",
        sideEffects: [
            "the table engine",
            "the Pointer DnD primitives (`components/dnd/*`)",
            "the sandbox helpers, on variants that use them",
        ],
        transportCapable: true,
    },
    kanban: {
        label: "Kanban",
        installRoot: "aliases.kanbanVariants (default `kanban/`)",
        sideEffects: [
            "the kanban engine",
            "the Pointer DnD primitives (`components/dnd/*`)",
            "the sandbox helpers, on variants that use them",
        ],
        transportCapable: true,
    },
    tree: {
        label: "Trees",
        installRoot: "aliases.treeVariants (default `tree/`)",
        sideEffects: [
            "the TreeCanvas engine",
            "GraphToolbar, on variants that use it",
        ],
        transportCapable: true,
    },
    charts: {
        label: "Charts",
        installRoot: "aliases.chartVariants/<type>/<slug>/",
        sideEffects: ["the `chart-primitives` base component"],
        nested: true,
    },
    dnd: {
        label: "Drag & drop",
        installRoot: "aliases.dndVariants (default `dnd/`)",
        sideEffects: ["the Pointer DnD engine (`components/dnd/*`)"],
    },
    progress: {
        label: "Progress",
        installRoot: "aliases.uiVariants (default `ui-variants/`)",
        sideEffects: ["`components/ui/progress-shared.tsx`"],
    },
    "async-field": {
        label: "Async fields",
        installRoot: "aliases.uiVariants (default `ui-variants/`)",
        sideEffects: ["nothing else — the bundle is self-contained"],
        transportCapable: true,
    },
    "infinite-field": {
        label: "Infinite fields",
        installRoot: "aliases.uiVariants (default `ui-variants/`)",
        sideEffects: ["nothing else — the bundle is self-contained"],
        transportCapable: true,
    },
};

/** The fallback for the ~30 lab primitive demo categories (badge, card, …). */
const PRIMITIVE_CATEGORY: Omit<VariantCategory, "id"> = {
    label: "UI primitives",
    installRoot: "aliases.uiVariants (default `ui-variants/<primitive>/`)",
    sideEffects: ["the base primitive it builds on, if not already installed"],
};

export function getCategory(id: string): VariantCategory {
    const explicit = EXPLICIT_CATEGORIES[id];
    if (explicit) return { id, ...explicit };
    return { id, ...PRIMITIVE_CATEGORY, label: titleCase(id) };
}

function titleCase(slug: string): string {
    return slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export interface CatalogEntry {
    /** The exact token passed to the CLI, e.g. `tables/tables-server-crm`. */
    slug: string;
    /** `tables`, or `charts` for the nested chart slugs. */
    categoryId: string;
    /** The part after the category, used for search + display. */
    name: string;
}

const VARIANT_SLUGS = variantIndex as string[];
const BASE_SLUGS = baseComponentIndex as string[];

export const VARIANT_ENTRIES: CatalogEntry[] = VARIANT_SLUGS.map((slug) => {
    const firstSlash = slug.indexOf("/");
    return {
        slug,
        categoryId: slug.slice(0, firstSlash),
        name: slug.slice(firstSlash + 1),
    };
});

export const BASE_ENTRIES: CatalogEntry[] = BASE_SLUGS.map((slug) => ({
    slug,
    categoryId: "base",
    name: slug,
}));

/** Category id → its entries, in the order the registry index lists them. */
export const VARIANTS_BY_CATEGORY: Map<string, CatalogEntry[]> = (() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const entry of VARIANT_ENTRIES) {
        const bucket = map.get(entry.categoryId);
        if (bucket) bucket.push(entry);
        else map.set(entry.categoryId, [entry]);
    }
    return map;
})();

export const CATEGORY_IDS: string[] = [...VARIANTS_BY_CATEGORY.keys()];

/** Categories whose variants carry a data layer, so `transport` applies. */
export const TRANSPORT_CATEGORY_IDS: string[] = CATEGORY_IDS.filter(
    (id) => getCategory(id).transportCapable,
);

export const CATALOG_COUNTS = {
    baseComponents: BASE_ENTRIES.length,
    variants: VARIANT_ENTRIES.length,
    categories: CATEGORY_IDS.length,
};

/** Is this argument a `<category>/<variant>` slug rather than a base component? */
export function isVariantSlug(arg: string): boolean {
    return arg.includes("/");
}

export function categoryOf(arg: string): string | null {
    if (!isVariantSlug(arg)) return null;
    return arg.slice(0, arg.indexOf("/"));
}

/** Does the current argument list contain a variant from this category? */
export function argsIncludeCategory(args: string[], categoryId: string): boolean {
    return args.some((arg) => categoryOf(arg) === categoryId);
}

/** Does the current argument list contain anything with a data layer? */
export function argsIncludeTransportCapable(args: string[]): boolean {
    return args.some((arg) => {
        const category = categoryOf(arg);
        return category !== null && getCategory(category).transportCapable === true;
    });
}
