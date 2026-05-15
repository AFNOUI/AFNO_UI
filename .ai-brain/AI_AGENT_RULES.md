# AI_AGENT_RULES.md

> Hard rules for AI coding agents (Cursor, Codex, Claude Code, Copilot, ...) working
> in this repository. Read these BEFORE you write code.
>
> Rules are numbered for citability ("violated rule R-04 — adding @dnd-kit"). Every
> rule has a *test* you can run yourself to verify your change passes.
>
> If a rule conflicts with a user request, surface the conflict in chat — do not
> silently route around the rule. The user can always override; you cannot.
>
> Read order: `CORE_IDENTITY.md` → `STRUCTURAL_MAP.md` → `DATA_AND_LOGIC_FLOW.md` →
> `THE_DECISION_LOG.md` → `CURRENT_SPRINT.md` → **this file** → write code.

---

## 0. Meta-rules (apply to every change)

### R-00 — Single source of truth
The registry JSONs under `public/registry/` are the wire contract. If you change a file
the CLI ships to consumers (`app/components/ui/*`, `app/components/ui/dnd/*`,
`app/forms/*`, `app/kanban/*`, `app/utils/cellJsRunner.ts`, `app/utils/rowDialogTemplate.ts`,
`app/components/lab/dnd/variants/*`, `app/registry/**`), you MUST rebuild the matching
registry generator(s) in the same commit:

| Touched | Run |
|---|---|
| `app/forms/**` | `pnpm run generate:registry` |
| `app/components/tables/**`, `app/tables/types/**` | `pnpm run build:tables-registry` |
| `app/kanban/**` | `pnpm run build:kanban-registry` |
| `app/components/ui/dnd/**` | `pnpm run build:dnd-registry` (AND tables + kanban because both also embed DnD) |
| `app/components/lab/dnd/variants/**`, `app/kanban-builder/data/kanbanBuilderTemplates.ts`, `app/table-builder/data/*Templates.ts`, chart variant configs | `pnpm run build:variants-registry` |
| `app/components/lab/<primitive>/*`, `app/registry/<primitive>/<variant>.tsx` | `pnpm run build:registry` |
| `app/utils/themeExport.ts`, theme tokens | `pnpm run verify:theme-export-sync` (auto-fail if not regenerated) |

**Verify**: `pnpm run verify:quick` is green.

### R-01 — Read `.ai-brain/` before edits
Do not edit `app/components/ui/**`, `afnoui-cli/**`, `scripts/build-*.ts`, or any
registry generator without first reading `THE_DECISION_LOG.md`. Many "obvious"
cleanups are recorded there as **Forbidden change**. Examples: re-adding
`@dnd-kit/*` (1.5), collapsing `dist/` into `.gitignore` (2.3), moving sandbox
helpers under `components/tables/` (1.11), inlining DnD primitives into variants
(1.14), reverting Wave-7 layout (1.15).

### R-02 — Update `.ai-brain/` on structural changes
If your change moves files, renames aliases, changes the registry JSON shape, alters
build script outputs, or contradicts an existing decision: update
`STRUCTURAL_MAP.md`, `DATA_AND_LOGIC_FLOW.md`, and add (or supersede) an entry in
`THE_DECISION_LOG.md` in the SAME commit. Add a Wave-N entry to `CURRENT_SPRINT.md`.

**Verify**: `git diff --stat .ai-brain/` shows ≥ 1 file when `git diff --stat scripts/ afnoui-cli/ app/registry/` is non-empty.

### R-03 — `0 errors, no commits` floor for lint, tests, CLI
```
pnpm lint                       # floor: 0 errors (warnings OK)
pnpm test                       # 213/213 must pass
pnpm run build:cli              # afnoui-cli tsc + its 105 tests
```
Plus `pnpm run verify:quick`. If your edit is structural enough to touch the variant
registries, also run:
```
pnpm run validate:variants
cd test && pnpm build           # MUST succeed cleanly
```

### R-04 — Forbidden dependencies
- `@dnd-kit/*` — use `app/components/ui/dnd` (DECISION 1.5).
- Any global-store library (redux / zustand / jotai / valtio) — use
  `useBuilderHistory` (DECISION 1.1).
- `prettier` — ESLint flat config only (DECISION 1.4).
- `playwright` / `cypress` for e2e — visual builders are the e2e harness (DECISION 1.6).

**Verify**: `grep -r "@dnd-kit\|prettier\|zustand\|redux\|jotai\|valtio" package.json afnoui-cli/package.json` is empty.

---

## 1. CLI / Registry separation rules

### R-10 — Registry is the wire format. CLI ≠ frontend.
The `afnoui-cli/` directory MUST NOT import from `app/` (DECISION 1.9). If you need
the CLI to know something about the frontend, **embed it in `public/registry/*.json`**
at build time via a script in `scripts/`.

