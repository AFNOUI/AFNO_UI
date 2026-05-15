/**
 * Ensures public/registry/tables.json embedded `code` matches canonical sources on disk
 * (app/table-builder/TablePreview.tsx, app/table-builder/hooks/useTablePreview.ts,
 * app/tables/types/types.ts, app/components/ui/table.tsx) after applying the same
 * self-reference import rewrites as `scripts/build-tables-registry.ts`.
 *
 * Run: node scripts/verify-tables-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TABLES_JSON = path.join(ROOT, "public", "registry", "tables.json");

const TARGET_TO_SOURCE = {
  "components/tables/TablePreview.tsx": "app/table-builder/TablePreview.tsx",
  "components/tables/useTablePreview.ts": "app/table-builder/hooks/useTablePreview.ts",
  "components/tables/types.ts": "app/tables/types/types.ts",
  "utils/cellJsRunner.ts": "app/utils/cellJsRunner.ts",
  "utils/rowDialogTemplate.ts": "app/utils/rowDialogTemplate.ts",
  "components/ui/table.tsx": "app/components/ui/table.tsx",
  "components/shared/VariantJsonConfigPanel.tsx":
    "app/components/shared/VariantJsonConfigPanel.tsx",
  "components/dnd/index.ts": "app/components/ui/dnd/index.ts",
  "components/dnd/DndContext.tsx": "app/components/ui/dnd/DndContext.tsx",
  "components/dnd/useDraggable.ts": "app/components/ui/dnd/useDraggable.ts",
  "components/dnd/useDropZone.ts": "app/components/ui/dnd/useDropZone.ts",
  "components/dnd/DropIndicator.tsx": "app/components/ui/dnd/DropIndicator.tsx",
  "components/dnd/types.ts": "app/components/ui/dnd/types.ts",
  "components/dnd/dnd.css": "app/components/ui/dnd/dnd.css",
};

/** Same transform used by scripts/build-tables-registry.ts — keep in sync. */
function rewriteSharedFileImports(source) {
  return source
    .replace(
      /from\s+(["'])@\/table-builder\/hooks\/useTablePreview\1/g,
      "from $1./useTablePreview$1",
    )
    .replace(
      /from\s+(["'])@\/table-builder\/data\/tableBuilderTemplates\1/g,
      "from $1./types$1",
    )
    .replace(
      /from\s+(["'])@\/utils\/cellJsRunner\1/g,
      "from $1../../utils/cellJsRunner$1",
    )
    .replace(
      /from\s+(["'])@\/utils\/rowDialogTemplate\1/g,
      "from $1../../utils/rowDialogTemplate$1",
    )
    .replace(
      /from\s+(["'])@\/table-builder\/utils\/cellJsRunner\1/g,
      "from $1../../utils/cellJsRunner$1",
    )
    .replace(
      /from\s+(["'])@\/components\/ui\/dnd\1/g,
      "from $1../dnd$1",
    );
}

function normalize(s) {
  return s.replace(/\r\n/g, "\n");
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

if (!fs.existsSync(TABLES_JSON)) {
  console.error(`Missing ${path.relative(ROOT, TABLES_JSON)} — run: npm run build:tables-registry`);
  process.exit(1);
}

const raw = fs.readFileSync(TABLES_JSON, "utf8");
const data = JSON.parse(raw);

let errors = 0;

const tableInstall = data?.tableInstall;
if (!tableInstall || typeof tableInstall !== "object") {
  console.error("Missing or invalid tableInstall in tables.json");
  errors++;
} else {
  if (!isStringArray(tableInstall.npmDependencies)) {
    console.error("Invalid tableInstall.npmDependencies (must be string[])");
    errors++;
  }
  if (
    tableInstall.npmDevDependencies !== undefined &&
    !isStringArray(tableInstall.npmDevDependencies)
  ) {
    console.error("Invalid tableInstall.npmDevDependencies (must be string[] when present)");
    errors++;
  }
  if (!isStringArray(tableInstall.uiComponents)) {
    console.error("Invalid tableInstall.uiComponents (must be string[])");
    errors++;
  }
}

if (!Array.isArray(data?.shared)) {
  console.error("Missing or invalid shared[] in tables.json");
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
      console.error(`Unknown target path in tables.json shared[]: ${file.path}`);
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
      isCss
        ? fs.readFileSync(abs, "utf8")
        : rewriteSharedFileImports(fs.readFileSync(abs, "utf8")),
    );
    const inRegistry = normalize(file.code);
    if (onDisk !== inRegistry) {
      console.error(`Mismatch: ${file.path} (source: ${sourceRel})`);
      console.error(
        `  disk ${onDisk.length} chars, registry ${inRegistry.length} chars — run: npm run build:tables-registry`,
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n✖ ${errors} issue(s). Run: npm run build:tables-registry`);
  process.exit(1);
}

console.log(
  `✓ tables.json in sync with disk (${data.shared.length} embedded files checked)`,
);
