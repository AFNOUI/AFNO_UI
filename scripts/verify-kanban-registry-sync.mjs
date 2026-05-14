/**
 * Ensures public/registry/kanban.json embedded `code` matches canonical sources on
 * disk after applying the same self-reference import rewrites as
 * `scripts/build-kanban-registry.ts`.
 *
 * Run: node scripts/verify-kanban-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KANBAN_JSON = path.join(ROOT, "public", "registry", "kanban.json");

const TARGET_TO_SOURCE = {
  "components/kanban/KanbanBoard.tsx": "app/kanban/KanbanBoard.tsx",
  "components/kanban/KanbanCard.tsx": "app/kanban/KanbanCard.tsx",
  "components/kanban/KanbanCardDialog.tsx": "app/kanban/KanbanCardDialog.tsx",
  "components/kanban/KanbanAddCardDialog.tsx": "app/kanban/KanbanAddCardDialog.tsx",
  "components/kanban/types.ts": "app/kanban/types.ts",
  // Sandbox helpers ship to a sibling `utils/` folder (NOT under `components/tables/`).
  "utils/cellJsRunner.ts": "app/utils/cellJsRunner.ts",
  "utils/rowDialogTemplate.ts": "app/utils/rowDialogTemplate.ts",
  "lib/dnd/index.ts": "app/components/ui/dnd/index.ts",
  "lib/dnd/DndContext.tsx": "app/components/ui/dnd/DndContext.tsx",
  "lib/dnd/useDraggable.ts": "app/components/ui/dnd/useDraggable.ts",
  "lib/dnd/useDropZone.ts": "app/components/ui/dnd/useDropZone.ts",
  "lib/dnd/DropIndicator.tsx": "app/components/ui/dnd/DropIndicator.tsx",
  "lib/dnd/types.ts": "app/components/ui/dnd/types.ts",
  "lib/dnd/dnd.css": "app/components/ui/dnd/dnd.css",
};

/** Same transform used by scripts/build-kanban-registry.ts — keep in sync. */
function rewriteSharedFileImports(source) {
  return source
    .replace(/from\s+(["'])@\/kanban\/types\1/g, "from $1./types$1")
    .replace(/from\s+(["'])@\/kanban\/KanbanCard\1/g, "from $1./KanbanCard$1")
    .replace(/from\s+(["'])@\/kanban\/KanbanCardDialog\1/g, "from $1./KanbanCardDialog$1")
    .replace(/from\s+(["'])@\/kanban\/KanbanAddCardDialog\1/g, "from $1./KanbanAddCardDialog$1")
    .replace(/from\s+(["'])@\/kanban\/dnd\1/g, "from $1@/lib/dnd$1")
    .replace(/from\s+(["'])@\/utils\/cellJsRunner\1/g, "from $1../../utils/cellJsRunner$1")
    .replace(/from\s+(["'])@\/utils\/rowDialogTemplate\1/g, "from $1../../utils/rowDialogTemplate$1");
}

function normalize(s) {
  return s.replace(/\r\n/g, "\n");
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

if (!fs.existsSync(KANBAN_JSON)) {
  console.error(`Missing ${path.relative(ROOT, KANBAN_JSON)} — run: npm run build:kanban-registry`);
  process.exit(1);
}

const raw = fs.readFileSync(KANBAN_JSON, "utf8");
const data = JSON.parse(raw);

let errors = 0;

const kanbanInstall = data?.kanbanInstall;
if (!kanbanInstall || typeof kanbanInstall !== "object") {
  console.error("Missing or invalid kanbanInstall in kanban.json");
  errors++;
} else {
  if (!isStringArray(kanbanInstall.npmDependencies)) {
    console.error("Invalid kanbanInstall.npmDependencies (must be string[])");
    errors++;
  }
  if (
    kanbanInstall.npmDevDependencies !== undefined &&
    !isStringArray(kanbanInstall.npmDevDependencies)
  ) {
    console.error("Invalid kanbanInstall.npmDevDependencies (must be string[] when present)");
    errors++;
  }
  if (!isStringArray(kanbanInstall.uiComponents)) {
    console.error("Invalid kanbanInstall.uiComponents (must be string[])");
    errors++;
  }
}

if (!Array.isArray(data?.shared)) {
  console.error("Missing or invalid shared[] in kanban.json");
  errors++;
} else {
  for (const file of data.shared) {
    if (!file?.path || typeof file.code !== "string") {
      console.error(`Invalid shared entry: ${JSON.stringify(file)}`);
      errors++;
      continue;
    }
    const sourceRel = TARGET_TO_SOURCE[file.path];
    if (!sourceRel) {
      console.error(`Unknown target path in kanban.json shared[]: ${file.path}`);
      errors++;
      continue;
    }
    const abs = path.join(ROOT, sourceRel);
    if (!fs.existsSync(abs)) {
      console.error(`Missing source file for ${file.path}: ${sourceRel}`);
      errors++;
      continue;
    }
    const isCss = sourceRel.endsWith(".css");
    const onDisk = normalize(
      isCss ? fs.readFileSync(abs, "utf8") : rewriteSharedFileImports(fs.readFileSync(abs, "utf8")),
    );
    const inRegistry = normalize(file.code);
    if (onDisk !== inRegistry) {
      console.error(`Mismatch: ${file.path} (source: ${sourceRel})`);
      console.error(
        `  disk ${onDisk.length} chars, registry ${inRegistry.length} chars — run: npm run build:kanban-registry`,
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n✖ ${errors} issue(s). Run: npm run build:kanban-registry`);
  process.exit(1);
}

console.log(
  `✓ kanban.json in sync with disk (${data.shared.length} embedded files checked)`,
);