**Verify**:
```
grep -r "from\s*['\"]\.\./\.\./app" afnoui-cli/src   # must be empty
```

### R-11 — When IS a CLI change required?
You need to touch `afnoui-cli/` ONLY for these structural concerns:

| Concern | File | Triggered by |
|---|---|---|
| New top-level path prefix (e.g. `themes/<slug>/...`) | `installPaths.ts::resolveRegistryOutputPath` + `VARIANT_ROOT_ALIASES` | adding a new variant family |
| New alias in `afnoui.json` | `types.ts::AfnoConfig.aliases` + `config.ts::DEFAULT_CONFIG` + `config.ts::inferMissingAliasFields` + `afnoAliasesForBaseDir` | new variant family OR new shared install target |
| Idempotency probe for new engine | `operations.ts::is<X>SystemInstalled` | new shared subsystem |
| New registry JSON shape | `types.ts::<X>RegistryJson` + `registryShape.ts::parse<X>Registry` | new shared subsystem with its own `<X>.json` |
| Help / tip strings printed to the user | `operations.ts::install<X>SystemShared` console.log lines, `init.ts` description | UX improvement |

Everything else — **file contents, new variants, dep additions, peer changes, snippet
type-safety, removed lint warnings** — is a **registry-only** change. Run the matching
build script, redeploy, no CLI work.

**Verify**: if your PR changes `app/components/ui/<X>` or `app/registry/**` but does
not move files or add an alias, `git diff --stat afnoui-cli/` should be empty.

### R-12 — Improve the routing in JSON if you find yourself adding a 5th `if (norm.startsWith(...))` branch.
Today's hardcoded prefix table in `installPaths.ts` (forms/, tables/, kanban/, charts/,
dnd/, utils/) is acceptable at 6 entries. If you're about to add a 7th, instead consider
externalizing the prefix → alias map to a `public/registry/routing.json` so future
categories require zero CLI churn. Flag it in `CURRENT_SPRINT.md` if you don't do the
refactor inline.

---

## 2. Reusable / Maintainable / Scalable rules

### R-20 — Reuse before extract
Three uses → extract a helper. Two uses → inline copy is fine. One use → never extract.
DECISION 3.0 (DRY-on-third-occurrence) supersedes any premature abstraction instinct.

### R-21 — Pure functions for codegen, side-effects at the edges
`*-builder/utils/codegen/*` is pure: `(config) => string`. IO lives in
`afnoui-cli/src/lib/operations.ts` and Next route handlers only. Adding a `fs.writeSync`
to a codegen file is automatically wrong.

**Verify**: `grep -rn "fs\.\|fetch(\|axios\." app/{form,table,kanban,ui}-builder/utils/codegen/` is empty.

### R-22 — Every shared file ships through ONE registry
If file `F` is referenced by two engines (kanban + tables → DnD primitives), it must
be defined in **one in-app source file** (`app/components/ui/dnd/index.ts`) and shipped
via **multiple registry JSONs** (`tables.json`, `kanban.json`, `dnd.json`) that point
back to the same source. Never copy the file body into two source locations. Idempotency
relies on byte equality across all three registries.

**Verify**: any file in `tables.json::shared`, `kanban.json::shared`, `dnd.json::shared`
exists exactly once in `app/`.

### R-23 — Strict TS, named generics, no `any`
- `strict: true` everywhere (workspace + CLI). No exceptions.
- `any` is allowed only in two places: at parser boundaries (immediately followed by
  type narrowing), and in registry-shape validators (`registryShape.ts`). Every other
  `any` requires a `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
  with a comment explaining the trade-off.
- Generic constraints over `extends`. e.g. `<TRow extends { id: string }>` over
  `<T extends any>`.

### R-24 — Comments explain *why*, never *what*
Forbidden: `// increment counter`, `// import module`, `// return value`. Use a comment
to document a non-obvious trade-off, a constraint the code can't express, or a
"don't fix this" rationale that names what we tried and rejected.

### R-25 — `"use client"` at source for hook-using shipped files
Files in `app/components/ui/dnd/`, `app/kanban/`, `app/forms/{rhf,tanstack,action}/`
that use React hooks MUST carry the `"use client"` directive at the top of the SOURCE
file (DECISION 2.1, past mistake 3.3). Do not rely on CLI-side injection alone.

---

## 3. DnD-specific rules (Wave-7+ — DECISION 1.15)

### R-30 — DnD primitives live at `components/dnd/*` on the consumer
- In-app source: `app/components/ui/dnd/*.{ts,tsx,css}` — unchanged.
- Registry target paths: `components/dnd/<file>` — three registries (`tables.json`,
  `kanban.json`, `dnd.json`) all emit identical bytes.
- Consumer install path: `<componentsBase>/dnd/*`. Import as `@/components/dnd`.

