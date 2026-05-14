# CURRENT_SPRINT.md

> Living document of feature status + the immediate next-step roadmap.
> Update this file *before* committing new work, not after. Stale sprints are silent technical debt.
>
> Last updated: 2026-05-10 — by the AI assistant after the Wave-6 wrap-up (kanban-variant pipeline, sandbox-helper folder relocation, custom-DnD-only tables, schema-engine fit-view fix, form-export field-tab content fix, pinned-column UI hardening) **plus the Wave-6 follow-up** (pinned body-cell bleed-through fix via `zBase`/`--card`/`overflow: hidden`/`stackBias` and `/forms` variant-gallery field-file emission via `generateAllFiles`).
> Anchor commit reference: working tree against `8f5fba3 Fix: Fixed Table Cli Code Generation Issue` plus the post-summary refactor sweep.

---

## 1. Feature Status

### 1.1 Live (production-ready, snapshot-locked, registry-synced)

| Feature | Path | Notes |
|---|---|---|
| **Component Lab** (CSS-variable theme editor) | `app/(pages)/lab/page.tsx`, `app/components/lab/*` | 51 UI primitives. Live-edit CSS variables. Theme export to `globals.css`. |
| **Form Builder** (3 stacks: RHF / TanStack Form / Action) | `app/form-builder/`, `app/(pages)/form-builder/` | 25+ field types. Conditional logic. Async + infinite. Wizard / multi-tab / single layouts. JSON import/export. |
| **Form Variants** | `app/(pages)/forms/page.tsx` | Curated examples installable via `npx afnoui add forms/<slug>`. |
| **Table Builder** | `app/table-builder/`, `app/(pages)/table-builder/` | Pinned columns (z-index biased per side), virtualization, server / client per-feature data modes, DnD reordering on the project's **custom Pointer DnD** (no `@dnd-kit/*`), grouped headers, row-detail dialog with sandboxed JS. |
| **Table Variants** | `app/(pages)/tables/page.tsx` | **21** variants live in `public/registry/variants/tables/*.json` (default-pin, expert-pinned-grouped, pinned-virtualized, sandbox-js-demo, server-crm, …). |
| **Kanban Builder** | `app/kanban-builder/`, `app/(pages)/kanban-builder/` | Three layouts (board / compact / swimlane), WIP limits, custom card fields, user-templated dialog with sandboxed JS. Uses the same custom Pointer DnD library as tables and the ui-builder. |
| **Kanban Variants** | `app/(pages)/kanban/page.tsx` | **12** variants live in `public/registry/variants/kanban/*.json` (personal-tasks, sprint-board, hiring-pipeline, content-calendar, infinite-scroll-demo, rtl-sprint-timeline, …). All installable via `npx afnoui add kanban/<slug>`; engine + custom DnD + sandbox helpers are pulled in transitively. |
| **UI Builder** (drag-and-drop page composer) | `app/ui-builder/`, `app/(pages)/ui-builder/` | 50+ components. Responsive breakpoints. Code export. |
| **Charts & Data Viz** | `app/components/ui/charts/*`, `app/(pages)/charts/<type>/page.tsx` | Bar / Line / Pie / Area / Radar / Scatter / Sankey / Bump / Funnel / Gauge / Heatmap / PolarArea / RadialBar / Treemap / Donut-Progress / Candlestick / Waterfall. RTL/LTR aware. |
| **Schema Engine** | `app/(pages)/schema-engine/` | JSON-schema visualizer with reactflow + dagre. |
| **Dashboard** (reference) | `app/(pages)/dashboard/page.tsx` | Stats cards + table + activity feed + quick actions. Demonstrates layouts. |
| **i18n** | `app/lib/i18n.ts` | 7 locales: en, es, fr, de, zh, ja, ar. RTL handling for ar via `RtlLayoutProvide`. |
| **Theme system** | `app/contexts/ThemeContext.tsx`, `app/data/*` | Light / dark + uploadable presets. Live CSS-variable mutation. |
| **`afnoui` CLI** | `afnoui-cli/` | 9 commands: `add`, `init`, `form init`, `update`, `list`, `diagnose`, `doctor`, `clean`, `help`. **105/105** unit tests. Sandbox-helper paths (`utils/cellJsRunner.ts`, `utils/rowDialogTemplate.ts`) routed via a dedicated `resolveUtilsHelperPath` to a sibling `<libBase>/utils/` folder so they don't collide with the `utils` alias (which points at `lib/utils.ts`) and don't pollute `components/tables/` for kanban-only installs. |
| **Registry pipeline** | `scripts/build-*-registry.ts`, `scripts/verify-*-registry-sync.mjs` | Forms / tables / kanban / components / variants. `build-variants-registry.ts` now emits charts + tables + kanban variants from in-app template tables (single source of truth). Verifier scripts gate CI. |

