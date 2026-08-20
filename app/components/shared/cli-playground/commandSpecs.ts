/**
 * Every `afnoui` command, described for humans.
 *
 * The CLI's own `--help` is accurate but assumes you already know what you are
 * looking for. This file is the opposite: it is written for someone who knows
 * what they want to *achieve* and not which command achieves it. Hence the
 * intent-first grouping, the `whenToUse` line on every command, and the fact
 * that a flag carries a `note` (what it does) separately from a `detail` (why
 * you would reach for it).
 *
 * The flag surface itself is verified against
 * `afnoui-cli/src/cli/commands/*` by `scripts/verify-cli-playground-flags.ts`.
 * Adding a flag to the CLI without adding it here fails the build, on purpose.
 */

import {
    Brush,
    Compass,
    Database,
    FileCode2,
    FormInput,
    Kanban,
    Layers,
    List,
    MousePointer2,
    Network,
    Package,
    RefreshCw,
    Rocket,
    Search,
    Stethoscope,
    Table2,
    Trash2,
    Wrench,
} from "lucide-react";

import { argsIncludeCategory, argsIncludeTransportCapable, getCategory } from "./catalog";
import type { CliCommandSpec, CliFlagSpec, CliGroup } from "./types";

export const CLI_GROUPS: CliGroup[] = [
    {
        id: "setup",
        label: "Set up a project",
        blurb: "Run once, before anything else. Creates `afnoui.json` and the base primitives every other command assumes.",
        icon: Rocket,
    },
    {
        id: "install",
        label: "Install something",
        blurb: "Pull a primitive, a form, a table, a kanban board, a tree, a chart or a drag-and-drop demo into your project as real source files.",
        icon: Package,
    },
    {
        id: "engines",
        label: "Install a whole engine",
        blurb: "Install the shared runtime for a family up front, instead of letting the first `add` drag it in. Useful when you plan to hand-write the variant yourself.",
        icon: Layers,
    },
    {
        id: "transport",
        label: "Change how data is fetched",
        blurb: "Move an already-installed variant between fetch and axios, or between React state and TanStack Query — without losing your edits.",
        icon: Database,
    },
    {
        id: "discover",
        label: "See what exists",
        blurb: "Read-only listings of everything the registry can install. Nothing is written.",
        icon: Compass,
    },
    {
        id: "maintain",
        label: "Maintain & repair",
        blurb: "Refresh files from the registry, health-check the project, clear stale CLI state, or remove AfnoUI entirely.",
        icon: Wrench,
    },
];

/* ---------------------------------------------------------------------------
 * Shared flag definitions
 * ------------------------------------------------------------------------ */

/**
 * The form-stack axis. Four CLI spellings (`--stack <kind>` plus three boolean
 * shortcuts) that all set the same thing, so the playground shows one control.
 */
function formStackFlag(alwaysRelevant: boolean): CliFlagSpec {
    return {
        id: "stack",
        flag: "--stack",
        aliasFlags: ["--react-hook-form", "--tanstack", "--action"],
        kind: "enum",
        label: "Form stack",
        note: "Which form library the generated fields are wired to.",
        detail:
            "All three stacks expose the same field components and the same JSON config — only the binding layer differs. `--tanstack` and `--action` are shorthands for the matching `--stack` value.",
        defaultValue: "rhf",
        options: [
            {
                value: "rhf",
                label: "React Hook Form",
                token: null,
                note: "**The default.** Nothing is appended, because this is what you get anyway.",
                installs: ["react-hook-form", "@hookform/resolvers", "zod"],
            },
            {
                value: "tanstack",
                label: "TanStack Form",
                token: "--stack tanstack",
                note: "Same fields, bound to `@tanstack/react-form`. Shorthand: `--tanstack`.",
                installs: ["@tanstack/react-form", "zod"],
            },
            {
                value: "action",
                label: "React 19 Action",
                token: "--stack action",
                note: "`useActionState` — server-action friendly, no client form library. Shorthand: `--action`.",
                installs: ["zod"],
            },
        ],
        relevantWhen: alwaysRelevant
            ? undefined
            : (ctx) => argsIncludeCategory(ctx.args, "forms"),
    };
}

const DRY_RUN_NOTE =
    "Prints every file it would write and every package it would install, then exits without touching disk. The safest way to answer \"what will this actually do to my project?\".";

