# AfnoUI CLI — Authoritative Command Reference

> One-stop reference for every `afnoui` command, every flag, every variant
> category, every alias. Built from the registry index (319 variants across
> 38 categories) on 2026-05-15.
>
> When this file disagrees with `afnoui-cli/src/**` or `public/registry/**`,
> trust the source code / registry — and open a PR to fix this file.

## 0. TL;DR

```bash
# Bootstrap a brand-new project
npx afnoui init                                      # primitives + Tailwind + globals.css
npx afnoui init --dnd                                # also installs Pointer DnD engine

# Install variants
npx afnoui add button card dialog                    # base primitives
npx afnoui add forms/forms-contact                   # React Hook Form (default)
npx afnoui add forms/forms-job-application --tanstack
npx afnoui add forms/forms-contact --stack action
npx afnoui add tables/tables-server-crm              # table engine + DnD + variant
npx afnoui add kanban/kanban-sprint-board            # kanban engine + DnD + variant
npx afnoui add charts/bar/charts-bar-grouped         # specific chart variant
npx afnoui add dnd/sortable-list                     # DnD engine + demo

# Maintenance
npx afnoui list                                      # base components
npx afnoui list variants --json                      # scriptable variant index
npx afnoui doctor                                    # health check
npx afnoui diagnose                                  # auto-repair locks + cache
npx afnoui update button input                       # refresh primitives
npx afnoui clean                                     # interactive uninstall
```

## 1. Global flags (any command)

These attach to the root program and propagate to every sub-command.

| Flag | Behaviour |
|---|---|
| `--dry-run` | Preview every write and every `npm/yarn/pnpm install` without touching disk or the package manager. Combine with any command. |
| `--debug`   | Print stack traces, the registry fetch URLs, the detected package manager, and verbose write-skipped reasons. |
| `--force`   | Overwrite managed files even when the user edited them locally. Required to re-bootstrap an already-initialized project with `init`. |

## 2. Command index

| Command | Purpose | Key flags |
|---|---|---|
| `init` | Scaffold `afnoui.json`, install Tailwind + base UI primitives + globals.css | `--dnd`, `--force`, `--dry-run` |
| `add [components...]` | Install one or more base components and/or variant bundles | `--stack`, `--react-hook-form`, `--tanstack`, `--action` |
| `form init` | Install shared form types + ONE stack (RHF / TanStack / Action) | `--stack`, `--react-hook-form`, `--tanstack`, `--action` |
| `update [components...]` | Re-fetch + overwrite base components (always `--force`) | (global only) |
| `list [scope]` | List base components OR every `category/variant` slug | `--json`, scope = `variants` |
| `doctor` | Verify Tailwind + globals.css + cn helper + registry connectivity | (global only) |
| `diagnose` | Auto-repair stale install locks + expired registry-cache entries | (global only) |
| `clean` | Interactive removal of UI components, form system, form variants, `afnoui.json` | (global only) |
| `help` | Print the full menu with copy-pasteable examples | (global only) |

## 3. `afnoui init`

**Purpose:** Bootstrap a project for AfnoUI in one shot.

**What it does (in order):**

1. Asserts `package.json` exists.
2. Ensures Tailwind is installed (auto-detects Tailwind v4 vs v3 from `package.json`).
3. Writes `afnoui.json` with auto-detected aliases.
4. Confirms / writes `globals.css` with theme tokens (`@theme` block for v4, `:root` vars for v3).
5. Generates `lib/utils.ts` with the `cn` helper.
6. Fetches every entry from `index.json` and installs the matching UI primitive.
7. If `--dnd` is set, also installs the Pointer DnD engine (`components/dnd/*` + `lucide-react`).

**Flags:**

| Flag | Effect |
|---|---|
| `--dnd` | Also install the Pointer DnD primitives. Safe when AfnoUI is already initialized — falls back to a DnD-only install. |
| `--force` | Re-bootstrap an already-initialized project, overwriting managed files. |
| `--dry-run` | Print every planned write + install without touching disk. |
| `--debug` | Show the registry URL, the chosen package manager, and a stack trace on failure. |

**Examples:**

