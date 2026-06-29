# ARCHITECTURE_OVERVIEW.md

> **Synthesis layer.** A single, source-verified walkthrough of how AfnoUI turns
> authored components into files inside a consumer's repo. It ties the three
> deep docs together and pins the exact functions that do the work.
>
> This doc **synthesizes**; it does not replace. For exhaustive detail go to:
> - `CORE_IDENTITY.md` — who/what/why.
> - `STRUCTURAL_MAP.md` — every directory + dependency boundary.
> - `DATA_AND_LOGIC_FLOW.md` — the three lifecycles in narrative form.
> - `THE_DECISION_LOG.md` — decisions + past mistakes (1.x / 2.x / 3.x).
> - `AI_AGENT_RULES.md` — numbered hard rules (R-00…R-52, F-01…F-16).
> - `CLI_REFERENCE.md` — every command, flag, alias.
>
> If this file disagrees with the source, the **source wins** — fix this file.
> Anchors use `file:lineApprox symbol` so they survive small edits.

---

## 1. The 30-second model

AfnoUI is a **shadcn-style "copy-in" distributor**: it does not publish a runtime
package consumers import from. It *writes source files into the consumer's repo*
and lets them own the code. Four layers, decoupled on purpose:

```
 app/**                scripts/build-*.ts        public/registry/*.json        afnoui-cli/
 (authoring + lab)  ──►  (bake / verify)     ──►   (the WIRE CONTRACT)     ──►   (inject into
 source of truth        generators + sync          the only thing the CLI         consumer repo)
                        verifiers                   ever reads (over HTTP)
```

The hard boundary: **`afnoui-cli/src/**` MUST NOT import from `app/**`** (R-10,
F-12). Every fact the CLI needs about a component is *baked into the registry
JSON at build time*. This is what lets the CLI ship as a standalone npm package.

**Three lifecycles** (`DATA_AND_LOGIC_FLOW.md`):
- **A — builder → exported code.** Visual builders (`app/{form,table,kanban,ui}-builder`)
  do pure codegen `(config) => string`; nothing is persisted server-side.
- **B — source → registry JSON.** `pnpm run build:*-registry` reads whitelisted
  `app/**` files, embeds their source, writes `public/registry/*.json` + a
  `app/registry/*Generated.ts` twin. A `verify-*-sync.mjs` fails CI on drift.
- **C — registry JSON → consumer repo.** `afnoui add` fetches JSON and writes
  files. **A, B, and C agree byte-for-byte** because they share one format.

---

## 2. Layer 1 — CLI & distribution flow

Entry: `afnoui-cli/src/index.tsx` → `cli/program.ts` (commander wiring) → one
`register<Cmd>Command` per file in `cli/commands/`.

### 2.1 `afnoui add` pipeline (`cli/commands/add.ts:39 registerAddCommand`)

1. **Config.** `getConfig()` reads `afnoui.json` from cwd. If absent, it
   auto-creates one: detects `src/` vs app-dir, calls
   `config.ts:196 afnoAliasesForBaseDir`, infers Tailwind v4 via `tailwindIsV4`.
2. **Classify args.** `name.includes("/")` splits **base components** (`button`)
   from **`category/variant` slugs** (`forms/forms-contact`, `charts/bar/x`).
3. **Expand base set.** Variant categories add their prereq base components:
   `charts/<type>` → `charts-<type>` + `chart-primitives`; `progress/*` →
   `progress-shared`; `toggle/*` in `TOGGLE_GROUP_VARIANTS` → `toggle-group`.
   `tables` / `kanban` / `dnd` are **skipped here** — their engines come from the
   `ensure*` step (avoids a 404 base lookup). `dropdown` aliases to `dropdown-menu`.
4. **Validate against `index.json`.** Unknown base names are dropped (with a note
   if the user typed them explicitly alongside a variant).
5. **Global CSS / theme.** `ensureGlobalCssSetupOrPrompt` (`cli/internal/globalsCss.ts`).
6. **Install base components.** `operations.ts:1134 installComponent` — recursive
   over `registryDependencies`, dedupes via `installed` set +
   `install-state.ts` globals, installs npm deps via `safeInstall`.
7. **Ensure subsystems** (order matters):
   `ensureFormSystemForVariantSlugs` → `…Table…` → `…Kanban…` → `…Dnd…`
   (`operations.ts:492 / :669 / :825 / :981`). Each is a no-op unless a slug in
   its category is present.
8. **Install variants.** `operations.ts:1232 installVariant` writes each bundle.
9. **Summary.** Prints the deduped, sorted list of written paths.

