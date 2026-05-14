import type { ReactElement } from "react";

import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";

/**
 * Shared contract for category-specific node renderers. Each category
 * (content / marketing / forms / data / charts) exports a function that
 * attempts to render `node` and returns `null` if the node type is not
 * handled by that category — giving the top-level `RenderComponent`
 * dispatcher a clean "first non-null wins" pipeline.
 */
export type CategoryRenderer = (
  node: BuilderNode,
  classes: string,
) => ReactElement | null;
