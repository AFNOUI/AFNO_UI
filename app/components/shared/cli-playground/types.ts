/**
 * The type layer for the CLI playground.
 *
 * The playground is a *model* of the `afnoui` CLI, not a second implementation
 * of it: every command, argument and flag is described declaratively here and
 * in `commandSpecs.ts`, and the UI is a generic renderer over that description.
 * That is what lets the same component serve the homepage (every command) and
 * a builder page (one command, argument pre-filled) without branching.
 *
 * The one hard rule: this model must never drift from the real CLI. It is
 * locked by `scripts/verify-cli-playground-flags.ts`, which parses the
 * commander definitions in `afnoui-cli/src/cli/commands/*` and fails the build
 * if a flag exists there but not here (or here but not there). Descriptions are
 * ours to write; the flag surface is not.
 */

import type { LucideIcon } from "lucide-react";

/** Top-level grouping in the command picker — phrased by intent, not by verb. */
export type CliGroupId =
    | "setup"
    | "install"
    | "engines"
    | "transport"
    | "discover"
    | "maintain";

export interface CliGroup {
    id: CliGroupId;
    label: string;
    /** Answers "what am I trying to do?" — this is what people scan. */
    blurb: string;
    icon: LucideIcon;
}

/**
 * The live selection. Flags are keyed by `CliFlagSpec.id` rather than by the
 * flag string so an enum flag (`--stack tanstack`) and a boolean flag
 * (`--force`) can share one record.
 */
export interface CommandContext {
    /** Positional arguments, in the order they will appear in the command. */
    args: string[];
    /** Flag id → value. `true` for an enabled boolean, the chosen value for an enum. */
    flags: Record<string, string | boolean | undefined>;
}

export interface FlagOption {
    value: string;
    label: string;
    /**
     * What this choice appends to the command. `null` means "emit nothing" —
     * used for the value that is already the CLI's default, so the playground
     * never prints a flag that changes nothing.
     */
    token: string | null;
    note: string;
    installs?: string[];
}

export interface CliFlagSpec {
    /** Stable key used in `CommandContext.flags`. */
    id: string;
    /** The literal flag as commander declares it, e.g. `--force` or `--stack`. */
    flag: string;
    /**
     * Other CLI flags this one control stands in for. The CLI often exposes
     * several spellings of one axis (`--stack tanstack` === `--tanstack`, and
     * `--axios`/`--fetch` are two ends of the same choice); the playground
     * renders the axis once and lists the spellings here so the drift verifier
     * still accounts for every declared flag.
     */
    aliasFlags?: string[];
    kind: "boolean" | "enum";
    label: string;
    /** One line, next to the control. Plain language, no jargon. */
    note: string;
    /** The longer "why would I want this" — surfaced when the flag is active. */
    detail?: string;
    /** Required for `kind: "enum"`. */
    options?: FlagOption[];
    /** Enum default — the option whose `token` is usually `null`. */
    defaultValue?: string;
    /** Flag ids that cannot be on at the same time. Enforced symmetrically. */
    conflictsWith?: string[];
    /** npm packages turning this on will cause the CLI to install. */
    installs?: string[];
    /** Hidden entirely when this returns false — the flag cannot apply here. */
    relevantWhen?: (ctx: CommandContext) => boolean;
    /**
     * Shown, but with an explanation that it currently changes nothing. A live
     * control that silently no-ops is worse than no control.
     */
    inertWhen?: (ctx: CommandContext) => string | null;
}

/** How a command takes its positional arguments. */
export type CliArgKind =
    /** No positional arguments at all (`doctor`, `clean`, `init`, …). */
    | "none"
    /** Any number of base components and/or `<category>/<variant>` slugs (`add`). */
    | "components"
    /** Any number of base components only (`update`). */
    | "base-components"
    /** Exactly one variant slug, optional (`transport [variant]`). */
    | "variant"
    /** A fixed word from a small set (`list [scope]`). */
    | "scope";

export interface CliArgSpec {
    kind: CliArgKind;
    /** Rendered above the picker. */
    label: string;
    /** One line under the label explaining what belongs here. */
    help: string;
    /** What the command does when no argument is given, when that is legal. */
    emptyMeans?: string;
    /** For `kind: "scope"`. */
    choices?: { value: string; label: string; note: string }[];
    /** For `kind: "variant"` — restrict the catalog to categories that qualify. */
    categoryFilter?: (categoryId: string) => boolean;
    /** Why the catalog is filtered, shown under the picker. */
    filterNote?: string;
}

export interface CliCommandSpec {
    id: string;
    group: CliGroupId;
    /** The tokens after `afnoui`, e.g. `add` or `form init`. */
    command: string;
    /** Display name in the picker. */
    label: string;
    icon: LucideIcon;
    /** One line in the picker list. This is the whole point of the playground. */
    tagline: string;
    /** "Use this when…" — shown once the command is selected. */
    whenToUse: string;
    /** Concrete bullets: what it writes, what it installs, what it never touches. */
    whatItDoes: string[];
    args: CliArgSpec;
    /**
     * What the command writes when it takes no positional arguments. Without
     * this an argument-less command like `table init` reported "Changes no
     * files", because the write list was derived purely from its arguments —
     * exactly backwards for the commands whose whole job is writing an engine.
     */
    baseWrites?: string[];
    flags: CliFlagSpec[];
    /**
     * Which of the three global flags are meaningful here. `--force` on a
     * read-only command like `doctor` is accepted by commander but does
     * nothing, so offering it would be a lie.
     */
    globalFlags: GlobalFlagId[];
    /** Called out in a warning strip — destructive or surprising behaviour. */
    caution?: string;
    /** Deep link into the docs for the full reference. */
    docsHref?: string;
}

export type GlobalFlagId = "dry-run" | "debug" | "force";

/** One piece of the rendered command, carrying its own explanation. */
export interface CommandToken {
    text: string;
    kind: "runner" | "binary" | "command" | "arg" | "flag" | "value";
    /** Shown in the token legend beneath the command. */
    note: string;
}

export interface CommandProblem {
    level: "error" | "warning";
    message: string;
}

/** Everything the result panel needs, derived purely from the selection. */
export interface BuiltCommand {
    /** The full command string for the chosen package manager. */
    text: string;
    tokens: CommandToken[];
    problems: CommandProblem[];
    /** npm packages this run will add to package.json. */
    installs: string[];
    /** Where files will land, one line per distinct destination. */
    writes: string[];
    /** True when the command is incomplete (missing a required argument). */
    incomplete: boolean;
    /**
     * `--dry-run` is on, so `installs` and `writes` describe what *would*
     * happen. The panel keeps showing them — that preview is the entire reason
     * to run with the flag — but labels them as a preview.
     */
    dryRun: boolean;
}