### 1.2 Partially baked (works but has known sharp edges)

| Feature | Sharp edge | Path |
|---|---|---|
| **`afnoui form init` for TanStack and Action stacks** | Has been less stress-tested than the RHF default. JSON-object input fields and date-helpers may have subtle differences. | `afnoui-cli/src/cli/commands/form.ts`, `app/forms/{tanstack-forms,action-forms}/*` |
| **`validate-installed-variants.ts`** | Requires `pnpm dev` running on port 3000 in another terminal. CI cannot run it without solving dev-server orchestration. | `scripts/validate-installed-variants.ts` |
| **Chart Builder UI** | Builder UI does not exist yet — chart variants are hand-coded in `app/components/ui/charts/*` and registered manually via the variant registry pipeline. | (not present) |
| **UI Builder code export for nested containers > 3 levels deep** | Generates correct code but the inspector’s drop targets get visually crowded. Existing TODO in `RenderNode.tsx`. | `app/ui-builder/RenderNode.tsx` |
| **`@tanstack/react-store` dependency** | Listed in `package.json` but currently unused. Reserved for the planned ui-builder selection store. | `package.json` |
| **CLI `--debug` output verbosity** | Inconsistent across commands. Some print full stack traces, others print one line. | `afnoui-cli/src/cli/commands/*` |
| **CLI fully-non-interactive flag** | `--force` exists but doesn’t suppress all interactive prompts (e.g. init wizard still asks). Plan: a `--yes` / `--non-interactive` master flag. | `afnoui-cli/src/cli/commands/init.ts` |
| **Registry caching on the CLI** | Currently disabled (`ENABLE_CACHE = false`). Re-installs to the same project re-download every JSON. | `afnoui-cli/src/lib/constants.ts` |

### 1.3 Ghost (planned, file scaffolds may exist, behaviour does not)

| Ghost feature | Why it’s ghosted | Where it would land |
|---|---|---|
| **Chart Builder** | Same shape as form/table/kanban builders. Needs a config schema, a builder canvas, an export tab, and a registry pipeline. | `app/chart-builder/` (does not exist). `chartVariants` alias already in `afnoui.json` — CLI half-ready. The kanban variant pipeline (Wave-6 above) is the template to copy. |
| **Theme registry as a CLI install target** | Currently themes are exported from the lab page and pasted into `globals.css`. The CLI’s `theme.json` exists but `afnoui add theme/<preset>` doesn’t. | `afnoui-cli/src/cli/commands/theme.ts` (does not exist) |
| **CLI `afnoui upgrade`** for in-place engine updates | Today users run `afnoui add forms/forms-contact --force` to refresh the engine. A dedicated upgrade command would be friendlier. | `afnoui-cli/src/cli/commands/upgrade.ts` |
| **Kanban "swimlane" layout JSON-import edge cases** | Imports a config but cards mapped to swimlanes with missing field references silently drop. | `app/kanban-builder/KanbanJsonImportDialog.tsx` |
| **Mobile breakpoint preview** in ui-builder | The breakpoint picker exists; mobile-first stacking semantics not yet validated against deeply nested grids. | `app/ui-builder/utils/codegen/responsiveClasses.ts` |
| **Per-component dependency tree visualizer** | An "see what `dialog` actually pulls in" page. Data is in `components.json` already. | (not present) |
| **CLI offline mode** with a snapshot of the registry | Pairs with caching. | (not present) |

---

## 2. The Next 10 Steps (hyper-detailed roadmap)

