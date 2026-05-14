import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import type { ImportTracker } from "./imports";

/** Shared renderer signature. `nodeToJSX` is passed in so layout nodes can
 * recurse back through the dispatcher without forming an import cycle. */
export type RenderFn = (node: BuilderNode, imports: ImportTracker, indent?: number) => string;
