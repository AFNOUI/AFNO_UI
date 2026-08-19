# TASK_QUEUE.md

> The running queue of open work, in the user's priority order.
> `CURRENT_SPRINT.md` is the *status board* (what landed, what the gates are).
> This file is the *queue* (what's next, and why it's in that position).
>
> Rules for keeping this file honest:
> - Move an item to **Done** in the same commit that finishes it, with the commit SHA.
> - Never delete an item silently. If it's dropped, move it to **Dropped** with a reason.
> - Items marked **ASK FIRST** must not be started without the user saying go.
> - **When Now / Next / Blocked on the user are all empty** (nothing queued,
>   nothing in flight), delete this whole file rather than leaving a Done-only
>   husk around. Decided 2026-08-19 — the user wants this doc to exist only
>   while there is open work, not as a permanent history log (that's what git
>   history / `THE_DECISION_LOG.md` are for). Re-create it fresh next time
>   something needs queuing.
>
> Last updated: 2026-08-19 (post charts/dnd/lab consistency pass)

---

## Blocked on the user

### 5. Optional global error handling — **on hold 2026-08-19, user doesn't know what they want here yet**
The task was authorized to start, but when asked what the UX should actually
be (a reporter port with no UI? a default toast? per-variant flag vs
project-wide `init` flag?), the user said to leave it — they don't know yet.
Do not restart this without the user bringing it back up with an actual
answer to "what should happen when a hook-boundary error fires." The shape
below is still the agreed *architecture*; what's missing is the UX decision on
top of it.

Agreed shape (do not redesign from scratch):
- A **third orthogonal axis**, wrapping at the **hook boundary**, so it composes
  with any transport combo. Without orthogonality this is
  `fetch|axios × local|tanstack × none|global` = 8 templates.
- Shipped as an installable **shared module** via the CLI's ensure-subsystem
  pattern + `fileHashes` consent.
- **Default OFF.** Generated code may reference it only when the flag is on —
  DECISION 1.12 keeps variants self-contained.
- **Composes with** TanStack Query rather than being replaced by it.

---

## Not agent work — the user's own steps

**Pushing, merging to `main`, and `npm publish` are the user's job.** Never put
them in this queue and never do them unasked. Commit locally when asked; the
user takes it from there.

This matters because a stale "unpushed" note once sat in a session handoff long
after the work had shipped. Verify before believing that kind of claim:

```
git log --oneline origin/dev..dev          # empty = nothing unpushed
git branch -r --contains <sha>             # which remote branches have it
npm view afnoui version                    # vs afnoui-cli/package.json
```

---

## Standing conventions for this queue

- Commit trailer is `Co-Authored-By: ANI1KET <aniketrouniyar12@gmail.com>` —
  the user's own second account. **Never** a Claude co-author.
- Build artifacts (`dist/`, regenerated registries) are committed, not reverted.
  Build *before* committing.
- `afnoui-cli/` is its own gitignored git repo — commit its `src/` + `dist/` there separately.
- Production gate before saying "done":
  `pnpm lint && pnpm test && pnpm run build:cli && pnpm run verify:quick && pnpm run validate:variants && cd test && pnpm build`
- Registry generators produce a `*GeneratedAt` timestamp, so a rebuild always
  dirties 10 files by one line each. That churn alone is not a real diff.

---

## Done (post Wave-9)

### `ComponentInstall` now renders the interactive `CliPlayground`, not a static bar
Closes the "charts/dnd/lab pages still use the old bar" gap from the
2026-08-16 handoff. `ComponentInstall` (charts, DnD, all ~140 lab component
demos) rendered `CliInstallCommandBar` — copy button + package-manager tabs,
one fixed command string built by hand in `getAfnouiAddCommand`.

Swapped its internals for a scoped `CliPlayground`
(`{ commandId: "add", args: [`${category}/${variant}`], lockCommand: true,
lockArgs: true }`) — the same scope shape every builder page already uses.
Consumers changed nothing; `category`/`variant`/`hideInstallBar` props are
identical. Now every one of those install bars gets the copy button, the
package-manager tabs, `--dry-run`/`--force`/`--debug`, and the "Explain this
command" disclosure for free.