```bash
npx afnoui init                  # default
npx afnoui init --dnd            # default + Pointer DnD engine
npx afnoui init --force          # re-bootstrap
npx afnoui init --dnd --dry-run  # preview-only
```

## 4. `afnoui add [components...]`

**Purpose:** Install one or more base components and/or variant bundles.

**Argument shape:**

Each positional argument is one of:

* a **base component slug** — e.g. `button`, `dialog`, `form`.
* a **`<category>/<variant>` slug** — e.g. `forms/forms-contact`, `tables/tables-server-crm`.
* a **`charts/<type>/<variant>` slug** — e.g. `charts/bar/charts-bar-grouped`.

Pass any number of arguments; mixing kinds is supported.

**Category routing (where files land):**

| Slug pattern | Install root | Side-effects |
|---|---|---|
| `forms/<slug>` | `aliases.formVariants` (default `forms/`) | + form engine + RHF/TanStack/Action stack |
| `tables/<slug>` | `aliases.tableVariants` (default `tables/`) | + table engine + Pointer DnD + sandbox helpers |
| `kanban/<slug>` | `aliases.kanbanVariants` (default `kanban/`) | + kanban engine + Pointer DnD + sandbox helpers |
| `charts/<type>/<slug>` | `aliases.chartVariants/<type>/<slug>/` | + `chart-primitives` base |
| `dnd/<slug>` | `aliases.dndVariants` (default `dnd/`) | + Pointer DnD engine (`components/dnd/*`) |
| `components/<slug>` | `aliases.components` (default `components/`) | (lab primitive variants) |
| `progress/<slug>` | engine + `components/ui/progress-shared.tsx` | — |
| `<base>` | `aliases.ui` (default `components/ui/`) | + every transitive dep |

**Form-stack flags (apply ONLY to `forms/<slug>` arguments):**

| Flag | Stack installed |
|---|---|
| _(none)_ | React Hook Form (default) |
| `--stack rhf` | React Hook Form (explicit) |
| `--stack tanstack` | `@tanstack/react-form` |
| `--stack action` | React 19 `useActionState` |
| `--react-hook-form` | Same as `--stack rhf` |
| `--tanstack` | Same as `--stack tanstack` |
| `--action` | Same as `--stack action` |

**Examples:**

```bash
# Pure primitives
npx afnoui add button card dialog input

# Forms with explicit stack
npx afnoui add forms/forms-contact                          # RHF (default)
npx afnoui add forms/forms-job-application --tanstack       # TanStack Form
npx afnoui add forms/forms-payment --stack action           # React 19 ActionForm

# Tables / Kanban / Charts / DnD
npx afnoui add tables/tables-server-crm
npx afnoui add kanban/kanban-sprint-board
npx afnoui add charts/bar/charts-bar-grouped
npx afnoui add charts/heatmap/charts-heatmap-default
npx afnoui add dnd/sortable-list

# Mixed
npx afnoui add button card forms/forms-contact tables/tables-default-pin

# Maintenance
npx afnoui add forms/forms-contact --dry-run   # preview
npx afnoui add forms/forms-contact --force     # overwrite local edits
```

## 5. `afnoui form init`

**Purpose:** Install the AfnoUI form runtime ONCE per stack (shared field
types, the `cn` helper, the FormField glue, TanStack Query for async fields,
plus the chosen form stack).

**Flags:**

| Flag | Stack |
|---|---|
| `--stack rhf` (default) | React Hook Form 7 + `@hookform/resolvers` + `zod` |
| `--stack tanstack` | `@tanstack/react-form` 1.x |
| `--stack action` | React 19 `useActionState` |
| `--react-hook-form` | Same as `--stack rhf` |
| `--tanstack` | Same as `--stack tanstack` |
| `--action` | Same as `--stack action` |

**Idempotency:** re-running with the same stack is a no-op. Re-running with
a different stack installs the second stack alongside the first.

**Examples:**

```bash
npx afnoui form init                            # RHF (default)
npx afnoui form init --stack rhf                # explicit RHF
npx afnoui form init --tanstack                 # TanStack Form
npx afnoui form init --action                   # React 19 ActionForm
npx afnoui form init --stack tanstack --dry-run # preview-only
npx afnoui form init --tanstack --force         # overwrite managed files
```

