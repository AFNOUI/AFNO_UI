/**
 * Selection → command string, token annotations, warnings, and effects.
 *
 * Deliberately pure and UI-free: the same function backs the homepage
 * playground, the scoped builder-page playground, and its unit tests. The
 * output is a `BuiltCommand`, which carries not just the text but *why each
 * piece of it is there* — the token legend is the part that makes this a
 * teaching tool instead of a string concatenator.
 */

import { getAfnouiCommand, type PackageManager } from "../cliInstallCommands";

import { categoryOf, getCategory, isVariantSlug } from "./catalog";
import { GLOBAL_FLAGS_BY_ID } from "./commandSpecs";
import type {
    BuiltCommand,
    CliCommandSpec,
    CliFlagSpec,
    CommandContext,
    CommandProblem,
    CommandToken,
} from "./types";

/** Flags that apply to the current selection at all (the rest are hidden). */
export function visibleFlags(spec: CliCommandSpec, ctx: CommandContext): CliFlagSpec[] {
    return spec.flags.filter((flag) => flag.relevantWhen?.(ctx) ?? true);
}

/** Is this boolean flag on, or this enum flag set to a non-default value? */
function isActive(flag: CliFlagSpec, ctx: CommandContext): boolean {
    const value = ctx.flags[flag.id];
    if (flag.kind === "boolean") return value === true;
    return typeof value === "string" && value !== flag.defaultValue;
}

/** The literal tokens a flag contributes, if any. */
function flagTokens(flag: CliFlagSpec, ctx: CommandContext): string[] {
    const value = ctx.flags[flag.id];
    if (flag.kind === "boolean") return value === true ? [flag.flag] : [];

    const chosen = flag.options?.find((option) => option.value === value);
    if (!chosen?.token) return [];
    // `--stack tanstack` is one option but two shell tokens.
    return chosen.token.split(" ");
}

function flagNote(flag: CliFlagSpec, ctx: CommandContext): string {
    if (flag.kind === "boolean") return flag.note;
    const chosen = flag.options?.find((option) => option.value === ctx.flags[flag.id]);
    return chosen ? `${flag.label}: ${chosen.note}` : flag.note;
}

function flagInstalls(flag: CliFlagSpec, ctx: CommandContext): string[] {
    if (flag.kind === "boolean") {
        return ctx.flags[flag.id] === true ? (flag.installs ?? []) : [];
    }
    const chosen = flag.options?.find((option) => option.value === ctx.flags[flag.id]);
    return chosen?.installs ?? [];
}

/** One line describing where an argument's files land and what tags along. */
function writeLineFor(arg: string): string {
    if (!isVariantSlug(arg)) {
        return `\`${arg}\` → aliases.ui (default \`components/ui/${arg}.tsx\`)`;
    }
    const categoryId = categoryOf(arg);
    const category = getCategory(categoryId ?? "");
    return `\`${arg}\` → ${category.installRoot}`;
}

/** Side-effects are per category, not per variant, so they are deduped. */
function sideEffectsFor(args: string[]): string[] {
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const arg of args) {
        const categoryId = categoryOf(arg);
        if (!categoryId || seen.has(categoryId)) continue;
        seen.add(categoryId);
        const category = getCategory(categoryId);
        for (const effect of category.sideEffects) {
            const line = `${category.label}: also installs ${effect}`;
            if (!lines.includes(line)) lines.push(line);
        }
    }
    return lines;
}

