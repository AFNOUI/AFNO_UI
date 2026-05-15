# STRUCTURAL_MAP.md

> Authoritative directory + dependency map. Updated on every structural change.
> If `ls` disagrees with this file, `ls` is right and this file is stale — fix it.

---

## 1. Top-level layout (workspace root: `d:/uilab`)

```
uilab/
├── afnoui-cli/                  ← Standalone npm package (the CLI). Self-contained.
├── app/                         ← Next.js App Router source (the website + builders).
├── public/                      ← Static assets + the registry JSONs the CLI reads.
│   └── registry/                ← THE single source of truth (shipped over HTTP).
├── scripts/                     ← Build-time tooling (registry generators + verifiers).
├── tests/                       ← Workspace-level Vitest suite (codegen + utils).
├── .ai-brain/                   ← Authoritative docs for humans + AI agents (read FIRST).
│   ├── CORE_IDENTITY.md         ← Who we are, what we ship.
│   ├── STRUCTURAL_MAP.md        ← This file.
│   ├── DATA_AND_LOGIC_FLOW.md   ← Source → registry → CLI → consumer pipeline.
│   ├── THE_DECISION_LOG.md      ← Decisions + forbidden changes + past mistakes.
│   ├── CURRENT_SPRINT.md        ← Wave status, roadmap, quality gates.
│   ├── AI_AGENT_RULES.md        ← Numbered rules (R-00…R-52, F-01…F-16). Cite by number.
│   └── CLI_REFERENCE.md         ← Exhaustive `afnoui` command/flag/alias docs (Wave-8).
├── AGENTS.md                    ← Wave-8: universal AI-tool entry (agents.md convention).
├── CLAUDE.md                    ← Wave-8: Anthropic Claude Code entry point.
├── .cursor/                     ← Wave-8: Cursor IDE config.
│   └── rules/                   ← Cursor-native .mdc rules (afnoui.mdc, cli.mdc).
├── .github/                     ← Wave-8: GitHub-side config.
│   └── copilot-instructions.md  ← GitHub Copilot Chat repo-level instructions.
├── package.json                 ← Website + workspace scripts.
├── tsconfig.json                ← Workspace TS config. Excludes `afnoui-cli/`.
├── eslint.config.mjs            ← ESLint v9 flat config.
├── postcss.config.mjs           ← Tailwind v4 + autoprefixer.
├── next.config.ts               ← Next 16 config.
├── components.json              ← shadcn-ui registry pointer (we use it as a manifest).
└── README.md                    ← Bootstrapped by create-next-app. Light.
```

