import { BarChart3, FormInput, Layout, Star, Type, type LucideIcon } from "lucide-react";

import type { BuilderNode, ComponentRegistryEntry } from "./registry/types";
import { LAYOUT_ENTRIES } from "./registry/entries/layoutEntries";
import { BASIC_ENTRIES } from "./registry/entries/basic";
import { MARKETING_ENTRIES } from "./registry/entries/marketing";
import { FORM_ENTRIES } from "./registry/entries/forms";
import { DATA_ENTRIES } from "./registry/entries/data";

/**
 * Barrel for the UI-Builder registry. Heavy registry data lives under
 * `./registry/entries/<category>.ts`; variant class maps and derived style
 * helpers live in `./registry/variantClasses.ts`; shared types in
 * `./registry/types.ts`.
 *
 * This file is kept as the single public surface consumed by the builder
 * canvas, inspector panel, code generator, and tests, so every symbol it
 * previously exported is still re-exported from here.
 *
 * Byte-for-byte shape is locked in by
 * `tests/codegen/uiBuilderRegistry.test.ts` snapshots — the concatenation
 * order of `componentRegistry` must remain layout → basic → marketing →
 * forms → data.
 */

export type {
    BuilderNode,
    BreakpointStyles,
    Breakpoint,
    EditableProp,
    ComponentRegistryEntry,
} from "./registry/types";

export {
    GRID_COLUMN_CLASS_MAP,
    COLUMN_LAYOUT_CLASS_MAP,
    CARD_VARIANT_CLASS_MAP,
    STAT_CARD_VARIANT_CLASS_MAP,
    getDerivedLayoutStyles,
    getCardVariantClass,
    getStatCardVariantClass,
} from "./registry/variantClasses";

let _counter = 0;
export function generateId(): string {
  return `node_${Date.now()}_${++_counter}`;
}

export function createNode(type: string): BuilderNode | null {
    const entry = componentRegistry.find((c) => c.type === type);
  if (!entry) return null;
  const node: BuilderNode = {
    id: generateId(),
    type,
    props: { ...entry.defaultProps },
    styles: JSON.parse(JSON.stringify(entry.defaultStyles)),
    children: [],
  };
  if (entry.defaultChildren) {
        node.children = entry.defaultChildren.map((c) => ({
      ...c,
      id: generateId(),
            children: (c.children || []).map((gc) => ({ ...gc, id: generateId(), children: gc.children || [] })),
    }));
  }
  return node;
}

export const componentRegistry: ComponentRegistryEntry[] = [
    ...LAYOUT_ENTRIES,
    ...BASIC_ENTRIES,
    ...MARKETING_ENTRIES,
    ...FORM_ENTRIES,
    ...DATA_ENTRIES,
];

componentRegistry.forEach((entry) => {
    if (!entry.editableProps) (entry as unknown as { editableProps: [] }).editableProps = [];
});

export const categoryLabels: Record<string, string> = {
  layout: "Layout",
  basic: "Basic",
  marketing: "Marketing",
  forms: "Forms",
  data: "Data & Charts",
};

export const categoryIcons: Record<string, LucideIcon> = {
  layout: Layout,
  basic: Type,
  marketing: Star,
  forms: FormInput,
  data: BarChart3,
};