### R-31 — DnD VARIANTS live at top-level `dnd/<slug>/`
The consumer's import path inside a snippet is `../../components/dnd` (and
`../../lib/utils` for `cn`). Generated by `dndVariantSources.ts::buildDndUsageCode`.
The CLI routes via `aliases.dndVariants` (default `"dnd"`) — see
`installPaths.ts::resolveRegistryOutputPath`.

### R-32 — Snippet drag-data types use `type X = { ... } & Record<string, unknown>`
**Past mistake 3.14**. NEVER declare drag data as `interface X { id: string }` in a
snippet template literal — closed interfaces fail the
`T extends DragData = Record<string, unknown>` constraint under consumer-side strict TS.
The intersection with `Record<string, unknown>` adds the open string-index signature.
Property types remain narrow (`item.data.id` is still `string`).

Good:
```ts
type TaskDragData = { id: string } & Record<string, unknown>;
const { dragProps } = useDraggable<TaskDragData>({ id, data: { id } });
```

Bad:
```ts
interface TaskDragData { id: string }   // fails T extends DragData constraint
useDraggable<TaskDragData>({ ... });
```

**Verify**: regenerate `public/registry/variants/dnd/*.json` and inspect the snippets.
Or: `cd test && pnpm build` succeeds.

### R-33 — `<div {...zoneProps}>` only, never `<div ref={zoneProps.ref} {...zoneProps}>`
**Past mistake 3.14**. `zoneProps` is `{ ref, "data-dnd-zone", "data-dnd-over" }`. The
spread already carries the callback ref. Adding `ref={...}` next to the spread is a
hard error in React 19 / TS 5.7 (`'ref' is specified more than once`).

### R-34 — `react-day-picker` uses `autoFocus`, not `initialFocus`
**Past mistake 3.14**. v10+ removed `initialFocus`. Any snippet, lab demo, or registry
file with a `<Calendar mode="single" ... />` must use `autoFocus`.

---

## 4. Filesystem layout rules

### R-40 — Top-level consumer directories are stable
This is the contract a consumer sees after `npx afnoui add ...`:

```
<consumer-root>/
├── components/
│   ├── ui/<primitive>.tsx          ← shadcn primitives + chart-primitives, form-primitives, progress-shared
│   ├── ui/charts/<type>.tsx        ← chart engines
│   ├── ui/table/<file>.tsx         ← table engine wrappers (mirrors ui/charts)
│   ├── forms/                      ← shadcn form glue + per-stack engines
│   ├── kanban/                     ← kanban engine
│   ├── tables/                     ← table engine
│   └── dnd/                        ← Pointer DnD primitives (Wave-7)
├── lib/
│   └── utils.ts                    ← cn helper (single file)
├── utils/                          ← sandbox helpers (cellJsRunner, rowDialogTemplate)
├── hooks/                          ← engine hooks
├── forms/<slug>/                   ← form variants
├── tables/<slug>/                  ← table variants
├── kanban/<slug>/                  ← kanban variants
├── charts/<type>/<slug>/           ← chart variants
└── dnd/<slug>/                     ← DnD variants (Wave-7)
```

Any new top-level directory requires DECISION-LOG approval. Any reshuffle of an
existing directory requires DECISION-LOG supersede + AI_AGENT_RULES update.

### R-41 — `progress-shared.tsx` lives directly under `components/ui/`
**Wave-7** (DECISION 1.15). NOT `components/ui/progress/progress-shared.tsx`. NOT
`components/lab/progress/progress-shared.tsx`. Mirrors `chart-primitives.tsx` and
`form-primitives.tsx` — flat, one level of nesting. The 8 progress variants
(`progress-circular.tsx`, `progress-step.tsx`, …) all import via
`@/components/ui/progress-shared`.

### R-42 — `utils/<file>` is a NEUTRAL location, not the `utils` alias
**DECISION 1.11**. The `utils` alias points at the cn-helper FILE (`lib/utils.ts`).
Sandbox helpers (`cellJsRunner.ts`, `rowDialogTemplate.ts`) live in a sibling
`<libBase>/utils/` DIRECTORY, routed via `resolveUtilsHelperPath`. Don't conflate
the two.

---

## 5. Test / verify rules

### R-50 — Snapshots are the contract
`tests/codegen/*` snapshots pin the *byte shape* of generated code. Updating a
snapshot is a sin if you didn't intend a public-contract change. When you DO mean it,
run `pnpm exec vitest run -u` and document the diff in the PR body.

### R-51 — Registry verifiers are the second-tier gate
For every registry generator there is a `verify-*-registry-sync.mjs`. CI runs them
on every PR. If you modify a build script, also modify the matching verifier in the
same commit. The verifier's `TARGET_TO_SOURCE` map is the canonical list of files
the engine ships.

