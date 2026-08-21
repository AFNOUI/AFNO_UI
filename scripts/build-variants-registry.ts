import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import type { FormLibrary } from "../app/registry/formRegistry";
import { buildFormVariantStackFiles } from "../app/form-builder/utils/formCodeGenerator";
import { DEFAULT_TRANSPORT } from "../app/lib/codegen/transport";
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
import { treeTemplates } from "../app/tree-builder/data/treeBuilderTemplates";
import { buildTreeVariantFiles, treeVariantFeatures } from "../app/tree-builder/utils/variantBundle";
import {
  buildFieldVariantFiles,
  type FieldFamily,
  type TransportChoice,
} from "../app/registry/fieldVariantBundle";

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
  /** Same form variant, hand-unrolled JSX (no formConfig.ts/dispatcher) — installed via `--static`. */
  staticStacks?: Record<string, VariantRegistryItemFile[]>;
  /** Optional engine feature groups this variant needs (e.g. `["toolbar"]`). */
  features?: string[];
  /**
   * Bare npm packages the variant's own files import (e.g. `axios`, `zod`,
   * `@tanstack/react-query`). The CLI installs these on `afnoui add <cat>/<slug>`;
   * without them a variant lands with unresolved imports in a project that never
   * ran the matching engine `init`. React/Next are excluded — they are guaranteed
   * by the host framework.
   */
  npmDependencies?: string[];
  /**
   * CLI-gated transport opt-ins (AI_AGENT_RULES § R-56).
   *
   * The two axes are INDEPENDENT: `--axios` swaps only `services.ts`, and
   * `--tanstack` swaps only `hooks` + `constants.ts`. So there is no combined
   * key — passing both flags applies both override sets. Files listed here
   * REPLACE the same paths in `files` when the flag is present.
   */
  transport?: {
    axios?: { files: VariantRegistryItemFile[]; npmDependencies: string[] };
    tanstack?: { files: VariantRegistryItemFile[]; npmDependencies: string[] };
  };
};

/**
 * Generic `transport` override builder.
 *
 * Diffs each flavored generation against the default and keeps only the files
 * that actually changed, so the registry carries ~2 extra files per variant
 * instead of a full duplicate bundle for every combo.
 */
function buildTransportBlock(
  defaultFiles: VariantRegistryItemFile[],
  generate: (choice: { http: "fetch" | "axios"; query: "local" | "tanstack" }) => VariantRegistryItemFile[],
): VariantRegistryItem["transport"] | undefined {
  const byPath = new Map(defaultFiles.map((f) => [f.path, f.content]));
  const diff = (choice: { http: "fetch" | "axios"; query: "local" | "tanstack" }) =>
    generate(choice).filter((f) => byPath.get(f.path) !== f.content);

  const axiosFiles = diff({ http: "axios", query: "local" });
  const tanstackFiles = diff({ http: "fetch", query: "tanstack" });

  const block: NonNullable<VariantRegistryItem["transport"]> = {};
  if (axiosFiles.length > 0) block.axios = { files: axiosFiles, npmDependencies: ["axios"] };
  if (tanstackFiles.length > 0) {
    block.tanstack = { files: tanstackFiles, npmDependencies: ["@tanstack/react-query"] };
  }
  return Object.keys(block).length > 0 ? block : undefined;
}

/**
 * Builds the `transport` override block for a table variant.
 *
 * Diffs each flavored generation against the default one and keeps only the
 * files that actually changed — so the registry payload carries ~2 extra files
 * per variant instead of a full duplicate bundle.
 */
function buildTableTransportBlock(
  config: Parameters<typeof buildTableVariantFiles>[0],
  dataMode: DataMode,
  variantSlug: string,
  defaultFiles: VariantRegistryItemFile[],
): VariantRegistryItem["transport"] | undefined {
  const byPath = new Map(defaultFiles.map((f) => [f.path, f.content]));

  const diff = (choice: { http: "fetch" | "axios"; query: "local" | "tanstack" }) =>
    buildTableVariantFiles(config, dataMode, variantSlug, choice)
      .filter((f) => byPath.get(f.path) !== f.content)
      .map((f) => ({
        path: f.path,
        type: "registry:table-variant" as const,
        content: f.content,
      }));

  const axiosFiles = diff({ http: "axios", query: "local" });
  const tanstackFiles = diff({ http: "fetch", query: "tanstack" });

  const block: NonNullable<VariantRegistryItem["transport"]> = {};
  if (axiosFiles.length > 0) block.axios = { files: axiosFiles, npmDependencies: ["axios"] };
  if (tanstackFiles.length > 0) {
    block.tanstack = { files: tanstackFiles, npmDependencies: ["@tanstack/react-query"] };
  }
  return Object.keys(block).length > 0 ? block : undefined;
}

