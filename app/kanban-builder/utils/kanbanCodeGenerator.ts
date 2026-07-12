/**
 * Multi-file code generator for the Kanban Builder. Mirrors the shape used
 * by `tableCodeGenerator.ts` / `treeCodeGenerator.ts` so the Export tab can
 * render generated files + shared engine files in a single tabbed view.
 *
 * Supports the same 3-level renderer story as tree/table:
 *   - Reusable board-wide `renderCard` (lives in renderers.tsx, imported by config.ts)
 *   - Per-card `card.render` keyed by id (lives in renderers.tsx, attached in data.ts)
 *   - Built-in <KanbanCard /> fallback (no extra code needed)
 */
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";

export interface GeneratedFile {
  name: string;
  path: string;
  description: string;
  isFixed: boolean;
  language: "tsx" | "ts" | "json";
  code: string;
}

/**
 * Source-string descriptors for the renderers.tsx file. Templates ship these
 * pre-authored so the generated output matches what the user sees in the live
 * preview.
 */
export interface KanbanRendererSources {
  /** Shared imports for the renderers.tsx file (no trailing newline). */
  imports?: string;
  /** Source of the single reusable `renderCard` (right-hand side of `=`). */
  reusable?: string;
  /** Per-card renderers keyed by card id (right-hand side of `=`). */
  perCard?: Record<string, string>;
  /**
   * Source of the typed JSX `cardClickAction.renderDialog`. When present,
   * the generated `config.ts` attaches it to `boardConfig.cardClickAction`.
   * Falls back to `dialogTemplate` then the default field-grid.
   */
  dialog?: string;
}

function pascalize(input: string, fallback = "MyBoard"): string {
  const cleaned = (input || fallback).replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned[0].toUpperCase() + cleaned.slice(1);
}

/** Strip the non-serialisable `render` field from a card clone for JSON.stringify. */
function stripCardRenderers(cards: KanbanCardData[]): KanbanCardData[] {
  return cards.map((c) => {
    const { render, ...rest } = c;
    void render;
    return rest as KanbanCardData;
  });
}

function emitTypesFile(): string {
  return `/**
 * Re-export of the kanban engine types — imported by the generated component
 * so callers don't need to dig into the engine internals.
 */
export type {
  KanbanBuilderConfig,
  KanbanCardData,
  KanbanColumnConfig,
  KanbanCardField,
} from "@/components/kanban/types";
`;
}

function emitDataFile(cards: KanbanCardData[], hasPerCard: boolean): string {
  const clean = stripCardRenderers(cards);
  if (!hasPerCard) {
    return `import type { KanbanCardData } from "./types";

/** Initial card data. Swap with your own backend fetch when wiring up production. */
export const initialCards: KanbanCardData[] = ${JSON.stringify(clean, null, 2)};
`;
  }
  return `import type { KanbanCardData } from "./types";
import { cardRenderers } from "./renderers";
import { attachCardRenderers } from "@/components/kanban/attachRenderers";

/**
 * Per-card renderers live in ./renderers.tsx. \`attachCardRenderers\` wires
 * them onto each card's \`render\` field in a single O(n) pass.
 *
 * Resolution order at render time:
 *   card.render   ->   config.renderCard   ->   built-in <KanbanCard />
 */
const rawCards: KanbanCardData[] = ${JSON.stringify(clean, null, 2)};

export const initialCards: KanbanCardData[] = attachCardRenderers(rawCards, cardRenderers);
`;
}