**AI-rule rule of one source:** `.ai-brain/AI_AGENT_RULES.md` and
`.ai-brain/CLI_REFERENCE.md` are the substance. Every tool-specific entry
file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc`,
`.github/copilot-instructions.md`) is a thin pointer. Adding a rule means
editing `AI_AGENT_RULES.md` ONLY. See `THE_DECISION_LOG.md § 1.16`.

---

## 2. `app/` — the website + builders

Every directory listed has a single responsibility; nothing else may move into it without an entry being added here.

### 2.1 Routing layer (Next App Router)
```
app/
├── layout.tsx                   ← Root layout. Mounts providers (theme, query, i18n, RTL).
├── page.tsx                     ← Landing page (marketing + CLI cheatsheet).
├── globals.css                  ← Theme tokens + base + utility resets.
├── (pages)/                     ← Route group; segments inside become URLs.
│   ├── components/<slug>/page.tsx   ← One demo page per UI primitive (button, card, …).
│   ├── charts/                      ← Chart lab section.
│   │   ├── layout.tsx               ← Shared chrome: PageBreadcrumb + ChartsLabPrereqBanner.
│   │   ├── page.tsx                 ← Aggregator (every chart × every variant).
│   │   └── <type>/page.tsx          ← Per-chart-type variant gallery.
│   ├── dnd/                         ← DnD lab section (mirrors charts).
│   │   ├── layout.tsx               ← Shared chrome + single DndProvider mount.
│   │   ├── page.tsx                 ← Aggregator (every dnd variant, live demo).
│   │   └── <slug>/page.tsx          ← Per-variant DndVariantGallery (one of 9).
│   ├── forms/page.tsx               ← Form variants gallery.
│   ├── tables/page.tsx              ← Table variants gallery.
│   ├── kanban/page.tsx              ← Kanban variants gallery.
│   ├── form-builder/page.tsx        ← Visual form builder.
│   ├── table-builder/page.tsx       ← Visual table builder.
│   ├── kanban-builder/page.tsx      ← Visual kanban builder.
│   ├── ui-builder/page.tsx          ← Visual page/UI builder (drag-and-drop).
│   ├── schema-engine/page.tsx       ← JSON-schema visualizer.
│   ├── dashboard/page.tsx           ← Reference dashboard.
│   └── lab/page.tsx                 ← Theme lab (CSS variable editor).
```

### 2.2 Component layers
```
app/components/
├── ui/                          ← Owned shadcn/Radix primitives. THIS is the registry surface.
│   ├── button.tsx, card.tsx, dialog.tsx, ...      ← ~51 primitives.
│   ├── form.tsx, form-primitives.tsx              ← shadcn Form glue.
│   ├── chart-primitives.tsx                       ← Recharts wrapper (RTL/LTR-aware).
│   ├── charts/<type>.tsx                          ← Per-chart-type wrappers.
│   ├── dnd/                                       ← Custom Pointer DnD library.
│   │   ├── DndContext.tsx, useDraggable.ts, useDropZone.ts,
│   │   ├── DropIndicator.tsx, types.ts, index.ts
│   └── …
├── lab/                         ← Demo components used ONLY on (pages)/components/<slug>.
│   ├── <primitive>/<VariantName>.tsx              ← One TSX per registered variant.
│   ├── shared/                                    ← Lab primitives reused across sections.
│   │   ├── LabPrereqBanner.tsx                    ← Reusable `afnoui init` banner.
│   │   └── sectionBreadcrumb.ts                   ← Pathname → crumbs (charts + dnd + …).
│   ├── charts/                                    ← Charts lab module.
│   │   ├── ChartsLabPrereqBanner.tsx              ← Thin wrapper over LabPrereqBanner.
│   │   ├── ChartVariantGallery.tsx                ← Per-chart-type gallery (LTR/RTL toggle).
│   │   ├── chartVariantSources.ts                 ← Variant registry consumed by build script.
│   │   └── chartUiFullSourceGenerated.ts          ← AUTO-GEN: embedded UI chart source for the "Component" tab.
│   ├── dnd/                                       ← DnD lab module (mirrors charts).
│   │   ├── DndLabPrereqBanner.tsx                 ← Thin wrapper over LabPrereqBanner.
│   │   ├── DndVariantGallery.tsx                  ← Per-variant detail page renderer (no direction toggle).
│   │   ├── dndVariantSources.ts                   ← Variant registry consumed by build script.
│   │   ├── shared/SortableDropShadow.tsx          ← Animated "make-room" target shared across variants.
│   │   └── variants/<slug>.tsx                    ← Per-variant in-app Demo + installable snippet.
│   │                                                Snippets must use `useDraggable<T>` /
│   │                                                `useDropZone<TZone, TItem>` with named
│   │                                                `type X = { … } & Record<string, unknown>`
│   │                                                (NOT `interface X`) so the `T extends DragData`
│   │                                                constraint is satisfied under consumer-side
│   │                                                strict TS. Drop targets spread `{...zoneProps}`
│   │                                                only — never `ref={zoneProps.ref} {...zoneProps}`
│   │                                                (newer React/TS treat the duplicate `ref` as
│   │                                                a hard error). See DECISION 1.15.
│   ├── progress/                                  ← Progress lab module.
│   │   ├── progress-shared.tsx                    ← In-app SOURCE for progress utilities used by
│   │   │                                            ALL progress variants. Ships to consumers at
│   │   │                                            `components/ui/progress-shared.tsx` (DIRECTLY
│   │   │                                            under `ui/`, NOT `ui/progress/`) — see
│   │   │                                            scripts/build-registry.ts target mapping
│   │   │                                            and DECISION 1.15.
│   │   └── …                                      ← Per-variant lab demos.
│   └── …
├── shared/                      ← Reused across pages: CodeBlock, InstallCommand, etc.
└── forms/                       ← Page-level form wrappers (FormsCodePanel, FormsVariantsSwitcher).
```

### 2.3 Engine layers (runtime code that the CLI ALSO ships)
> These directories are **mirrored to user projects** by the CLI. Edit with care — registry verifiers will catch drift.

```
app/forms/                       ← Form runtime engine (3 stacks).
│   ├── react-hook-form/         ← RHF stack (ReactHookForm.tsx + fields/ + hooks).
│   ├── tanstack-forms/          ← TanStack Form stack.
│   ├── action-forms/            ← React 19 useActionState stack.
│   ├── hooks/useInfiniteOptions.ts ← Shared infinite-scroll hook (TanStack Query).
│   └── types/types.ts           ← FormConfig, FormFieldConfig, …