> These are immediate-priority moves in the order they should be tackled. Each step has explicit start/finish criteria.

### Step 0 — DONE in Wave 6 (recorded for traceability)
- `afnoui add kanban/<slug>` is no longer a 404 — `scripts/build-variants-registry.ts` emits 12 kanban variant JSONs from `app/kanban-builder/data/kanbanBuilderTemplates.ts`. New helper: `app/kanban-builder/utils/variantBundle.ts` (mirrors `table-builder/utils/variantBundle.ts`).
- Sandbox helpers (`cellJsRunner.ts`, `rowDialogTemplate.ts`) now ship at `utils/<file>` (not `components/tables/<file>`). CLI’s `resolveRegistryOutputPath` short-circuits `utils/<file>` paths into a sibling `<libBase>/utils/` folder.
- `tables.json` no longer ships `@dnd-kit/*` — the table engine consumes the project's custom `lib/dnd/*` (7 files: `DndContext.tsx`, `DropIndicator.tsx`, `dnd.css`, `index.ts`, `types.ts`, `useDraggable.ts`, `useDropZone.ts`). Build script rewrites the import from `@/components/ui/dnd` → `../../lib/dnd` at registry-build time.
- `app/table-builder/TablePreview.tsx`: pinned-column z-index biased per side (header `20 + stackBias`, filter `15 + stackBias`); filter cells `overflow-hidden` + input wrapper `min-w-0 max-w-full overflow-x-hidden`; sortable header label `min-w-0 flex-1 truncate` so resize handle stays usable.
- `app/schema-engine/SchemaCanvas.tsx`: `onInit` performs an immediate + RAF-deferred `fitView`; layout effect re-fits on `setTimeout(0)` after `ResizablePanel` settles. `min-h-0 min-w-0` on `ReactFlow` + page wrappers prevents the horizontal scroll the panel group used to leak.
- `app/form-builder/ExportTab.tsx`: each `requiredComponents.fieldComponents` entry now renders a `TabsContent` that pulls source via `getFieldFile(file, formLibrary)` — clicking a field tab now shows its actual code (used to render a blank panel).
- **(later in Wave 6)** `app/table-builder/TablePreview.tsx` body cells: `pinStyle()` gained a `zBase` parameter (header `20+stackBias`, filter `15+stackBias`, body `10+stackBias`); default background is now `hsl(var(--card))` (fully opaque, matches the `<Card>` chrome) with `overflow: hidden` to clip cell-internal overflow. New helper `computeStackBias()` extracts the per-side biasing math. Body cell `widthStyle` gained `maxWidth` (was missing — header already had it). Together this stops Buy/Sell `<Badge>`s from bleeding across the pinned ID column on `tables/tables-pinned-virtualized` during horizontal scroll.
- **(later in Wave 6)** `app/form-builder/utils/codegen/generateAllFiles.ts` now appends per-field-type registry files (`TextField.tsx`, `SelectField.tsx`, `DateField.tsx`, …) for every `usedFieldType`, sourced via `getRequiredComponents(config) → getFieldFile(file, library)`. Without this, `FormsCodePanel` in `/forms` silently dropped them. Companion cleanup in `app/form-builder/ExportTab.tsx`: removed the duplicate `requiredComponents.fieldComponents.map(...)` rendering — single source of truth now. 6 "file shape locked" snapshots in `tests/codegen/formCodeGenerator.test.ts` updated to the new shape.

### Step 1 — Resolve all `react-hooks/preserve-manual-memoization` lint warnings
**Status**: `pnpm lint` is at 0 errors / 44 warnings. Most warnings are `any` types and `next/image` suggestions, but a handful are React-Compiler memoization mismatches.
**Acceptance**:
- Run `pnpm lint --max-warnings=0` and triage each remaining warning.
- For each warning: either fix (extract optional-chained deps to stable locals; replace `useMemo`-with-side-effects with `useEffect`) OR add an inline disable with a justification.
**Files to scan first**: `app/ui-builder/RenderNode.tsx`, `app/ui-builder/InspectorPanel.tsx`, `app/table-builder/TablePreview.tsx`.
**Expected diff size**: small (≤10 files, ≤100 LOC).

