/**
 * Single source of truth for `/dnd` lab variants.
 *
 * Mirrors `chartVariantSources.ts`:
 *   - one `DndVariantSource` per registered demo,
 *   - each carries its in-app React component AND its registry-installable
 *     snippet (a standalone TSX example the CLI ships verbatim).
 *
 * Used by:
 *   - `app/(pages)/dnd/page.tsx`        — aggregator overview (client)
 *   - `DndVariantGallery.tsx`           — per-variant client renderer
 *   - `scripts/build-variants-registry.ts` — emits
 *     `public/registry/variants/dnd/<slug>.json` for `afnoui add dnd/<slug>`
 *
 * **RSC contract**: this module embeds two non-serializable payloads — the
 * `Component` (a React component) and the `icon` (a `lucide-react`
 * `forwardRef` object). Per-variant `page.tsx` files are **Server Components
 * and must NOT import from here**. They forward only the slug string to a
 * Client Component (`DndVariantGallery`), which does the lookup. This keeps
 * the boundary clean: nothing crosses it except strings.
 *
 * The build script (`scripts/build-variants-registry.ts`) only reads plain
 * primitives (`slug`, `snippet`) and runs under Node via `tsx` — no RSC
 * constraints apply.
 *
 * **CLI contract**: the snippet imports DnD primitives via a *relative*
 * `../../components/dnd` path (the shipped layout lands the demo at
 * `dnd/<slug>/<Pascal>Demo.tsx` and the primitives at `components/dnd/*`).
 * The CLI's standard alias-rewriter skips relative imports, so what we ship
 * here is what lands in the consumer's project — no surprise transforms.
 */

import type { ComponentType } from "react";
import {
  ArrowLeftRight,
  Flag,
  Folder,
  Image as ImageIcon,
  Layers,
  ListOrdered,
  MoveHorizontal,
  Table2,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  SortableListDemo,
  sortableListSnippet,
} from "@/components/lab/dnd/variants/sortable-list";
import {
  HorizontalReorderDemo,
  horizontalReorderSnippet,
} from "@/components/lab/dnd/variants/horizontal-reorder";
import {
  MultiListDemo,
  multiListSnippet,
} from "@/components/lab/dnd/variants/multi-list";
import {
  ImageGridDemo,
  imageGridSnippet,
} from "@/components/lab/dnd/variants/image-grid";
import {
  TrashDemo,
  trashSnippet,
} from "@/components/lab/dnd/variants/trash";
import {
  BucketsDemo,
  bucketsSnippet,
} from "@/components/lab/dnd/variants/buckets";
import {
  TreeDemo,
  treeSnippet,
} from "@/components/lab/dnd/variants/tree";
import {
  FilesDemo,
  filesSnippet,
} from "@/components/lab/dnd/variants/files";
import {
  TableRowReorderDemo,
  tableReorderSnippet,
} from "@/components/lab/dnd/variants/table-reorder";

export type DndVariantSource = {
  /** Kebab-case slug — matches `/dnd/<slug>` route + sidebar `id`. */
  slug: string;
  /** Human-readable name (breadcrumb leaf + card title). */
  name: string;
  /** Short marketing-style description shown in headers + index grid. */
  description: string;
  /** Compact identifier badges for the gallery preview. */
  badges: readonly string[];
  /** Side-bar / header icon. */
  icon: LucideIcon;
  /** Live in-app demo component (wrapped in `DndProvider` by `layout.tsx`). */
  Component: ComponentType;
  /** Registry-installable example: shipped verbatim via `afnoui add dnd/<slug>`. */
  snippet: string;
};