After `form init`, add a real variant with `npx afnoui add forms/<slug>`.

## 6. `afnoui update [components...]`

**Purpose:** Re-fetch and overwrite installed BASE components from the registry.
This is `add` with `--force` baked in, scoped to base components only.

**Why it's separate from `add --force`:**

* `update` works only on **base** slugs (the names from `npx afnoui list`).
* `add --force` is required for **variants** (`<category>/<variant>`).

**Examples:**

```bash
npx afnoui update button input             # refresh two primitives
npx afnoui update calendar form            # refresh primitives with peer deps
npx afnoui update button --dry-run         # preview the diff
```

## 7. `afnoui list [scope]`

**Purpose:** Read-only listing of what `add` knows how to install.

**Modes:**

| Form | Output |
|---|---|
| `npx afnoui list` | Base components (button, dialog, input, …) |
| `npx afnoui list --json` | Same, as a JSON array |
| `npx afnoui list variants` | Every `<category>/<variant>` slug |
| `npx afnoui list variants --json` | Same, as a JSON array |

**Examples:**

```bash
npx afnoui list
npx afnoui list --json
npx afnoui list variants
npx afnoui list variants --json | jq '.[] | select(startswith("forms/"))'
npx afnoui list variants --json | jq '.[] | select(startswith("charts/bar/"))'
```

## 8. `afnoui doctor`

**Purpose:** Read-only health check; never touches disk or package manager.

**What it verifies:**

1. `cn` helper exists at `aliases.utils` path.
2. A `globals.css` file is reachable from the project root.
3. Tailwind directives are present (v4: `@import "tailwindcss"`; v3: `@tailwind`).
4. Registry URL responds to `GET /index.json` within the circuit-breaker window.

**Exit code:** `0` (all green) or `1` (at least one check failed).

**Examples:**

```bash
npx afnoui doctor
npx afnoui doctor --debug   # also print registry URL
```

## 9. `afnoui diagnose`

**Purpose:** Self-heal common CLI-state issues. Safe to run any time.

**What it fixes:**

* Stale `.afnoui-install.lock` files (older than 5 min AND owner pid is dead).
* Invalid (corrupt-JSON) lock files.
* Cache entries past TTL.
* Invalid (corrupt-JSON) cache entries.

**Examples:**

```bash
npx afnoui diagnose
```

## 10. `afnoui clean`

**Purpose:** Interactive removal of AfnoUI-managed directories.

**Steps (each step asks for confirmation):**

1. Confirm overall: remove `aliases.ui/` (default `components/ui`).
2. If present, prompt to remove `aliases.forms/` (form engine + field components).
3. If present, prompt to remove `aliases.formVariants/` (installed `forms-*` bundles).
4. Remove `afnoui.json`.

**Safety:** `package.json` dependencies are NEVER auto-uninstalled.

```bash
npx afnoui clean
```

## 11. `afnoui help`

Prints a grouped menu of every command + flag + example. Equivalent to
this document but in the terminal.

```bash
npx afnoui help
npx afnoui <command> --help    # per-command flag reference (commander)
```

## 12. Aliases (`afnoui.json → aliases`)

The CLI auto-detects sensible defaults at `init`. Override by editing
`afnoui.json` after `init`.

| Alias key | Default (app-router) | Default (src-dir) | Default (flat) | Where it routes |
|---|---|---|---|---|
| `components` | `app/components` | `src/components` | `components` | catch-all primitive root |
| `ui` | `app/components/ui` | `src/components/ui` | `components/ui` | base primitives + `progress-shared.tsx` |
| `utils` | `app/lib/utils` | `src/lib/utils` | `lib/utils` | `cn` helper |
| `hooks` | `app/hooks` | `src/hooks` | `hooks` | shared React hooks |
| `lib` | `app/lib` | `src/lib` | `lib` | misc shared modules |
| `forms` | `app/components/forms` | `src/components/forms` | `components/forms` | form engine (RHF/TanStack/Action) |
| `formVariants` | `app/forms` | `src/forms` | `forms` | installed `forms-*` bundles |
| `chartVariants` | `app/charts` | `src/charts` | `charts` | chart variant bundles |
| `tableVariants` | `app/tables` | `src/tables` | `tables` | table variant bundles |
| `kanbanVariants` | `app/kanban` | `src/kanban` | `kanban` | kanban variant bundles |
| `dndVariants` | `app/dnd` | `src/dnd` | `dnd` | DnD variant bundles |

