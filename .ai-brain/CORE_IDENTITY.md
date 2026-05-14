# CORE_IDENTITY.md

> Canonical source for *what this project is and why it exists*.
> If a future AI/contributor disagrees with anything below, they MUST update this file in the same commit. No silent drift.

---

## 1. The Problem

### 1.1 Surface symptom (what users feel)
React/Next.js teams burn weeks gluing together:
- shadcn/ui components copy-pasted file by file,
- Radix primitives whose peer-deps drift between projects,
- bespoke form/table/kanban abstractions that have to be re-written for every product,
- chart libraries that don’t know what RTL is,
- and a dozen `npm install …` lines that are perpetually out of sync with what their teammate copied yesterday.

The result: every project starts at 30% and re-invents the same 70%.

### 1.2 Root cause we attack
There is no single source of truth that owns *all four* of:
1. The component’s **runtime source code**,
2. Its **UI primitive dependencies** (Radix peers, npm runtime deps, dev deps),
3. A **visual builder** that produces a config/code artifact,
4. A **CLI** that injects all of that into the consumer’s repo.

Existing tools (shadcn-ui CLI, v0, plasmic, retool) each cover one or two slices. None cover all four with a *static* registry that the builders, the website, and the CLI all read from.

### 1.3 Our move
We collapse the four slices into one immutable artifact: the JSON files in `public/registry/`.

- **The website** (`app/`) reads them to power live previews, builders, and export panels.
- **The CLI** (`afnoui-cli/`) reads the *same* JSONs over HTTP and writes them into the user’s project, transforming import paths to match the consumer’s `afnoui.json` aliases.
- **Visual builders** (`form-builder`, `table-builder`, `chart-builder` (planned), `kanban-builder`, `ui-builder`) emit configs that the runtime engines (`forms`, `tables`, `kanban`, `components/ui/charts`) interpret — so the *exported* code is the same code the user just designed visually, byte-for-byte.

We refuse to ship a “starter template.” We ship a CLI that gives you a working production page in one command.

---

## 2. The User (Persona)

### 2.1 Primary persona — “Mid-to-senior frontend engineer building a product, not a portfolio”
- **Role**: full-stack or front-of-stack TypeScript engineer at a startup or product team (5–50 engineers).
- **Stack literacy**: comfortable with Next.js App Router, server vs client components, Tailwind, TanStack Query, React Hook Form *or* TanStack Form *or* React 19 `useActionState`.
- **Tolerance for magic**: low. They want to read every file the CLI writes. No `node_modules`-buried abstractions.
- **Time horizon**: building this week, shipping next week, maintaining for years.
- **Trust contract**:
  - When they click **Export**, they expect compilable code that pastes into their repo and runs without manual editing.
  - When they run `npx afnoui add forms/forms-contact`, they expect:
    - the form to render on first reload,
    - imports to use *their* alias (`@/components`, `~components`, `src/components`, whatever `afnoui.json` says),
    - peer-deps installed (with the right package manager — pnpm/npm/yarn/bun auto-detected),
    - no overwrites of files they’ve customised (managed-file marker + `--force` to override),
    - `"use client"` directives correctly placed for App-Router compatibility.

### 2.2 Secondary persona — “Designer-coder doing a quick UI spike”
- Uses the **website builders** (form-builder, ui-builder, kanban-builder) without ever installing the CLI.
- Exports JSON, hands it to engineering, or copies the generated TSX into a CodeSandbox.
- Doesn’t care about CLI flags; cares deeply about the visual builder feeling responsive and the preview matching the export.

### 2.3 Tertiary persona — “AI coding agent (Cursor / Codex / Claude Code)”
- Treated as a first-class consumer. The `.ai-brain/` directory exists for them.
- They will read CORE_IDENTITY → STRUCTURAL_MAP → DATA_AND_LOGIC_FLOW → DECISION_LOG → CURRENT_SPRINT in that order before touching code.

