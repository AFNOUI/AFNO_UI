/**
 * Verifies export-related token lists stay aligned with app/globals.css.
 * Run: node scripts/verify-theme-export-sync.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GLOBALS_CSS = path.join(ROOT, "app", "globals.css");
const THEME_CONTEXT = path.join(ROOT, "app", "contexts", "ThemeContext.tsx");
const EXPORT_PLAN = path.join(ROOT, "app", "data", "globalsCssExportPlan.ts");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function extractNamedBlock(css, selector) {
  const start = css.indexOf(selector);
  if (start < 0) return null;
  const open = css.indexOf("{", start);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return null;
}

function extractVarNames(text) {
  const names = new Set();
  const re = /(--[a-z0-9-]+)\s*:/gi;
  let m;
  while ((m = re.exec(text))) names.add(m[1]);
  return names;
}

function extractThemeContextNames(tsx) {
  const names = new Set();
  const re = /name:\s*"(--[a-z0-9-]+)"/gi;
  let m;
  while ((m = re.exec(tsx))) names.add(m[1]);
  return names;
}

const css = read(GLOBALS_CSS);
const themeContext = read(THEME_CONTEXT);
const exportPlan = read(EXPORT_PLAN);

const rootBlock = extractNamedBlock(css, ":root");
const darkBlock = extractNamedBlock(css, ".dark");
if (!rootBlock || !darkBlock) {
  console.error("✖ Unable to parse :root or .dark block in app/globals.css");
  process.exit(1);
}

const rootVars = extractVarNames(rootBlock);
const darkVars = extractVarNames(darkBlock);
const defaultVars = extractThemeContextNames(themeContext);
const plannedVars = extractThemeContextNames(exportPlan);

const missingDefaults = [...rootVars].filter((v) => !defaultVars.has(v));
const missingPlan = [...rootVars].filter((v) => !plannedVars.has(v));
const darkOnlyVars = [...darkVars].filter((v) => !rootVars.has(v));

let failed = false;
if (missingDefaults.length) {
  failed = true;
  console.error("✖ New :root token(s) missing in ThemeContext defaults:");
  for (const v of missingDefaults.sort()) console.error(`  - ${v}`);
}
if (missingPlan.length) {
  failed = true;
  console.error("✖ New :root token(s) missing in globalsCssExportPlan:");
  for (const v of missingPlan.sort()) console.error(`  - ${v}`);
}
if (darkOnlyVars.length) {
  failed = true;
  console.error("✖ .dark defines token(s) not present in :root:");
  for (const v of darkOnlyVars.sort()) console.error(`  - ${v}`);
}

if (failed) {
  console.error("\nUpdate ThemeContext defaults and export plan to keep exports production-safe.");
  process.exit(1);
}

console.log(
  `✓ theme export sync OK (${rootVars.size} :root vars, ${darkVars.size} .dark vars validated against defaults + plan)`,
);
