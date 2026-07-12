/**
 * Wire per-card renderers onto initial card data.
 *
 * Resolution order applied at render time:
 *   card.render  →  config.renderCard  →  defaultRichCardRenderer  →  <KanbanCard />
 *
 * O(n) single pass.
 */
import type { CardRenderer, KanbanCardData } from "./types";

export type CardRendererMap = Readonly<Record<string, CardRenderer | undefined>>;

export function attachCardRenderers(
  cards: readonly KanbanCardData[],
  renderers: CardRendererMap,
): KanbanCardData[] {
  const out: KanbanCardData[] = new Array(cards.length);
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const renderer = renderers[card.id];
    out[i] = renderer ? { ...card, render: renderer } : card;
  }
  return out;
}