### 2.2 The "ensure subsystem" pattern (forms/tables/kanban/dnd)

All four share one shape — read `installTableSystemShared` / `installKanbanSystemShared`
/ `installDndSystemShared` / `installFormSystemFixed` as variations on a theme:

- **Cold path** (engine absent — probed by `is<X>SystemInstalled`, e.g.
  `operations.ts:719 isKanbanSystemInstalled` checks `components/kanban/KanbanBoard.tsx`):
  full install — npm deps (+ `optionalPeers` for tables), UI components, then every
  `registry.shared` file written as a **`managed`** file.
- **Warm path** (engine present): top up runtime deps + `refresh<X>EngineSharedFiles`
  — re-writes shared engine files **silently without `--force`** so registry-side
  engine fixes propagate on every `add`. This is why engine files are `managed`.

Idempotency across subsystems relies on the DnD primitives being **byte-identical**
in `tables.json`, `kanban.json`, and `dnd.json` (R-22, F-10): install one then
another and the equality check skips the writes.

### 2.3 Write-decision tree (`operations.ts:167 writeRegistryOutputFile` + `:263 writeFormSystemFile`)

```
target exists?
 ├─ no                      → write, log ✅
 └─ yes
     ├─ content identical   → skip (──force: "up to date", else "use --force")
     ├─ kind === variant    → overwrite silently (variants are regenerated, not user-owned)
     ├─ managed && !force    → overwrite, log "🔄 Refreshed (engine update)"
     ├─ force | debug        → show line diff (diff pkg); prompt unless --force
     └─ else                → refuse, "use --force"
```

### 2.4 Resilience & statelessness

- **Lockfile** `.afnoui-install.lock` (`lib/locks.ts`), `cleanupStaleLocks` removes
  stale (> `LOCK_TIMEOUT` 120s, `constants.ts`).
- **Network** `lib/network.ts` circuit breaker: stop after 3 failures, reset 60s.
- **Stateless** `ENABLE_CACHE = false` — no `.afnoui-cache/`; every install hits HTTP.
- **Package manager** `detectPackageManager` by lockfile (pnpm→yarn→bun→npm);
  `safeInstall` skips already-present deps and promotes dev→runtime when needed.
- **Registry URL** `constants.ts:17 getRegistryUrl`: `AFNOUI_REGISTRY_URL` override →
  `NODE_ENV=development` ⇒ `http://localhost:3000/registry` → else production CDN
  `https://afnoui.aniketrouniyar.com.np/registry`.

---

## 3. Layer 2 — Directory & token topology (the mirror principle)

**The repo's layout is the consumer's layout.** A source dir in `app/` maps to a
stable consumer dir (R-40). Authoring on the left, what the user gets on the right:

| In-app source | Ships to consumer | Via |
|---|---|---|
| `app/components/ui/<name>.tsx` | `components/ui/<name>.tsx` | `components.json` |
| `app/components/ui/charts/<type>.tsx` | `components/ui/charts/<type>.tsx` | components |
| `app/components/ui/dnd/*` | `components/dnd/*` (**Wave-7**, was `lib/dnd`) | `tables/kanban/dnd.json` (identical bytes) |
| `app/components/ui/progress/progress-shared.tsx` | `components/ui/progress-shared.tsx` (flat!) | components (R-41, F-03) |
| `app/forms/{rhf,tanstack,action}/**` | `components/forms/**` | `forms.json` stacks |
| `app/kanban/**` | `components/kanban/**` | `kanban.json::shared` |
| `app/components/tables/*` (engine) | `components/tables/*` | `tables.json::shared` |
| `app/utils/{cellJsRunner,rowDialogTemplate}.ts` | `utils/<file>` (**neutral**, not the `utils` alias) | shared (R-42, DECISION 1.11) |
| `app/lib/utils.ts` | `lib/utils.ts` (the `cn` helper file) | components |
| variant TSX (forms/tables/kanban/charts/dnd) | `<root>/<slug>/…` top-level | `variants/<cat>/<slug>.json` |

### 3.1 Placement routing (`helpers/installPaths.ts:93 resolveRegistryOutputPath`)

Prefix-first, then longest-alias match:
- `forms/` `tables/` `kanban/` `charts/` `dnd/` → the matching **variant-root alias**
  (`aliases.{formVariants,tableVariants,kanbanVariants,chartVariants,dndVariants}`).
  These five are `VARIANT_ROOT_ALIASES` (`installPaths.ts:18`) and are deliberately
  excluded from the generic alias loop.
