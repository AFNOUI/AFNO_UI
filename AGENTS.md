# AGENTS.md

> Universal entry point for AI coding agents working in this repo. Read by:
> Cursor, Cursor CLI, OpenAI Codex/Codex CLI, Google Antigravity, Aider,
> Continue, and any agent that follows the [agents.md](https://agents.md)
> convention. Tool-specific entry points (`.cursor/rules/`, `CLAUDE.md`,
> `.github/copilot-instructions.md`) delegate to this file and to `.ai-brain/`.

## You are working in: AfnoUI

A Next.js 15 / React 19 / Tailwind v4 component library + CLI distribution
system. Components are authored in `app/`, baked into `public/registry/*.json`,
and installed into consumer projects via the `afnoui` CLI under
`afnoui-cli/`.

## Required reading (in order, before any code edit)

1. **`.ai-brain/CORE_IDENTITY.md`** — who we are, what we ship, who consumes it.
2. **`.ai-brain/STRUCTURAL_MAP.md`** — the directory map. The CLI's behaviour
   is determined by this layout; do not move files without consulting it.
3. **`.ai-brain/DATA_AND_LOGIC_FLOW.md`** — how a component goes from source
   to consumer project. Read this if you touch a build script or a registry JSON.
4. **`.ai-brain/THE_DECISION_LOG.md`** — irrevocable architectural decisions
   and a list of past mistakes you must not re-introduce.
5. **`.ai-brain/AI_AGENT_RULES.md`** — numbered hard rules (R-00 to R-52) and
   a Forbidden-changes table (F-01 to F-16). Cite the rule number when you
   apply or explain it.
6. **`.ai-brain/CLI_REFERENCE.md`** — exhaustive `afnoui` CLI documentation:
   every command, every flag, every variant kind, every alias. Use this
   instead of guessing flag names.
7. **`.ai-brain/CURRENT_SPRINT.md`** — what wave we are in and what's queued.

## The five non-negotiables

1. **Registry is the wire contract.** Files inside `app/components/ui/**`,
   `app/forms/**`, `app/kanban/**`, `app/registry/**` MUST be paired with a
   rebuild of the matching registry generator in the same commit. Run
   `pnpm run verify:quick` before declaring done.
2. **CLI is independent of the frontend.** `afnoui-cli/src/**` MUST NOT
   `import` from `app/**`. If the CLI needs to know something about a
   component, encode it in `public/registry/*.json` at build time.
3. **No forbidden deps:** `@dnd-kit/*`, `redux`, `zustand`, `jotai`,
   `valtio`, `prettier`, `playwright`, `cypress`. (See AI_AGENT_RULES § R-04
   for rationale.)
4. **Strict TS, no `any` (except parser boundaries).** `interface X { id: string }`
   for snippet drag-data is BANNED — use
   `type X = { id: string } & Record<string, unknown>` (see § R-32).
5. **Production gate before "done":** `pnpm lint && pnpm test && pnpm run build:cli
   && pnpm run verify:quick && pnpm run validate:variants && cd test && pnpm build`.

## Quick commands by task

| Task | Run |
|---|---|
| Add a shadcn primitive | edit `app/registry/<name>.tsx` + lab demo → `pnpm run build:registry` |
| Add a form variant | edit under `app/forms/variants/<slug>/` → `pnpm run generate:registry` |
| Add a table / kanban variant | edit `app/components/tables/...` or `app/kanban/...` → `pnpm run build:tables-registry` / `build:kanban-registry` |
| Add a DnD variant | edit `app/components/lab/dnd/variants/<slug>.tsx` → `pnpm run build:variants-registry` |
| Edit DnD primitives | edit `app/components/ui/dnd/*` → run BOTH `build:tables-registry` AND `build:kanban-registry` AND `build:dnd-registry` |
| Touch the CLI | edit `afnoui-cli/src/**` → `cd afnoui-cli && npm test && npm run build` |
| Bump the AfnoUI CLI publish | bump `afnoui-cli/package.json` version + `afnoui-cli/src/lib/constants.ts::CLI_VERSION` |

## How to use `afnoui` from this repo

The CLI is at `afnoui-cli/`. Built bin is `afnoui-cli/dist/index.js`.

```bash
# Run the local build
cd afnoui-cli && npm run build && node dist/index.js help

# Run end-to-end against the on-disk test project
npm run validate:variants                     # repo root
```

See `.ai-brain/CLI_REFERENCE.md` for every command, flag, and variant kind.

## If you cause a regression

1. Find the matching `Past mistake N.N` in `.ai-brain/THE_DECISION_LOG.md`.
2. If it doesn't exist, ADD it before you fix the code.
3. If it exists, cite it in your PR description (`fixes regression of past
   mistake 3.14`).
4. Update `AI_AGENT_RULES.md` if the rule that should have caught the
   regression was missing.
