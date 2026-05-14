import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import { nodeToJSX } from "./codegen/dispatch";
import { buildImports, createImportTracker } from "./codegen/imports";

/**
 * Public API: generate a runnable React page from a UI-Builder node tree.
 *
 * The heavy lifting (per-type JSX rendering, import bookkeeping, HTML-entity
 * escaping, responsive class flattening) lives under `./codegen/`. This module
 * is intentionally thin so the public surface used by `CodePreviewPanel` and
 * downstream tests stays stable.
 *
 * Byte-for-byte output is locked in by `tests/codegen/uiBuilderCodeGen.test.ts`
 * snapshots — every branch of the dispatcher is covered there.
 */
export function generateCleanCode(nodes: BuilderNode[]): string {
    if (nodes.length === 0) return "// Empty canvas — drag components to get started";
    const imports = createImportTracker();
    const jsx = nodes.map((n) => nodeToJSX(n, imports, 6)).join("\n\n");
    const importStatements = buildImports(imports);
    return `${importStatements ? `${importStatements}\n\n` : ""}export default function Page() {
  return (
    <div className="min-h-screen">
${jsx}
    </div>
  );
}`;
}
