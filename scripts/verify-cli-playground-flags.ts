/**
 * Lock the CLI playground's model of the CLI to the real CLI.
 *
 * `app/components/shared/cli-playground/commandSpecs.ts` describes every
 * `afnoui` command so the site can teach it. Descriptions are ours to write —
 * the *flag surface* is not. If someone adds `--foo` to a commander definition
 * and forgets the playground, the site quietly stops being a complete reference
 * and starts being a misleading one, which is worse than having no playground.
 *
 * So: parse the `.option(...)` declarations out of
 * `afnoui-cli/src/cli/commands/*.ts` and assert they match the playground's
 * specs, per command, in both directions.
 *
 * Scope of the guarantee, stated honestly: this checks that the same SET of
 * flags exists on each command. It does not check the flags' semantics, nor
 * that a `relevantWhen` predicate is right. Those are covered by reading the
 * diff, not by this script.
 *
 * Run: `npx tsx scripts/verify-cli-playground-flags.ts`
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { CLI_COMMANDS, GLOBAL_FLAGS } from "../app/components/shared/cli-playground/commandSpecs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const commandsDir = path.join(repoRoot, "afnoui-cli", "src", "cli", "commands");
const programFile = path.join(repoRoot, "afnoui-cli", "src", "cli", "program.ts");

/**
 * Which playground command ids each CLI source file owns. A file that registers
 * several commands (system.ts registers all five engine inits from one loop)
 * lists them all; its flags apply to every one of them.
 */
const FILE_TO_COMMAND_IDS: Record<string, string[]> = {
    "add.ts": ["add"],
    "init.ts": ["init"],
    "form.ts": ["form-init"],
    "list.ts": ["list"],
    "transport.ts": ["transport"],
    "update.ts": ["update"],
    "doctor.ts": ["doctor"],
    "diagnose.ts": ["diagnose"],
    "clean.ts": ["clean"],
    "help.ts": ["help"],
    "system.ts": ["table-init", "kanban-init", "tree-init", "dnd-init", "chart-init"],
};

/** Every `--flag` that appears as the first argument of a `.option(...)` call. */
function declaredFlags(source: string): Set<string> {
    const flags = new Set<string>();
    const pattern = /\.option\(\s*["'`](--[\w-]+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) flags.add(match[1]);
    return flags;
}

function sorted(values: Iterable<string>): string[] {
    return [...values].sort();
}

const problems: string[] = [];

/* --- per-command flags ---------------------------------------------------- */

const sourceFiles = fs.readdirSync(commandsDir).filter((name) => name.endsWith(".ts"));

for (const file of sourceFiles) {
    const commandIds = FILE_TO_COMMAND_IDS[file];
    if (!commandIds) {
        problems.push(
            `${file} is a CLI command file the playground verifier does not know about. ` +
                `Add it to FILE_TO_COMMAND_IDS (and to commandSpecs.ts if it registers a new command).`,
        );
        continue;
    }

    const cliFlags = declaredFlags(fs.readFileSync(path.join(commandsDir, file), "utf8"));

    for (const commandId of commandIds) {
        const spec = CLI_COMMANDS.find((candidate) => candidate.id === commandId);
        if (!spec) {
            problems.push(`commandSpecs.ts has no command with id "${commandId}" (declared for ${file}).`);
            continue;
        }

        const specFlags = new Set<string>();
        for (const flag of spec.flags) {
            specFlags.add(flag.flag);
            for (const alias of flag.aliasFlags ?? []) specFlags.add(alias);
        }

        const missing = sorted(cliFlags).filter((flag) => !specFlags.has(flag));
        const extra = sorted(specFlags).filter((flag) => !cliFlags.has(flag));

        if (missing.length > 0) {
            problems.push(
                `\`afnoui ${spec.command}\` accepts ${missing.join(", ")} but the playground never offers ` +
                    `${missing.length === 1 ? "it" : "them"}. Add to commandSpecs.ts (as a flag, or as an ` +
                    `aliasFlags entry on the axis it belongs to).`,
            );
        }
        if (extra.length > 0) {
            problems.push(
                `The playground offers ${extra.join(", ")} on \`afnoui ${spec.command}\`, but ${file} ` +
                    `declares no such option. The generated command would fail.`,
            );
        }
    }
}

/* --- global flags --------------------------------------------------------- */

const programFlags = declaredFlags(fs.readFileSync(programFile, "utf8"));
const globalSpecFlags = new Set(GLOBAL_FLAGS.map((flag) => flag.flag));

const missingGlobals = sorted(programFlags).filter((flag) => !globalSpecFlags.has(flag));
const extraGlobals = sorted(globalSpecFlags).filter((flag) => !programFlags.has(flag));

if (missingGlobals.length > 0) {
    problems.push(`program.ts declares global ${missingGlobals.join(", ")}, missing from GLOBAL_FLAGS.`);
}
if (extraGlobals.length > 0) {
    problems.push(`GLOBAL_FLAGS lists ${extraGlobals.join(", ")}, which program.ts does not declare.`);
}

/* --- report --------------------------------------------------------------- */

if (problems.length > 0) {
    console.error("❌ CLI playground is out of sync with the CLI:\n");
    for (const problem of problems) console.error(`   • ${problem}`);
    console.error("");
    process.exit(1);
}

const flagCount = CLI_COMMANDS.reduce(
    (total, spec) =>
        total + spec.flags.reduce((sum, flag) => sum + 1 + (flag.aliasFlags?.length ?? 0), 0),
    0,
);

console.log(
    `✅ CLI playground in sync: ${CLI_COMMANDS.length} commands, ${flagCount} command flags, ` +
        `${GLOBAL_FLAGS.length} global flags.`,
);
