# DATA_AND_LOGIC_FLOW.md

> Traces the full lifecycle of every important piece of data through the system.
> If a future change adds a new data path that isn’t listed here, the change is incomplete.

---

## 1. The Three Major Data Lifecycles

Three independent flows account for ~95% of activity:

| Flow | Owner | Trigger | Persistence |
|---|---|---|---|
| **A. Visual builder → exported code** | website (in-memory React state) | user clicks a builder | nothing — code is copied to clipboard or downloaded |
| **B. Registry build → JSON artifact** | `scripts/*` | `pnpm run build:*-registry` | `public/registry/*.json` (committed) |
| **C. CLI install → user’s repo** | `afnoui-cli` | `npx afnoui add <slug>` | files written into the consumer project |

These flows share **one** intermediate format: the registry JSON. That single file format is what makes the website preview, the export panel, and the CLI install agree byte-for-byte.

---

## 2. Flow A — Visual builder → exported code

Tracing one piece of data: **a new "email" field added in the form-builder, then exported.**

### Step-by-step

```
┌──────────────────────────────────────────────────────────────────────────┐
│  USER INTERFACE                                                          │
│  app/(pages)/form-builder/page.tsx                                       │
│  ─ user drags "Email" from LayoutPicker into FormCanvas                  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ onDrop → addField({ type: "email", … })
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STATE                                                                   │
│  app/hooks/useBuilderHistory.ts  (undo/redo stack of FormConfig)         │
│  ─ FormConfig is a single immutable object: { sections: [{ fields }] }  │
│  ─ history.push(nextConfig)  ← O(1), no merge logic                     │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  VALIDATION (in PropertiesPanel as user edits)                          │
│  ─ Zod runs against FormFieldConfig schema on blur                      │
│  ─ Errors are surfaced inline; invalid configs do NOT block the canvas  │
│    but DO disable the Export button.                                    │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  CODE GENERATION (PURE)                                                  │
│  app/form-builder/utils/codegen/*                                        │
│  ─ generateAllFiles(config, schemaMode, hydratedFields, stack, mode)    │
│      └─ stackPieces(stack).buildVariantBundle(config, …)                │
│          ├─ configPageEmitter      (formConfig.ts)                      │
│          ├─ staticPages/<stack>     (page.tsx + types.ts)               │
│          └─ fieldRegistry           (per-field component imports)       │
│  ─ getRequiredComponents(config) = { fieldComponents, uiComponents }    │
│  ─ generateNpmInstallCommand(stack)  ← reads formStackInstall (registry)│
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ files: GeneratedFile[]
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  DISPLAY                                                                 │
│  app/form-builder/ExportTab.tsx                                          │
│  ─ Tabs: file list (left), CodeBlock (right), Install commands (top)    │
│  ─ Copy button → navigator.clipboard.writeText                          │
│  ─ Download button → JSZip-free flat-file download                      │
└──────────────────────────────────────────────────────────────────────────┘

USER OUTCOME: copy/paste-able TSX in their preferred form stack.
NOTHING WAS PERSISTED IN OUR SYSTEM.
```

The same shape applies to **table-builder** (`TablePreview` → `tableCodeGenerator.ts` → `TableExportTab`), **kanban-builder** (`KanbanBoard` preview → `kanbanCodeGenerator.ts` → `KanbanExportTab`), and **ui-builder** (`BuilderCanvas` → `utils/codegen/*` → `CodePreviewPanel`).

### Why this design
- **No backend.** Builders are 100% client-side React. Cuts latency to zero and removes auth/quota/storage concerns.
- **Pure codegen.** Every emitter function is `(config) => string` — trivially testable, snapshot-locked, no React imports.
- **`useBuilderHistory`, not Zustand/Redux.** The builder’s only meaningful state is the config object; history is a plain `[past, present, future]` tuple.

---

## 3. Flow B — Registry build → JSON artifact

