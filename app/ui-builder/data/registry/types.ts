import type { LucideIcon } from "lucide-react";

/**
 * Domain types shared by every registry entry, by the builder canvas runtime
 * (BuilderNode / BreakpointStyles), and by the code generator.
 *
 * Kept in their own module so `entries/*.ts`, the barrel
 * `uiBuilderRegistry.ts`, and downstream UI code can all depend on types
 * without dragging in the heavy registry data.
 */

export interface BuilderNode {
    id: string;
    type: string;
    hidden?: boolean;
    locked?: boolean;
    layerName?: string;
    children: BuilderNode[];
    styles: BreakpointStyles;
    props: Record<string, unknown>;
}

export interface BreakpointStyles {
    base: Record<string, string>;
    sm?: Record<string, string>;
    md?: Record<string, string>;
}

export type Breakpoint = "base" | "sm" | "md";

export interface EditableProp {
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "number" | "color" | "url" | "boolean";
    options?: { label: string; value: string }[];
    placeholder?: string;
}

export interface ComponentRegistryEntry {
    type: string;
    label: string;
    icon: LucideIcon;
    category: "layout" | "basic" | "marketing" | "forms" | "data";
    isContainer: boolean;
    isComposite?: boolean;
    defaultProps: Record<string, unknown>;
    defaultStyles: BreakpointStyles;
    defaultChildren?: Omit<BuilderNode, "id">[];
    editableProps: EditableProp[];
}
