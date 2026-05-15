# CLAUDE.md — Claude Code instructions

> Anthropic's Claude Code looks for this file at the repo root. The substance
> lives in `AGENTS.md` and `.ai-brain/`; this file is a Claude-specific
> pointer that keeps token usage low.

**Read first:** `AGENTS.md` at the repo root.

## What this repo is

A registry-driven UI component library (Next.js 15 / React 19 / Tailwind v4)
plus its installable CLI (`afnoui` under `afnoui-cli/`). Files in `app/` are
the source of truth; `public/registry/*.json` is the generated wire format
shipped to consumer projects via `afnoui add`.

## Non-negotiable rules

1. Rebuild the matching registry generator whenever you edit `app/components/ui/**`,
   `app/forms/**`, `app/kanban/**`, `app/components/lab/dnd/variants/**`, or
   `app/registry/**`. The exact command is in `.ai-brain/AI_AGENT_RULES.md § R-00`.
2. `afnoui-cli/src/**` MUST NOT import from `app/**`. Encode frontend facts
   in the registry JSONs.
3. Banned deps: `@dnd-kit/*`, `redux`, `zustand`, `jotai`, `valtio`, `prettier`,
   `playwright`, `cypress`. See § R-04.
4. DnD drag-data: `type X = { id: string } & Record<string, unknown>`, never
   `interface X { id: string }` (§ R-32).
5. Production gate before "done":
   `pnpm lint && pnpm test && pnpm run build:cli && pnpm run verify:quick &&
    pnpm run validate:variants && cd test && pnpm build`.

## Deep references

- `.ai-brain/AI_AGENT_RULES.md` — every rule, numbered (R-00 — R-52, F-01 — F-16).
- `.ai-brain/CLI_REFERENCE.md` — exhaustive CLI docs.
- `.ai-brain/STRUCTURAL_MAP.md` — the directory map.
- `.ai-brain/THE_DECISION_LOG.md` — decisions + past mistakes (don't repeat).
- `.ai-brain/CURRENT_SPRINT.md` — wave status + queued work.

## Style notes for Claude

- Prefer `Read` / `Grep` over guessing. The registry JSONs are large but they
  ARE the contract — opening them is usually faster than re-deriving.
- When in doubt about a flag or alias, run `node afnoui-cli/dist/index.js help`
  or open `.ai-brain/CLI_REFERENCE.md` — do not invent flags.
- Cite rule numbers in your explanations ("per R-32, drag-data uses the
  intersection type"). It makes the reasoning auditable.
