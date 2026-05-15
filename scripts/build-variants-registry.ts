import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import type { FormLibrary } from "../app/registry/formRegistry";
import { buildFormVariantStackFiles } from "../app/form-builder/utils/formCodeGenerator";
import { buildChartVariantCode, chartVariantSources } from "../app/components/lab/charts/chartVariantSources";
import {
  dndVariantFilePath,
  dndVariantSources,
} from "../app/components/lab/dnd/dndVariantSources";
import { tableTemplates } from "../app/table-builder/data/tableBuilderTemplates";
import type { DataMode } from "../app/table-builder/utils/tableCodeGenerator";
import { buildTableVariantFiles } from "../app/table-builder/utils/variantBundle";
import { kanbanTemplates } from "../app/kanban-builder/data/kanbanBuilderTemplates";
import { buildKanbanVariantFiles } from "../app/kanban-builder/utils/variantBundle";

/**
 * Build Variants Registry Script
 *
 * - Non-form / non-table / non-kanban variants: one file from the module's `code` export.
 * - Form variants (`app/registry/forms/*.tsx`): `formConfig` + buildFormVariantStackFiles
 *   → per-stack bundles under `forms/<slug>/` (relative imports to `components/forms/`).
 * - Table variants (built directly from `tableTemplates`): `tableConfig` (+ optional `dataMode`)
 *   → per-variant bundles under `tables/<slug>/` (installs to `tableVariants`, e.g. `app/tables/<slug>/`).
 *   The shared engine files are shipped separately via `public/registry/tables.json`.
 * - Kanban variants (built directly from `kanbanTemplates`): `KanbanBuilderConfig` + cards
 *   → per-variant bundles under `kanban/<slug>/` (installs to `kanbanVariants`, e.g. `app/kanban/<slug>/`).
 *   Mirrors the table pipeline; engine files ship via `public/registry/kanban.json`.
 *
 *   npx afnoui add <category>/<variant> [--stack rhf|tanstack|action]
 *   Chart variants:  npx afnoui add charts/<type>/<variant>  (e.g. charts/bar/default)
 *   Table variants:  npx afnoui add tables/<variant>
 *   Kanban variants: npx afnoui add kanban/<variant>
 *   DnD variants:    npx afnoui add dnd/<variant>            (e.g. dnd/sortable-list)
 *
 * DnD variants ship a single example file at
 *   `components/dnd-examples/<slug>/<Pascal>Demo.tsx`
 * with imports rewritten to *relative* paths (`../../../lib/dnd`,
 * `../../../lib/utils`) so the CLI's standard alias-rewriter never has to
 * touch them — matching the chart-variants policy (THE_DECISION_LOG 1.12).
 */

type VariantRegistryItemFile = {
  path: string;
  type: string;
  content: string;
};

type VariantRegistryItem = {
  name: string;
  category: string;
  variant: string;
  files: VariantRegistryItemFile[];
  stacks?: Record<string, VariantRegistryItemFile[]>;
};

const REGISTRY_ROOT = path.join(process.cwd(), "public", "registry", "variants");
const APP_REGISTRY_ROOT = path.join(process.cwd(), "app", "registry");

const TABLE_VARIANT_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  // Keep old curated slug for backwards compatibility.
  serverSideCRM: "tables-server-crm",
};

/**
 * Slug overrides for kanban templates. The map key is the template's record key
 * in `kanbanTemplates` (camelCase) and the value is the kebab-case slug the CLI
 * exposes. Add an entry here only when the auto-derived slug would break an
 * existing public URL — otherwise leave the map empty so new templates don't
 * silently get an off-shape slug.
 */
const KANBAN_VARIANT_SLUG_OVERRIDES: Partial<Record<string, string>> = {};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function tableTemplateKeyToVariantSlug(key: string): string {
  return TABLE_VARIANT_SLUG_OVERRIDES[key] ?? `tables-${toKebabCase(key)}`;
}

function kanbanTemplateKeyToVariantSlug(key: string): string {
  return KANBAN_VARIANT_SLUG_OVERRIDES[key] ?? `kanban-${toKebabCase(key)}`;
}

function collectRegistryVariantFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.tsx?$/.test(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return results;
}