- `utils/<file>` → `resolveUtilsHelperPath` (`installPaths.ts:150`): a sibling
  `<libBase>/utils/` DIRECTORY (app-dir → `app/utils`, src → `src/utils`, flat →
  `utils`). **Not** the `utils` *alias*, which is the `lib/utils.ts` cn FILE —
  conflating them collides on case-insensitive filesystems (DECISION 1.11).
- everything else → longest-alias-first match over the non-variant aliases
  (cached per `aliases` ref in a `WeakMap`, `getNonVariantAliasEntries`).
- **R-12 watch:** there are 6 hardcoded prefixes today. A 7th should be
  externalized to a `routing.json` instead of adding another `if`.

### 3.2 Alias inference (`config.ts:49 inferMissingAliasFields`)

Old `afnoui.json` files get missing aliases backfilled from siblings by string
surgery (e.g. `…/tables` → `…/kanban` → `…/dnd`, `…/components` → `…/lib`). Never
overwrites a user-set value. `afnoAliasesForBaseDir` derives the whole alias set
from app-dir-vs-src detection at init time. The repo's own root `afnoui.json`
points aliases back at `app/**` so the website can self-host the registry.

---

## 4. Layer 3 — Component injection (read → transform → write)

Each file goes through **two transform passes**, then directive policy, then write.

### 4.1 Pass 1 — placement
`resolveRegistryOutputPath(file.path, aliases)` (see §3.1) → logical consumer path.

### 4.2 Pass 2 — source text (one of two, never both)
- **Alias-prefix swap** — `operations.ts:1015 transformPath`: rewrites `~alias`,
  `"alias/`, `'alias/` to the consumer's alias using pre-compiled regexes cached
  per `aliases` ref (`getAliasPatterns`). Used for component/engine `code`.
- **Alias→relative** — `helpers/imports.ts:95 rewriteAliasedImportsToRelative`:
  turns `@/components/ui/button` into `./`/`../` specifiers resolved against the
  target file on disk (`resolveAliasedImportSpecifier` + `pickResolvedModuleFile`).
  Applied to engine/component source files in `writeRegistryOutputFile` /
  `writeFormSystemFile`.
- **THE SKIP RULE** — for chart/table/kanban **variant** files,
  `writeRegistryOutputFile` (`operations.ts:177-199`) **skips** the relative
  rewriter. Variant bundles cross two alias roots in one file, so their
  `variantBundle.ts` builders pre-rewrite imports to relative at **build time**
  (DECISION 1.12, past mistake 3.8). The CLI's rewriter only does flat alias
  swaps, never `../` arithmetic.

### 4.3 Framework-aware `"use client"` (`helpers/imports.ts:252 applyClientDirectivePolicy`)
- `framework === "next"`: inject `"use client"` **iff** the file actually uses a
  client feature (`usesClientFeatures` — hooks, custom `useX(`, JSX `onX=`, browser
  globals; comments/strings stripped first). Existing directives preserved.
- `framework === "none"` (Vite/CRA/unknown): strip both `"use client"` and
  `"use server"` (dead/illegal outside App Router).
- Source files that use hooks already carry `"use client"` at authoring time
  (R-25, F-15) — CLI injection is a safety net, not the primary mechanism.
- Framework resolved once via `resolveTargetFramework` (`AFNOUI_FRAMEWORK` env →
  `detectFramework`).

### 4.4 Targeted fixups
- `helpers/imports.ts:288 rewriteChartPrimitivesImportForInstalledCharts`:
  `../chart-primitives` → `../ui/chart-primitives` when a chart engine lands in
  `components/charts/` next to `components/ui/`.
- `installVariant` removes legacy `forms/<variant>.tsx` and
  `components/forms/variants/<variant>/` left by pre-Wave layouts.

### 4.5 Tailwind / theme (`operations.ts:1330 handleTailwindSetup`)
v4 → idempotently ensures `@import "tailwindcss"` + appends the `@theme` block to
`globals.css` (skips if `@theme` exists). v3 → writes CSS variables + a
`tailwind.config.{ts,js}`. `theme.json` is verified against
`app/utils/themeExport.ts` by `verify:theme-export-sync`.

---

## 5. Registry JSON shapes (quick reference)

Validated by `helpers/registryShape.ts` (parsers throw LOUD at the boundary).

- **`components.json`** — manifest of base primitives; each item has `files[]`,
  `dependencies`, `devDependencies`, `registryDependencies`.