### Step 2 — Land `--non-interactive` master flag on the CLI
**Why**: needed for CI runs of `validate-installed-variants.ts`.
**Acceptance**:
- `afnoui-cli/src/cli/program.ts` exposes a top-level `--non-interactive` flag.
- Every prompt site (`inquirer.prompt(...)` calls) reads `globalOpts.nonInteractive` and short-circuits with the default value.
- Add CLI tests asserting `--non-interactive` on `init` chooses defaults without prompting.
**Files**: `afnoui-cli/src/cli/program.ts`, `afnoui-cli/src/cli/commands/init.ts`, `afnoui-cli/src/cli/commands/add.ts`, `afnoui-cli/tests/unit/init.test.ts` (new).

### Step 3 — Wire `validate-installed-variants.ts` into a non-blocking CI job
**Why**: catches CLI install regressions that unit tests can’t.
**Acceptance**:
- A GitHub Actions matrix step that:
  1. `pnpm install`
  2. `pnpm run dev &` and wait for `localhost:3000/registry/components.json` to respond.
  3. `pnpm run validate:variants`
- The job is `continue-on-error: true` initially. After two green weeks, flip to a hard gate.
**Files**: `.github/workflows/validate-variants.yml` (new).

### Step 4 — Generate Chart Builder MVP (mirroring kanban-builder layout)
**Why**: largest gap in the "every visual primitive has a builder" story.
**Acceptance**:
- `app/chart-builder/` exists with `ChartBuilderGuide`, `ChartCanvas`, `ChartExportTab`, `ChartSettingsPanel`, `ChartJsonImportDialog`.
- `app/chart-builder/utils/{chartCodeGenerator.ts, chartSharedFiles.ts}` exist.
- `app/(pages)/chart-builder/page.tsx` exists; the landing page tile linking to `/charts` updates to `/chart-builder` once non-empty.
- Initial scope: bar + line + area + pie. Deeper variants (sankey, bump, gauge) later.
**Out of scope**: chart variants registry pipeline (Step 7).

### Step 5 — Add `afnoui upgrade` command
**Why**: clarifies the "refresh the engine after a registry update" workflow.
**Acceptance**:
- `afnoui upgrade` detects which engines (forms / tables / kanban) are installed, fetches their registry JSONs, and refreshes shared files.
- Prompts before overwriting user-modified files (use the existing managed-file marker).
- `--dry-run` shows a per-file diff (uses existing `diff` package).
**Files**: `afnoui-cli/src/cli/commands/upgrade.ts` (new), `afnoui-cli/src/lib/operations.ts` (extract `refresh*EngineSharedFiles` into a public surface).

### Step 6 — CLI registry caching with ETag invalidation
**Why**: removes the perf cost of `ENABLE_CACHE = false` while keeping correctness.
**Acceptance**:
- `afnoui-cli/src/lib/network.ts` records `ETag` per URL on the first fetch.
- Subsequent fetches send `If-None-Match`; on `304 Not Modified` reuse the cached body.
- Cache lives in `~/.afnoui-cache/<host>/<path>.json` with a versioning header (`CACHE_VERSION`).
- `afnoui clean` deletes it.
- Default OFF (preserve current stateless behaviour); enable via `AFNOUI_CACHE=1` or a future flag.
**Files**: `afnoui-cli/src/lib/network.ts`, `afnoui-cli/src/cli/commands/clean.ts`, `afnoui-cli/tests/unit/network.test.ts`.

### Step 7 — Chart variants registry pipeline
**Why**: parity with forms / tables / kanban so `afnoui add charts/<type>/<variant>` is a real command.
**Acceptance**:
- `scripts/build-charts-registry.ts` exists; emits `public/registry/charts.json` and `app/registry/chartRegistryGenerated.ts`.
- `scripts/verify-charts-registry-sync.mjs` exists.
- CLI parses `charts.json` (extends `parseTablesRegistry` shape).
- `afnoui-cli/tests/unit/registryShape.test.ts` adds `parseChartsRegistry` cases.
- `package.json` `verify:quick` chain extended.

