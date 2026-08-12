# TASK_QUEUE.md

> The running queue of open work, in the user's priority order.
> `CURRENT_SPRINT.md` is the *status board* (what landed, what the gates are).
> This file is the *queue* (what's next, and why it's in that position).
>
> Rules for keeping this file honest:
> - Move an item to **Done** in the same commit that finishes it, with the commit SHA.
> - Never delete an item silently. If it's dropped, move it to **Dropped** with a reason.
> - Items marked **ASK FIRST** must not be started without the user saying go.
>
> Last updated: 2026-08-09 (post Wave-9)

---

## Now

*(nothing in flight — pick the top item from Next)*

---

## Next

### 3. Builder Export tabs + variant galleries must show transport flags
Leftover from #12. Both still print only the default install command; they should
reflect `--axios` / `--tanstack-query`.

User's call: ship this **inside the broader page-UI consistency pass**, not as a
standalone change.

**Now also owns the multi-file gallery display.** `ComponentInstall` /
`CodePreview` still take a single `fullCode: string`, but `async-field` /
`infinite-field` install four files each since DECISION 1.18. They currently
render as one concatenated block via `buildFieldVariantPreview()` in
`app/registry/fieldVariantBundle.ts`. Replace that with real per-file tabs
(forms/tables already have the shape to copy) and delete the preview helper.

---

## Blocked on the user

### 4. CLI command playground — **DISCUSS THE DESIGN FIRST**
A command playground in each builder + variant page. The user explicitly asked
that the design be discussed before any implementation starts.

### 5. Optional global error handling — **ASK BEFORE STARTING**
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

## Done (Wave-9 follow-ups)

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
