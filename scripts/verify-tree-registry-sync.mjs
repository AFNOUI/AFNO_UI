/**
 * Ensures public/registry/tree.json embedded `code` matches canonical sources on
 * disk after applying the same self-reference import rewrites as
 * `scripts/build-tree-registry.ts`. Checks both the always-shipped `shared`
 * engine files and every `optionalShared` feature group (e.g. the GraphToolbar).
 *
 * Run: node scripts/verify-tree-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TREE_JSON = path.join(ROOT, "public", "registry", "tree.json");

const TARGET_TO_SOURCE = {
  "components/tree/TreeCanvas.tsx": "app/trees/TreeCanvas.tsx",
  "components/tree/treeLayout.ts": "app/trees/treeLayout.ts",
  "components/tree/types.ts": "app/trees/types.d.ts",
  "components/graph/index.ts": "app/components/ui/graph/index.ts",
  "components/graph/types.ts": "app/components/ui/graph/types.ts",
  "components/graph/GraphToolbar.tsx": "app/components/ui/graph/GraphToolbar.tsx",
  "components/graph/useGraphFilter.ts": "app/components/ui/graph/useGraphFilter.ts",
};

/** Same transform used by scripts/build-tree-registry.ts — keep in sync. */
function rewriteSharedFileImports(source) {
  return source
    .replace(/from\s+(["'])@\/trees\/types\1/g, "from $1./types$1")
    .replace(/from\s+(["'])@\/trees\/treeLayout\1/g, "from $1./treeLayout$1")
    .replace(/from\s+(["'])@\/trees\/TreeCanvas\1/g, "from $1./TreeCanvas$1")
    .replace(/@\/components\/ui\/graph/g, "@/components/graph");
}

function normalize(s) {
  return s.replace(/\r\n/g, "\n");
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

if (!fs.existsSync(TREE_JSON)) {
  console.error(`Missing ${path.relative(ROOT, TREE_JSON)} — run: npm run build:tree-registry`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(TREE_JSON, "utf8"));

let errors = 0;

const treeInstall = data?.treeInstall;
if (!treeInstall || typeof treeInstall !== "object") {
  console.error("Missing or invalid treeInstall in tree.json");
  errors++;
} else {
  if (!isStringArray(treeInstall.npmDependencies)) {
    console.error("Invalid treeInstall.npmDependencies (must be string[])");
    errors++;
  }
  if (
    treeInstall.npmDevDependencies !== undefined &&
    !isStringArray(treeInstall.npmDevDependencies)
  ) {
    console.error("Invalid treeInstall.npmDevDependencies (must be string[] when present)");
    errors++;
  }
  if (!isStringArray(treeInstall.uiComponents)) {
    console.error("Invalid treeInstall.uiComponents (must be string[])");
    errors++;
  }
}

function checkFile(file, where) {
  if (!file?.path || typeof file.code !== "string") {
    console.error(`Invalid ${where} entry: ${JSON.stringify(file)}`);
    errors++;
    return;
  }
  const sourceRel = TARGET_TO_SOURCE[file.path];
  if (!sourceRel) {
    console.error(`Unknown target path in tree.json ${where}: ${file.path}`);
    errors++;
    return;
  }
  const abs = path.join(ROOT, sourceRel);
  if (!fs.existsSync(abs)) {
    console.error(`Missing source file for ${file.path}: ${sourceRel}`);
    errors++;
    return;
  }
  const isCss = sourceRel.endsWith(".css");
  const onDisk = normalize(
    isCss ? fs.readFileSync(abs, "utf8") : rewriteSharedFileImports(fs.readFileSync(abs, "utf8")),
  );
  const inRegistry = normalize(file.code);
  if (onDisk !== inRegistry) {
    console.error(`Mismatch: ${file.path} (source: ${sourceRel})`);
    console.error(
      `  disk ${onDisk.length} chars, registry ${inRegistry.length} chars — run: npm run build:tree-registry`,
    );
    errors++;
  }
}

let checked = 0;

if (!Array.isArray(data?.shared)) {
  console.error("Missing or invalid shared[] in tree.json");
  errors++;
} else {
  for (const file of data.shared) {
    checkFile(file, "shared[]");
    checked++;
  }
}

if (data?.optionalShared !== undefined) {
  if (!Array.isArray(data.optionalShared)) {
    console.error("Invalid optionalShared[] in tree.json (must be an array when present)");
    errors++;
  } else {
    for (const group of data.optionalShared) {
      if (!group?.feature || !Array.isArray(group.files)) {
        console.error(`Invalid optionalShared group: ${JSON.stringify(group?.feature)}`);
        errors++;
        continue;
      }
      for (const file of group.files) {
        checkFile(file, `optionalShared[${group.feature}]`);
        checked++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n✖ ${errors} issue(s). Run: npm run build:tree-registry`);
  process.exit(1);
}

console.log(`✓ tree.json in sync with disk (${checked} embedded files checked)`);
