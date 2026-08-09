/**
 * The data layer for a generated kanban board: `constants.ts`, `services.ts`
 * and `hooks.ts`.
 *
 * Extracted from `kanbanCodeGenerator.ts` so that file stays about rendering
 * the board, not about transport. See AI_AGENT_RULES § R-55 (the layering these
 * files implement) and § R-56 / § R-57 (transport opt-ins + tunables).
 */
import {
  cliGatedNote,
  emitConstantsFile,
  tanstackConstants,
  type ConstantsEntry,
  type TransportChoice,
} from "@/lib/codegen/transport";

export function emitConstantsFileForBoard(
  title: string,
  transport: TransportChoice,
): string {
  const entries: ConstantsEntry[] = [
    { name: "API_BASE", value: '"/api"', doc: "Base URL every request in services.ts is built from." },
    { name: "CARDS_PATH", value: '"/cards"', doc: "Appended to API_BASE for card create / move / fetch calls." },
    {
      name: "BASE_HEADERS",
      value: "{} as Record<string, string>",
      doc: "Sent on every request. Add auth headers here.",
    },
  ];
  if (transport.query === "tanstack") entries.push(...tanstackConstants());
  return emitConstantsFile(`the ${title} board`, entries);
}

export function emitServicesFile(transport: TransportChoice): string {
  const requestHelper =
    transport.http === "axios"
      ? `import axios from "axios";

/**
 * Single place the HTTP client is named — swap clients or add interceptors
 * here, not in each function below.
 */
export async function request<T = void>(
  path: string,
  init: { method: string; body?: unknown },
): Promise<T> {
  const res = await axios.request<T>({
    url: \`\${API_BASE}\${path}\`,
    method: init.method,
    headers: { "Content-Type": "application/json", ...BASE_HEADERS },
    data: init.body,
  });
  return res.data;
}`
      : `/**
 * Single place the HTTP client is named — swap \`fetch\` for axios or add
 * interceptors here, not in each function below.
 */
export async function request<T = void>(
  path: string,
  init: { method: string; body?: unknown },
): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    method: init.method,
    headers: { "Content-Type": "application/json", ...BASE_HEADERS },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}`;

  return `import type { KanbanCardData } from "./types";
import { API_BASE, CARDS_PATH, BASE_HEADERS } from "./constants";

/**
 * Network layer for this board — the ONLY file here that should talk to your
 * backend (AI_AGENT_RULES § R-55: component → hooks.ts → services.ts).
 *
 * The bodies below are stubs so the board works offline out of the box.
 * Replace them with real requests; the hooks and the component do not change.
 *
${cliGatedNote("http", transport)}
 */

${requestHelper}

export interface CardMoveEvent {
  card: KanbanCardData;
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
  cards: KanbanCardData[];
}

export interface LoadMoreEvent {
  columnId: string;
  cursor?: string;
}

/** Fully-qualified endpoint these services target. Keeps CARDS_PATH in one place. */
export const CARD_ENDPOINT = \`\${API_BASE}\${CARDS_PATH}\`;

/**
 * Persist a card's new column + position.
 *
 * Stubbed so the board works offline. To go live, delete the \`console.log\`
 * and uncomment the call — \`request\` is already wired to your chosen client.
 */
export async function persistCardMove(event: CardMoveEvent): Promise<void> {
  // await request(\`\${CARDS_PATH}/\${event.card.id}\`, {
  //   method: "PATCH",
  //   body: { columnId: event.toColumnId, position: event.toIndex },
  // });
  console.log("[kanban] card moved:", event);
}

/** Fetch the next page of cards for one column (infinite-scroll columns). */
export async function fetchMoreCards(event: LoadMoreEvent): Promise<KanbanCardData[]> {
  // return request<KanbanCardData[]>(
  //   \`\${CARDS_PATH}?column=\${event.columnId}&cursor=\${event.cursor ?? ""}\`,
  //   { method: "GET" },
  // );
  console.log("[kanban] load more:", event);
  return [];
}
`;
}

export function emitHooksFile(componentName: string, transport: TransportChoice): string {
  const doc = `/**
 * React glue between the board component and \`services.ts\`.
 *
 * Per AI_AGENT_RULES § R-55 this is the ONLY file that calls services — the
 * component never imports \`./services\` directly. This is also where your
 * logic belongs — optimistic updates, rollback, cache invalidation, and error
 * handling. The requests themselves stay in \`services.ts\`.
 *
 * Errors are deliberately left to propagate: wrap a call in try/catch here and
 * handle it however your app does (custom error class, status-code mapping,
 * toast, rollback). Nothing is caught for you.
 *
${cliGatedNote("query", transport)}
 */`;

  if (transport.query === "tanstack") {
    return `import { useMutation } from "@tanstack/react-query";

import {
  persistCardMove,
  fetchMoreCards,
  type CardMoveEvent,
  type LoadMoreEvent,
} from "./services";
import { GC_TIME_MS } from "./constants";

${doc}

/** Called whenever a card is dropped into a new position via DnD. */
export function use${componentName}CardChange() {
  const mutation = useMutation({
    mutationFn: (event: CardMoveEvent) => persistCardMove(event),
    gcTime: GC_TIME_MS,
  });
  // \`mutateAsync\` rethrows, so errors still reach your caller unchanged.
  return mutation.mutateAsync;
}

/** Called when an infinite-scroll column reaches its sentinel. */
export function use${componentName}LoadMore() {
  const mutation = useMutation({
    mutationFn: (event: LoadMoreEvent) => fetchMoreCards(event),
    gcTime: GC_TIME_MS,
  });
  return mutation.mutateAsync;
}
`;
  }

  return `import { useCallback } from "react";

import {
  persistCardMove,
  fetchMoreCards,
  type CardMoveEvent,
  type LoadMoreEvent,
} from "./services";

${doc}

/** Called whenever a card is dropped into a new position via DnD. */
export function use${componentName}CardChange() {
  return useCallback(async (event: CardMoveEvent) => {
    await persistCardMove(event);
  }, []);
}

/** Called when an infinite-scroll column reaches its sentinel. */
export function use${componentName}LoadMore() {
  return useCallback(async (event: LoadMoreEvent) => {
    await fetchMoreCards(event);
  }, []);
}
`;
}