### Step 8 — Type the CLI `--debug` output via a structured logger
**Why**: easier to grep, easier to test, friendlier to non-TTY consumers.
**Acceptance**:
- `afnoui-cli/src/lib/log.ts` exposes `log.info / log.warn / log.error / log.debug` with consistent fields (`scope`, `phase`, `meta`).
- All `console.log(chalk...)` calls in `afnoui-cli/src/lib/operations.ts` and `cli/commands/*` migrated.
- `--debug` prints JSON lines; absent flag uses chalk pretty output.
- Tests assert one log line per install phase.

### Step 9 — Extract per-builder registry templates to JSON files (instead of TS)
**Why**: today `app/{form,table,kanban}-builder/data/*Templates.ts` are huge TS files. Treating templates as data lets the export panel ingest user-uploaded templates symmetrically.
**Acceptance**:
- `app/{form,table,kanban}-builder/data/templates/<slug>.json` files exist.
- A small loader (`loadTemplates.ts`) imports them via `import.meta.glob` (Next 16 supports this) and validates with Zod at load time.
- The existing `data/*Templates.ts` becomes a thin re-export.

### Step 10 — Replace remaining hardcoded UI strings with i18n keys
**Why**: i18n coverage was expanded recently but isn’t exhaustive.
**Acceptance**:
- Run a one-off grep of every TSX file in `app/(pages)/**` and `app/{form,table,kanban,ui}-builder/**` for English-language strings ≥3 words long that aren’t already inside `t("…")`.
- For each, add a key to `app/lib/i18n.ts` (all 7 locales) and replace the hardcoded string.
- Add an ESLint custom rule (or a CI grep) that fails on regressions.

---

## 3. Standing Quality Gates (must always be green before merge)

These are not "next steps" — they’re the floor. Listed so future contributors know what to run.

```
pnpm run verify:quick
  └─ verify:forms-registry      ← scripts/verify-forms-registry-sync.mjs
  └─ verify:tables-registry     ← scripts/verify-tables-registry-sync.mjs   (13 shared files)
  └─ verify:kanban-registry     ← scripts/verify-kanban-registry-sync.mjs   (14 shared files)
  └─ verify:theme-export-sync   ← scripts/verify-theme-export-sync.mjs
  └─ pnpm exec tsc --noEmit     (workspace, excludes afnoui-cli)
  └─ pnpm lint                   (workspace ESLint v9 flat config — floor: 0 errors)
  └─ pnpm test                   (workspace Vitest — 213 tests)
  └─ pnpm run build:cli          (afnoui-cli tsc, also runs its 105 tests)

# Variant pipeline (must rerun after touching template files or shared engine sources)
pnpm run build:tables-registry && pnpm run build:kanban-registry && pnpm run build:variants-registry
# Currently emits 310 variants total (forms + tables(21) + kanban(12) + charts + components).
```

Plus `pnpm exec next build` — should compile cleanly. Recent baseline: 22.3s.

---

## 4. Out-of-Sprint Backlog (good ideas, no commitment)

- Bun-native CLI binary (currently node only).
- VS Code extension that surfaces registry variants in the command palette.
- Per-variant Storybook export.
- A "diff against previous version" view in the export tabs.
- A markdown-based doc generator that consumes `.ai-brain/` for end-user docs (meta!).
- Server-actions form stack (next-safe-action) as a fourth option.
- WCAG audit pass on every UI primitive.

---

## 5. Communication conventions for AI agents continuing this work

When picking up a task from this file, an agent should:

1. **Read in order**: `CORE_IDENTITY.md` → `STRUCTURAL_MAP.md` → `DATA_AND_LOGIC_FLOW.md` → `THE_DECISION_LOG.md` → `CURRENT_SPRINT.md`.
2. **Pick a step**, not a feature description. Each step in §2 has explicit acceptance criteria.
3. **Update `CURRENT_SPRINT.md` in the same commit** when promoting a "Ghost" to "Partially baked" or to "Live", or when adding a step.
4. **Add to `THE_DECISION_LOG.md`** whenever a decision is made that future contributors might be tempted to reverse.
5. **Run `pnpm run verify:quick` before saying "done".** The standing quality gate is non-negotiable.
