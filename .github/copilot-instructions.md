# GitHub Copilot instructions — AfnoUI

> Repo-level instructions for GitHub Copilot Chat + inline completions.
> The substance is in `AGENTS.md` (universal) and `.ai-brain/` (deep docs).
> This file is a short-form pointer so Copilot's prompt budget is spent on
> code, not duplicated rules.

## Project shape

- **Next.js 15 / React 19 / Tailwind v4** monorepo with a published CLI.
- **Two surfaces:**
  - `app/` — the live demo app + lab + builders + source-of-truth for variants.
  - `afnoui-cli/` — the published CLI (`afnoui` on npm).
- **Wire format:** `public/registry/*.json` — generated from `app/` by
  `scripts/build-*-registry.ts` and consumed by the CLI.

## Hard rules (do not break)

1. **Registry rebuild discipline.** Editing `app/components/ui/**`,
   `app/forms/**`, `app/kanban/**`, `app/components/lab/dnd/variants/**`, or
   `app/registry/**`? Run the matching `pnpm run build:*-registry`.
2. **CLI does not import from `app/**`.** Encode frontend facts in the
   registry JSONs.
3. **Banned deps:** `@dnd-kit/*`, `redux`, `zustand`, `jotai`, `valtio`,
   `prettier`, `playwright`, `cypress`.
4. **DnD drag-data type:** `type X = { id: string } & Record<string, unknown>`,
   NEVER `interface X { id: string }` (past mistake 3.14).
5. **`<div {...zoneProps}>`** — never `<div ref={zoneProps.ref} {...zoneProps}>`.
6. **`autoFocus`** on `<Calendar>` — never `initialFocus` (`react-day-picker` v10+).
7. **No transport in engine files:** no `axios` / `@tanstack/react-query` import
   in `app/{forms,tables,kanban,trees}/**` or any shared source. The engine
   describes requests; the variant's `services.ts` sends them (§ R-53, R-54).
8. **`component → hooks.ts → services.ts`** in every variant — a component
   importing `services.ts` is a violation (§ R-55).
9. **axios / TanStack Query are CLI-gated opt-ins**, marked `TODO(cli-gated)`;
   the generated default is `fetch` + local React state (§ R-56).
10. **CLI change ⇒ playground change, same commit.** New/renamed/removed command
    or flag in `afnoui-cli/src/cli/**` must land in
    `app/components/shared/cli-playground/commandSpecs.ts` too — it is the site's
    interactive CLI reference and it can lie. `pnpm run verify:cli-playground`
    catches flag drift only (§ R-58).

## Quality gate before "done"

```
pnpm lint
pnpm test
pnpm run build:cli
pnpm run verify:quick
pnpm run validate:variants
cd test && pnpm build
```

## Deep reads

| File | When |
|---|---|
| `AGENTS.md` | Start of every session |
| `.ai-brain/STRUCTURAL_MAP.md` | Touching layout |
| `.ai-brain/THE_DECISION_LOG.md` | Touching architecture |
| `.ai-brain/AI_AGENT_RULES.md` | Anything (it numbers every rule) |
| `.ai-brain/CLI_REFERENCE.md` | Anything that touches `afnoui-cli/` |
| `.ai-brain/CURRENT_SPRINT.md` | Planning what's next |