/* ---------------------------------------------------------------------------
 * The commands
 * ------------------------------------------------------------------------ */

export const CLI_COMMANDS: CliCommandSpec[] = [
    /* ----------------------------------------------------------- setup --- */
    {
        id: "init",
        group: "setup",
        command: "init",
        label: "init",
        icon: Rocket,
        tagline: "Scaffold `afnoui.json` and the base UI primitives.",
        whenToUse:
            "**First command in any project.** Everything else assumes `afnoui.json` exists — run this once and never think about it again.",
        whatItDoes: [
            "Writes `afnoui.json` with the aliases that decide where future files land — it **detects your layout** (`app/`, `src/app/`, Vite, flat) rather than assuming Next.js.",
            "Installs Tailwind if missing and wires the AfnoUI CSS variables into your `globals.css`.",
            "Installs the `cn` helper and the base primitives the rest of the registry imports.",
        ],
        baseWrites: [
            "`afnoui.json` at your project root",
            "The base primitives → aliases.ui (default `components/ui/`)",
            "CSS variables appended to your `globals.css`",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [
            {
                id: "dnd",
                flag: "--dnd",
                kind: "boolean",
                label: "Include drag & drop",
                note: "Also installs the Pointer DnD primitives (`components/dnd/*`).",
                detail:
                    "Worth turning on if you already know you want tables with reorderable rows, a kanban board, or any `dnd/*` demo — those all sit on the same primitives, and this saves a second install pass.",
                installs: ["lucide-react"],
            },
        ],
        globalFlags: ["dry-run", "force", "debug"],
        caution:
            "Re-running `init` on an already-initialised project needs `--force`, which overwrites the managed files it wrote the first time.",
    },

    /* --------------------------------------------------------- install --- */
    {
        id: "add",
        group: "install",
        command: "add",
        label: "add",
        icon: Package,
        tagline: "Install primitives and variant bundles into your project.",
        whenToUse:
            "The command you will run most. One argument is either a base primitive (`button`) or a `<category>/<variant>` slug (`tables/tables-server-crm`) — and you can mix both in one run.",
        whatItDoes: [
            "Copies **real source files** into your project. Nothing is added as a runtime dependency you cannot edit.",
            "Pulls in whatever the bundle needs — the engine, the DnD primitives, the base components it imports — but **only once per project**.",
            "Records a hash of every file it writes in `afnoui.json`, so a later install can **tell your edits from its own**.",
        ],
        args: {
            kind: "components",
            label: "What do you want to install?",
            help: "Pick any number. Base primitives and variant bundles can be mixed in a single command.",
        },
        flags: [
            formStackFlag(false),
            {
                id: "axios",
                flag: "--axios",
                kind: "boolean",
                label: "Use axios",
                note: "Generate services.ts against axios instead of the built-in fetch.",
                detail:
                    "Opt-in. The default costs **no dependency at all** — pick this only if the rest of your app already speaks axios (interceptors, a configured base URL, and so on).",
                installs: ["axios"],
                relevantWhen: (ctx) => argsIncludeTransportCapable(ctx.args),
            },
            {
                id: "tanstackQuery",
                flag: "--tanstack-query",
                kind: "boolean",
                label: "Use TanStack Query",
                note: "Hold results in TanStack Query instead of plain React state.",
                detail:
                    "Independent of the axios choice — the two compose. **Not** to be confused with `--tanstack`, which picks the TanStack **Form** stack; different library, different axis.",
                installs: ["@tanstack/react-query"],
                relevantWhen: (ctx) => argsIncludeTransportCapable(ctx.args),
            },
        ],
        globalFlags: ["dry-run", "force", "debug"],
        docsHref: "/docs",
    },

    /* --------------------------------------------------------- engines --- */
    {
        id: "form-init",
        group: "engines",
        command: "form init",
        label: "form init",
        icon: FormInput,
        tagline: "Install the shared form engine and one form stack.",
        whenToUse:
            "When you want to build forms by hand against the AfnoUI field components, rather than starting from a `forms/*` variant.",
        whatItDoes: [
            "Installs the shared form types plus every field component.",
            "Installs **exactly one** binding stack — React Hook Form unless you choose otherwise.",
            "**Idempotent**: running it again changes nothing unless you pass `--force`.",
        ],
        baseWrites: [
            "The shared form types and every field component → aliases.forms (default `components/forms/`)",
            "The chosen stack's binding layer alongside them",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [formStackFlag(true)],
        globalFlags: ["dry-run", "force", "debug"],
    },
    {
        id: "table-init",
        group: "engines",
        command: "table init",
        label: "table init",
        icon: Table2,
        tagline: "Install the whole table engine up front.",
        whenToUse:
            "When you plan to write your own table config instead of installing one of the 26 table variants.",
        whatItDoes: [
            "Installs every shared table engine file and its runtime dependencies — the complete set, because the per-variant subset is only knowable once a variant is chosen.",
            "Suggests `afnoui add tables/<slug>` afterwards for a working example.",
        ],
        baseWrites: [
            "Every shared table engine file → aliases.tables (default `components/tables/`)",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["dry-run", "force", "debug"],
    },
    {
        id: "kanban-init",
        group: "engines",
        command: "kanban init",
        label: "kanban init",
        icon: Kanban,
        tagline: "Install the whole kanban engine up front.",
        whenToUse: "Same idea as `table init`, for boards.",
        whatItDoes: [
            "Installs the board/card runtime plus the Pointer DnD primitives it drags with.",
            "**Idempotent** — re-running is a no-op without `--force`.",
        ],
        baseWrites: [
            "Every shared kanban engine file → aliases.kanban (default `components/kanban/`)",
            "The Pointer DnD primitives → `components/dnd/`",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["dry-run", "force", "debug"],
    },
    {
        id: "tree-init",
        group: "engines",
        command: "tree init",
        label: "tree init",
        icon: Network,
        tagline: "Install the tree / graph engine up front.",
        whenToUse: "When you want TreeCanvas and the layout engine without a specific tree variant.",
        whatItDoes: [
            "Installs the layout + renderer runtime and its dependencies.",
            "GraphToolbar comes along only with variants that use it.",
        ],
        baseWrites: [
            "The TreeCanvas engine → aliases.trees (default `components/trees/`)",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["dry-run", "force", "debug"],
    },
    {
        id: "dnd-init",
        group: "engines",
        command: "dnd init",
        label: "dnd init",
        icon: MousePointer2,
        tagline: "Install the drag-and-drop primitives on their own.",
        whenToUse:
            "When you want the Pointer DnD library for your own components. It is a first-party pointer-events implementation — AfnoUI does not depend on @dnd-kit.",
        whatItDoes: [
            "Installs `components/dnd/*` and `lucide-react`.",
            "The same primitives tables, kanban and the tree engine drag with, so installing them twice is a no-op.",
        ],
        baseWrites: [
            "The Pointer DnD primitives → `components/dnd/`",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["dry-run", "force", "debug"],
    },
    {
        id: "chart-init",
        group: "engines",
        command: "chart init",
        label: "chart init",
        icon: Brush,
        tagline: "Install every chart type at once.",
        whenToUse:
            "When you want the full charting surface rather than one chart. Otherwise prefer `add charts/<type>/<slug>`.",
        whatItDoes: [
            "Installs `chart-primitives` plus **all 17** `charts-*` components.",
            "Heavier than a single chart variant — this is the whole system.",
        ],
        baseWrites: [
            "`chart-primitives` and all 17 `charts-*` components → aliases.ui",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["dry-run", "force", "debug"],
    },

    /* ------------------------------------------------------- transport --- */
    {
        id: "transport",
        group: "transport",
        command: "transport",
        label: "transport",
        icon: Database,
        tagline: "Switch an installed variant between fetch/axios and React state/TanStack Query.",
        whenToUse:
            "After the fact, when the data layer needs to change but your edits to the component should survive. This is the safe alternative to re-adding with --force.",
        whatItDoes: [
            "Rewrites **only** the files the axis you named actually owns — typically `services.ts` for the HTTP axis, `hooks.ts` + `constants.ts` for the query axis.",
            "Shows a **diff** and asks before writing. Files outside the named axis are never touched.",
            "The two axes are **independent** and both directions exist, so every switch is **reversible**.",
        ],
        baseWrites: [
            "Only the files owned by the axis you named — typically `services.ts`, or `hooks.ts` + `constants.ts`",
        ],
        args: {
            kind: "variant",
            label: "Which installed variant?",
            help: "Leave this empty to list what every installed variant is currently on.",
            emptyMeans:
                "With no variant, `transport` prints a table of every installed variant and its current transport. Nothing is written.",
            categoryFilter: (id) => getCategory(id).transportCapable === true,
            filterNote:
                "Only categories with a data layer are listed — a purely client-side variant has no services.ts to rewrite.",
        },
        flags: [
            {
                id: "httpClient",
                flag: "--axios",
                aliasFlags: ["--fetch"],
                kind: "enum",
                label: "HTTP client",
                note: "Who sends the request.",
                detail:
                    "Leave this on **don't change** and the axis is not touched at all — naming one axis never resets the other.",
                defaultValue: "unchanged",
                options: [
                    {
                        value: "unchanged",
                        label: "Don't change",
                        token: null,
                        note: "This axis is left exactly as it is.",
                    },
                    {
                        value: "fetch",
                        label: "fetch",
                        token: "--fetch",
                        note: "Back to the built-in `fetch`. Adds **no dependency**.",
                    },
                    {
                        value: "axios",
                        label: "axios",
                        token: "--axios",
                        note: "Sends with axios instead.",
                        installs: ["axios"],
                    },
                ],
            },
            {
                id: "queryStrategy",
                flag: "--tanstack-query",
                aliasFlags: ["--local-state"],
                kind: "enum",
                label: "Where the result lives",
                note: "Who holds the fetched data.",
                detail:
                    "Independent of the HTTP client — all four combinations are valid and supported.",
                defaultValue: "unchanged",
                options: [
                    {
                        value: "unchanged",
                        label: "Don't change",
                        token: null,
                        note: "This axis is left exactly as it is.",
                    },
                    {
                        value: "local",
                        label: "React state",
                        token: "--local-state",
                        note: "Back to plain React state. Adds **no dependency**.",
                    },
                    {
                        value: "tanstack",
                        label: "TanStack Query",
                        token: "--tanstack-query",
                        note: "Caching, refetching and invalidation handled by the query client.",
                        installs: ["@tanstack/react-query"],
                    },
                ],
            },
            {
                id: "yes",
                flag: "--yes",
                kind: "boolean",
                label: "Skip the confirmation",
                note: "For CI. Implied by `--dry-run`.",
                detail:
                    "Without this, the command **refuses to write** unattended in a non-interactive shell rather than guessing you meant yes.",
            },
        ],
        globalFlags: ["dry-run", "debug"],
    },

    /* -------------------------------------------------------- discover --- */
    {
        id: "list",
        group: "discover",
        command: "list",
        label: "list",
        icon: List,
        tagline: "List every base component, or every variant slug.",
        whenToUse:
            "When you want the exact slug to pass to `add` and would rather not guess. Also the fastest way to script against the registry.",
        whatItDoes: [
            "Reads the registry index and prints it. **Writes nothing**, needs no `afnoui.json`.",
            "With `--json` the output is a plain array, suitable for piping into `jq`.",
        ],
        args: {
            kind: "scope",
            label: "List what?",
            help: "",
            choices: [
                {
                    value: "",
                    label: "Base components",
                    note: "The single-file primitives: button, dialog, input, …",
                },
                {
                    value: "variants",
                    label: "Every variant slug",
                    note: "All `<category>/<variant>` slugs across forms, tables, kanban, tree, charts, dnd and the primitive demos.",
                },
            ],
        },
        flags: [
            {
                id: "json",
                flag: "--json",
                kind: "boolean",
                label: "JSON output",
                note: "Print a raw JSON array instead of the formatted list.",
                detail: "Works for both scopes. `npx afnoui list variants --json | jq '.[] | select(startswith(\"forms/\"))'`.",
            },
        ],
        globalFlags: ["debug"],
    },

    /* -------------------------------------------------------- maintain --- */
    {
        id: "update",
        group: "maintain",
        command: "update",
        label: "update",
        icon: RefreshCw,
        tagline: "Re-fetch base components from the registry, overwriting local edits.",
        whenToUse:
            "When the registry shipped a fix to a primitive you already have, or you want a known-good copy back after experimenting.",
        whatItDoes: [
            "Always behaves as `--force`: your local edits to these files **are replaced**.",
            "Works on **base components only**. For a variant, use `add <category>/<variant> --force` instead.",
        ],
        args: {
            kind: "base-components",
            label: "Which components?",
            help: "Base primitives only — the names `afnoui list` prints.",
        },
        flags: [],
        globalFlags: ["dry-run", "debug"],
        caution: "This overwrites **without asking**. Preview with `--dry-run` first if you have edited these files.",
    },
    {
        id: "doctor",
        group: "maintain",
        command: "doctor",
        label: "doctor",
        icon: Stethoscope,
        tagline: "Health-check the project: Tailwind, globals.css, the cn helper, registry reachability.",
        whenToUse:
            "Before running `add` in CI, or when an install behaved strangely and you want to know whether the project or the network is at fault.",
        whatItDoes: [
            "**Read-only.** Never touches disk or the package manager.",
            "Exits `0` when everything is green, `1` when any check fails — so it works as a CI gate.",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["debug"],
    },
    {
        id: "diagnose",
        group: "maintain",
        command: "diagnose",
        label: "diagnose",
        icon: Search,
        tagline: "Clear stale install locks and expired cache entries.",
        whenToUse:
            "When an install claims another install is already running but nothing is. Usually the aftermath of a killed process.",
        whatItDoes: [
            "Removes dead lock files, corrupt lock files, and cache entries past their TTL.",
            "Only touches the CLI's **own state** under your home directory — never your project files.",
        ],
        baseWrites: [
            "The CLI's own lock and cache files under your home directory",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["debug"],
    },
    {
        id: "clean",
        group: "maintain",
        command: "clean",
        label: "clean",
        icon: Trash2,
        tagline: "Interactively remove AfnoUI from the project.",
        whenToUse: "When you want AfnoUI out — or want a genuinely clean slate before re-initialising.",
        whatItDoes: [
            "Walks the managed directories and asks before removing each one.",
            "**Never** uninstalls npm packages, because other code in your project may still import them.",
        ],
        baseWrites: [
            "Removes the AfnoUI-managed directories you confirm, and `afnoui.json`",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: ["debug"],
        caution: "**Deletes directories.** Each step asks first, but there is no undo once you answer yes.",
    },
    {
        id: "help",
        group: "maintain",
        command: "help",
        label: "help",
        icon: FileCode2,
        tagline: "Print the full command reference in your terminal.",
        whenToUse: "When you are offline, or want the flag list next to the shell you are typing in.",
        whatItDoes: [
            "Prints **every** command, flag and example, grouped the same way this page is.",
            "`npx afnoui <command> --help` gives the **per-command** detail.",
        ],
        args: { kind: "none", label: "", help: "" },
        flags: [],
        globalFlags: [],
    },
];

/* ---------------------------------------------------------------------------
 * Global flags
 * ------------------------------------------------------------------------ */

export const GLOBAL_FLAGS: CliFlagSpec[] = [
    {
        id: "dry-run",
        flag: "--dry-run",
        kind: "boolean",
        label: "Preview only",
        note: "Show everything it **would** do, then exit without writing.",
        detail: DRY_RUN_NOTE,
    },
    {
        id: "force",
        flag: "--force",
        kind: "boolean",
        label: "Overwrite my edits",
        note: "Replace managed files **even where you have changed them**.",
        detail:
            "AfnoUI hashes every file it writes into afnoui.json. Without --force, a file that no longer matches that hash is treated as yours and left alone (or asked about). This is the flag that overrides that protection — so it is also the one to be careful with.",
    },
    {
        id: "debug",
        flag: "--debug",
        kind: "boolean",
        label: "Verbose output",
        note: "Print stack traces, registry URLs and the detected package manager.",
        detail: "The first thing to add when an install fails and the one-line error is not enough.",
    },
];

export const GLOBAL_FLAGS_BY_ID: Record<string, CliFlagSpec> = Object.fromEntries(
    GLOBAL_FLAGS.map((flag) => [flag.id, flag]),
);

export const COMMANDS_BY_ID: Record<string, CliCommandSpec> = Object.fromEntries(
    CLI_COMMANDS.map((command) => [command.id, command]),
);

export function commandsInGroup(groupId: string): CliCommandSpec[] {
    return CLI_COMMANDS.filter((command) => command.group === groupId);
}
