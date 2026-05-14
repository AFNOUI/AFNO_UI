# THE_DECISION_LOG.md

> Permanent record of architectural decisions, what was rejected, and the workarounds future contributors must NOT "fix".
> Format: each decision is dated and has a `Status` (Accepted / Superseded / Reverted). When a decision is superseded, leave the original entry — append a new one referencing it.

---

## Section 1 — Architecture Debt (decisions deliberately deferred)

### 1.1 [Accepted] No global state library
**Decision**: Builder canvas state lives in `useBuilderHistory` (a `[past, present, future]` tuple per builder page). UI state stays local. Server state goes through TanStack Query.

**Rejected alternative**: Zustand / Redux Toolkit / Jotai.

**Reasoning**:
- The builder’s only meaningful state is *one* config object. A 60-line custom hook beats pulling a global-store dependency for a single value.
- Forms, tables, kanban builders are siblings — they never share state. There is nothing global to globalise.
- Theme + i18n already use React context with no perf issues.

**When to revisit**: when a third independent builder needs to share state with one of the existing builders. Not before.

---

### 1.2 [Accepted] No backend, no auth, no persistence
**Decision**: The website ships zero backend code. Builders are 100% client-side; export is the only persistence mechanism.

**Rejected alternative**: Save drafts to localStorage. Save drafts to a backend with accounts.

**Reasoning**:
- Auth + storage are 10× the surface area we’d be willing to maintain.
- localStorage drafts get corrupted across schema changes (config shape evolves quarterly). The blast radius is too large.
- The JSON import/export dialog is the explicit save path. Users who want versioning use git.

---

### 1.3 [Accepted] Stateless CLI (no `.afnoui-cache/`)
**Decision**: `ENABLE_CACHE = false` in `afnoui-cli/src/lib/constants.ts`. Every install hits the network.

**Rejected alternative**: Cache registry JSONs by ETag.

**Reasoning**:
- CI environments hate persistent caches across runs (cause non-deterministic builds).
- Registry JSONs are small (forms.json ~500KB, kanban.json ~92KB). Even on bad connections this is sub-second.
- A stale cache is far worse than a slow network — silent drift between what the user sees in the export tab and what the CLI installs.

**When to revisit**: when registry JSONs cross 5MB or users start asking for offline-mode installs.

---

### 1.4 [Accepted] No Prettier
**Decision**: ESLint flat config (v9) only. No Prettier, no `.prettierrc`.

**Rejected alternative**: Prettier with `eslint-config-prettier`.

**Reasoning**:
- Prettier reformats *everything* on save → noisy diffs in PRs.
- Most of our generated code is byte-locked by snapshot tests; Prettier reformatting would break snapshots constantly.
- Manual review catches the formatting drift we care about.

**When to revisit**: when the team grows past ~5 active contributors and merge conflicts on whitespace become real.

---

### 1.5 [Accepted] Custom DnD library instead of @dnd-kit
**Decision**: Pointer-event-based DnD library at `app/components/ui/dnd/` (`DndContext`, `useDraggable`, `useDropZone`, `DropIndicator`, `dnd.css`). Zero external dependency. Used by **kanban + tables + ui-builder** — three independent consumers, one library.