/** npm package name grammar (scoped + unscoped), used to reject false positives. */
const VALID_PACKAGE_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Packages every consumer project already has by definition — never emitted as a variant dep. */
const FRAMEWORK_PROVIDED_PACKAGES = new Set(["react", "react-dom", "next"]);

/**
 * Collect the bare npm packages a variant's files import. Relative paths and the
 * `@/…` project alias are skipped; scoped packages keep their first two segments
 * (`@tanstack/react-query`), unscoped keep the first (`embla-carousel-autoplay`).
 */
function detectNpmDependencies(item: VariantRegistryItem): string[] {
  const files = [...item.files, ...Object.values(item.stacks ?? {}).flat()];
  const found = new Set<string>();
  for (const file of files) {
    // `[^"'\n]` matters: variant content embeds template literals and JSON blobs, so a
    // greedy match can span lines and yield garbage like `",\n  "` (seen in tree variants).
    for (const match of file.content.matchAll(/(?:from|import)\s*\(?\s*["']([^"'\n]+)["']/g)) {
      const spec = match[1].trim();
      if (spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("@/") || spec.startsWith("~")) continue;
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (!pkg || FRAMEWORK_PROVIDED_PACKAGES.has(pkg)) continue;
      // Only real npm package names — anything else is a false positive from embedded content.
      if (!VALID_PACKAGE_NAME.test(pkg)) continue;
      found.add(pkg);
    }
  }
  return [...found].sort();
}

/** Attach detected npm deps (omitting the key when there are none) and write the variant JSON. */
function writeVariantJson(targetPath: string, item: VariantRegistryItem): void {
  const npmDependencies = detectNpmDependencies(item);
  const payload: VariantRegistryItem = npmDependencies.length > 0 ? { ...item, npmDependencies } : item;
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2));
}

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

/**
 * Slug overrides for tree templates (record key in `treeTemplates` → kebab slug).
 * Empty by default so new templates auto-derive `tree-<kebab>`; add an entry only
 * to preserve an existing public URL.
 */
const TREE_VARIANT_SLUG_OVERRIDES: Partial<Record<string, string>> = {};

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

