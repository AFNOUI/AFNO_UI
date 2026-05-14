/**
 * Multi-file code generator for the Kanban Builder. Mirrors the shape used
 * by `tableCodeGenerator.ts` so the Export tab can render generated files
 * + shared engine files in a single tabbed view with consistent UX.
 *
 * The generated component is fully self-contained: just drop it into any
 * React project that already has the shared engine files in place.
 */
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";

export interface GeneratedFile {
  name: string;
  path: string;
  code: string;
  isFixed: boolean;
  description: string;
  language: "tsx" | "ts" | "json";
}

function pascalize(input: string, fallback = "MyBoard"): string {
  const cleaned = (input || fallback).replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned[0].toUpperCase() + cleaned.slice(1);
}

/**
 * Engine type imports point at the **installed** engine path. The CLI ships
 * `types.ts` to `components/kanban/types.ts`; consumers pick it up via their
 * `@/components/...` tsconfig alias. We deliberately do NOT emit a
 * variant-local `types.ts` re-export — that produced a duplicate "types.ts"
 * tab next to the engine's own `types.ts`.
 */
const ENGINE_TYPES_IMPORT = `@/components/kanban/types`;

function emitDataFile(cards: KanbanCardData[]): string {
  return `import type { KanbanCardData } from "${ENGINE_TYPES_IMPORT}";

/** Initial card data. Swap with your own backend fetch when wiring up production. */
export const initialCards: KanbanCardData[] = ${JSON.stringify(cards, null, 2)};
`;
}

function emitConfigFile(config: KanbanBuilderConfig): string {
  return `import type { KanbanBuilderConfig } from "${ENGINE_TYPES_IMPORT}";

/** Static configuration. All fields are typed and validated. */
export const boardConfig: KanbanBuilderConfig = ${JSON.stringify(config, null, 2)};
`;
}

function emitOnChangeHook(componentName: string): string {
  return `import { useCallback } from "react";
import type { KanbanCardChangeEvent, KanbanLoadMoreEvent } from "${ENGINE_TYPES_IMPORT}";

/**
 * Called whenever a card is dropped into a new position via DnD.
 * Replace the body with your real backend call (e.g. fetch PATCH).
 *
 * Example:
 *   await fetch(\`/api/cards/\${event.card.id}\`, {
 *     method: "PATCH",
 *     body: JSON.stringify({ columnId: event.toColumnId, position: event.toIndex }),
 *   });
 */
export function use${componentName}CardChange() {
  return useCallback((event: KanbanCardChangeEvent) => {
    // TODO: persist the change to your backend.
    console.log("[kanban] card moved:", event);
  }, []);
}

export function use${componentName}LoadMore() {
  return useCallback(async (event: KanbanLoadMoreEvent) => {
    // TODO: fetch the next page for event.columnId/event.cursor and append it to cards.
    console.log("[kanban] load more:", event);
  }, []);
}
`;
}

function emitComponentFile(componentName: string, config: KanbanBuilderConfig): string {
  return `import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { boardConfig } from "./config";
import { initialCards } from "./data";
import { use${componentName}CardChange, use${componentName}LoadMore } from "./useCardChange";
import type { KanbanCardData } from "${ENGINE_TYPES_IMPORT}";

/**
 * ${config.title}
 * ${config.subtitle ?? ""}
 *
 * Drag-and-drop is powered by the project's custom Pointer DnD library
 * (no @dnd-kit dependency). Cards persist locally — wire \`useCardChange\`
 * to your backend to make moves stick across reloads.
 */
export default function ${componentName}() {
  const [cards, setCards] = useState<KanbanCardData[]>(initialCards);
  const handleCardChange = use${componentName}CardChange();
  const handleLoadMore = use${componentName}LoadMore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{boardConfig.title}</h2>
        {boardConfig.subtitle && (
          <p className="text-sm text-muted-foreground">{boardConfig.subtitle}</p>
        )}
      </div>
      <KanbanBoard
        config={boardConfig}
        cards={cards}
        onCardsChange={setCards}
        onCardChange={handleCardChange}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
`;
}

/**
 * Generate the per-board files. Shared engine files (KanbanBoard, DnD lib,
 * dialog template engine, etc.) come from `kanbanSharedFiles.ts`.
 *
 * Pass `componentNameOverride` to lock the emitted component / hook names to
 * the variant slug (used by `buildKanbanVariantFiles` for CLI bundles), so the
 * variant files don't drift if a user renames their board's `title` later.
 */
export function generateKanbanFiles(
  config: KanbanBuilderConfig,
  cards: KanbanCardData[],
  componentNameOverride?: string,
): GeneratedFile[] {
  const componentName = componentNameOverride ?? pascalize(config.title);
  const folder = `src/boards/${componentName}`;
  return [
    {
      name: `${componentName}.tsx`,
      path: `${folder}/${componentName}.tsx`,
      description: "Your generated board component — wires the engine to your config + data + onChange hook.",
      isFixed: false,
      language: "tsx",
      code: emitComponentFile(componentName, config),
    },
    {
      name: "config.ts",
      path: `${folder}/config.ts`,
      description: "Strongly-typed board configuration. Edit columns, layout, fields here.",
      isFixed: false,
      language: "ts",
      code: emitConfigFile(config),
    },
    {
      name: "data.ts",
      path: `${folder}/data.ts`,
      description: "Initial card data. Swap with your fetch on production.",
      isFixed: false,
      language: "ts",
      code: emitDataFile(cards),
    },
    {
      name: "useCardChange.ts",
      path: `${folder}/useCardChange.ts`,
      description: "Hook fired on every drop — call your backend here to persist moves.",
      isFixed: false,
      language: "ts",
      code: emitOnChangeHook(componentName),
    },
  ];
}

/** Backwards-compat: generates ONLY the component file as a single string. */
export function generateKanbanCode(config: KanbanBuilderConfig, cards: KanbanCardData[]): string {
  return generateKanbanFiles(config, cards)[0].code;
}