**Rejected alternative**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`.

**Reasoning**:
- @dnd-kit pulls 3 packages, ships ~30KB minified. We use DnD in 3 places (kanban, ui-builder, table rows) and need only ~600 lines of logic.
- @dnd-kit’s RTL handling required wrapping every consumer in extra boilerplate.
- Our Pointer API approach handles autoscroll, prefers-reduced-motion, and RTL index resolution natively.

**Cost**: We own a small DnD codebase. We must keep it documented and tested (via the kanban *and* tables registry verifiers — both ship the files to user projects). `tables.json` and `kanban.json` both embed `lib/dnd/*` in their `shared` arrays; their build scripts rewrite the source-side `@/components/ui/dnd` import to `../../lib/dnd` so the file lands at the consumer's `<libBase>/dnd/*` and resolves naturally.

**Forbidden change**: Do NOT add `@dnd-kit/*` back as a dependency. If you need a new DnD primitive, extend `app/components/ui/dnd/`. (Past mistake 3.6 below traces what regressed when `tables.json` accidentally kept the `@dnd-kit/*` deps.)

---

### 1.6 [Accepted] No e2e test framework
**Decision**: No Playwright, no Cypress, no Puppeteer.

**Rejected alternative**: Playwright with a small smoke suite for builders.

**Reasoning**:
- The visual builders ARE the e2e harness. If a regression breaks the canvas, you see it within seconds in dev.
- We have 213 unit tests + 100 CLI tests + 4 registry verifier scripts + `validate-installed-variants.ts` (which actually runs the CLI against a live dev server and asserts results). That’s a strong floor.
- Playwright on Windows + Next 16 + TanStack Query was historically flaky for similar projects.

**When to revisit**: when we have a billing/auth flow or any user-data path. Currently we have neither.

---

### 1.7 [Accepted] React Hook Form + TanStack Form + useActionState — three stacks, not one
**Decision**: Maintain three form stacks. Each is shipped via the CLI separately.

**Rejected alternative**: Pick one. Tell users to deal with it.

**Reasoning**:
- Real teams choose form libraries for non-technical reasons (existing codebase, hiring market, framework opinions). Telling them to migrate is a non-starter.
- The codegen split (`form-builder/utils/codegen/staticPages/{rhf,tanstack,action}.ts`) keeps stack-specific code physically isolated. Snapshot tests prevent cross-contamination.
- The registry has `formStackInstall` per stack — a small JSON object per variant — not three separate registries.

**Cost**: 3× the snapshot surface area for form codegen. Acceptable — caught by `formCodeGenerator.test.ts`.

---

### 1.8 [Accepted] Recharts, not visx / nivo / d3-direct
**Decision**: All charts wrap Recharts in `app/components/ui/charts/<type>.tsx`.

**Rejected alternative**: visx (composable but lower-level), nivo (heavier), pure d3 (we’d be reimplementing Recharts).

**Reasoning**:
- Recharts gives accessible defaults and respects `direction` more politely than visx out of the box.
- One library means one mental model for chart authors and one set of theme tokens.

**Cost**: Some chart variants we want (e.g. polar-area with custom interactions) need heavier wrapping.

---

### 1.9 [Accepted] CLI is a separate npm package, not a workspace package
**Decision**: `afnoui-cli/` has its own `package.json`, its own `tsconfig.json`, its own `dist/` (committed). Not a pnpm workspace member.

**Rejected alternative**: pnpm workspace with the CLI as `@afnoui/cli`.

**Reasoning**:
- Workspace setups make publishing complicated (dist resolution, `pnpm publish` quirks, dual-mode imports).
- We want the CLI testable in total isolation. A workspace would let it accidentally import from `app/`.
- Hard rule enforced by grep: `afnoui-cli/src` has zero imports from outside its directory (other than npm packages).

**Cost**: Two `node_modules`, two test runs in CI. Manageable.

---

### 1.10 [Accepted] Single registry, three generators
**Decision**: Forms / tables / kanban each have their own registry build script (`generate-registry.ts`, `build-tables-registry.ts`, `build-kanban-registry.ts`). They all output into one `public/registry/` directory.

**Rejected alternative**: One mega-script that builds everything.

**Reasoning**:
- Each script encodes domain-specific install metadata (form has `stackInstall`, table has `tableInstall.optionalPeers`, kanban has its own `KanbanRegistryInstallSpec`).
- Independent rebuilds let CI skip unchanged categories.

**Cost**: 3 `pnpm run build:*-registry` commands. Aliased as `pnpm run build` chains.

---

### 1.11 [Accepted] `utils/<file>` registry paths bypass the `utils` alias
**Decision**: When a registry-shared file path begins with `utils/` (`cellJsRunner.ts`, `rowDialogTemplate.ts`), `resolveRegistryOutputPath` (`afnoui-cli/src/lib/helpers/installPaths.ts`) routes it through a dedicated `resolveUtilsHelperPath` that targets a sibling `<libBase>/utils/` folder — **NOT** the `utils` alias.

**Rejected alternative**: Reuse the existing `utils` alias entry (which points at `lib/utils.ts` for the cn helper).

**Reasoning**:
- The `utils` alias is conventionally a *single file* (`lib/utils.ts` or `app/lib/utils.ts`) that owns `cn(clsx, twMerge)`. Treating it as a directory would have created `lib/utils/cellJsRunner.ts` next to `lib/utils.ts` — folder/file collision on case-insensitive filesystems and `tsc` resolution ambiguity.
- A kanban-only install (`afnoui add kanban/<slug>`) used to drop sandbox helpers into `components/tables/`, dragging in a stray `tables/` directory the user never asked for. The `utils/` route is shared cleanly between table installs and kanban installs.
- The router is layout-aware: app-dir → `app/utils/`, src-rooted → `src/utils/`, flat → `utils/`. Inferred from the existing `aliases.lib` (no new config field needed).

**Forbidden change**: Do NOT relocate these helpers back under `components/tables/`. The build scripts (`scripts/build-tables-registry.ts`, `scripts/build-kanban-registry.ts`) have hardcoded `targetPath: "utils/<file>"` plus matching import-rewrite regexes (`from … "../../utils/<file>"`).

---

### 1.12 [Accepted] Variant bundles ship pre-rewritten relative imports
**Decision**: Charts / tables / kanban variant JSONs embed code with imports already rewritten to *relative* paths (`../../components/tables/…`, `../../utils/cellJsRunner`, …). The CLI `writeRegistryOutputFile` skips `rewriteAliasedImportsToRelative` for these variant categories.

**Rejected alternative**: Ship variants with `@/components/...` aliases and let the CLI rewrite at install time (the path forms / non-variant files take).

**Reasoning**:
- Variant bundles cross *two* alias roots in a single file (e.g. a kanban variant references both `kanban/<slug>` siblings and the engine in `components/kanban/*`). The CLI's per-import rewriter would need to know the variant's *own* install location to emit correct `../../` counts. Doing it at build-time, where we know the relationship, is simpler and snapshot-testable.
- Keeps the CLI's transform layer single-purpose: it only handles top-level alias swaps (`@` → `~`, `app/` → `src/`, etc.), never directory-relative computation.

**Forbidden change**: Do NOT add the chart / table / kanban variant categories to the `rewriteAliasedImportsToRelative` branch in `operations.ts::writeRegistryOutputFile`. Past mistake 3.7 records what happens when this guard is missing.

---

## Section 2 — The "Hacks" Library

> Each entry is a non-standard piece of code. If you’re an AI tempted to "clean it up" — read the rationale first. Most of these protect against silent regressions.

### 2.1 `"use client"` is INSIDE source files of the DnD library and kanban runtime
**Where**:
- `app/components/ui/dnd/{DndContext.tsx, useDraggable.ts, useDropZone.ts}`
- `app/kanban/{KanbanBoard,KanbanCardDialog,KanbanAddCardDialog}.tsx`

**Looks weird because**: A library file with a `"use client"` directive is unusual — typically the directive lives on the importing component.

**Why we did it**:
- These files use React hooks. Next 16 App Router will fail the build if they’re imported from a server component without the directive.
- The CLI ships these files into consumer projects where the consumer’s page may default to server. Embedding the directive at source means the CLI doesn’t need to inject it.
- Alternative (CLI-side injection) was tried and is fragile across framework versions.

**Don’t**: remove `"use client"` from these files.

---

### 2.2 ~~`LEGACY_FORM_STACK_INSTALL` fallback~~ **removed** (CLI is registry-only for form deps)
**Where**: `afnoui-cli/src/lib/helpers/registryShape.ts` — `resolveFormStackInstall`, `validateModernFormRegistryShape`, `parseFormsRegistry`.

**Historical problem**: a hardcoded `LEGACY_FORM_STACK_INSTALL` duplicated `STACK_INSTALL` from `scripts/generate-registry.ts`, coupling the CLI to frontend knowledge and guaranteeing drift.

**Current behaviour**:
- `validateModernFormRegistryShape` requires `stackInstall` with **valid** entries for **all three** stacks (`rhf`, `tanstack`, `action`).
- `resolveFormStackInstall` **throws** if the requested stack’s block is missing or malformed — no embedded fallback lists.
- Legacy `forms.json` that only had `fixed` + `fields` is detected via `tryPartitionLegacyFormRegistry` but **rejected** in `parseFormsRegistry` with an explicit “regenerate `public/registry/forms.json`” message.

**Don’t**: reintroduce a CLI-side duplicate of npm/UI lists; extend `forms.json` (`stackInstall`) instead.

---

### 2.3 `dist/` is committed to git for `afnoui-cli/`
**Where**: `afnoui-cli/dist/`

**Looks weird because**: build artifacts in git are anti-pattern.

**Why it stays**:
- The CLI publishes from `dist/` (`"main": "./dist/index.js"`, `"bin": "dist/index.js"`).
- Local `npx afnoui` resolution from a workspace before publish needs `dist/` to exist.
- We DO want diffs reviewable — sometimes a TS change has surprising JS output.

**Don’t**: add `afnoui-cli/dist/` to `.gitignore`.

---

### 2.4 `cellJsRunner.ts` runs user-supplied JavaScript via `new Function(...)`
**Where**: `app/utils/cellJsRunner.ts`.

**Looks weird because**: `new Function()` is "eval-equivalent" and security tooling flags it.

**Why it stays**:
- The user-supplied JS is theirs — they own the tab where it runs. Same trust boundary as the React component itself.
- Sandboxing in the browser without WASM/iframes is performative; we accept the risk and isolate failure with try/catch.
- Used by both tables (cell formatters, row-dialog JS) and kanban (card formatters, dialog JS).

**Don’t**: refactor to a WASM sandbox without first proving the perf cost is acceptable for ≤16ms/render targets.

---

### 2.5 `generated*` TS files have a 500KB string-literal body
**Where**:
- `app/registry/formRegistryGenerated.ts` — ~500KB
- `app/registry/tableRegistryGenerated.ts` — ~80KB
- `app/registry/kanbanRegistryGenerated.ts` — ~90KB

**Looks weird because**: A 500KB TS file is intimidating; one’s instinct is to dynamic-import.

**Why it stays**:
- Dynamic imports break the export tab’s synchronous code preview UX.
- Next 16 tree-shakes unused exports. The website only loads the chunks it actually displays.
- Snapshot tests pin the file shape. Drift is caught immediately.
- Re-running the generator is one command.

**Don’t**: convert to dynamic imports without first measuring bundle impact in a real Next build.

---

### 2.6 Workspace `tsconfig.json` excludes `afnoui-cli/`
**Where**: `tsconfig.json` `"exclude": ["node_modules", "test", "afnoui-cli"]`.

**Looks weird because**: a TS project usually wants to typecheck everything.

**Why it stays**:
- The CLI has its own `strict: true` `tsconfig.json` and runs its own `tsc` in CI.
- Without the exclusion, the website tsc tries to resolve CLI imports (chalk, commander, fs-extra) against the website’s `node_modules`, which doesn’t have them, producing a wall of false errors.

**Don’t**: remove the exclusion.

---

### 2.7 `useEffect(() => setCards(initialCards), [initialCards])` in `app/(pages)/kanban/page.tsx`
**Where**: kanban variant gallery page.

**Looks weird because**: setting state from an effect in response to a prop change is "controlled-vs-uncontrolled" controversy territory. Linters and React docs both nudge you toward derived state.

**Why it stays**:
- The variant gallery switches between curated examples. When the user picks a different variant, `initialCards` is a new reference; we want to reset the local working set.
- Derived state (`useMemo` returning `initialCards`) was tried — caused a render loop the React Compiler flagged.
- A `key={variantSlug}` on the board would also work but forces a full re-mount of `KanbanBoard`, which throws away DnD active drags and animation state.

**Don’t**: refactor without understanding the trade-off. The comment in the file documents it.

---

### 2.8 `dir="auto"` on chart titles + `dir="ltr"` on shell-command snippets
**Where**: `app/components/ui/chart-primitives.tsx`, `app/page.tsx` (CLIBlock).

**Looks weird because**: explicit `dir` attributes on elements that are inside an already-direction-aware container.

**Why they stay**:
- `dir="auto"` lets the Unicode Bidi algorithm pick per-text. Mixed-direction strings (Arabic title with English numerals) render correctly without mirroring the chart’s explicit direction.
- `dir="ltr"` on shell snippets prevents `$` and CLI flags from mirroring under RTL pages, which would render commands unrunnable.

**Don’t**: remove these directives; they’re intentional Bidi controls.

---

### 2.9 The CLI re-fetches `tables.json` on every variant install of an already-installed engine
**Where**: `afnoui-cli/src/lib/operations.ts` — `ensureTableSystemForVariantSlugs`, warm path.

**Looks weird because**: an "engine already installed" branch should be a no-op.

**Why it’s not a no-op**:
- We refresh shared engine files on every variant install. This propagates engine-side updates (e.g. a new optional config flag, a type widening) without forcing the user to remember `--force`.
- Net cost: one HTTP GET (~30KB) per install. Cheap.

**Don’t**: convert this branch to a true no-op without a versioning story.

---

### 2.10 `validate-installed-variants.ts` requires `pnpm dev` to be running
**Where**: `scripts/validate-installed-variants.ts`.

**Looks weird because**: a build-validation script that depends on a *running dev server* is a weird CI shape.

**Why it stays**:
- It’s the only way we exercise the *real* CLI install path against the *real* registry over HTTP.
- It runs locally before merging anything that touches CLI install logic.
- CI runs `pnpm run verify:quick` (which excludes this script) plus the registry verifiers — that’s our gate. The full `validate:variants` is a developer pre-merge checkpoint.

**Don’t**: wire this into CI without first solving "spin up dev server in CI then tear it down".

---

### 2.11 Per-call `await validateConfig()` inside `transformPath`
**Where**: `afnoui-cli/src/lib/operations.ts::transformPath`.

**Looks weird because**: appears redundant — every call validates the same config.

**Why it stays**:
- `validateConfig` is itself memoised internally for the same `aliases` reference (via `inferMissingAliasFields` running only when fields are missing).
- The function MUST handle `config?: AfnoConfig | undefined` (some CLI helpers pass nothing). The `await getConfig()` fallback path is the safety net.

**Optimisation already applied**: regex pattern set is now WeakMap-cached per `aliases` reference (`getAliasPatterns`). The remaining `await` is essentially free.

---

### 2.12 `app/kanban/dnd/index.ts` is a re-export shim of `@/components/ui/dnd`
**Where**: `app/kanban/dnd/index.ts`.

**Looks weird because**: a one-line file that just re-exports.

**Why it stays**:
- Backward-compat for the era when DnD lived inside `app/kanban/dnd/`.
- The kanban registry’s `shared` files have hardcoded paths that mention `kanban/dnd`. Changing them would force every consumer to re-install.
- The shim is 8 lines of code, has no runtime cost, and lets us move the source of truth without breaking installed projects.

**Don’t**: delete this until we ship a registry breaking-change major version (planned but not soon).

---

### 2.13 `resolveUtilsHelperPath` is a sibling helper of `resolveRegistryOutputPath`
**Where**: `afnoui-cli/src/lib/helpers/installPaths.ts` — `resolveRegistryOutputPath` short-circuits any path starting with `utils/` to `resolveUtilsHelperPath`.

**Looks weird because**: a special-cased branch above the generic alias loop, when most other registry path families are handled by the loop.

**Why it stays**:
- The `utils` alias points at the cn-utility *file* (`lib/utils.ts`), not a directory. Letting the generic loop run would produce `lib/utils/cellJsRunner.ts` — collides with `lib/utils.ts`.
- Layout-detection is inherited from the `lib` alias (app-dir vs src-rooted vs flat) — no separate config knob.

**Don’t**: collapse the branch back into the generic loop. See decision 1.11. Tests in `afnoui-cli/tests/unit/installPaths.test.ts` (the "utils helpers" describe block) pin the behaviour.

---

### 2.14 Pinned-column z-index uses `stackBias`, not raw `index`
**Where**: `app/table-builder/TablePreview.tsx` — `pinStyle()` adds `stackBias` to header (`20 + stackBias`) and filter (`15 + stackBias`) z-index of pinned columns.

**Looks weird because**: a normal sticky-table pattern uses a single z-index per "layer". Adding a per-column bias looks over-engineered.

**Why it stays**:
- Without the bias, two adjacent left-pinned columns at the *same* z-index let the rightmost one's content overlap the leftmost one's resize handle and sort button as the user scrolls horizontally. The bias guarantees the leftmost-pinned column always paints above its right neighbours (and the rightmost-pinned column always paints above its left neighbours on the right side). Mirror-symmetric for RTL via the `inset-inline-start/end` pair.

**Don’t**: replace with a flat z-index. Re-test horizontal scroll with three or more pinned columns before changing.

---

### 2.15 `SchemaCanvas` calls `fitView` from both `onInit` AND a layout effect
**Where**: `app/schema-engine/SchemaCanvas.tsx`.

**Looks weird because**: belt-and-braces — one of the two should suffice.

**Why both**:
- `onInit`: handles first navigation when nodes exist before mount. Two passes inside `onInit` (sync + RAF) cover the case where `ResizablePanel` hasn't measured the viewport yet.
- Layout effect with `setTimeout(0)`: handles re-fit when `direction`/`laidOutNodes` change after the initial mount (e.g. user switches schema, adds nodes, or drags the resize handle wide enough to need re-fit).

**Don’t**: collapse to a single call site. The two events are genuinely independent and both fire in real usage.

---

## Section 3 — Past Mistakes (recorded so they’re not re-introduced)

### 3.1 Form export panel showed wrong `npm install` hint (missing `date-fns`)
**Symptom**: Until the recent refactor, `FormsCodePanel.tsx` and `ExportTab.tsx` hardcoded the displayed install command. The CLI’s actual install (via `forms.json`) was correct, but the displayed hint was missing `date-fns`. Users who copy-pasted got a runtime error.

**Fix landed**: both panels now derive the install command from `formStackInstall` (registry).

**Lesson encoded**: anywhere we display "the deps you need", read from the registry.

---

### 3.2 `getDependencyReport` (table) had an inline duplicate of `tableInstall`
**Symptom**: Same drift hazard. Same kind of fix.

**Fix landed**: `getDependencyReport(config)` reads from `tableInstall.npmDependencies` + `tableInstall.optionalPeers`, plus an inline list of Radix peers (kept inline because they’re a property of the shadcn primitives the table engine uses, not the table engine itself).

---

### 3.3 Kanban + DnD files lacked `"use client"` and broke `next build`
**Symptom**: `pnpm exec next build` failed in dev because a server component imported a hook-using DnD file.

**Fix landed**: `"use client"` added to all kanban runtime + DnD library files + kanban-builder leaf components. Kanban registry rebuilt to ship the directive.

**Lesson encoded**: any file that uses a React hook AND ships through the registry MUST have `"use client"` at source. Don’t rely on CLI-side injection alone.

---

### 3.4 `useMemo` calling `setState` caused infinite renders in kanban variant page
**Symptom**: React Compiler flagged `react-hooks/preserve-manual-memoization`.

**Fix landed**: replaced with `useEffect`.

**Lesson encoded**: never call setters from `useMemo`.

---

### 3.5 `splitPinned` helper, `cardById` map, `totalRows` prop, empty `handleAddCard` — all dead code that slipped through
**Symptom**: Wave-5 cleanup discovered them.

**Fix landed**: removed. `pnpm lint` is the floor.

**Lesson encoded**: when removing a feature, grep for every consumer first. The `visibleCols` over-removal in `TablePreview.tsx` was a near-miss — re-added in the same wave.

---

### 3.6 `tables.json` shipped `@dnd-kit/*` and `@/components/ui/dnd` imports → `Cannot find module '../ui/dnd'` after CLI install
**Symptom**: After `npx afnoui add tables/tables-pinned-virtualized`, the consumer's `DataTable.tsx` errored on `Cannot find module '../ui/dnd'`. The CLI's relative-path rewriter had transformed `@/components/ui/dnd` → `../ui/dnd` based on the *table engine's* install location, but the consumer never received the dnd files because `tables.json` didn't list them in `shared`. Worse, `tableInstall.npmDependencies` still listed `@dnd-kit/*` from a pre-Wave-5 era — wholly inconsistent.

**Fix landed**:
- `scripts/build-tables-registry.ts` removed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` from `TABLE_INSTALL.npmDependencies`.
- `TABLE_SHARED_SOURCES` now explicitly includes `lib/dnd/*` (7 files).
- `TablePreview.tsx` engine source uses `@/components/ui/dnd`; the build script's `rewriteSharedFileImports` replaces it with `../../lib/dnd` before embedding into `tables.json`.
- `scripts/verify-tables-registry-sync.mjs` updated to assert all 7 dnd files are present.

**Lesson encoded**: registry verifiers must enumerate *every* file the engine imports, not just files in the engine directory. The verifier's `TARGET_TO_SOURCE` map is the source of truth.

---

### 3.7 Sandbox helpers used to land at `components/tables/<file>` for kanban-only installs
**Symptom**: A user running `npx afnoui add kanban/kanban-personal-tasks` — without ever installing a table — ended up with a stray `app/components/tables/cellJsRunner.ts` and `app/components/tables/rowDialogTemplate.ts`. Confusing folder structure; suggested table support was being installed when it wasn't.

**Fix landed**:
- Both build scripts changed `targetPath` to `utils/<file>` (was `components/tables/<file>`).
- CLI added `resolveUtilsHelperPath` (`afnoui-cli/src/lib/helpers/installPaths.ts`) so `utils/<file>` paths route to a sibling `<libBase>/utils/` folder that's neutral between tables and kanban.
- Engine sources (`TablePreview.tsx`, `KanbanBoard.tsx`, `KanbanCardDialog.tsx`) updated to import from `@/utils/cellJsRunner`; build scripts rewrite to `../../utils/cellJsRunner` for the embedded copy.

**Lesson encoded**: shared sandbox / template / formatter helpers belong in a category-neutral folder (`utils/`), never inside one consumer's directory.

---

### 3.8 `npx afnoui add kanban/<slug>` 404'd because no kanban variant JSONs were emitted
**Symptom**: `Failed to fetch registry data from http://localhost:3000/registry/variants/kanban/kanban-personal-tasks.json: 404 Not Found`. The kanban builder + engine + registry were all in place, but `build-variants-registry.ts` never iterated `kanbanTemplates`.

**Fix landed**:
- New `app/kanban-builder/utils/variantBundle.ts` exports `buildKanbanVariantFiles(config, cards, slug)` mirroring `table-builder/utils/variantBundle.ts`.
- `kanbanCodeGenerator.ts::generateKanbanFiles` accepts an optional `componentNameOverride` so variant bundles use the slug as the component/hook name (prevents drift if the user renames the board title).
- `scripts/build-variants-registry.ts` added a kanban block: clears `public/registry/variants/kanban/`, iterates `kanbanTemplates`, writes one `<slug>.json` per template (12 files total).
- CLI `operations.ts::writeRegistryOutputFile` adds `isKanbanVariantFile` to the predicate list that *skips* `rewriteAliasedImportsToRelative` (variant bundles are pre-rewritten — see decision 1.12).

**Lesson encoded**: when adding a new variant category, the `build-variants-registry.ts` block, the CLI's relative-rewrite skip-list, and the registry verifier must all be touched in the same PR. The kanban category was the regression-test case for this checklist.

---

### 3.9 Form export tab had `TabsTrigger` per field but no `TabsContent` — clicking a field tab showed blank
**Symptom**: In `app/form-builder/ExportTab.tsx`'s code-preview pane, the leftmost tab list rendered tabs for each required field component (e.g. "EmailField.tsx", "DateField.tsx"). Clicking them switched the active tab — but the right-hand panel rendered nothing because the component never emitted a `TabsContent` with a matching `value`.

**Fix landed**:
- Imported `getFieldFile` from `app/registry/formRegistry.ts`.
- Added a `requiredComponents.fieldComponents.map(...)` block emitting `<TabsContent value={comp.file}>` with a `<CodeBlock>` of the field's source, path, and description.
- Fallback message points the user at `pnpm run generate:registry` if the field source is missing.

**Lesson encoded**: every `TabsTrigger` must have a corresponding `TabsContent`. Add a runtime assertion in `Tabs.tsx`? Probably not (would be over-engineered for one place); keep as a code-review checklist.

---

### 3.10 Schema engine never auto-fit on first navigation
**Symptom**: First navigation to `/schema-engine` rendered all the schema nodes shrunk into the top-left, requiring a manual click on the "fit view" button. Subsequent navigations (via Next.js soft-routing) were sometimes fine, sometimes not — racy.

**Fix landed**:
- `SchemaCanvas.tsx::SchemaCanvasInner` now passes `onInit` to `ReactFlow` that calls `instance.fitView({ duration: 0 })` immediately and a second `instance.fitView({ duration: 200 })` inside `requestAnimationFrame`. Two-pass handles the case where `ResizablePanel` measures the viewport asynchronously.
- The existing layout-effect that re-fits on `laidOutNodes` / `direction` change now wraps `fitView` in `setTimeout(0)` to land after the panel-resize callback settles.
- Added `min-h-0 min-w-0` to `ReactFlow` and to the page wrapper so the flex container actually shrinks rather than overflowing horizontally.

**Lesson encoded**: any flex-child rendered via `ResizablePanel` needs `min-h-0 min-w-0` to avoid overflow + size-detection races. Any auto-fit-on-mount feature needs both `onInit` *and* a layout-effect re-fit.

---

### 3.11 Pinned-column header overlapped neighbours; filter input let cell scroll
**Symptom**: With three left-pinned columns, the second column's header text painted over the first column's resize handle as the user scrolled. Separately, typing into the per-column filter input caused horizontal overflow inside the cell because the input was narrower than its placeholder.

**Fix landed** (`app/table-builder/TablePreview.tsx`):
- `pinStyle()` now adds a `stackBias` to z-index per pinned column based on its position relative to the pinned edge — leftmost-pinned wins on the left, rightmost-pinned wins on the right. Header `z-index = 20 + stackBias`, filter row `z-index = 15 + stackBias`.
- Filter row `TableHead` got `overflow-hidden`; filter `<Input>` wrapped in a `<div className="min-w-0 max-w-full overflow-x-hidden">` so the input itself is clipped to the column width without scrolling.
- Sortable header's `<button>` got `w-full`; its label `<span>` got `min-w-0 flex-1 truncate` so long labels truncate cleanly without forcing the resize handle off-screen.

**Lesson encoded**: sticky tables with > 2 pinned columns per side need per-column z-index biasing. Filter inputs in cell containers should always be wrapped with `overflow-x-hidden` + `min-w-0`.

---

### 3.12 Pinned-column **body cells** let unpinned cell content (badges) bleed through during horizontal scroll
**Symptom**: The user reported a thin coloured sliver visible *inside* the pinned ID column on certain rows of `tables/tables-pinned-virtualized` (Trade Ledger). The sliver matched the green Buy/Sell `<Badge>` from the unpinned "Side" column. Hack 3.11 had already biased z-index for header/filter, but the **body** cell branch in `SortableRow` still used the legacy `pinStyle` defaults: `zIndex: 2`, `background: hsl(var(--background))`, no `overflow` clamp, and no `stackBias`. With three or more pinned columns, the rightmost pinned column's body cell could paint over the leftmost pinned column's edge during horizontal scroll, and any cell-internal overflow (rounded badges, long text) inside the next-cell-to-the-right could leak across the sticky boundary into the pinned area.

**Fix landed** (`app/table-builder/TablePreview.tsx`):
- `pinStyle()` accepts a new optional `zBase` parameter (default `10`). Header callers pass `20 + stackBias`, filter callers pass `15 + stackBias`, body callers pass `10 + stackBias`. Strict layering: `header > filter > body > unpinned (auto/0)`.
- Default `pinStyle()` background switched from `hsl(var(--background))` (page-level token) to `hsl(var(--card))` (the `<Card>` token that wraps the table). Fully opaque, matches the table chrome exactly.
- `pinStyle()` adds `overflow: hidden` so wide labels / rounded badges painted *inside* a pinned cell can never extend past its sticky boundary into a sibling pinned column.
- New helper `computeStackBias(col, startCols, endCols)` extracts the per-side biasing math so `SortableRow` doesn't duplicate the arithmetic.
- Body cell `widthStyle` gained `maxWidth: ${width}px` (mirroring the header's existing 3-axis lock) so the cell can never grow past its declared width and fight the sticky offsets.
- `getPinnedColumnLayout()` was reworked to call `pinStyle()` with explicit `zBase` for header/filter, then override only the translucent muted backgrounds — eliminating a redundant z-index spread+override pattern.

**Why this works defensively**: even if some future Tailwind utility or Radix primitive accidentally creates a stacking context inside an unpinned cell (transform, will-change, opacity < 1), the body pinned cell now wins by a comfortable margin (z-index 10+ vs. typical 0–2) and its content is opaquely framed against `--card`.

**Second-pass fix (Wave-6 follow-up)**: the first pass forced every pinned body cell to a flat `hsl(var(--card))` background. That mask worked for scroll bleed, but introduced a visible *visual* mismatch: striped odd rows (which carry an `bg-muted/40` overlay on `<TableRow>`) and selected rows (`bg-primary/5`) made the pinned cell look like a "patch" sitting on top of a different-coloured row. The user reported this on `tables/tables-pinned-virtualized`. Additional fixes:
- `pinStyle()` no longer sets `background` itself. Callers (header / filter / body) supply the right opaque colour for their context.
- New helper `pinnedRowBackground({ selected, striped })` uses `color-mix(in srgb, hsl(var(--card)), hsl(var(--muted)) 40%)` (or `--primary 8%` for selected) to synthesise a *single solid colour* that visually equals what an unpinned cell shows for the same row state. Pinned and unpinned cells now look identical at every row state.
- Header / filter sticky cells switched from translucent `hsl(var(--muted) / 0.4)` (which let scrolling content smudge through at scrollLeft > 0) to `color-mix(in srgb, hsl(var(--card)), hsl(var(--muted)) 40%)` — same look, fully opaque mask.
- `pinStyle()` adds `isolation: isolate` to every pinned cell, creating an explicit stacking context as defence against Radix portals / transforms / `will-change` hoisting children above the pin.
- `overflow: hidden` extended from pinned cells to **all** body cells: rounded badge edges, long unbroken text, anti-aliased pill borders inside an *unpinned* sibling can no longer paint past their own column box into a sticky neighbour's territory (the classic green-sliver bleed-through).
- The pinned-edge separator gained a soft 6-px drop shadow alongside the existing 1-px inset hairline. The hairline becomes invisible when `--border` matches `--card` in some themes; the shadow guarantees the divider is always visible.

**Don't**: revert any of these — the bleed-through is invisible until a user has > 2 pinned columns and a wide-content cell scrolls under them, so it's easy to "clean up" the changes without realising what they protect. In particular, do not put `background` back into `pinStyle()` — the per-row `pinnedRowBackground()` matching is the whole point.

---

### 3.13 `/forms` variant gallery silently dropped per-field component files (`TextField.tsx`, `SelectField.tsx`, `DateField.tsx`, …)
**Symptom**: Picking a form variant in `app/(pages)/forms/page.tsx` (e.g. *Job Application*) showed the engine + variant files in `FormsCodePanel`'s file tabs (`MyFormPage.tsx`, `formConfig.ts`, `formSchema.ts`, `formService.ts`, `ReactHookForm.tsx`, `useReactHookForm.ts`, `types.ts`, `useBackendErrors.ts`, …) but **none of the per-field-type files** the form actually used (`TextField.tsx`, `SelectField.tsx`, `FileField.tsx`, `DateField.tsx`, …). The form-builder *export tab* (`app/form-builder/ExportTab.tsx`) had previously been patched to render these via a separate `requiredComponents.fieldComponents.map(...)` loop (past-mistake 3.9), but the variant gallery's `FormsCodePanel` only iterates whatever `generateAllFiles()` returns — and `generateAllFiles()` never asked the registry for field components.

**Root cause**: `getRequiredFixedFiles(usedFieldTypes, library)` in `app/registry/formRegistry.ts` only filters the *engine* files (drops `useInfiniteOptions.ts` if no async/infinite fields). It never iterates `usedFieldTypes` to emit the matching `getFieldFile(...)`. So `generateAllFiles()` was structurally incomplete.

**Fix landed** (`app/form-builder/utils/codegen/generateAllFiles.ts`):
- After the engine-files loop, iterate `getRequiredComponents(config).fieldComponents` and append each field's registry file (via `getFieldFile(file, library)`) to the output.
- De-duplicate against an already-built `seenPaths` set to keep tab keys unique even if a future engine file lands at the same path.
- Field files are emitted with `isFixed: true` so the `FormsCodePanel` legend renders them with the gray "shared — install once" dot and badge (consistent with the rest of the engine).

**Companion cleanup** (`app/form-builder/ExportTab.tsx`):
- Removed the now-redundant `requiredComponents.fieldComponents.map(...)` `<TabsTrigger>` and `<TabsContent>` blocks. The same field files now appear in the main `generatedFiles.map(...)` rendering, eliminating the second source of truth and the chance of the two lists drifting apart.
- Dropped the `getFieldFile` import that's no longer used in this file.
- Updated the file-tab `useEffect` to derive `availableTabs` from `generatedFiles` only.

**Snapshots updated**: 6 "file shape locked" snapshots in `tests/codegen/formCodeGenerator.test.ts` (rhf/tanstack/action × config/static) — the new field files are now in the locked output. Future drift is caught immediately.

**Lesson encoded**: every panel that renders "all files for this form" must source from `generateAllFiles()`. If two panels each compute their own union (`generatedFiles` + `requiredComponents.fieldComponents`), they will inevitably drift. The single-list pattern protects against the drift by construction.