Tracing: **a new shared kanban file added to `app/kanban/`.**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SOURCE                                                                  │
│  app/kanban/KanbanNewFeature.tsx (engineer adds it)                      │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ developer runs:
                                 │   pnpm run build:kanban-registry
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  BUILD SCRIPT                                                            │
│  scripts/build-kanban-registry.ts                                        │
│  ─ reads SHARED_KANBAN_SOURCE_FILES list (whitelist, not glob)          │
│  ─ for each: { path, language, description } + readFileUtf8(path)       │
│  ─ assembles { kanbanInstall, shared, generatedAt }                     │
│  ─ writes public/registry/kanban.json (pretty)                          │
│  ─ writes app/registry/kanbanRegistryGenerated.ts (template literal)    │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  VERIFY (CI gate)                                                        │
│  scripts/verify-kanban-registry-sync.mjs                                 │
│  ─ Re-reads each shared file from disk                                   │
│  ─ Compares to embedded `code` in kanban.json                            │
│  ─ Fails CI if any file drifts                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  EXPOSED TWO WAYS                                                        │
│  ─ HTTP: /registry/kanban.json (consumed by CLI)                         │
│  ─ TS:   app/registry/kanbanRegistry.ts → re-exports kanbanInstall +    │
│          getSharedKanbanFiles() (consumed by KanbanExportTab in-app)    │
└──────────────────────────────────────────────────────────────────────────┘

