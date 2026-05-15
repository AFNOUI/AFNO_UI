/**
 * Ensures public/registry/dnd.json embedded `code` matches canonical sources on
 * disk (same bytes as scripts/build-dnd-registry.ts — no import rewrites).
 *
 * Run: node scripts/verify-dnd-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DND_JSON = path.join(ROOT, "public", "registry", "dnd.json");

const TARGET_TO_SOURCE = {
  "components/dnd/index.ts": "app/components/ui/dnd/index.ts",
  "components/dnd/DndContext.tsx": "app/components/ui/dnd/DndContext.tsx",
  "components/dnd/useDraggable.ts": "app/components/ui/dnd/useDraggable.ts",
  "components/dnd/useDropZone.ts": "app/components/ui/dnd/useDropZone.ts",
  "components/dnd/DropIndicator.tsx": "app/components/ui/dnd/DropIndicator.tsx",
  "components/dnd/types.ts": "app/components/ui/dnd/types.ts",
  "components/dnd/dnd.css": "app/components/ui/dnd/dnd.css",
};

function normalize(s) {
  return s.replace(/\r\n/g, "\n");
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

if (!fs.existsSync(DND_JSON)) {
  console.error(`Missing ${path.relative(ROOT, DND_JSON)} — run: npm run build:dnd-registry`);
  process.exit(1);
}

const raw = fs.readFileSync(DND_JSON, "utf8");
const data = JSON.parse(raw);

let errors = 0;

const dndInstall = data?.dndInstall;
if (!dndInstall || typeof dndInstall !== "object") {
  console.error("Missing or invalid dndInstall in dnd.json");
  errors++;
} else {
  if (!isStringArray(dndInstall.npmDependencies)) {
    console.error("Invalid dndInstall.npmDependencies (must be string[])");
    errors++;
  }
  if (dndInstall.npmDevDependencies !== undefined && !isStringArray(dndInstall.npmDevDependencies)) {
    console.error("Invalid dndInstall.npmDevDependencies (must be string[] when present)");
    errors++;
  }
  if (!isStringArray(dndInstall.uiComponents)) {
    console.error("Invalid dndInstall.uiComponents (must be string[])");
    errors++;
  }
}

if (!Array.isArray(data?.shared)) {
  console.error("Missing or invalid shared[] in dnd.json");
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
      console.error(`Unknown target path in dnd.json shared[]: ${file.path}`);
      errors++;
      continue;
    }
    const abs = path.join(ROOT, sourceRel);
    if (!fs.existsSync(abs)) {
      console.error(`Missing source file for ${file.path}: ${sourceRel}`);
      errors++;
      continue;
    }
    const onDisk = normalize(fs.readFileSync(abs, "utf8"));
    const inRegistry = normalize(file.code);
    if (onDisk !== inRegistry) {
      console.error(`Mismatch: ${file.path} (source: ${sourceRel})`);
      console.error(
        `  disk ${onDisk.length} chars, registry ${inRegistry.length} chars — run: npm run build:dnd-registry`,
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n✖ ${errors} issue(s). Run: npm run build:dnd-registry`);
  process.exit(1);
}

console.log(`✓ dnd.json in sync with disk (${data.shared.length} embedded files checked)`);