async function buildVariantsRegistry() {
  if (!fs.existsSync(REGISTRY_ROOT)) {
    fs.mkdirSync(REGISTRY_ROOT, { recursive: true });
  }

  const variantFiles = collectRegistryVariantFiles(APP_REGISTRY_ROOT);
  const index = new Set<string>();
  const errors: string[] = [];

  for (const registryPath of variantFiles) {
    const rel = path
      .relative(APP_REGISTRY_ROOT, registryPath)
      .replace(/\\/g, "/");
    const parts = rel.split("/");
    if (parts.length < 2) {
      // Top-level files under app/registry/ (e.g. formRegistry.ts, tableRegistry.ts) are
      // facade modules, not variants — skip silently.
      continue;
    }
    const [category, fileName] = parts;
    if (!category || !fileName) {
      errors.push(`Unable to parse registry path: ${rel}`);
      continue;
    }

    if (
      category === "charts" ||
      category === "tables" ||
      category === "kanban" ||
      category === "dnd"
    ) {
      // Charts, tables, kanban, and dnd variants are emitted from their
      // template / source tables (see the dedicated blocks below), not from
      // per-file modules under `app/registry/<category>/`. Skip silently here
      // so legacy module files (if any) don't double-emit.
      continue;
    }

    const variantSlug = fileName.replace(/\.tsx?$/, "");
    const variantName = `${category}/${variantSlug}`;

    let item: VariantRegistryItem;

    if (category === "tables") {
      try {
        const url = pathToFileURL(registryPath).href;
        const mod = await import(url);
        if (!mod.tableConfig) {
          errors.push(`Variant "${variantName}": missing tableConfig export`);
          continue;
        }
        const dataMode: DataMode = mod.dataMode === "api" ? "api" : "static";
        const variantFiles = buildTableVariantFiles(
          mod.tableConfig,
          dataMode,
          variantSlug,
        );
        item = {
          name: variantName,
          category,
          variant: variantSlug,
          files: variantFiles.map((f) => ({
            path: f.path,
            type: "registry:table-variant",
            content: f.content,
          })),
        };
      } catch (err) {
        errors.push(
          `Variant "${variantName}": failed to build table bundle: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
    } else if (category === "forms") {
      try {
        const url = pathToFileURL(registryPath).href;
        const mod = await import(url);
        if (!mod.formConfig) {
          errors.push(`Variant "${variantName}": missing formConfig export`);
          continue;
        }
        const stacks: Record<string, VariantRegistryItemFile[]> = {};
        for (const lib of ["rhf", "tanstack", "action"] as FormLibrary[]) {
          const bundle = buildFormVariantStackFiles(mod.formConfig, lib, variantSlug);
          stacks[lib] = bundle.map((f) => ({
            path: f.path,
            type: "registry:form-variant",
            content: f.content,
          }));
        }
        item = {
          name: variantName,
          category,
          variant: variantSlug,
          files: [],
          stacks,
        };
      } catch (err) {
        errors.push(
          `Variant "${variantName}": failed to build form bundles: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
    } else {
      let code: string;
      try {
        const url = pathToFileURL(registryPath).href;
        const mod = await import(url);
        if (typeof mod.code !== "string") {
          errors.push(`Variant "${variantName}": missing or invalid "code" export`);
          continue;
        }
        code = mod.code;
      } catch (err) {
        errors.push(
          `Variant "${variantName}": failed to load registry module: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }

      const singleFilePath = `components/ui/${category}/${variantSlug}.tsx`;
      const files: VariantRegistryItemFile[] = [
        {
          path: singleFilePath,
          type: "registry:variant",
          content: code,
        },
      ];

      item = {
        name: variantName,
        category,
        variant: variantSlug,
        files,
      };
    }

    const targetDir = path.join(REGISTRY_ROOT, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, `${variantSlug}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(item, null, 2));
    index.add(variantName);
  }

  const tablesVariantRoot = path.join(REGISTRY_ROOT, "tables");
  if (fs.existsSync(tablesVariantRoot)) {
    fs.rmSync(tablesVariantRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(tablesVariantRoot, { recursive: true });

  for (const template of Object.values(tableTemplates)) {
    const variantSlug = tableTemplateKeyToVariantSlug(template.key);
    const variantName = `tables/${variantSlug}`;
    const dataMode: DataMode =
      template.config.sortMode === "api" || template.config.paginationMode === "api"
        ? "api"
        : "static";
    const files = buildTableVariantFiles(template.config, dataMode, variantSlug);
    const item: VariantRegistryItem = {
      name: variantName,
      category: "tables",
      variant: variantSlug,
      files: files.map((f) => ({
        path: f.path,
        type: "registry:table-variant",
        content: f.content,
      })),
    };
    const targetPath = path.join(tablesVariantRoot, `${variantSlug}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(item, null, 2));
    index.add(variantName);
  }

  /**
   * Kanban variants are generated directly from `kanbanTemplates` (the same data
   * that powers the live `/kanban` variant page) so the registry can never drift
   * from what users see in-app. Mirrors the table pipeline above.
   */
  const kanbanVariantRoot = path.join(REGISTRY_ROOT, "kanban");
  if (fs.existsSync(kanbanVariantRoot)) {
    fs.rmSync(kanbanVariantRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(kanbanVariantRoot, { recursive: true });

  for (const [templateKey, template] of Object.entries(kanbanTemplates)) {
    const variantSlug = kanbanTemplateKeyToVariantSlug(templateKey);
    const variantName = `kanban/${variantSlug}`;
    const files = buildKanbanVariantFiles(template.config, template.cards, variantSlug);
    const item: VariantRegistryItem = {
      name: variantName,
      category: "kanban",
      variant: variantSlug,
      files: files.map((f) => ({
        path: f.path,
        type: "registry:kanban-variant",
        content: f.content,
      })),
    };
    const targetPath = path.join(kanbanVariantRoot, `${variantSlug}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(item, null, 2));
    index.add(variantName);
  }

  const chartsVariantRoot = path.join(REGISTRY_ROOT, "charts");
  if (fs.existsSync(chartsVariantRoot)) {
    fs.rmSync(chartsVariantRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(chartsVariantRoot, { recursive: true });

  for (const source of chartVariantSources) {
    const typeDir = path.join(chartsVariantRoot, source.chartSlug);
    fs.mkdirSync(typeDir, { recursive: true });

    for (const variant of source.variants) {
      const variantRest = `${source.chartSlug}/${variant.value}`;
      const variantName = `charts/${variantRest}`;
      const item: VariantRegistryItem = {
        name: variantName,
        category: "charts",
        variant: variantRest,
        files: [
          {
            path: `charts/${source.chartSlug}/${variant.value}Chart.tsx`,
            type: "registry:variant",
            content: buildChartVariantCode(source, variant.value),
          },
        ],
      };

      const targetPath = path.join(typeDir, `${variant.value}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(item, null, 2));
      index.add(variantName);
    }
  }

  /**
   * DnD variants — mirror of the chart pipeline above. Each source carries a
   * standalone `snippet` (already using relative `../../../lib/{dnd,utils}`
   * imports) so the CLI ships it verbatim. The destination path lives under
   * the standard `components` alias, which every consumer layout already
   * resolves; no new CLI alias is required.
   */
  const dndVariantRoot = path.join(REGISTRY_ROOT, "dnd");
  if (fs.existsSync(dndVariantRoot)) {
    fs.rmSync(dndVariantRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(dndVariantRoot, { recursive: true });

  for (const source of dndVariantSources) {
    const variantName = `dnd/${source.slug}`;
    const item: VariantRegistryItem = {
      name: variantName,
      category: "dnd",
      variant: source.slug,
      files: [
        {
          path: dndVariantFilePath(source.slug),
          type: "registry:variant",
          content: source.snippet,
        },
      ],
    };

    const targetPath = path.join(dndVariantRoot, `${source.slug}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(item, null, 2));
    index.add(variantName);
  }

  fs.writeFileSync(
    path.join(REGISTRY_ROOT, "index.json"),
    JSON.stringify(Array.from(index).sort(), null, 2)
  );

  if (errors.length) {
    console.warn(
      `⚠️  Variant registry built with ${errors.length} warning(s):`
    );
    for (const err of errors) {
      console.warn(`  - ${err}`);
    }
  }

  console.log(
    `🎯 Variant Registry Built! (${index.size} variants in public/registry/variants)`
  );
}

buildVariantsRegistry();