## 13. Variant catalog (319 total)

Slugs you can pass to `afnoui add`. Reference snapshot — query
`npx afnoui list variants` for the live list.

### Forms (10) — supports `--stack rhf|tanstack|action`

```
forms/forms-async-infinite
forms/forms-conditional
forms/forms-contact
forms/forms-display-only
forms/forms-invoice
forms/forms-job-application
forms/forms-login
forms/forms-multi-step
forms/forms-payment
forms/forms-survey
```

### Tables (21) — installs table engine + Pointer DnD on first add

```
tables/tables-clickable-users           tables/tables-pinned-virtualized
tables/tables-default-pin               tables/tables-product-catalog
tables/tables-expert-gallery            tables/tables-real-estate-listings
tables/tables-expert-pinned-grouped     tables/tables-sandbox-js-demo
tables/tables-expert-stats-expand       tables/tables-server-crm
tables/tables-expert-timeline           tables/tables-simple-list
tables/tables-invoice-tracker           tables/tables-sticky-dashboard
tables/tables-minimal-pagination        tables/tables-task-board
tables/tables-no-pagination-list        tables/tables-team-members
tables/tables-order-management          tables/tables-underlined-reports
tables/tables-page-size-selector
```

### Kanban (12) — installs kanban engine + Pointer DnD on first add

```
kanban/kanban-bug-tracker               kanban/kanban-long-columns
kanban/kanban-compact-grid              kanban/kanban-personal-tasks
kanban/kanban-content-calendar          kanban/kanban-product-roadmap
kanban/kanban-crm-pipeline              kanban/kanban-rtl-sprint-timeline
kanban/kanban-dense-backlog             kanban/kanban-sprint-board
kanban/kanban-hiring-pipeline
kanban/kanban-infinite-scroll-demo
```

### DnD (9) — auto-installs Pointer DnD engine (`components/dnd/*`)

```
dnd/buckets                             dnd/multi-list
dnd/files                               dnd/sortable-list
dnd/horizontal-reorder                  dnd/table-reorder
dnd/image-grid                          dnd/trash
                                        dnd/tree
```

### Charts (93) — 17 chart types

```
area / bar / bump / candlestick / donut-progress / funnel / gauge /
heatmap / line / pie / polar-area / radar / radial-bar / sankey /
scatter / treemap / waterfall
```

Use `npx afnoui list variants --json | jq '.[] | select(startswith("charts/"))'`
for the full list.

### Other variant categories (≥1 variant each)

```
accordion (2)   alert (2)   alert-dialog (5)   async-field (4)   badge (4)
breadcrumb (5)  button (4)  card (8)           carousel (7)      checkbox (9)
collapsible (5) combobox (5)command (6)         composite-input (10)
dialog (7)      dropdown (9) form (1)          infinite-field (8) input (1)
menubar (3)     navigation-menu (4)            popover (7)        progress (9)
radio (1)       scroll-area (6)                select (1)         separator (8)
sheet (6)       slider (1)                      switch (5)         tabs (1)
toggle (12)     tooltip (8)
```

## 14. Exit codes

| Code | Meaning |
|---|---|
| `0` | Success (or a no-op, e.g. nothing to update) |
| `1` | Error — invalid arguments, registry fetch failure, validation failure, or `doctor` found a missing check |

## 15. CI recipes

```bash
# Fail the build if a fresh project can't initialize from the registry
npx afnoui init --debug --force
npx afnoui doctor

# Snapshot the list of variants for a release-notes diff
npx afnoui list variants --json > variants.json

# Re-sync every component to the published registry (no fork drift)
xargs -a baseline-list.txt npx afnoui update --

# Auto-repair before running install
npx afnoui diagnose
```