**Why this didn't need a transport picker or per-category filtering:** charts
and DnD have no data-fetching layer, and the `add` command's `--axios` /
`--tanstack-query` flags already declare `relevantWhen:
argsIncludeTransportCapable(ctx.args)` in `commandSpecs.ts` — they self-hide
for non-transport-capable slugs. Nothing extra to build.

Dropped `ComponentInstall`'s `installArgs` string prop — its only caller
(`FormsVariantsSwitcher`) passed it under `hideInstallBar`, so the resolved
string was never rendered; `CliPlayground`'s scope takes typed
`flags`/`args`, not a free-form string, so there was nothing to port forward.

`LabPrereqBanner` (the `afnoui init` / `afnoui init --dnd` prerequisite
banners) and the homepage hero were **not** touched — those show one fixed
setup command, a different question from "install this specific variant,"
the same reasoning as the `app/page.tsx` exception already in
`commandSurfaces.test.ts`.

Verified: lint 0 errors, 381/381 (incl. `commandSurfaces.test.ts`), `tsc
--noEmit` clean, `verify:quick` green, `validate:variants` (358 variants,
9 batches) green, `cd test && pnpm build` clean.

### Bad slugs in CLI docs/examples — diagnosed, not yet fixed
Confirmed this is **example-string drift, not a resolver bug** —
`charts/bar/grouped.json` and `button/button-variants.json` both resolve
correctly. The wrong strings (`charts/bar/charts-bar-grouped`,
`button/variants`) are copy-paste examples in `program.ts`, `help.ts`,
`add.ts` (CLI repo), `.ai-brain/CLI_REFERENCE.md`, and — the one live
consequence — `app/lib/seo/content.ts:111`, which renders on the homepage
(`app/page.tsx`) and would 404 for anyone who copies it. Still needs the
nested CLI repo + a rebuild; ask before starting (touches the CLI's own
docs/output, not just this repo).

### Variant galleries + multi-file gallery display (item 3b)
`TransportPicker` also wired into all four galleries —
`(pages)/{tables,kanban,trees}/page.tsx` and `components/forms/FormsVariantsSwitcher`
— so the printed `npx afnoui add …` carries `--axios` / `--tanstack-query`, and
the shown code + dependency list follow the choice.

**Real bug caught here:** the tables gallery printed
`npx afnoui add tables/simpleList` — the *template record key*, which is
camelCase and **404s**. The registry slug is kebab-case (`tables-simple-list`)
with an override for `serverSideCRM → tables-server-crm`. Added a local mirror
of `tableTemplateKeyToVariantSlug` and verified all **72** template keys across
tables/kanban/tree resolve to a real `public/registry/variants/**` file.

Kanban had two install commands on one page (its own `ComponentInstall` bar plus
the picker) that could disagree. Transport state is lifted to the page so both
render the same command — `FilesPanel` is now controlled.

**Multi-file display** — `CodePreview` gained an optional `files` prop; when
present the Component tab shows a per-file strip. Purely additive, so every
existing single-`fullCode` caller is untouched. The 12 field snippet modules now
export `files` instead of a concatenated `code` blob, and
`buildFieldVariantPreview()` is deleted. The gallery now shows
`constants.ts | services.ts | hooks.ts | <Component>.tsx` as real tabs, which is
the whole point — concatenating them hid the layering the bundle exists to teach.

### Transport picker in all four builder Export tabs
New shared `app/components/shared/TransportPicker.tsx`, wired into
`table-builder/TableExportTab`, `kanban-builder/KanbanExportTab`,
`form-builder/ExportTab` and `(pages)/tree-builder/page.tsx::FilesPanel`.

**The gap it closed:** every generator has accepted a `TransportChoice` since
Wave-9, but *nothing in the UI ever passed one* — `transportFlags()` had zero
callers. So the site only ever showed the fetch + React-state default and the
axios / TanStack code paths were unreachable from the browser.

Two independent radio groups (never one four-way list — that reads as coupled),
matching the existing option-card markup so it looks like one more optional
choice. Shows the resulting deps, the CLI flags, and the
`afnoui transport <variant> …` line for an already-installed project.

**Honesty fix found by probing:** a purely client-side table generates no
`services.ts` / `useTableData.ts` at all, so the picker was a silent no-op there.
Extracted `generatesDataLayer(config, dataMode)` from `generateAllFiles` (same
condition, same result) and the picker now says *why* it is inert and what to
change. The dep report also falls back to the default transport in that case, so
it never lists a package nothing imports.