function detectProblems(spec: CliCommandSpec, ctx: CommandContext): CommandProblem[] {
    const problems: CommandProblem[] = [];

    // Conflicting flags. Declared one-way in the specs, enforced both ways here
    // so a spec author cannot half-declare a conflict.
    for (const flag of visibleFlags(spec, ctx)) {
        if (!isActive(flag, ctx)) continue;
        for (const otherId of flag.conflictsWith ?? []) {
            const other = spec.flags.find((candidate) => candidate.id === otherId);
            if (other && isActive(other, ctx)) {
                problems.push({
                    level: "error",
                    message: `${flag.flag} and ${other.flag} cannot be used together.`,
                });
            }
        }
    }

    // A flag that is offered but currently changes nothing.
    for (const flag of visibleFlags(spec, ctx)) {
        const inert = flag.inertWhen?.(ctx);
        if (inert && isActive(flag, ctx)) {
            problems.push({ level: "warning", message: inert });
        }
    }

    // The one confusion the CLI's own docs call out: two different libraries
    // whose flags read almost identically.
    if (ctx.flags.stack === "tanstack" && ctx.flags.tanstackQuery === true) {
        problems.push({
            level: "warning",
            message:
                "`--stack tanstack` (TanStack Form, how fields bind) and `--tanstack-query` (TanStack Query, where results live) are different libraries. This is valid — just make sure you meant both.",
        });
    }

    if (spec.globalFlags.includes("force") && ctx.flags.force === true) {
        problems.push({
            level: "warning",
            message:
                "--force overwrites files you have edited, without asking. Run it once with --dry-run first if you are not sure what has drifted.",
        });
    }

    return problems;
}

export function buildCommand(
    spec: CliCommandSpec,
    ctx: CommandContext,
    packageManager: PackageManager,
): BuiltCommand {
    const tokens: CommandToken[] = [];
    const installs: string[] = [];
    const writes: string[] = [];

    for (const part of spec.command.split(" ")) {
        tokens.push({
            text: part,
            kind: "command",
            note: tokens.length === 0 ? spec.tagline : `Subcommand of \`${spec.command.split(" ")[0]}\`.`,
        });
    }

    // Positional arguments. A command declared as taking none never renders
    // them, whatever state it is handed — the belt to the CliPlayground brace.
    for (const arg of spec.args.kind === "none" ? [] : ctx.args) {
        if (spec.args.kind === "scope") {
            const choice = spec.args.choices?.find((candidate) => candidate.value === arg);
            if (arg) tokens.push({ text: arg, kind: "arg", note: choice?.note ?? "" });
            continue;
        }
        tokens.push({ text: arg, kind: "arg", note: writeLineFor(arg) });
        writes.push(writeLineFor(arg));
    }

    // Command flags, then global flags — matching the order people type them.
    for (const flag of visibleFlags(spec, ctx)) {
        const parts = flagTokens(flag, ctx);
        if (parts.length === 0) continue;
        tokens.push({ text: parts[0], kind: "flag", note: flagNote(flag, ctx) });
        for (const value of parts.slice(1)) {
            tokens.push({ text: value, kind: "value", note: `Value for ${parts[0]}.` });
        }
        installs.push(...flagInstalls(flag, ctx));
    }

    for (const globalId of spec.globalFlags) {
        if (ctx.flags[globalId] !== true) continue;
        const globalFlag = GLOBAL_FLAGS_BY_ID[globalId];
        tokens.push({ text: globalFlag.flag, kind: "flag", note: globalFlag.note });
    }

    const args = tokens
        .filter((token) => token.kind !== "runner" && token.kind !== "binary")
        .map((token) => token.text)
        .join(" ");

    const text = getAfnouiCommand(packageManager, args);

    // The runner and binary are prepended last so their notes can reference the
    // finished command.
    const [runner, ...rest] = text.split(" ");
    const runnerTokens: CommandToken[] = [
        {
            text: rest[0] === "afnoui" ? runner : `${runner} ${rest[0]}`,
            kind: "runner",
            note: "Runs the CLI straight from npm without adding it to your project.",
        },
        {
            text: "afnoui",
            kind: "binary",
            note: "The AfnoUI CLI. It reads its catalog from the public registry, so it always sees the same components this site does.",
        },
    ];

    const requiresArg =
        (spec.args.kind === "components" ||
            spec.args.kind === "base-components") &&
        ctx.args.length === 0;

    return {
        text,
        tokens: [...runnerTokens, ...tokens],
        problems: detectProblems(spec, ctx),
        installs: [...new Set(installs)],
        writes: [...(writes.length === 0 ? (spec.baseWrites ?? []) : writes), ...sideEffectsFor(ctx.args)],
        incomplete: requiresArg,
        dryRun: spec.globalFlags.includes("dry-run") && ctx.flags["dry-run"] === true,
    };
}