- **`forms.json`** — `shared.{core,hook,util}` + per-stack `stacks.{rhf,tanstack,action}`
  (`fixed.{core,hook,util}` + `fields{}`) + `stackInstall` (npm + uiComponents).
- **`tables.json` / `kanban.json`** — `{table,kanban}Install` (+ `optionalPeers`
  for tables) + `shared[]` of `{path, code, language}` engine + `components/dnd/*` +
  `utils/*`. **No `@dnd-kit/*`** (R-04, F-07).
- **`dnd.json`** — `dndInstall` (`uiComponents:["utils"]`) + the 7 `components/dnd/*`
  primitives only.
- **`variants/<cat>/<slug>.json`** — `files[]` (or `stacks{}` for forms) with
  `content` **already rewritten to relative** for chart/table/kanban/dnd.

---

## 6. Edge cases & guardrails (the load-bearing ones)

- **Variant install with no engine** → `ensure*ForVariantSlugs` installs the engine
  first; the user only ever types the variant.
- **Engine drift on existing projects** → warm-path `refresh*EngineSharedFiles`
  (managed, no `--force`).
- **Sandbox helper would collide with `lib/utils.ts`** → `resolveUtilsHelperPath`
  routes to a neutral `utils/` dir (DECISION 1.11, F-09).
- **DnD drag-data generics** → `type X = { id: string } & Record<string, unknown>`,
  never `interface X` (R-32, F-04). Drop zones spread `{...zoneProps}` only, never
  `ref={zoneProps.ref} {...zoneProps}` (R-33, F-05).
- **Forbidden deps** → `@dnd-kit/*`, redux/zustand/jotai/valtio, prettier,
  playwright/cypress (R-04). DnD is the in-house `app/components/ui/dnd`.
- **Concurrent / crashed installs** → lockfile + stale cleanup. **Registry down**
  → circuit breaker. **User-modified file** → managed-marker / `--force` / diff.

### Production gate (R-03/R-52 — run before "done")
```
pnpm lint && pnpm test && pnpm run build:cli && pnpm run verify:quick \
  && pnpm run validate:variants && cd test && pnpm build
```
And per R-00: any edit to a shipped file (`app/components/ui/**`, `app/forms/**`,
`app/kanban/**`, `app/components/ui/dnd/**`, `app/components/lab/dnd/variants/**`,
`app/registry/**`, the sandbox utils) MUST rebuild its registry generator in the
same commit.

---

## 7. Drift reconciled + things to watch

Caught during the source scan and **fixed** (see commit alongside this doc):

1. ~~**Registry URL** — `STRUCTURAL_MAP.md` claimed the prod CDN URL is "commented
   out."~~ Corrected: `constants.ts:17 getRegistryUrl` actively returns
   `https://afnoui.aniketrouniyar.com.np/registry` for non-dev; the dev branch keys
   on `NODE_ENV === "development"`; `AFNOUI_REGISTRY_URL` overrides both.
2. ~~**`lib/dnd` vs `components/dnd`**~~ — Wave-7 moved DnD primitives to
   `components/dnd/*`. Stale **present-tense** mentions were corrected in the
   table/kanban install tips (`operations.ts`), the `build-dnd-registry.ts` header,
   and `DATA_AND_LOGIC_FLOW.md`. Build scripts already emit `components/dnd/*`
   (verified against `public/registry/variants/**`).

**By design — not drift:**
- **Historical `lib/dnd` references remain on purpose** in `THE_DECISION_LOG.md`
  and `CURRENT_SPRINT.md` (they document the Wave-7 *migration*: "was `lib/dnd`").
  Leave them — rewriting history there is wrong.
- **Version fields differ:** `constants.ts CLI_VERSION` (the published CLI) vs root
  `afnoui.json version` (the website's self-host manifest) track separately. Per
  AGENTS.md a CLI publish bumps `afnoui-cli/package.json` + `CLI_VERSION` only.

---

## 8. Where to look next

| I want to… | Open |
|---|---|
| add a primitive / variant / field | `AI_AGENT_RULES.md §8` matrix + the matching `scripts/build-*.ts` |
| understand a routing decision | `installPaths.ts` + `THE_DECISION_LOG.md` (1.11, 1.12, 1.14, 1.15) |
| change the registry shape | `lib/types.ts` + `helpers/registryShape.ts` + R-11 |
| trace a CLI command | `cli/commands/<cmd>.ts` → `lib/operations.ts` |
| see the full dir map | `STRUCTURAL_MAP.md` |
| check current wave / queued work | `CURRENT_SPRINT.md` |