### 2.4 Anti-personas (we explicitly do not target)
- “Drag-and-drop website builders for non-coders.” We are not Webflow/Wix.
- “Visual database modellers.” We don’t own the backend.
- “Whole-app starter templates.” We give parts, not skeletons.

---

## 3. The Tone

### 3.1 Code tone — *Robust, library-grade, zero-magic*
Concretely:

| Quality | Stance |
|---|---|
| **Type strictness** | `strict: true` everywhere. Generics over `any` (`<TRow extends { id: string }>`). `unknown` at boundaries, narrow with type guards. |
| **Comments** | Explain *why*, never *what*. Every non-obvious decision has a comment that names the alternative we rejected. |
| **Error handling** | Fail loud at boundaries (CLI prints stack traces in `--debug`, throws in registry parsers). Fail soft inside builders (toast + console.warn). |
| **Side-effects** | Pushed to the edges. Pure helpers in `utils/`, pure codegen in `*-builder/utils/codegen/`, IO only in CLI `operations.ts` and Next route handlers. |
| **Dependencies** | Every prod dep is justified by use in at least one *runtime* feature. No utility-belt libraries. We removed `@dnd-kit/*` and wrote our own DnD library because the bundle-size + RTL story didn’t survive scrutiny. |
| **Tests** | Vitest. Snapshot tests pin generated code shape. Unit tests for pure helpers. CLI has its own 100-test characterization suite. We do not unit-test React components — the visual builders are the test harness. |
| **DRY** | Extract once we have the third occurrence, never on the second. Premature abstraction is the bigger cost. |
| **Single source of truth** | Registry JSON owns deps + code. Anything in the website or CLI that re-encodes the same fact is a bug to be removed. |

### 3.2 UI tone — *Minimal-but-dense, professional, non-cute*
| Quality | Stance |
|---|---|
| **Visual density** | Closer to Linear / Vercel / Stripe than to Notion / Figma. Compact rows, tight typography, no oversized hero illustrations. |
| **Interaction** | Keyboard-accessible by default (Radix primitives). Hover affordances are subtle. No celebratory confetti. |
| **Color** | Theme-driven via CSS variables (`--primary`, `--background`, etc.). Two built-in modes (light/dark) + user-uploadable presets via the Theme panel. |
| **Direction** | LTR + RTL are equal-class citizens. Use logical Tailwind classes (`ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) — never `pl-*`/`ml-*`/`text-left`. Mixed-direction text uses `dir="auto"` so the Unicode Bidi algorithm picks. |
| **Motion** | Functional only. Drag preview + drop indicator + fade for state transitions. Honour `prefers-reduced-motion`. |
| **Copy** | American English, sentence case, imperative voice ("Add row", not "Add a Row" or "Add Row Here"). All UI strings live in `app/lib/i18n.ts` resources for 7 locales (en/es/fr/de/zh/ja/ar). |
| **Empty states** | Always present. Always actionable ("No fields yet → click + to add one", not "List is empty"). |

### 3.3 Velocity stance — *“Slow shipping, fast iterating”*
- We do not ship features without registry verification scripts proving the embedded code matches disk.
- We do not break the CLI test suite. Ever. Treat 100/100 as the floor.
- We do not commit `pnpm exec next build` failures.
- Refactors land *before* features that depend on them, in the same PR family.

### 3.4 Forbidden patterns
- Emoji in source code unless explicitly themed (the landing page uses `lucide-react` icons exclusively).
- `any`, `as any`, `// @ts-ignore` — every occurrence requires a justification comment.
- Hardcoded strings in business components (must go through i18n).
- Hardcoded npm-install lists outside the registry generators (must derive from `tableInstall` / `formStackInstall` / `kanbanInstall`).
- Physical Tailwind direction classes (`pl-*`, `ml-*`, `text-left`, `text-right`) outside explicitly LTR-only contexts (e.g. shell command snippets).
- New dependencies on `@dnd-kit/*` — use `app/components/ui/dnd` instead.