CONSEQUENCE: the new file is live in the next CLI install AND visible in the
in-app export panel. Both update from one build step.
```

### Same shape for forms / tables / charts / variants
- `scripts/generate-registry.ts --ts` → `forms.json` + `formRegistryGenerated.ts`. Also emits `formStackInstall` (per-stack npm dep + UI primitive list, the canonical record consumed by both website and CLI).
- `scripts/build-tables-registry.ts` → `tables.json` + `tableRegistryGenerated.ts`. `tableInstall.npmDependencies` deliberately excludes `@dnd-kit/*` — the engine consumes the project's own custom DnD library. The script's `rewriteSharedFileImports` rewrites `@/components/ui/dnd` → `../../lib/dnd` and `@/utils/<file>` → `../../utils/<file>` before embedding into the JSON.
- `scripts/build-kanban-registry.ts` → `kanban.json` + `kanbanRegistryGenerated.ts`. Same rewrite policy as tables. Both registries ship the *same* 7-file `lib/dnd/*` payload — installing one engine then the other is idempotent (the file contents are identical).
- `scripts/build-registry.ts` → `components.json` + `variants/<category>/<slug>.json` for the lab-style primitive variants.
- `scripts/build-variants-registry.ts` → per-variant JSONs for **forms + tables + kanban + charts**. For tables/kanban/charts it iterates the in-app template tables (`tableTemplates`, `kanbanTemplates`, chart variant configs) so the registry can never drift from what users see in the builder pages. Calls each domain's `variantBundle.ts` builder, which does the import-rewrite at build time (variant bundles ship pre-rewritten — see THE_DECISION_LOG 1.12).

### Why the pre-rewrite at build time
Variant bundles cross *two* alias roots in a single emitted file (e.g. a kanban variant references both `kanban/<slug>` siblings and the engine in `components/kanban/*`). The CLI's per-import rewriter operates only on top-level alias swaps — it doesn't compute relative `../` counts. Doing the relative computation at build-time, where the relationship is known and snapshot-testable, keeps the CLI single-purpose. CLI consequence: `writeRegistryOutputFile` uses `isChartVariantFile || isTableVariantFile || isKanbanVariantFile` to *skip* `rewriteAliasedImportsToRelative` for these categories.

---

## 4. Flow C — CLI install → user’s repo

Tracing: **`npx afnoui add forms/forms-contact --stack=rhf` in a fresh Next.js project.**

```
USER TERMINAL (consumer's project root)
$ npx afnoui add forms/forms-contact --stack=rhf

──────────────────────────────────────────────────────────────────────────────
  afnoui-cli/src/cli/commands/add.ts :: registerAddCommand → action handler
──────────────────────────────────────────────────────────────────────────────
1. await getConfig()  → reads `afnoui.json` from cwd
                        (creates one with init wizard if missing)
2. classify slugs:     forms-contact → category="forms" → variant slug
3. await ensureFormSystemForVariantSlugs([slug], registryUrl, cfg, opts, stack)
   │
   ├─ HTTP GET  http://localhost:3000/registry/forms.json
   │             via afnoui-cli/src/lib/network.ts (circuit breaker, retries)
   │
   ├─ parseFormRegistry(raw)           ← afnoui-cli/src/lib/helpers/registryShape.ts
   │             throws if shape invalid (LOUD failure at boundary)
   │
   ├─ if isFormSystemInstalled(cfg):
   │     refreshFormEngineSharedFiles(reg, cfg, opts)   ← propagate engine updates
   │ else:
   │     installFormSystemFixed(reg, stack, cfg, opts)  ← full install
   │       │
   │       ├─ safeInstall(stackInstall.npmDependencies, opts)
   │       │      └─ detects pm via detectPackageManager()  (pnpm-lock → pnpm, …)
   │       │      └─ execa('pnpm', ['add', …pkgs])
   │       ├─ for ui primitive in stackInstall.uiComponents:
   │       │      installComponent(name, registryUrl, set, opts)
   │       │      └─ HTTP GET /registry/components/<name>.json
   │       │      └─ resolves alias paths via resolveLocalPath()
   │       │      └─ writes file via writeRegistryOutputFile()
   │       │           applies "use client" directive policy (Next vs Vite vs CRA)
   │       │           applies transformPath() to import strings
   │       └─ for shared file in stackInstall.shared:
   │              transformPath(file.code, cfg)  ← SWAPS aliases per consumer
   │              fs-extra.outputFile(absoluteTarget, transformed)
   │
4. for variantSlug in slugs:
     installVariant(slug, registryUrl, set, opts)
     ├─ HTTP GET /registry/variants/forms/forms-contact.json
     ├─ writes per-variant files via writeRegistryOutputFile
     └─ logs install summary (chalk.green)

──────────────────────────────────────────────────────────────────────────────
USER OUTCOME (in their repo):
  src/components/ui/{button,input,form,…}.tsx        ← shadcn primitives
  src/components/forms/react-hook-form/...           ← engine
  src/components/forms/react-hook-form/fields/…      ← only required fields
  src/forms/forms-contact/                           ← variant bundle
  package.json — deps added: react-hook-form, @hookform/resolvers, zod,
                  axios, date-fns, @tanstack/react-query (+ dev: typescript)
──────────────────────────────────────────────────────────────────────────────

Equivalent for `npx afnoui add kanban/kanban-personal-tasks`:
  src/components/ui/{button,badge,scroll-area,…}.tsx ← shadcn primitives
  src/components/kanban/{KanbanBoard,KanbanCard,…}.tsx  ← engine
  src/lib/dnd/{DndContext,useDraggable,…}.tsx + dnd.css ← custom DnD library
                                                         (NOT @dnd-kit — see decision 1.5)
  src/utils/cellJsRunner.ts                              ← sandbox helper, NEUTRAL location
  src/utils/rowDialogTemplate.ts                         ← template helper, NEUTRAL location
                                                         (NOT components/tables/ — see decision 1.11)
  src/kanban/kanban-personal-tasks/                      ← variant bundle (relative imports already)
  package.json — deps added: lucide-react, class-variance-authority, clsx,
                  tailwind-merge (no @dnd-kit/* anywhere)
──────────────────────────────────────────────────────────────────────────────
```

### Where the alias rewrites happen
1. **Filesystem placement** — `resolveRegistryOutputPath(filePath, aliases)` (`installPaths.ts`):
   - `forms/<slug>/...` → `aliases.formVariants` root.
   - `tables/<slug>/...` → `aliases.tableVariants` root.
   - `kanban/<slug>/...` → `aliases.kanbanVariants` root.
   - `charts/<type>/<variant>/...` → `aliases.chartVariants` root.
   - **`utils/<file>`** → `resolveUtilsHelperPath(...)` returns `<libBase>/utils/<file>` (app-dir → `app/utils/`, src-rooted → `src/utils/`, flat → `utils/`). This **bypasses the generic alias loop** because the `utils` alias points at `lib/utils.ts` (the cn helper *file*) — using the alias would create `lib/utils/cellJsRunner.ts` next to `lib/utils.ts` which collides on case-insensitive filesystems. See THE_DECISION_LOG 1.11.
   - Anything else: longest-alias-first match against `aliases.{components, ui, hooks, lib, …}`. Cached with WeakMap (`getNonVariantAliasEntries`).
2. **Source-text transformation** — `transformPath(content, cfg)` (`operations.ts`):
   - Pre-compiled regex set per `aliases` reference (`getAliasPatterns` → WeakMap).
   - Three patterns per alias: `~alias`, `"alias/`, `'alias/`. Replaces with consumer’s alias.
3. **Skipped for variant bundles** — `writeRegistryOutputFile` checks `isChartVariantFile || isTableVariantFile || isKanbanVariantFile`. When true, it writes the file content as-is (variant bundles ship with imports already rewritten to relative paths at build time). See decision 1.12 for rationale.

### Failure modes & their guards
- **Registry unreachable** → circuit breaker in `network.ts` short-circuits after 3 failures, sleeps 60s, prints clear error.
- **Concurrent installs** → `.afnoui-install.lock` file (acquired in `operations.ts`, released in `finally`).
- **User-modified files** → managed-file marker checked on write. Without `--force`, refuses to overwrite.
- **Wrong package manager** → never trust detection blindly; print the chosen pm in `--debug` so users can verify.
- **`"use client"` placement** → `framework-aware policy` in `imports.ts`. Next.js: inject when file uses hooks. Vite/CRA: strip the directive.

---

## 5. State Management

### 5.1 Categories of state

| Category | Tool | Location |
|---|---|---|
| **UI-local** | `useState` / `useReducer` | colocated with the component |
| **Builder canvas + history** | `useBuilderHistory` (custom — `[past, present, future]` tuple) | each builder’s page-level component |
| **Theme** | React context (`app/contexts/ThemeContext.tsx`) + `next-themes` for persistence | mounted in `RootThemeProvider` |
| **i18n / direction** | `i18next` + `react-i18next` + `RtlLayoutProvide` | mounted in `I18nextProvider` and `RtlLayoutProvide` |
| **Server / async data** | `@tanstack/react-query` | provided by `QueryProvider`. Used by `useInfiniteOptions`, kanban `loadMore`, async form fields |
| **Toasts** | `hooks/use-toast.ts` (sonner-backed) | called from anywhere; renders in `<Toaster />` mounted in root layout |
| **DnD active drag** | `@/components/ui/dnd` `DndProvider` (React context) | mounted at the boundary that hosts a drag (kanban board, table body, ui-builder canvas). Same library shipped to consumers via BOTH `tables.json::shared` AND `kanban.json::shared` (rewritten to `lib/dnd/*` at install). |

### 5.2 Cross-component communication
- **Parent ↔ child**: props. No exceptions for builder state.
- **Sibling components**: lifted to nearest common ancestor.
- **Cross-tree (rare)**: React context (theme, i18n, query, dnd, toaster).
- **Client ↔ server**: TanStack Query. `useInfiniteOptions` is the canonical example for paginated remote options.
- **Builder ↔ persisted state**: there is none. We refuse to persist drafts to localStorage by default — too easy to corrupt across schema changes. The JSON import/export dialog is the manual save mechanism.

### 5.3 Caching policy

| Cache | Owner | TTL | Invalidation |
|---|---|---|---|
| TanStack Query default | website | `staleTime: 0` (default) | refetch on focus |
| Theme preference | localStorage (`next-themes`) | infinite | user clicks theme switcher |
| Locale preference | localStorage (`i18next-browser-languagedetector`) | infinite | user clicks language switcher |
| CLI registry fetches | none by default (`ENABLE_CACHE = false` in `constants.ts`) | n/a | every install hits the network |
| CLI lockfile | `.afnoui-install.lock` | `LOCK_TIMEOUT = 120000ms` | release in `finally` or stale-file cleanup |

The CLI is **stateless by design**. We do not write a `.afnoui-cache/` folder. Trade-off: slightly slower repeat installs, perfectly clean CI behaviour.

---

## 6. Edge Cases (every "weird" scenario we’ve consciously handled)

### Form / table / kanban builders
1. **User drops a field while another is being edited** → `useBuilderHistory.push` clones the next state; in-flight edits in `PropertiesPanel` are committed on blur, never silently dropped.
2. **JSON import with malformed config** → `JsonObjectInput` validates against the same Zod schema as PropertiesPanel; rejects with inline error; never half-imports.
3. **User exports before all required fields are filled** → Export button is disabled (computed from `hasFields && allFieldsValid`). Empty state shown in `ExportTab`.
4. **Conditional fields refer to a removed field** → `getRequiredComponents` walks the field list once; orphan conditions are emitted as comments in the generated code, never silent removals.
5. **Two fields share the same name** → form-builder PropertiesPanel disallows duplicate names; codegen would otherwise produce an invalid `defaultValues` shape.
6. **Date field with locale-specific formatting** → `app/forms/utils/dateFieldHelpers.ts` always serializes ISO 8601; display formatting is i18n-driven.
7. **Async/dependent select with cyclic dependencies (A depends on B, B depends on A)** → `dependentApiRequest` detects cycles via a visited-set; the second pass throws and surfaces a toast.

### Tables
8. **Server-mode pagination + client-mode sort** — each feature can be `"client"` or `"api"` independently. The hook codegen branches per-feature; client sort runs on whatever page the API returned.
9. **Virtualization + DnD active row** — `@tanstack/react-virtual` handles measurements; the active drag is positioned in absolute coordinates so virtualization scrolling does not detach the drag.
10. **Sticky pinned column + horizontal scroll** — uses `position: sticky` with `inset-inline-start` (logical property), so pin behaviour is correct in RTL.
11. **Cell formatter throws** — `cellJsRunner.ts` runs user JS in a sandboxed function with a try/catch; on throw, the cell falls back to the raw value and logs to console (never crashes the table).
12. **Row dialog template references a missing field** — `rowDialogTemplate.ts` Mustache renderer renders empty string for missing tokens; never throws.
13. **API endpoint returns partial rows mid-scroll** — table hook deduplicates by `id`, never doubles rows.
14. **CSV export with comma in cell** — quote escaping per RFC 4180 (handled in tableCodeGenerator’s utility emit).

### Kanban
15. **Drop on a WIP-limit-full column** — `KanbanBoard` shows an inline warning, calls `onCardChange` with a rejection flag; the consumer decides whether to allow.
16. **Drag card off-screen / loses pointer** — `DndContext` listens to `pointerup` on `window`, not the source element, so loss of focus still ends the drag.
17. **Card click while drag is starting** — activation distance threshold (default 4px) prevents accidental drag from a click.
18. **Reordering during `loadMore` fetch** — the appended cards are merged behind the current sort; in-progress reorder is preserved.
19. **User-templated dialog with bad JS** — `cellJsRunner.ts` sandbox + try/catch; dialog still opens with the template fallback.

### CLI
20. **User runs install while another install is mid-flight in the same project** → `acquireLock(LOCK_FILE)` blocks; second invocation prints "another install is in progress" and waits.
21. **Stale lockfile from a crashed previous run** → `cleanupStaleLocks()` checks mtime > `LOCK_TIMEOUT` and removes.
22. **`afnoui.json` exists but is missing a new alias (e.g. `kanbanVariants`)** → `inferMissingAliasFields` fills it from sibling aliases (e.g. `tableVariants` ⇒ swap `/tables` → `/kanban`). Never mutates user-provided values.
23. **Consumer is on a different package manager than detected** → `--debug` prints the choice; user can override via flag (planned — see CURRENT_SPRINT.md).
24. **Consumer’s Tailwind is v3 not v4** → `tailwindIsV4()` detects from package.json range; init refuses to write v4-only utilities.
25. **HTTP fetch fails 3× consecutively** → circuit breaker opens for 60s; caller sees a clear "circuit breaker active" error instead of cascading timeouts.
26. **Variant install requested without engine present** → `ensureFormSystemForVariantSlugs` / `ensureTableSystemForVariantSlugs` / `ensureKanbanSystemForVariantSlugs` install the engine first, then the variant. User just types the variant.
27. **Engine update needs to land on already-installed engine** → `refresh*EngineSharedFiles` runs on the warm path (when engine is detected) so type-signature changes propagate without `--force`.
28. **File the CLI is about to write was modified by the user** → managed-marker check; without `--force`, prompts (or in `--dry-run` mode, prints a diff via `diff` package).
29. **`"use client"` directive needed but absent in the source** → `injectUseClientDirective()` adds it when target framework is Next App Router; strips it for Vite/CRA where it would be a syntax error.
30. **Charts in RTL with mixed-direction titles** (e.g. Arabic title with English numerals) → `<h4 dir="auto">` lets the Unicode Bidirectional Algorithm pick per character; chart axes still respect explicit `direction` prop.
31. **Browser doesn’t support `clipboard.writeText` (e.g. http context)** → CodeBlock’s copy button falls back to a `document.execCommand('copy')` path; never silently fails.
32. **i18n locale switch mid-render** → `RtlLayoutProvide` updates `<html dir>` synchronously; CSS logical properties handle the rest. No remount.
33. **User loses internet during CLI install** → next HTTP request fails; `safeInstall` cancels the package-manager subprocess; lock released; partial files remain (we do not roll back, but the registry verifier on the next install will detect drift).

### Build / Next.js specifics
34. **A registry shared file uses React hooks but lacks `"use client"`** → manifests as a Next.js build error in dev. Two safeguards: (a) source files in `app/kanban/`, `app/components/ui/dnd/`, etc. carry the directive; (b) registry build embeds the directive verbatim; (c) CLI’s framework-aware policy adds it when missing on consumer side.
35. **Snapshot lock breaks because registry-shipped file size changed** → expected on intentional engine edits. CI-friendly fix: `pnpm exec vitest run -u`.
36. **Sandbox helper would land in the `utils` alias FILE** → `resolveRegistryOutputPath` short-circuits any `utils/<file>` registry path through `resolveUtilsHelperPath`, which targets a sibling `<libBase>/utils/` directory. Without this, `cellJsRunner.ts` would write to `lib/utils/cellJsRunner.ts` — collision with `lib/utils.ts` on case-insensitive filesystems and ambiguous TS resolution. (See decision 1.11, hack 2.13.)
37. **Variant bundle import would resolve to the wrong directory** → variants embed pre-rewritten relative imports (`../../components/kanban/KanbanBoard`, `../../utils/cellJsRunner`, `../../lib/dnd`) computed by their `variantBundle.ts` builders at registry-build time. CLI's `writeRegistryOutputFile` skips its alias-to-relative rewriter for these categories. (See decision 1.12, past mistake 3.8.)
38. **Tables consumer ends up needing `@dnd-kit` despite using the project's custom DnD** → `tables.json`'s `tableInstall.npmDependencies` excludes `@dnd-kit/*` deliberately; `TablePreview.tsx` source uses `@/components/ui/dnd` which the build script rewrites to `../../lib/dnd` before embedding. The 7 dnd files ship via `tables.json::shared`. (See decision 1.5, past mistake 3.6.)
39. **Schema-engine first navigation paints all nodes shrunk into the corner** → `SchemaCanvas.onInit` runs `fitView({ duration: 0 })` immediately AND a second `fitView({ duration: 200 })` inside `requestAnimationFrame`. Two-pass pattern handles the case where `ResizablePanel` measures the viewport asynchronously. (See hack 2.15, past mistake 3.10.)
40. **Multiple pinned columns on the same side overlap their resize handles when scrolling horizontally** → `pinStyle()` adds a per-column `stackBias` to the z-index so leftmost-pinned wins on the left and rightmost-pinned wins on the right. Mirror-symmetric for RTL via `inset-inline-start/end`. (See hack 2.14, past mistake 3.11.)
41. **Form export tab shows a field tab but the panel is blank** → every `requiredComponents.fieldComponents` entry now emits its own `<TabsContent>` populated via `getFieldFile(file, formLibrary)` from the registry. Falls back to a "regenerate the registry" hint if the source is missing. (See past mistake 3.9.)
42. **`afnoui add kanban/<slug>` 404'd** → `scripts/build-variants-registry.ts` now iterates `kanbanTemplates` and writes `public/registry/variants/kanban/<slug>.json` (12 variants). Mirror of the tables pipeline; `app/kanban-builder/utils/variantBundle.ts` is the per-domain bundler. (See past mistake 3.8.)
