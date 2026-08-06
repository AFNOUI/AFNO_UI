/**
 * Ensures the chart registry entries match canonical sources on disk.
 *
 * Charts are the one engine that had no drift verifier: unlike dnd/tables/
 * kanban/tree (single aggregated bundles), each chart ships as its own
 * component entry produced by `scripts/build-registry.ts`, so nothing failed
 * the build when `app/components/ui/charts/*` changed without a rebuild.
 *
 * Checks, per entry:
 *   1. every chart source on disk has a `charts-<name>.json` entry
 *   2. every `charts-*.json` still has a source on disk (catches deletions)
 *   3. embedded `content` matches the source byte-for-byte, after applying the
 *      same `../chart-primitives` → `../ui/chart-primitives` rewrite the
 *      builder applies
 *   4. every entry is listed in `index.json`, so the CLI can resolve it
 *
 * Run: node scripts/verify-charts-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY_DIR = path.join(ROOT, "public", "registry");
const CHARTS_SRC_DIR = path.join(ROOT, "app", "components", "ui", "charts");
const INDEX_JSON = path.join(REGISTRY_DIR, "index.json");

const REBUILD = "npm run build:registry";

/**
 * Mirrors `rewriteChartPrimitivesImportForRegistryTarget` in
 * scripts/build-registry.ts. Charts install to `components/charts/*`, while the
 * primitives land in `components/ui/chart-primitives`, so the relative import
 * gains a `ui/` hop. Kept in lockstep with the builder by construction: if the
 * builder's rule changes, this comparison fails loudly rather than silently
 * passing.
 */
function rewriteChartPrimitivesImport(content, targetPath) {
  const norm = targetPath.replace(/\\/g, "/");
  if (!norm.includes("components/charts/") || norm.includes("/ui/charts/")) return content;
  return content.replace(/from\s+(["'])\.\.\/chart-primitives\1/g, "from $1../ui/chart-primitives$1");
}

const normalize = (s) => s.replace(/\r\n/g, "\n");

/** One registry entry ↔ one source file. */
function checkEntry({ entryName, sourceAbs, targetPath, errors }) {
  const jsonPath = path.join(REGISTRY_DIR, `${entryName}.json`);

  if (!fs.existsSync(jsonPath)) {
    errors.push(`Missing registry entry ${entryName}.json for ${path.relative(ROOT, sourceAbs)}`);
    return false;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (e) {
    errors.push(`${entryName}.json is not valid JSON: ${e.message}`);
    return false;
  }

  const file = data?.files?.find((f) => f?.path === targetPath);
  if (!file) {
    errors.push(`${entryName}.json has no file entry for target "${targetPath}"`);
    return false;
  }
  if (typeof file.content !== "string") {
    errors.push(`${entryName}.json file "${targetPath}" has no string content`);
    return false;
  }

  const expected = normalize(
    rewriteChartPrimitivesImport(fs.readFileSync(sourceAbs, "utf8"), targetPath),
  );
  const actual = normalize(file.content);

  if (expected !== actual) {
    errors.push(
      `Mismatch: ${targetPath} (source: ${path.relative(ROOT, sourceAbs)})\n` +
        `  disk ${expected.length} chars, registry ${actual.length} chars — run: ${REBUILD}`,
    );
    return false;
  }
  return true;
}

if (!fs.existsSync(CHARTS_SRC_DIR)) {
  console.error(`Missing ${path.relative(ROOT, CHARTS_SRC_DIR)}`);
  process.exit(1);
}

const errors = [];
let checked = 0;

// ── 1 + 3. Every chart source must be registered and in sync ───────────────
const chartSources = fs
  .readdirSync(CHARTS_SRC_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .sort();

const expectedEntries = new Set();

for (const fileName of chartSources) {
  const base = fileName.replace(/\.tsx$/, "");
  const entryName = `charts-${base}`;
  expectedEntries.add(entryName);
  const ok = checkEntry({
    entryName,
    sourceAbs: path.join(CHARTS_SRC_DIR, fileName),
    targetPath: `components/charts/${base}.tsx`,
    errors,
  });
  if (ok) checked++;
}

// The primitives every chart imports ship as their own entry.
expectedEntries.add("chart-primitives");
if (
  checkEntry({
    entryName: "chart-primitives",
    sourceAbs: path.join(ROOT, "app", "components", "ui", "chart-primitives.tsx"),
    targetPath: "components/ui/chart-primitives.tsx",
    errors,
  })
) {
  checked++;
}

// ── 2. Orphans: a registry entry whose source was deleted or renamed ───────
const publishedChartEntries = fs
  .readdirSync(REGISTRY_DIR)
  .filter((f) => /^charts-.+\.json$/.test(f))
  .map((f) => f.replace(/\.json$/, ""));

for (const entryName of publishedChartEntries) {
  if (!expectedEntries.has(entryName)) {
    errors.push(
      `Orphan registry entry ${entryName}.json — no matching source in ` +
        `${path.relative(ROOT, CHARTS_SRC_DIR)}. Delete it and run: ${REBUILD}`,
    );
  }
}

// ── 4. index.json must list every entry, or the CLI cannot resolve it ──────
if (!fs.existsSync(INDEX_JSON)) {
  errors.push(`Missing ${path.relative(ROOT, INDEX_JSON)} — run: ${REBUILD}`);
} else {
  const index = JSON.parse(fs.readFileSync(INDEX_JSON, "utf8"));
  const listed = new Set(Array.isArray(index) ? index : []);
  for (const entryName of expectedEntries) {
    if (!listed.has(entryName)) {
      errors.push(`${entryName} is missing from index.json — run: ${REBUILD}`);
    }
  }
}

if (errors.length > 0) {
  for (const message of errors) console.error(message);
  console.error(`\n✖ ${errors.length} issue(s). Run: ${REBUILD}`);
  process.exit(1);
}

console.log(`✓ chart registry in sync with disk (${checked} embedded files checked)`);