app/tables/                      ← Table runtime types + engine consumed by registry.
│   └── types/types.ts           ← TableBuilderConfig, TableColumnConfig, TableRow.
│                                  (Engine TSX lives in app/components/tables/* and ships
│                                   to consumers via tables.json's `shared` array, NOT via
│                                   @dnd-kit. Custom Pointer DnD ships from app/components/ui/dnd
│                                   and is rewritten to **components/dnd/*** on the consumer side
│                                   (Wave-7 — was `lib/dnd/*` pre-7).)

app/kanban/                      ← Kanban runtime engine.
│   ├── KanbanBoard.tsx          ← Three-layout board (board / compact / swimlane).
│   ├── KanbanCard.tsx           ← Configurable card content.
│   ├── KanbanCardDialog.tsx     ← User-templated detail dialog (imports `@/utils/rowDialogTemplate`,
│   │                              `@/utils/cellJsRunner`).
│   ├── KanbanAddCardDialog.tsx  ← New-card dialog with field inference.
│   ├── types.ts                 ← KanbanBuilderConfig, KanbanCardData, ….
│   └── dnd/index.ts             ← Re-export of @/components/ui/dnd (legacy import path,
│                                   kept for backward-compat with installed projects).

app/components/ui/dnd/           ← Custom Pointer DnD library, single source of truth.
│   ├── DndContext.tsx           ← Provider w/ autoscroll, prefers-reduced-motion, RTL handling.
│   ├── useDraggable.ts          ← Activation distance + custom React preview.
│   ├── useDropZone.ts           ← Animated "make-room" sibling translation.
│   ├── DropIndicator.tsx        ← Ghost slot indicator at the computed insertion index.
│   ├── types.ts                 ← Shared DnD type contracts.
│   ├── dnd.css                  ← Animation/cursor utilities (NOT inlined into JS).
│   └── index.ts                 ← Public surface barrel.
│   (Used by kanban + tables + ui-builder + the standalone DnD lab. Shipped via THREE
│    registries — `tables.json`, `kanban.json`, AND `dnd.json` (built by
│    `scripts/build-dnd-registry.ts`). All three rewrite `@/components/ui/dnd` →
│    `components/dnd/` so the files land at the consumer's `<componentsBase>/dnd/*` and
│    resolve naturally. Identical content across all three registries means installing
│    one then another produces no churn — the CLI's idempotency check sees the bytes
│    match and skips writes. **Wave-7**: consumer install location moved from
│    `lib/dnd/*` to `components/dnd/*` so the DnD library sits next to its sibling
│    primitives — see DECISION 1.15.)

app/utils/                       ← Sandboxed runtime utilities (also shipped).
│   ├── cellJsRunner.ts          ← Sandboxed JS for cell formatters / dialogJs / cardJs.
│   │                              Shipped at registry path `utils/cellJsRunner.ts`
│   │                              (NOT `components/tables/...` — see THE_DECISION_LOG 1.11).
│   ├── rowDialogTemplate.ts     ← Mustache-style row/card dialog renderer.
│   │                              Shipped at registry path `utils/rowDialogTemplate.ts`.
│   ├── colorUtils.ts            ← HSL/OKLCH conversions for the theme lab.
│   ├── mergeCssVariables.ts     ← Merge user theme overrides with defaults.
│   └── themeExport.ts           ← Serialize CSS-variable theme for export.
```

### 2.4 Builder layers (visual builders — NOT shipped to user projects)
```
app/form-builder/                ← Visual form builder (drag-and-drop, JSON import/export).
│   ├── ExportTab.tsx, PreviewTab.tsx, FormCanvas.tsx,
│   ├── PropertiesPanel.tsx, LayoutPicker.tsx, JsonObjectInput.tsx,
│   ├── data/formBuilderTemplates.ts
│   └── utils/
│       ├── formCodeGenerator.ts ← Re-export surface for codegen/.
│       └── codegen/             ← Per-stack code emitters + variant bundle.
│           ├── fieldRegistry.ts ← field-type → component + uiDeps + npm install.
│           ├── importAliases.ts, configPageEmitter.ts,
│           ├── staticPages/{rhf,tanstack,action}.ts,
│           ├── dispatchers/stackPieces.ts,
│           ├── variantBundle.ts ← CLI-ready bundle builder.
│           └── …

app/table-builder/               ← Visual table builder.
│   ├── TablePreview.tsx, TableExportTab.tsx, ColumnEditor.tsx,
│   ├── ApiConfigPanel.tsx, JsonImportDialog.tsx, …
│   └── utils/
│       ├── tableCodeGenerator.ts ← Pure codegen + getDependencyReport.
│       └── tableSharedFiles.ts   ← Barrel over registry/tableRegistry.

app/kanban-builder/              ← Visual kanban builder (mirrors form-builder).
│   ├── KanbanCardEditor.tsx, KanbanSettingsPanel.tsx,
│   ├── KanbanExportTab.tsx, KanbanJsonImportDialog.tsx, KanbanBuilderGuide.tsx,
│   ├── data/kanbanBuilderTemplates.ts ← 12 canonical kanban templates that
│   │                                    `scripts/build-variants-registry.ts` reads
│   │                                    to emit `public/registry/variants/kanban/<slug>.json`.
│   └── utils/
│       ├── kanbanCodeGenerator.ts ← Pure codegen. Accepts optional `componentNameOverride`
│       │                            so variant bundles use the slug name (prevents drift
│       │                            if the user renames the board title in the builder).
│       ├── kanbanSharedFiles.ts   ← Barrel over registry/kanbanRegistry.
│       └── variantBundle.ts       ← `buildKanbanVariantFiles(config, cards, slug)`.
│                                    Generates files via `kanbanCodeGenerator`, rewrites
│                                    `@/components/kanban/*` → `../../components/kanban/*`,
│                                    flattens to `kanban/<slug>/<basename>` for CLI install.
│                                    Mirror of `table-builder/utils/variantBundle.ts`.

app/ui-builder/                  ← Visual page/UI builder (compose UI primitives).
│   ├── BuilderCanvas.tsx, RenderNode.tsx, InspectorPanel.tsx,
│   ├── TemplateGallery.tsx, CodePreviewPanel.tsx,
│   ├── data/uiBuilderRegistry.ts (split per category)
│   ├── hooks/useUiBuilder.ts
│   ├── utils/codegen/{nodeRenderers,responsiveClasses,…}.ts
│   └── renderer/content.tsx

app/schema-engine/               ← JSON-schema visualizer (uses reactflow + dagre).
│   ├── SchemaCanvas.tsx          ← Renders nodes/edges. Auto-fits on first paint via a
│   │                               two-pass `onInit` (sync + RAF) PLUS a layout-effect
│   │                               re-fit on `direction` / `laidOutNodes` change.
│   │                               (See THE_DECISION_LOG hack 2.15 + past mistake 3.10.)
│   ├── InputPanel.tsx            ← JSON schema textarea + dialect selector.
│   ├── hooks/useDagreLayout.ts   ← Auto-arranges nodes via dagre.
│   └── types/types.ts
```

### 2.5 Wiring layer
```
app/contexts/ThemeContext.tsx    ← Reads CSS-variable preset, exposes light/dark toggle.
app/providers/                   ← Mounted in app/layout.tsx — order matters.
│   ├── RootThemeProvider.tsx    ← Reads localStorage, applies theme.
│   ├── QueryProvider.tsx        ← TanStack QueryClient. Used by forms/tables/kanban.
│   ├── I18nextProvider.tsx      ← i18next instance + language detection.
│   └── RtlLayoutProvide.tsx     ← Sets dir="rtl" on <html> when locale is RTL (e.g. ar).
app/hooks/
│   ├── useBuilderHistory.ts     ← Undo/redo stack used by form/table/kanban/ui builders.
│   ├── use-toast.ts             ← Sonner-backed toast hook.
│   └── use-mobile.tsx           ← Reactive viewport-width hook.
app/lib/
│   ├── i18n.ts                  ← All translation resources for 7 locales.
│   └── utils.ts                 ← `cn` (clsx + tailwind-merge), nothing else.
app/data/
│   ├── globalsCssExportPlan.ts  ← Per-token export plan for the theme lab.
│   ├── globalsThemeDefaults.ts  ← Built-in theme tokens.
│   └── themePresets.ts          ← Curated theme presets.
app/types/cssVariable.ts         ← Type for the theme-token model.
```

### 2.6 Registry-facing modules
```
app/registry/
├── formRegistry.ts              ← Facade. Exports getFixedFiles, getFieldFile, formStackInstall, ….
├── formRegistryGenerated.ts     ← AUTO-GENERATED by scripts/generate-registry.ts. ~500 KB.
├── tableRegistry.ts             ← Facade. Exports tableInstall, getSharedTableFiles, ….
├── tableRegistryGenerated.ts    ← AUTO-GENERATED by scripts/build-tables-registry.ts.
├── kanbanRegistry.ts            ← Facade. Exports kanbanInstall, getSharedKanbanFiles, ….
├── kanbanRegistryGenerated.ts   ← AUTO-GENERATED by scripts/build-kanban-registry.ts.
├── dndRegistryGenerated.ts      ← AUTO-GENERATED by scripts/build-dnd-registry.ts.
│                                  Standalone Pointer DnD lib (`components/dnd/*` — Wave-7,
│                                  was `lib/dnd/*`) shipped via `dnd.json` so
│                                  `afnoui add dnd/<slug>` + `afnoui init --dnd` can install
│                                  the engine without dragging in kanban/tables.
└── <primitive>/<variant>.tsx    ← Per-variant TSX files used by both the website demo
                                    AND copied verbatim into public/registry/variants/<slug>.json.
```

---

## 3. `public/registry/` — the wire format the CLI reads

```
public/registry/
├── components.json              ← Manifest of every UI primitive + its npm/peer deps.
├── theme.json                   ← Built-in theme tokens shipped to consumers.
├── forms.json                   ← Output of generate-registry.ts. Has stackInstall + per-stack files.
├── tables.json                  ← Output of build-tables-registry.ts. tableInstall (NO @dnd-kit/* —
│                                  uses custom Pointer DnD). shared array contains 13 files:
│                                  engine TSX (TablePreview etc.), 7 **components/dnd/*** files,
│                                  utils/cellJsRunner.ts, utils/rowDialogTemplate.ts.
├── kanban.json                  ← Output of build-kanban-registry.ts. kanbanInstall + shared (14 files):
│                                  engine TSX (KanbanBoard, KanbanCard, KanbanCardDialog,
│                                  KanbanAddCardDialog, types.ts), 7 **components/dnd/*** files,
│                                  utils/cellJsRunner.ts, utils/rowDialogTemplate.ts.
├── dnd.json                     ← Output of build-dnd-registry.ts. dndInstall + shared (7 files):
│                                  the 7 **components/dnd/*** primitives ONLY (no kanban/table-specific
│                                  files). `dndInstall.uiComponents = ["utils"]` so the CLI
│                                  installs `lib/utils.ts` (the `cn` helper) too. Consumed by
│                                  `afnoui init --dnd` and `afnoui add dnd/<slug>` via
│                                  `ensureDndSystemForVariantSlugs` (see CLI § 5).
└── variants/
    ├── components/<category>/<slug>.json
    ├── forms/<slug>.json        ← e.g. forms-contact, forms-job-application, … (~25 entries).
    ├── tables/<slug>.json       ← 21 entries (default-pin, expert-pinned-grouped,
    │                              pinned-virtualized, sandbox-js-demo, server-crm, …).
    ├── kanban/<slug>.json       ← 12 entries (personal-tasks, sprint-board, hiring-pipeline,
    │                              content-calendar, infinite-scroll-demo, rtl-sprint-timeline, …).
    │                              All emitted by build-variants-registry.ts from kanbanTemplates.
    ├── dnd/<slug>.json          ← 9 entries (sortable-list, horizontal-reorder, multi-list,
    │                              image-grid, trash, buckets, tree, files, table-reorder).
    │                              **Wave-7**: each ships ONE file at logical path
    │                              `dnd/<slug>/<Pascal>Demo.tsx` (top-level, sibling of
    │                              `components/`, mirroring `forms/`, `tables/`, `kanban/`,
    │                              `charts/`). Routed via the new `dndVariants` alias
    │                              (defaults to `dnd`). Imports inside the snippet are
    │                              pre-rewritten to relative `../../components/dnd` +
    │                              `../../lib/utils`. Engine (`components/dnd/*`) is
    │                              auto-installed by the CLI via
    │                              `ensureDndSystemForVariantSlugs` (fired from `afnoui add`
    │                              whenever any slug starts with `dnd/`). Standalone install
    │                              is `afnoui init --dnd`. Falls back to whatever the host
    │                              project already has if `kanban` / `tables` was installed.
    │                              Snippets use `useDraggable<TData>` /
    │                              `useDropZone<TZone, TItem>` with `TData = { id: string } &
    │                              Record<string, unknown>` so consumer-side strict TS
    │                              accepts the named alias against `T extends DragData`.
    └── charts/<type>/<slug>.json
```

Schema invariants (validated in `afnoui-cli/src/lib/helpers/registryShape.ts`):

| Field | Type | Owner |
|---|---|---|
| `npmDependencies` | `string[]` | every install spec |
| `npmDevDependencies` | `string[]` | every install spec |
| `uiComponents` | `string[]` | refers to keys in `components.json` |
| `optionalPeers` | `Record<string, string[]>` | tables + kanban only |
| `shared[].path` | logical path with alias prefix (e.g. `app/kanban/KanbanBoard.tsx`) | tables + kanban |
| `shared[].code` | full TSX/TS source (with engine imports already rewritten to relative) | tables + kanban |
| Variant `files[].path` | logical relative path inside the variant alias root (e.g. `kanban/<slug>/Board.tsx`) | every variant JSON |
| Variant `files[].content` | full TSX/TS source with imports **already rewritten to relative** (CLI skips its alias-rewriter for charts/tables/kanban variants — see THE_DECISION_LOG 1.12) | charts + tables + kanban variants |

The CLI never imports these JSONs from disk in the consumer’s project — it always fetches them from `getRegistryUrl()` (default `http://localhost:3000/registry` in dev; production CDN URL is commented out in `afnoui-cli/src/lib/constants.ts`).

---

## 4. `scripts/` — build-time tooling

| Script | Inputs | Outputs | When |
|---|---|---|---|
| `build-registry.ts` | `app/registry/<primitive>/<variant>.tsx`, `app/components/ui/*.tsx` | `public/registry/components.json`, `public/registry/variants/**/*.json` | every `pnpm build` |
| `generate-registry.ts --ts` | `app/forms/**`, `app/forms/types/**`, `app/components/ui/form*.tsx` | `public/registry/forms.json` + `app/registry/formRegistryGenerated.ts` | `pnpm run build:forms-registry` |
| `build-tables-registry.ts` | `app/tables/**`, `app/components/tables/*` (engine), shared utils | `public/registry/tables.json` + `app/registry/tableRegistryGenerated.ts` | `pnpm run build:tables-registry` |
| `build-kanban-registry.ts` | `app/kanban/**`, shared utils, DnD lib | `public/registry/kanban.json` + `app/registry/kanbanRegistryGenerated.ts` | `pnpm run build:kanban-registry` |
| `build-dnd-registry.ts` | `app/components/ui/dnd/**` only | `public/registry/dnd.json` + `app/registry/dndRegistryGenerated.ts` | `pnpm run build:dnd-registry` |
| `build-variants-registry.ts` | `app/{form,table,kanban}-builder/data/*Templates.ts`, chart + dnd variant configs | `public/registry/variants/**/*.json` (forms + tables + kanban + charts + dnd; charts/tables/kanban/dnd all read their in-app source-of-truth tables) | `pnpm run build:variants-registry` |
| `verify-forms-registry-sync.mjs` | `forms.json` ↔ disk | exit 0/1 | `pnpm run verify:forms-registry` |
| `verify-tables-registry-sync.mjs` | `tables.json` ↔ disk | exit 0/1 | `pnpm run verify:tables-registry` |
| `verify-kanban-registry-sync.mjs` | `kanban.json` ↔ disk | exit 0/1 | `pnpm run verify:kanban-registry` |
| `verify-dnd-registry-sync.mjs` | `dnd.json` ↔ disk | exit 0/1 | `pnpm run verify:dnd-registry` |
| `verify-theme-export-sync.mjs` | `themeExport.ts` ↔ `public/registry/theme.json` | exit 0/1 | `pnpm run verify:theme-export-sync` |
| `validate-installed-variants.ts` | live dev server | runs CLI installs into a temp project, asserts result | `pnpm run validate:variants` (requires `pnpm dev`) |

---

## 5. `afnoui-cli/` — the CLI (self-contained npm package)

```
afnoui-cli/
├── package.json                 ← Published as `afnoui` on npm. Bin: dist/index.js.
├── src/
│   ├── index.tsx                ← Entry — calls runCli().
│   ├── cli/
│   │   ├── program.ts           ← commander wiring; one register*Command per file.
│   │   └── commands/            ← One file per CLI subcommand.
│   │       ├── add.ts           ← `afnoui add <slug> [...]`.
│   │       ├── init.ts          ← `afnoui init`.
│   │       ├── form.ts          ← `afnoui form init [--stack rhf|tanstack|action]`.
│   │       ├── update.ts, list.ts, diagnose.ts, doctor.ts, clean.ts, help.ts
│   ├── lib/
│   │   ├── constants.ts         ← getRegistryUrl(), CLI_VERSION, lock paths.
│   │   ├── config.ts            ← Read/write afnoui.json + alias inference.
│   │   ├── operations.ts        ← The big one. Install / fetch / write / package-manager.
│   │   ├── network.ts           ← Fetch with circuit breaker + retries.
│   │   ├── locks.ts             ← .afnoui-install.lock file lifecycle.
│   │   ├── types.ts             ← AfnoConfig, *RegistryJson, FormStackKind, ….
│   │   └── helpers/
│   │       ├── installPaths.ts  ← Alias routing + WeakMap caches + getAliasPatterns.
│   │       │                      Special "variant root" branches:
│   │       │                        • `forms/<slug>/...`             → aliases.formVariants
│   │       │                        • `tables/<slug>/...`            → aliases.tableVariants
│   │       │                        • `kanban/<slug>/...`            → aliases.kanbanVariants
│   │       │                        • `charts/<type>/<slug>/...`     → aliases.chartVariants
│   │       │                        • `dnd/<slug>/...`               → aliases.dndVariants  (Wave-7)
│   │       │                          (DnD VARIANTS now ship at top-level `dnd/`,
│   │       │                           sibling of `components/`, mirroring forms /
│   │       │                           tables / kanban / charts. The DnD PRIMITIVES
│   │       │                           install at `components/dnd/*` via
│   │       │                           `ensureDndSystemForVariantSlugs` which fetches
│   │       │                           `dnd.json` and writes its 7 shared files plus
│   │       │                           the `dnd.css` import hint. Same pathway is used
│   │       │                           by `afnoui init --dnd`. See DECISIONS 1.13
│   │       │                           (superseded), 1.14, 1.15.)
│   │       │                        • `utils/<file>` → resolveUtilsHelperPath →
│   │       │                          `<libBase>/utils/<file>` (NOT the `utils` alias,
│   │       │                          which points at lib/utils.ts — see DECISION 1.11).
│   │       ├── registryShape.ts ← Pure parsers/validators for forms/tables/kanban JSONs.
│   │       ├── imports.ts       ← Import-style rewriting + "use client" injection.
│   │       └── framework.ts     ← Detect Next vs Vite vs CRA vs unknown.
├── tests/
│   └── unit/                    ← 105 Vitest tests across 7 files. Pure helpers, snapshot-free.
│                                  Includes a "utils helpers" describe block in installPaths.test.ts
│                                  pinning the `utils/<file>` routing across app-dir / src / flat layouts.
├── dist/                        ← `tsc` output. Published to npm. Tracked in git.
└── tsconfig.json                ← CLI-only TS config (its own strict mode).
```

The CLI **never imports from `app/`**. Cross-checked by grep on every commit.

---

## 6. `tests/` — workspace-level Vitest suite

```
tests/
├── codegen/
│   ├── formCodeGenerator.test.ts        ← Snapshot per stack × per dataMode.
│   ├── tableCodeGenerator.test.ts       ← Snapshot per template × per mode + dep report.
│   ├── uiBuilderCodeGen.test.ts
│   ├── uiBuilderRegistry.test.ts
│   └── __snapshots__/                   ← Locked file shapes. Edit only with -u.
└── utils/
    ├── dependentApiRequest.test.ts, fieldExtraKeys.test.ts,
    ├── dateSerialize.test.ts, dateFieldHelpers.test.ts,
    ├── fileFieldHelpers.test.ts, zodSchemaBuilder.test.ts
```

213 tests total. Run via `pnpm test`.

---

## 7. Dependency Graph (major libraries — role-scoped)

| Package | Used in | Specific role |
|---|---|---|
| `next@16` | website root | App Router framework. We use server + client components, no edge runtime. |
| `react@19`, `react-dom@19` | website + registry | UI runtime. We use the React Compiler (lint rules `react-hooks/preserve-manual-memoization` + `react-hooks/refs`). |
| `tailwindcss@4` + `@tailwindcss/postcss` | every component | Utility-first styling. v4 enables logical properties + `rtl:` variants used pervasively. |
| `class-variance-authority`, `clsx`, `tailwind-merge` | `app/lib/utils.ts` | `cn()` helper. CVA powers Button/Badge variants. |
| `lucide-react` | every component | The only icon set. No emojis, no other icon libs. |
| `@radix-ui/react-*` (~25 packages) | `app/components/ui/*` | Accessibility primitives. Each `ui/<name>.tsx` wraps one Radix primitive with theme tokens. |
| `cmdk` | `command.tsx` | Command palette primitive used by Combobox. |
| `recharts@3` | `app/components/ui/charts/*` | All charts. We wrap with `chart-primitives.tsx` for RTL-aware titles. |
| `react-hook-form@7`, `@hookform/resolvers@5` | `app/forms/react-hook-form/*` | RHF stack. NOT used outside that directory. |
| `@tanstack/react-form@1` | `app/forms/tanstack-forms/*` | TanStack Form stack. Same isolation rule. |
| `@tanstack/react-query@5` | `app/forms/hooks/useInfiniteOptions.ts`, kanban `loadMore` | Server-state cache for async/infinite form fields and kanban load-more. |
| `@tanstack/react-virtual@3` | `app/table-builder/TablePreview.tsx` | Row virtualization in tables. Engine-required peer. |
| `@tanstack/react-store@0.10` | (reserved for ui-builder selection store) | Lightweight store. Currently unused; do not delete — sprint-tracked. |
| `zod@4` | every form stack + schema-engine | Validation. Both runtime (default) and compile-time emit modes. |
| `axios@1` | `app/forms/hooks/*`, `app/forms/utils/*` | HTTP for async/dependent field options. We pin to axios — not fetch — for interceptor parity with consumers. |
| `date-fns@4` | form date helpers | Date parsing/serialization. **Required peer** (used to be missing from displayed `npm install` hints — fixed). |
| `react-day-picker@9` | `components/ui/calendar.tsx` | Calendar primitive. Used by date form fields. |
| `i18next@25`, `react-i18next@16`, `i18next-browser-languagedetector@8` | `app/lib/i18n.ts` + every UI string | Translations for 7 locales. |
| `next-themes@0.4` | `RootThemeProvider.tsx` | localStorage-backed light/dark switching. |
| `react-resizable-panels@4` | builders (form/table/kanban/ui) | Splitter for builder ↔ preview. |
| `react-syntax-highlighter@16` | `CodeBlock.tsx` | Syntax highlight in export tabs and demo pages. |
| `reactflow@11` + `dagre@0.8` | `app/(pages)/schema-engine/*` | Schema visualizer. Isolated to that single feature. |
| `embla-carousel-*` | `components/ui/carousel.tsx` + lab carousels | Carousel primitive set. |
| `vaul@1` | `components/ui/drawer.tsx` | Mobile drawer primitive. |
| `sonner@2` | `hooks/use-toast.ts` | Toast UI. |
| `input-otp@1` | `components/ui/input-otp.tsx` | OTP input primitive. |
| `cmdk` | `components/ui/command.tsx` | Command-bar primitive. |
| `@vitest/coverage-v8`, `vitest@4`, `happy-dom@20` | `tests/`, `afnoui-cli/tests/` | Test runner + coverage. We use `happy-dom` over jsdom for speed. |
| `eslint@9`, `eslint-config-next@16` | `eslint.config.mjs` | Flat config. We do **not** use Prettier — relying on ESLint + manual line-up. |
| `tsx@4`, `esbuild@0.27` | scripts/ | TS execution for build scripts. |

### CLI-only deps (`afnoui-cli/package.json`)
| Package | Role |
|---|---|
| `commander@14` | command tree + flag parsing |
| `chalk@5` | TTY colour output |
| `inquirer@13` | interactive prompts (init flow) |
| `fs-extra@11` | atomic writes, ensureDir |
| `node-fetch@3` | HTTP for registry fetches |
| `execa@9` | shell out to npm/pnpm/yarn/bun |
| `diff@8` | per-file diff display in `--dry-run` |

### What we do NOT use (and why)
| Excluded | Reason |
|---|---|
| `@dnd-kit/*` | Bundle size + RTL handling didn’t hold up. We wrote `app/components/ui/dnd`. |
| `redux`, `zustand`, `jotai`, `valtio` | Builder state lives in `useBuilderHistory`. UI state is local. Server state is TanStack Query. No global store needed. |
| `prisma`, `drizzle`, `kysely` | We don’t own the backend. |
| `framer-motion` | Tailwind keyframes + CSS transitions cover what we need. |
| `prettier` | ESLint format rules + manual review. Avoids reformat noise in PRs. |
| `playwright`, `cypress` | The visual builders are the e2e test harness. We don’t maintain a parallel suite. |

---

## 8. Naming Registry

### 8.1 Files
| Kind | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `KanbanBoard.tsx` |
| Hook file | `useCamelCase.ts` | `useBuilderHistory.ts` |
| Pure utility module | `camelCase.ts` | `cellJsRunner.ts` |
| Type-only module | `types.ts` (per directory) | `app/kanban/types.ts` |
| Page route | `page.tsx` (Next App Router rule) | `app/(pages)/kanban/page.tsx` |
| Layout route | `layout.tsx` | `app/layout.tsx` |
| shadcn primitive | `kebab-case.tsx` (matching shadcn registry) | `alert-dialog.tsx`, `dropdown-menu.tsx` |
| Variant TSX in `app/registry/` | `kebab-case.tsx` (matches registry slug) | `card-event.tsx`, `forms-contact.tsx` |
| Build script | `kebab-case.ts` | `build-kanban-registry.ts` |
| Test file | `<sourceBaseName>.test.ts` | `tableCodeGenerator.test.ts` |
| Snapshot | `<testFile>.snap` (Vitest convention) | `tableCodeGenerator.test.ts.snap` |
| AI brain file | `SCREAMING_SNAKE.md` (this directory only) | `STRUCTURAL_MAP.md` |

### 8.2 Identifiers
| Kind | Convention | Example |
|---|---|---|
| React component | `PascalCase` | `KanbanBoard`, `FormCanvas` |
| React hook | `useCamelCase` | `useDropZone`, `useTablePreview` |
| Pure function | `camelCase` | `transformPath`, `resolveRegistryOutputPath` |
| Local helper not exported | `camelCase` (no underscore prefix) | `escapeRegex` |
| Type / interface | `PascalCase` | `TableBuilderConfig`, `FormStackInstallSpec` |
| Type alias for a union | `PascalCase` | `DataMode = "static" \| "api"` |
| Enum-like const object | `SCREAMING_SNAKE_CASE` for the constant, `PascalCase` for the type | `STACK_INSTALL: Record<FormStackKind, …>` |
| Constant array of strings | `SCREAMING_SNAKE_CASE` | `TABLE_RADIX_PEERS`, `UNIVERSAL_DEV_DEPS` |
| Boolean flag prop / config | `enableX` / `isX` / `hasX` | `enableDnD`, `enableVirtualization`, `isFixed` |
| Event handler | `onCamelCase` for prop, `handleCamelCase` for impl | `onCardChange`, `handleAddCard` |
| Generated TS files | suffix `Generated` | `kanbanRegistryGenerated.ts` |
| Re-export facade | bare name, sibling to its `*Generated.ts` | `kanbanRegistry.ts` |
| CLI command file | `<command>.ts`, exports `register<Command>Command` | `add.ts` → `registerAddCommand` |
| Registry alias | lowercase, kebab-case in JSON, camelCase in TS | `tableVariants`, `kanbanVariants` |

### 8.3 Imports
- **Always** use the `@/*` alias for cross-directory imports inside `app/` (resolves to `app/*` per `tsconfig.json`).
- Relative imports (`./`, `../`) only for siblings inside the same module.
- Import order (enforced manually for now — `eslint-plugin-import` not enabled):
  1. Node built-ins (`path`, `fs`).
  2. Third-party packages.
  3. Internal aliased imports (`@/...`).
  4. Sibling/relative imports.
  5. Type-only imports last in each block (`import type { … }`).
- The CLI uses **only** relative imports (`./`, `../`) — no aliases. Everything is colocated under `afnoui-cli/src/`.

### 8.4 Comments
- JSDoc (`/** … */`) for every exported function/type/component when intent is non-obvious.
- Inline `//` for *why* not *what*.
- Comment header on every file with a 1–3 line purpose statement.
- Forbidden: `// TODO:` without a tracking note (use `// TODO(sprint-NN):` referencing CURRENT_SPRINT.md).