function treeTemplateKeyToVariantSlug(key: string): string {
  return TREE_VARIANT_SLUG_OVERRIDES[key] ?? `tree-${toKebabCase(key)}`;
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
      category === "tree" ||
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
        const staticStacks: Record<string, VariantRegistryItemFile[]> = {};
        for (const lib of ["rhf", "tanstack", "action"] as FormLibrary[]) {
          const bundle = buildFormVariantStackFiles(mod.formConfig, lib, variantSlug);
          stacks[lib] = bundle.map((f) => ({
            path: f.path,
            type: "registry:form-variant",
            content: f.content,
          }));
          // Same variant, hand-unrolled JSX instead of a formConfig.ts + runtime
          // dispatcher — installed via `afnoui add forms/<slug> --static`.
          const staticBundle = buildFormVariantStackFiles(
            mod.formConfig,
            lib,
            variantSlug,
            DEFAULT_TRANSPORT,
            "static",
          );
          staticStacks[lib] = staticBundle.map((f) => ({
            path: f.path,
            type: "registry:form-variant",
            content: f.content,
          }));
        }
        // `constants.ts` / `hooks.ts` / `services.ts` are stack-independent, so
        // one override set covers all three stacks (the CLI matches by path).
        const formTransport = buildTransportBlock(stacks.rhf, (choice) =>
          buildFormVariantStackFiles(mod.formConfig, "rhf", variantSlug, choice).map((f) => ({
            path: f.path,
            type: "registry:form-variant" as const,
            content: f.content,
          })),
        );
        item = {
          name: variantName,
          category,
          variant: variantSlug,
          files: [],
          stacks,
          staticStacks,
          ...(formTransport ? { transport: formTransport } : {}),
        };
      } catch (err) {
        errors.push(
          `Variant "${variantName}": failed to build form bundles: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
    } else if (category === "async-field" || category === "infinite-field") {
      // These two families ship as an R-55 bundle (component → hooks → services)
      // rather than one self-contained file, so `--axios` / `--tanstack-query`
      // can swap a single file each instead of duplicating the whole snippet.
      try {
        const url = pathToFileURL(registryPath).href;
        const mod = await import(url);
        if (
          typeof mod.componentName !== "string" ||
          typeof mod.componentCode !== "string" ||
          typeof mod.data !== "object"
        ) {
          errors.push(
            `Variant "${variantName}": missing data / componentName / componentCode export`,
          );
          continue;
        }

        const fieldModule = {
          data: mod.data,
          componentName: mod.componentName,
          componentCode: mod.componentCode,
        };
        const emit = (choice?: TransportChoice): VariantRegistryItemFile[] =>
          buildFieldVariantFiles(category as FieldFamily, variantSlug, fieldModule, choice).map(
            (f) => ({
              path: f.path,
              type: "registry:variant" as const,
              content: f.content,
            }),
          );

        const defaultFiles = emit();
        const transport = buildTransportBlock(defaultFiles, emit);

        item = {
          name: variantName,
          category,
          variant: variantSlug,
          files: defaultFiles,
          ...(transport ? { transport } : {}),
        };
      } catch (err) {
        errors.push(
          `Variant "${variantName}": failed to build field bundle: ${err instanceof Error ? err.message : String(err)}`,
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

      // Lab primitive demos are USER-owned files: they must not land inside
      // `components/ui`, which holds only the managed primitives the CLI refreshes
      // on every install. `ui-variants/<primitive>/<slug>.tsx` → `aliases.uiVariants`
      // (e.g. `app/ui-variants/badge/badge-outline.tsx`), mirroring how tables/
      // kanban/tree/dnd/charts variants sit outside their engines. See R-40.
      const singleFilePath = `ui-variants/${category}/${variantSlug}.tsx`;
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
    writeVariantJson(targetPath, item);
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
    const defaultFiles = files.map((f) => ({
      path: f.path,
      type: "registry:table-variant" as const,
      content: f.content,
    }));
    const transport = buildTableTransportBlock(
      template.config,
      dataMode,
      variantSlug,
      defaultFiles,
    );
    const item: VariantRegistryItem = {
      name: variantName,
      category: "tables",
      variant: variantSlug,
      files: defaultFiles,
      ...(transport ? { transport } : {}),
    };
    const targetPath = path.join(tablesVariantRoot, `${variantSlug}.json`);
    writeVariantJson(targetPath, item);
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
    const files = buildKanbanVariantFiles(template.config, template.cards, variantSlug, template.rendererSources);
    const kanbanDefaults = files.map((f) => ({
      path: f.path,
      type: "registry:kanban-variant" as const,
      content: f.content,
    }));
    const kanbanTransport = buildTransportBlock(kanbanDefaults, (choice) =>
      buildKanbanVariantFiles(
        template.config,
        template.cards,
        variantSlug,
        template.rendererSources,
        choice,
      ).map((f) => ({ path: f.path, type: "registry:kanban-variant" as const, content: f.content })),
    );
    const item: VariantRegistryItem = {
      name: variantName,
      category: "kanban",
      variant: variantSlug,
      files: kanbanDefaults,
      ...(kanbanTransport ? { transport: kanbanTransport } : {}),
    };
    const targetPath = path.join(kanbanVariantRoot, `${variantSlug}.json`);
    writeVariantJson(targetPath, item);
    index.add(variantName);
  }

  /**
   * Tree variants are generated directly from `treeTemplates` (the merged
   * hierarchical + workflow catalogue that powers the `/trees` and
   * `/tree-builder` pages) so the registry can never drift from what users see
   * in-app. Mirrors the kanban pipeline above. Each variant records the engine
   * `features` it needs (e.g. `["toolbar"]` → GraphToolbar) so the CLI installs
   * the matching optional group from `tree.json`.
   */
  const treeVariantRoot = path.join(REGISTRY_ROOT, "tree");
  if (fs.existsSync(treeVariantRoot)) {
    fs.rmSync(treeVariantRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(treeVariantRoot, { recursive: true });

  for (const [templateKey, template] of Object.entries(treeTemplates)) {
    const variantSlug = treeTemplateKeyToVariantSlug(templateKey);
    const variantName = `tree/${variantSlug}`;
    const files = buildTreeVariantFiles(
      template.config,
      template.tree,
      variantSlug,
      template.rendererSources,
    );
    const features = treeVariantFeatures(template.config);
    const treeDefaults = files.map((f) => ({
      path: f.path,
      type: "registry:tree-variant" as const,
      content: f.content,
    }));
    const treeTransport = buildTransportBlock(treeDefaults, (choice) =>
      buildTreeVariantFiles(
        template.config,
        template.tree,
        variantSlug,
        template.rendererSources,
        choice,
      ).map((f) => ({ path: f.path, type: "registry:tree-variant" as const, content: f.content })),
    );
    const item: VariantRegistryItem = {
      name: variantName,
      category: "tree",
      variant: variantSlug,
      files: treeDefaults,
      ...(features.length ? { features } : {}),
      ...(treeTransport ? { transport: treeTransport } : {}),
    };
    const targetPath = path.join(treeVariantRoot, `${variantSlug}.json`);
    writeVariantJson(targetPath, item);
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
      writeVariantJson(targetPath, item);
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
    writeVariantJson(targetPath, item);
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
