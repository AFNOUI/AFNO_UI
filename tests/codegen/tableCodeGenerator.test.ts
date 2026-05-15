import { describe, expect, it } from "vitest";

import {
  type DataMode,
  generateAllFiles,
  getDependencyReport,
} from "@/table-builder/utils/tableCodeGenerator";
import {
  buildTableVariantFiles,
  variantPageComponentName,
} from "@/table-builder/utils/variantBundle";
import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

/**
 * Locks the table codegen contract the way `formCodeGenerator.test.ts` locks forms:
 *
 *   ┌─────────────────────────────────────────────────────────────────────┐
 *   │  Pure helpers     → direct asserts + inline snapshots               │
 *   │  generateAllFiles → structural snapshot per (template × dataMode)   │
 *   │  buildTableVariantFiles → path rewrite snapshot per variant slug    │
 *   └─────────────────────────────────────────────────────────────────────┘
 *
 * We reuse curated `tableTemplates` rather than hand-rolling fixtures so the
 * coverage tracks the same configs shipped through `app/registry/tables/*`.
 */

const SIMPLE_CONFIG: TableBuilderConfig = tableTemplates.simpleList.config;
const RICH_STATIC_CONFIG: TableBuilderConfig = tableTemplates.invoiceTracker.config;
const RICH_API_CONFIG: TableBuilderConfig = tableTemplates.serverSideCRM.config;
const DND_VIRT_CONFIG: TableBuilderConfig = tableTemplates.pinnedVirtualized.config;

const DATA_MODES: DataMode[] = ["static", "api"];

/** Stable structural fingerprint — paths + descriptions + lang; code sizes only. */
function fingerprint(files: ReturnType<typeof generateAllFiles>) {
  return files
    .map((f) => ({
      name: f.name,
      path: f.path,
      language: f.language,
      isFixed: f.isFixed,
      codeBytes: f.code.length,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

describe("tableCodeGenerator / pure helpers", () => {
  it("getDependencyReport returns deterministic, sorted npm commands", () => {
    const report = getDependencyReport(SIMPLE_CONFIG);
    expect(report.npmInstall.startsWith("npm install ")).toBe(true);
    expect(report.npmInstallDev.startsWith("npm install -D ")).toBe(true);
    // Core deps always present
    for (const pkg of ["react", "clsx", "tailwind-merge", "lucide-react"]) {
      expect(report.npmInstall).toContain(pkg);
    }
    // Bundled custom DnD (`components/dnd`) — no @dnd-kit. Virtualization peer is engine-level.
    expect(report.npmInstall).not.toContain("@dnd-kit/core");
    expect(report.npmInstall).toContain("@tanstack/react-virtual");
  });

  it("getDependencyReport ships virtualization peer for virtualized configs", () => {
    const report = getDependencyReport(DND_VIRT_CONFIG);
    expect(report.npmInstall).toContain("@tanstack/react-virtual");
  });

  it("variantPageComponentName produces PascalCase + Table suffix", () => {
    expect(variantPageComponentName("tables-simple-list")).toBe("SimpleListTable");
    expect(variantPageComponentName("tables-server-crm")).toBe("ServerCrmTable");
    expect(variantPageComponentName("tables-admin_reports")).toBe("AdminReportsTable");
    expect(variantPageComponentName("unknown")).toBe("UnknownTable");
  });
});

describe("tableCodeGenerator / generateAllFiles (per template × per dataMode)", () => {
  const CASES: Array<[name: string, config: TableBuilderConfig]> = [
    ["simpleList", SIMPLE_CONFIG],
    ["invoiceTracker (static-rich)", RICH_STATIC_CONFIG],
    ["serverSideCRM (api-rich)", RICH_API_CONFIG],
    ["pinnedVirtualized (DnD/virt)", DND_VIRT_CONFIG],
  ];

  for (const [label, cfg] of CASES) {
    for (const mode of DATA_MODES) {
      it(`${label} / ${mode} — file shape locked`, () => {
        const files = generateAllFiles(cfg, mode);
        expect(fingerprint(files)).toMatchSnapshot();
      });
    }
  }

  it("api mode emits useTableData hook only when at least one feature is api-backed", () => {
    const apiFiles = generateAllFiles(RICH_API_CONFIG, "api");
    expect(apiFiles.some((f) => f.name === "useTableData.ts")).toBe(true);

    const staticFiles = generateAllFiles(SIMPLE_CONFIG, "static");
    expect(staticFiles.some((f) => f.name === "useTableData.ts")).toBe(false);
  });
});

describe("tableCodeGenerator / buildTableVariantFiles (CLI path rewrite)", () => {
  const CASES: Array<[slug: string, mode: DataMode, config: TableBuilderConfig]> = [
    ["tables-simple-list", "static", SIMPLE_CONFIG],
    ["tables-server-crm", "api", RICH_API_CONFIG],
  ];

  for (const [slug, mode, cfg] of CASES) {
    it(`${slug} — under tables/<slug>/ with engine imports pointing at components/tables`, () => {
      const files = buildTableVariantFiles(cfg, mode, slug);

      for (const f of files) {
        expect(f.path.startsWith(`tables/${slug}/`)).toBe(true);
        // No `src/` prefix leaks into the install layout
        expect(f.path.startsWith("src/")).toBe(false);
        expect(f.content).not.toMatch(/from\s+["']\.\/TablePreview["']/);
        expect(f.content).not.toMatch(/from\s+["']\.\/types["']/);
      }

      const dataTable = files.find((f) => f.path.endsWith("/DataTable.tsx"));
      expect(dataTable).toBeDefined();
      // Component renamed to `<Slug>Table`
      expect(dataTable!.content).toContain(variantPageComponentName(slug));
      expect(dataTable!.content).toMatch(/from\s+["']\.\.\/\.\.\/components\/tables\/TablePreview["']/);
    });
  }
});
