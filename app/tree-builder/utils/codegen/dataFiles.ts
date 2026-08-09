/**
 * The data layer for a generated tree: `constants.ts`, `services.ts` and
 * `hooks.ts`.
 *
 * Extracted from `treeCodeGenerator.ts` so that file stays about rendering the
 * canvas, not about transport. See AI_AGENT_RULES § R-55 (the layering these
 * files implement) and § R-56 / § R-57 (transport opt-ins + tunables).
 */
import {
  cliGatedNote,
  emitConstantsFile,
  tanstackConstants,
  type ConstantsEntry,
  type TransportChoice,
} from "@/lib/codegen/transport";

export function emitTreeConstants(title: string, transport: TransportChoice): string {
  const entries: ConstantsEntry[] = [
    { name: "API_BASE", value: '"/api"', doc: "Base URL every request in services.ts is built from." },
    { name: "NODES_PATH", value: '"/nodes"', doc: "Appended to API_BASE for node create / update / delete / move." },
    {
      name: "BASE_HEADERS",
      value: "{} as Record<string, string>",
      doc: "Sent on every request. Add auth headers here.",
    },
  ];
  if (transport.query === "tanstack") entries.push(...tanstackConstants());
  return emitConstantsFile(`the ${title} tree`, entries);
}

export function emitServicesFile(transport: TransportChoice): string {
  const requestHelper =
    transport.http === "axios"
      ? `import axios from "axios";

/** Single place the HTTP client is named — swap clients or add interceptors here. */
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
      : `/** Single place the HTTP client is named — swap it or add interceptors here. */
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

  return `import { API_BASE, NODES_PATH, BASE_HEADERS } from "./constants";
import type {
  TreeNodeAddEvent,
  TreeNodeUpdateEvent,
  TreeNodeRemoveEvent,
  TreeNodeMoveEvent,
} from "@/components/tree/types";

/**
 * Network layer for this tree — the ONLY file here that should talk to your
 * backend (AI_AGENT_RULES § R-55: component → hooks.ts → services.ts).
 *
 * The bodies below are stubs so the tree works offline out of the box. Replace
 * them with real requests; the hooks and the component do not change.
 *
${cliGatedNote("http", transport)}
 */

${requestHelper}

/** Fully-qualified endpoint these services target. Keeps NODES_PATH in one place. */
export const NODE_ENDPOINT = \`\${API_BASE}\${NODES_PATH}\`;

/** Persist a newly created node. */
export async function createNode(event: TreeNodeAddEvent): Promise<void> {
  // TODO: replace with your backend call, e.g. POST /api/nodes
  console.log("[tree] node added", event);
}

/** Persist an edit to an existing node. */
export async function updateNode(event: TreeNodeUpdateEvent): Promise<void> {
  // TODO: replace with your backend call, e.g. PATCH /api/nodes/:id
  console.log("[tree] node updated", event);
}

/** Persist a node deletion. */
export async function deleteNode(event: TreeNodeRemoveEvent): Promise<void> {
  // TODO: replace with your backend call, e.g. DELETE /api/nodes/:id
  console.log("[tree] node removed", event);
}

/** Persist a re-parent / reorder. */
export async function moveNode(event: TreeNodeMoveEvent): Promise<void> {
  // TODO: replace with your backend call, e.g. PATCH /api/nodes/:id/parent
  console.log("[tree] node moved", event);
}
`;
}

export function emitHooksFile(componentName: string, transport: TransportChoice): string {
  const doc = `/**
 * React glue between the tree component and \`services.ts\` — one handler per
 * mutation.
 *
 * Per AI_AGENT_RULES § R-55 this is the ONLY file that calls services; the
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

  const imports = `import type {
  TreeNodeAddEvent,
  TreeNodeUpdateEvent,
  TreeNodeRemoveEvent,
  TreeNodeMoveEvent,
} from "@/components/tree/types";

import { createNode, updateNode, deleteNode, moveNode } from "./services";`;

  if (transport.query === "tanstack") {
    return `import { useMutation } from "@tanstack/react-query";

${imports}
import { GC_TIME_MS } from "./constants";

${doc}
export function use${componentName}Handlers() {
  // \`mutateAsync\` rethrows, so errors reach your caller unchanged.
  const add = useMutation({ mutationFn: (e: TreeNodeAddEvent) => createNode(e), gcTime: GC_TIME_MS });
  const update = useMutation({ mutationFn: (e: TreeNodeUpdateEvent) => updateNode(e), gcTime: GC_TIME_MS });
  const remove = useMutation({ mutationFn: (e: TreeNodeRemoveEvent) => deleteNode(e), gcTime: GC_TIME_MS });
  const move = useMutation({ mutationFn: (e: TreeNodeMoveEvent) => moveNode(e), gcTime: GC_TIME_MS });

  return {
    handleNodeAdd: add.mutateAsync,
    handleNodeUpdate: update.mutateAsync,
    handleNodeRemove: remove.mutateAsync,
    handleNodeMove: move.mutateAsync,
  };
}
`;
  }

  return `import { useCallback } from "react";

${imports}

${doc}
export function use${componentName}Handlers() {
  const handleNodeAdd = useCallback(async (event: TreeNodeAddEvent) => {
    await createNode(event);
  }, []);

  const handleNodeUpdate = useCallback(async (event: TreeNodeUpdateEvent) => {
    await updateNode(event);
  }, []);

  const handleNodeRemove = useCallback(async (event: TreeNodeRemoveEvent) => {
    await deleteNode(event);
  }, []);

  const handleNodeMove = useCallback(async (event: TreeNodeMoveEvent) => {
    await moveNode(event);
  }, []);

  return { handleNodeAdd, handleNodeUpdate, handleNodeRemove, handleNodeMove };
}
`;
}