function emitConfigFile(
  config: KanbanBuilderConfig,
  hasReusable: boolean,
  hasDialog: boolean,
): string {
  const clean: Record<string, unknown> = { ...config };
  delete clean.renderCard;

  if (!hasReusable && !hasDialog) {
    return `import type { KanbanBuilderConfig } from "./types";

/** Static configuration. All fields are typed and validated. */
export const boardConfig: KanbanBuilderConfig = ${JSON.stringify(clean, null, 2)};
`;
  }
  const imports = [hasReusable && "renderCard", hasDialog && "renderCardDialog"].filter(Boolean).join(", ");
  const literal = hasReusable
    ? JSON.stringify(clean, null, 2).replace(/\n}$/, ",\n  renderCard,\n}")
    : JSON.stringify(clean, null, 2);
  const dialogAttach = hasDialog ? `

/**
 * Attach the typed JSX dialog renderer onto cardClickAction.
 *
 * Resolution order at render time (built into the engine):
 *   cardClickAction.renderDialog → cardClickAction.dialogTemplate → default field-grid
 */
boardConfig.cardClickAction = {
  ...(boardConfig.cardClickAction ?? {}),
  renderDialog: renderCardDialog,
};` : "";
  return `import type { KanbanBuilderConfig } from "./types";
import { ${imports} } from "./renderers";

/**
 * Static configuration.${hasReusable ? " The single reusable `renderCard` lives in ./renderers.tsx." : ""}
 *
 * Resolution order at render time:
 *   card.render   ->   config.renderCard   ->   built-in <KanbanCard />
 */
export const boardConfig: KanbanBuilderConfig = ${literal};${dialogAttach}
`;
}

function emitRenderersFile(sources: KanbanRendererSources): string {
  const importsBlock = sources.imports
    ? sources.imports + "\n"
    : `import type { CardRenderer } from "@/components/kanban/types";\n`;

  const parts: string[] = [importsBlock];

  if (sources.reusable) {
    parts.push(`/**
 * Case 1 — single reusable renderer. Every card renders through this body
 * unless it defines its own \`card.render\`. Return undefined to fall through
 * to the built-in <KanbanCard />.
 */
export const renderCard: CardRenderer = ${sources.reusable};
`);
  }

  if (sources.perCard && Object.keys(sources.perCard).length > 0) {
    const entries = Object.entries(sources.perCard)
      .map(([id, body]) => `  ${JSON.stringify(id)}: ${body},`)
      .join("\n");
    parts.push(`/**
 * Case 2 — per-card renderers keyed by card id. \`data.ts\` attaches these
 * onto \`card.render\` during load.
 */
export const cardRenderers: Record<string, CardRenderer> = {
${entries}
};
`);
  }

  if (sources.dialog) {
    // Only emit the type import when the shared imports block didn't already
    // bring `CardDialogRenderer` in — otherwise the generated renderers.tsx has
    // a duplicate-identifier error (TS2300) in the consumer project.
    const dialogImport = importsBlock.includes("CardDialogRenderer")
      ? ""
      : `import type { CardDialogRenderer } from "@/components/kanban/types";\n`;
    parts.push(`/**
 * Typed JSX renderer for the card-detail dialog. Wired onto
 * \`boardConfig.cardClickAction.renderDialog\`.
 *
 * Resolution order at render time:
 *   cardClickAction.renderDialog → cardClickAction.dialogTemplate → default field-grid
 */
${dialogImport}export const renderCardDialog: CardDialogRenderer = ${sources.dialog};
`);
  }

  return parts.join("\n");
}

function emitOnChangeHook(componentName: string): string {
  return `import { useCallback } from "react";
import type { KanbanCardData } from "./types";

/**
 * Called whenever a card is dropped into a new position via DnD.
 * Replace the body with your real backend call (e.g. fetch PATCH).
 */
export function use${componentName}CardChange() {
  return useCallback((event: {
    card: KanbanCardData;
    fromColumnId: string;
    toColumnId: string;
    fromIndex: number;
    toIndex: number;
    cards: KanbanCardData[];
  }) => {
    console.log("[kanban] card moved:", event);
  }, []);
}

export function use${componentName}LoadMore() {
  return useCallback(async (event: { columnId: string; cursor?: string }) => {
    console.log("[kanban] load more:", event);
  }, []);
}
`;
}