### R-52 — Production-equivalent gate: `validate:variants` + `next build` in `test/`
Wave-7 baseline. Run before any release-shaped PR:
```
npm run validate:variants
cd test && pnpm build
```
Must produce: lint 0 errors, tests 213/213, CLI 105/105, validate 319/319 variants
installed, `pnpm build` in `test/` cleanly emits all static pages.

---

## 6. Don't touch this list (Forbidden changes — accumulated)

| # | Don't | Why |
|---|---|---|
| F-01 | Move DnD primitives back to `lib/dnd/*` | DECISION 1.15. Breaks CLI idempotency probe. |
| F-02 | Move DnD variants back to `components/dnd-examples/` | DECISION 1.15. Inconsistent with forms / tables / kanban / charts. |
| F-03 | Move `progress-shared.tsx` back into `components/ui/progress/` | DECISION 1.15. Variant snippet imports are pinned at `@/components/ui/progress-shared`. |
| F-04 | Use `interface X { ... }` for DnD drag-data types in snippets | Past mistake 3.14. Use `type X = { ... } & Record<string, unknown>` instead. |
| F-05 | Re-add `ref={zoneProps.ref}` alongside `{...zoneProps}` | Past mistake 3.14. Duplicate `ref` is a hard error. |
| F-06 | Use `initialFocus` on `<Calendar>` | Past mistake 3.14. `react-day-picker` v10+ uses `autoFocus`. |
| F-07 | Add `@dnd-kit/*` to any `package.json` | DECISION 1.5. Use `app/components/ui/dnd`. |
| F-08 | Delete `afnoui-cli/dist/` from git | DECISION 2.3. Published CLI needs it. |
| F-09 | Move sandbox helpers under `components/tables/` | DECISION 1.11. Use `utils/<file>`. |
| F-10 | Delete duplicated `lib/dnd/*` entries (now `components/dnd/*`) from `kanban.json` / `tables.json` "for DRY" | DECISION 1.14. The duplication IS the contract. |
| F-11 | Add `installComponent("dnd-primitives", ...)` to ship DnD via the generic component pipeline | DECISION 1.14. Multi-file + CSS doesn't fit the generic shape. |
| F-12 | Import from `app/` inside `afnoui-cli/src/` | DECISION 1.9. CLI must be self-contained. |
| F-13 | Reformat with Prettier | DECISION 1.4. Breaks snapshots, noisy diffs. |
| F-14 | Replace `useBuilderHistory` with Redux / Zustand / Jotai | DECISION 1.1. Single-config builders don't need globals. |
| F-15 | Remove `"use client"` from `app/kanban/`, `app/components/ui/dnd/` source files | DECISION 2.1, past mistake 3.3. |
| F-16 | Skip `pnpm run verify:quick` before merging | DECISION 3.X. Quality gate is non-negotiable. |

---

## 7. When in doubt

1. Read the relevant `THE_DECISION_LOG.md` entry first.
2. If your intended change contradicts a `[Accepted]` decision: stop, surface the
   conflict in chat, propose a `[Superseded]` write-up. Don't go around it.
3. If your intended change is genuinely new ground: add an entry to the decision log
   in the same commit, mark it `[Accepted]`, name the alternative you rejected.
4. Run the full gate (R-52). The cost of a Wave-N follow-up "production-readiness pass"
   is FAR higher than running `cd test && pnpm build` once before you say "done".

---

## 8. Quick "did I touch the right things?" matrix

| If you... | You must also touch |
|---|---|
| Add a new shadcn primitive | `scripts/build-registry.ts` ENTRIES + lab demo + variant tsx + `pnpm run build:registry` |
| Add a new form field type | `app/forms/{rhf,tanstack,action}/fields/*` + `scripts/generate-registry.ts` STACK_INSTALL + form-builder `fieldRegistry.ts` + 3 snapshot files |
| Add a new variant family (e.g. "modals/") | new build script + new verifier + new CLI alias + new `VARIANT_ROOT_ALIASES` entry + new prefix branch in `installPaths.ts` + new registry JSON shape + parser + `.ai-brain/` updates + `CURRENT_SPRINT.md` step + DECISION entry |
| Rename / move a consumer-visible directory | build script `targetPath` + verifier `TARGET_TO_SOURCE` + CLI probe (if any) + tip text + `.ai-brain/` updates + DECISION entry + Wave-N sprint entry |
| Fix a build error inside a snippet template literal | the snippet TSX in `app/registry/` or `app/components/lab/.../variants/` + `pnpm run build:variants-registry` (or `build:registry`) + rerun `validate:variants` + `cd test && pnpm build` |
| Add a new CLI subcommand | `afnoui-cli/src/cli/commands/<cmd>.ts` + `program.ts` register call + tests + `STRUCTURAL_MAP.md` § 5 update |

If your touch matrix is empty, your change is likely a no-op or a documentation tweak.
Add the doc.
