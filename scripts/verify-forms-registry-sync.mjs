/**
 * Ensures public/registry/forms.json embedded `code` matches canonical sources on disk (app/forms/, app/components/ui/form-primitives.tsx, etc.).
 * Run: node scripts/verify-forms-registry-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FORMS_JSON = path.join(ROOT, "public", "registry", "forms.json");

function normalize(s) {
  return s.replace(/\r\n/g, "\n");
}

function collectRegistryFiles(obj) {
  const out = [];
  const pushBucket = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item?.path && typeof item.code === "string") out.push(item);
    }
  };
  if (obj.shared) {
    pushBucket(obj.shared.core);
    pushBucket(obj.shared.hook);
    pushBucket(obj.shared.util);
  }
  const stacks = obj.stacks;
  if (stacks && typeof stacks === "object") {
    for (const key of Object.keys(stacks)) {
      const bundle = stacks[key];
      if (bundle?.fixed) {
        pushBucket(bundle.fixed.core);
        pushBucket(bundle.fixed.hook);
        pushBucket(bundle.fixed.util);
      }
      if (bundle?.fields && typeof bundle.fields === "object") {
        for (const k of Object.keys(bundle.fields)) {
          const item = bundle.fields[k];
          if (item?.path && typeof item.code === "string") out.push(item);
        }
      }
    }
  }
  return out;
}

function diskPath(registryPath) {
  const rel = String(registryPath).replace(/^\/+/, "");
  return path.join(ROOT, rel);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

const raw = fs.readFileSync(FORMS_JSON, "utf8");
const data = JSON.parse(raw);
const files = collectRegistryFiles(data);

let errors = 0;

const stackInstall = data?.stackInstall;
if (!stackInstall || typeof stackInstall !== "object") {
  console.error("Missing or invalid stackInstall in forms.json");
  errors++;
} else {
  for (const stack of ["rhf", "tanstack", "action"]) {
    const spec = stackInstall[stack];
    if (!spec || typeof spec !== "object") {
      console.error(`Missing stackInstall.${stack} in forms.json`);
      errors++;
      continue;
    }
    if (!isStringArray(spec.npmDependencies)) {
      console.error(`Invalid stackInstall.${stack}.npmDependencies (must be string[])`);
      errors++;
    }
    if (spec.npmDevDependencies !== undefined && !isStringArray(spec.npmDevDependencies)) {
      console.error(`Invalid stackInstall.${stack}.npmDevDependencies (must be string[] when present)`);
      errors++;
    }
    if (!isStringArray(spec.uiComponents)) {
      console.error(`Invalid stackInstall.${stack}.uiComponents (must be string[])`);
      errors++;
    }
  }
}

for (const f of files) {
  const abs = diskPath(f.path);
  if (!fs.existsSync(abs)) {
    console.error(`Missing source file for registry path: ${f.path} → ${abs}`);
    errors++;
    continue;
  }
  const disk = normalize(fs.readFileSync(abs, "utf8"));
  const reg = normalize(f.code);
  if (disk !== reg) {
    console.error(`Mismatch: ${f.path}`);
    console.error(`  expected ${disk.length} chars on disk, registry has ${reg.length} chars`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n✖ ${errors} file(s) out of sync. Run: npm run build:forms-registry`);
  process.exit(1);
}

console.log(`✓ forms.json in sync with disk (${files.length} embedded files checked)`);