export const dndVariantSources: readonly DndVariantSource[] = [
  {
    slug: "sortable-list",
    name: "Sortable list",
    description:
      "Vertical reorder with a real-sized 'make-room' gap matching the dragged card.",
    badges: ["axis: y", "make-room", "single render"],
    icon: ListOrdered,
    Component: SortableListDemo,
    snippet: sortableListSnippet,
  },
  {
    slug: "horizontal-reorder",
    name: "Horizontal pill reorder",
    description:
      "X-axis index resolution lets pills swap places along a wrapping bar.",
    badges: ["axis: x", "RTL aware", "wrap"],
    icon: MoveHorizontal,
    Component: HorizontalReorderDemo,
    snippet: horizontalReorderSnippet,
  },
  {
    slug: "multi-list",
    name: "Multi-list transfer",
    description:
      "Move items between two lists — same-list reorders, cross-list transfers.",
    badges: ["2 zones", "cross-list", "insert at index"],
    icon: ArrowLeftRight,
    Component: MultiListDemo,
    snippet: multiListSnippet,
  },
  {
    slug: "image-grid",
    name: "Image grid sort",
    description:
      "2D-style grid of color tiles with insertion-point highlighting.",
    badges: ["grid", "tile reorder", "preview"],
    icon: ImageIcon,
    Component: ImageGridDemo,
    snippet: imageGridSnippet,
  },
  {
    slug: "trash",
    name: "Trash zone",
    description:
      "Drop a row onto the trash to delete it. Trash zone reacts on hover.",
    badges: ["delete on drop", "zone state", "scaling"],
    icon: Trash2,
    Component: TrashDemo,
    snippet: trashSnippet,
  },
  {
    slug: "buckets",
    name: "Priority buckets",
    description: "Drag a task between Low / Medium / High buckets to retag it.",
    badges: ["3 zones", "tag swap", "tone-coded"],
    icon: Flag,
    Component: BucketsDemo,
    snippet: bucketsSnippet,
  },
  {
    slug: "tree",
    name: "Nested tree reorder",
    description:
      "Reorder children inside their parent branch — each branch is its own DnD zone.",
    badges: ["scoped zones", "per-branch", "nested"],
    icon: Layers,
    Component: TreeDemo,
    snippet: treeSnippet,
  },
  {
    slug: "files",
    name: "File → folder drop",
    description:
      "Drop loose files into folders. Folders open visually on hover and tally a count.",
    badges: ["drop to file", "hover open", "counts"],
    icon: Folder,
    Component: FilesDemo,
    snippet: filesSnippet,
  },
  {
    slug: "table-reorder",
    name: "Table row reorder",
    description:
      "Drag the grip handle to reorder rows in a configuration table — toggles, badges, and actions stay live.",
    badges: ["axis: y", "grip handle", "live cells"],
    icon: Table2,
    Component: TableRowReorderDemo,
    snippet: tableReorderSnippet,
  },
];

/** `dndVariantSources` indexed by `slug` for O(1) page lookups. */
export const dndVariantBySlug: Readonly<Record<string, DndVariantSource>> =
  Object.fromEntries(dndVariantSources.map((s) => [s.slug, s]));

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/**
 * Convention for the file path the CLI writes into the consumer's project.
 *
 * DnD variant demos ship to the **`dnd/`** alias root (a sibling of
 * `components/`) — same shape as forms (`forms/<slug>/...`),
 * tables (`tables/<slug>/...`) and kanban (`kanban/<slug>/...`). The CLI
 * resolves this prefix via the `dndVariants` alias (default `dnd`, see
 * `afnoui-cli/src/lib/helpers/installPaths.ts`).
 *
 * The companion DnD primitives ship to `components/dnd/*` via
 * `public/registry/dnd.json`, so the demo's relative imports
 * (`../../components/dnd`, `../../lib/utils`) resolve from any layout
 * (app-dir / src-dir / flat) without a CLI alias rewrite.
 */
export function dndVariantFilePath(slug: string): string {
  return `dnd/${slug}/${toPascalCase(slug)}Demo.tsx`;
}

/**
 * Short, illustrative usage example for the "Snippet" tab.
 *
 * Mirrors the charts/kanban pattern: the Snippet tab shows a *small* example
 * of how to consume the variant after `afnoui add dnd/<slug>` installs it,
 * while the Component tab shows the full installed source. The short form
 * keeps the card readable and gives users a copy-pasteable starting point.
 */
export function buildDndUsageCode(source: DndVariantSource): string {
  const componentName = `${toPascalCase(source.slug)}Demo`;
  const exampleName = `${toPascalCase(source.slug)}Example`;
  return `import ${componentName} from "@/dnd/${source.slug}/${componentName}";

export default function ${exampleName}() {
  return <${componentName} />;
}
`;
}