Verified in a real browser on all four builders: the generated `services.ts`
gains `import axios`, the hook gains `@tanstack/react-query`, and the install
command grows both packages. Note kanban/tree hooks use `useMutation`, not
`useQuery` — grep for the *import* when checking, or you get a false negative.

`getDependencyReport(config, transport)` gained a defaulted second parameter, so
existing callers are unchanged. 287/287, lint 0 errors, `next build` clean.

### `afnoui transport [variant]` — the transport switch command
Standalone command, **not** folded into the planned `afnoui upgrade` (which does
not exist yet, so folding would have blocked this on Step 5). `upgrade` can call
into it later.

- Two independent axes, both reversible: `--axios`/`--fetch`,
  `--tanstack-query`/`--local-state`. Each axis moves only when a flag names it,
  so `--axios` cannot silently reset a TanStack choice. Opposing flags rejected.
- Bare `afnoui transport` lists what every installed variant is on.
- `--dry-run` diff preview; `--yes` for CI; refuses to write unattended in a
  non-interactive shell without `--yes`.
- Writes are scoped to the paths of the **changing** axes only.

**Two bugs found by probing rather than building** — both would have silently
destroyed user code:
1. Taking the union of both axes' paths meant `--axios` also rewrote
   `constants.ts`, discarding tunables to change an HTTP client. Now scoped per
   axis, and locked by a test.
2. The preview re-implemented the write's transform chain, so it showed phantom
   `use client` / import diffs. `writeRegistryOutputFile`'s chain was extracted
   to `prepareRegistryOutputContent` and both now share it.

The extraction is the only change to existing behaviour, and it is a pure
refactor — proved by installing tables + forms + async-field with the new build
and with `operations.ts` reverted: **114/114 files byte-identical**.

Caveat worth remembering: a transport axis *can* legitimately own a component
(tables' `--axios` owns `DataTable.tsx`, because its body differs per
transport). Those are named explicitly before the prompt rather than sliding by
inside a diff.

Verified: 130/130 CLI tests (was 110); full round trip
fetch+local → axios+local → axios+tanstack → fetch+tanstack → fetch+local against
a live local registry; stickiness, no-op detection, non-TTY guard and `--dry-run`
all confirmed; `verify:quick` exit 0, 287/287.

Still open from the original #14: a **global** `--non-interactive` flag
(`CURRENT_SPRINT.md` Step 2) should subsume this command's local `--yes`.

### `async-field` / `infinite-field` ship as R-55 bundles — DECISION 1.18
The last place a default install still pulled a transport dependency. All 12
snippets became `ui-variants/<family>/<slug>/{<Component>.tsx, hooks.ts,
services.ts, constants.ts}`, built by the new
`app/registry/fieldVariantBundle.ts`.

- Default `npmDependencies`: `["@tanstack/react-query","axios","lucide-react"]`
  → `["lucide-react"]`.
- `transport.axios` → `services.ts`; `transport.tanstack` → `hooks.ts` +
  `constants.ts`. Component byte-identical across all four combos (same sha).
- No CLI change needed — `resolveRegistryOutputPath`'s `ui-variants/` branch is
  a prefix replace, and transport-override application was already
  category-agnostic.
- Lab `shared.*` converted to the same runtime so the live demo matches the code
  it displays; `useInfiniteOptionsAutoScroll` deleted (a react-query cache-key
  artifact).

Verified: 4 combos × 12 variants type-checked and linted (192 files, 0 errors);
all four installed for real off a local registry with the right deps each time;
`verify:quick` exit 0, 287/287.

## Done (Wave-9)

- Engine/variant transport seam — `app/{forms,tables}/transport/*`, injected port,
  zero HTTP clients in the engine (R-53, R-54) — `7e95bcc`.
- `component → hooks.ts → services.ts` layering in all four variant families;
  `services.ts` emitted for every variant including stubs (R-55) — `3c90699`.
- axios / TanStack Query as CLI-gated opt-ins, shipped as registry **overrides,
  not duplicate bundles** (R-56, R-57) — `74091cf`.
- Rules + decision log propagated across all five AI-tool rule files — `88ac6e4`.