function emitComponentFile(componentName: string, config: KanbanBuilderConfig): string {
  const columnDnd = !!config.enableColumnDnd;
  return `import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { boardConfig } from "./config";
import { initialCards } from "./data";
import { use${componentName}CardChange, use${componentName}LoadMore } from "./useCardChange";
import type { KanbanCardData${columnDnd ? ", KanbanColumnConfig" : ""} } from "./types";

/**
 * ${config.title}
 * ${config.subtitle ?? ""}
 *
 * Drag-and-drop is powered by the project's custom Pointer DnD library
 * (no @dnd-kit dependency). Cards persist locally — wire \`useCardChange\`
 * to your backend to make moves stick across reloads.${columnDnd ? `
 *
 * Column reordering is enabled: dragging a column header rearranges the
 * board. Local \`columns\` state mirrors the order so the change persists
 * across re-renders. Replace with a server PATCH for production.` : ""}
 */
export default function ${componentName}() {
  const [cards, setCards] = useState<KanbanCardData[]>(initialCards);${columnDnd ? `
  const [columns, setColumns] = useState<KanbanColumnConfig[]>(boardConfig.columns);` : ""}
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
        config={${columnDnd ? "{ ...boardConfig, columns }" : "boardConfig"}}
        cards={cards}
        onCardsChange={setCards}${columnDnd ? `
        onColumnsChange={setColumns}` : ""}
        onCardChange={handleCardChange}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
`;
}

/**
 * Generate the per-board files. Shared engine files come from
 * `kanbanSharedFiles.ts`.
 */
export function generateKanbanFiles(
  config: KanbanBuilderConfig,
  cards: KanbanCardData[],
  rendererSources?: KanbanRendererSources,
  /**
   * Override the generated component/folder name. Variant bundles pass the slug
   * name so the installed file is stable even if the user renames the board
   * title in the builder. Defaults to `pascalize(config.title)`.
   */
  componentNameOverride?: string,
): GeneratedFile[] {
  const componentName = componentNameOverride ?? pascalize(config.title);
  const folder = `src/boards/${componentName}`;
  const hasReusable =
    typeof config.renderCard === "function" || !!rendererSources?.reusable;
  const perCardIds = rendererSources?.perCard
    ? Object.keys(rendererSources.perCard)
    : cards.filter((c) => typeof c.render === "function").map((c) => c.id);
  const hasPerCard = perCardIds.length > 0;

  const files: GeneratedFile[] = [
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
      description: hasReusable
        ? "Static config — imports the single reusable `renderCard` from ./renderers."
        : "Strongly-typed board configuration. Edit columns, layout, fields here.",
      isFixed: false,
      language: "ts",
      code: emitConfigFile(config, hasReusable, !!rendererSources?.dialog),
    },
    {
      name: "data.ts",
      path: `${folder}/data.ts`,
      description: hasPerCard
        ? "Initial cards — attaches per-card renderers from ./renderers."
        : "Initial card data. Swap with your fetch on production.",
      isFixed: false,
      language: "ts",
      code: emitDataFile(cards, hasPerCard),
    },
    {
      name: "useCardChange.ts",
      path: `${folder}/useCardChange.ts`,
      description: "Hook fired on every drop — call your backend here to persist moves.",
      isFixed: false,
      language: "ts",
      code: emitOnChangeHook(componentName),
    },
    {
      name: "types.ts",
      path: `${folder}/types.ts`,
      description: "Re-exports of engine types for ergonomic imports inside this folder.",
      isFixed: false,
      language: "ts",
      code: emitTypesFile(),
    },
  ];

  if (rendererSources && (rendererSources.reusable || hasPerCard || rendererSources.dialog)) {
    files.splice(1, 0, {
      name: "renderers.tsx",
      path: `${folder}/renderers.tsx`,
      description: hasReusable && hasPerCard
        ? "Reusable + per-card renderers. config.ts uses the reusable; data.ts attaches per-card by id."
        : hasReusable
          ? "Single reusable card renderer (referenced from config.ts)."
          : "Per-card renderers keyed by id (attached in data.ts).",
      isFixed: false,
      language: "tsx",
      code: emitRenderersFile(rendererSources),
    });
  }

  return files;
}

/** Backwards-compat: generates ONLY the component file as a single string. */
export function generateKanbanCode(config: KanbanBuilderConfig, cards: KanbanCardData[]): string {
  return generateKanbanFiles(config, cards)[0].code;
}
