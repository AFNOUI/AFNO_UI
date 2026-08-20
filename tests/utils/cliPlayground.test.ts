import { describe, expect, it } from "vitest";

import { buildCommand, visibleFlags } from "@/components/shared/cli-playground/buildCommand";
import { CLI_COMMANDS, COMMANDS_BY_ID } from "@/components/shared/cli-playground/commandSpecs";
import {
    BASE_ENTRIES,
    VARIANTS_BY_CATEGORY,
    VARIANT_ENTRIES,
    getCategory,
} from "@/components/shared/cli-playground/catalog";
import { CLI_PRESETS } from "@/components/shared/cli-playground/presets";
import type { CliCommandSpec, CommandContext } from "@/components/shared/cli-playground/types";

/** Flags start on their enum defaults, exactly as the UI initialises them. */
function ctxFor(spec: CliCommandSpec, overrides: Partial<CommandContext> = {}): CommandContext {
    const flags: CommandContext["flags"] = {};
    for (const flag of spec.flags) {
        if (flag.kind === "enum" && flag.defaultValue) flags[flag.id] = flag.defaultValue;
    }
    return { args: [], ...overrides, flags: { ...flags, ...overrides.flags } };
}

const add = COMMANDS_BY_ID.add;
const transport = COMMANDS_BY_ID.transport;

describe("command text", () => {
    it("builds the runner per package manager", () => {
        const ctx = ctxFor(add, { args: ["button"] });
        expect(buildCommand(add, ctx, "npm").text).toBe("npx afnoui add button");
        expect(buildCommand(add, ctx, "pnpm").text).toBe("pnpm dlx afnoui add button");
        expect(buildCommand(add, ctx, "bun").text).toBe("bunx afnoui add button");
    });

    it("keeps multiple arguments in selection order", () => {
        const ctx = ctxFor(add, { args: ["button", "tables/tables-default-pin"] });
        expect(buildCommand(add, ctx, "npm").text).toBe(
            "npx afnoui add button tables/tables-default-pin",
        );
    });

    it("flags an argument-less `add` as incomplete rather than printing a broken command", () => {
        expect(buildCommand(add, ctxFor(add), "npm").incomplete).toBe(true);
        expect(buildCommand(add, ctxFor(add, { args: ["button"] }), "npm").incomplete).toBe(false);
    });

    it("treats a missing `transport` argument as a valid command — it lists instead", () => {
        expect(buildCommand(transport, ctxFor(transport), "npm").incomplete).toBe(false);
        expect(buildCommand(transport, ctxFor(transport), "npm").text).toBe("npx afnoui transport");
    });
});

describe("the form-stack axis", () => {
    it("emits nothing for the default stack, because the default needs no flag", () => {
        const ctx = ctxFor(add, { args: ["forms/forms-contact"], flags: { stack: "rhf" } });
        expect(buildCommand(add, ctx, "npm").text).toBe("npx afnoui add forms/forms-contact");
    });

    it("emits `--stack <kind>` for the others", () => {
        const ctx = ctxFor(add, { args: ["forms/forms-contact"], flags: { stack: "tanstack" } });
        expect(buildCommand(add, ctx, "npm").text).toBe(
            "npx afnoui add forms/forms-contact --stack tanstack",
        );
    });

    it("is hidden entirely unless a forms/* slug is selected", () => {
        const withoutForms = ctxFor(add, { args: ["tables/tables-default-pin"] });
        const withForms = ctxFor(add, { args: ["forms/forms-contact"] });
        expect(visibleFlags(add, withoutForms).map((flag) => flag.id)).not.toContain("stack");
        expect(visibleFlags(add, withForms).map((flag) => flag.id)).toContain("stack");
    });
});

describe("the transport axes", () => {
    it("hides them for a bundle that has no data layer", () => {
        const ctx = ctxFor(add, { args: ["badge/badge-outline"] });
        const ids = visibleFlags(add, ctx).map((flag) => flag.id);
        expect(ids).not.toContain("axios");
        expect(ids).not.toContain("tanstackQuery");
    });

    it("moves only the axis you name — `--axios` never emits a query flag", () => {
        const ctx = ctxFor(transport, {
            args: ["tables/tables-server-crm"],
            flags: { httpClient: "axios" },
        });
        const built = buildCommand(transport, ctx, "npm");
        expect(built.text).toBe("npx afnoui transport tables/tables-server-crm --axios");
        expect(built.text).not.toContain("--local-state");
        expect(built.text).not.toContain("--tanstack-query");
    });

    it("supports both directions, so a switch is reversible", () => {
        const ctx = ctxFor(transport, {
            args: ["forms/forms-contact"],
            flags: { httpClient: "fetch", queryStrategy: "local" },
        });
        expect(buildCommand(transport, ctx, "npm").text).toBe(
            "npx afnoui transport forms/forms-contact --fetch --local-state",
        );
    });

    it("reports the dependency each choice installs", () => {
        const ctx = ctxFor(add, {
            args: ["tables/tables-server-crm"],
            flags: { axios: true, tanstackQuery: true },
        });
        expect(buildCommand(add, ctx, "npm").installs).toEqual(["axios", "@tanstack/react-query"]);
    });

    it("warns that --stack tanstack and --tanstack-query are different libraries", () => {
        const ctx = ctxFor(add, {
            args: ["forms/forms-contact"],
            flags: { stack: "tanstack", tanstackQuery: true },
        });
        const messages = buildCommand(add, ctx, "npm").problems.map((problem) => problem.message);
        expect(messages.some((message) => message.includes("different libraries"))).toBe(true);
    });
});

describe("effects", () => {
    it("names the install root and the transitive engine for a variant", () => {
        const ctx = ctxFor(add, { args: ["kanban/kanban-sprint-board"] });
        const { writes } = buildCommand(add, ctx, "npm");
        expect(writes.some((line) => line.includes("aliases.kanbanVariants"))).toBe(true);
        expect(writes.some((line) => line.includes("Pointer DnD"))).toBe(true);
    });

    it("does not repeat a category's side-effects once per variant", () => {
        const ctx = ctxFor(add, {
            args: ["tables/tables-default-pin", "tables/tables-server-crm"],
        });
        const engineLines = buildCommand(add, ctx, "npm").writes.filter((line) =>
            line.includes("the table engine"),
        );
        expect(engineLines).toHaveLength(1);
    });

    it("keeps the preview but marks it as a preview under --dry-run", () => {
        const ctx = ctxFor(add, {
            args: ["tables/tables-server-crm"],
            flags: { axios: true, "dry-run": true },
        });
        const built = buildCommand(add, ctx, "npm");
        expect(built.dryRun).toBe(true);
        expect(built.installs).toContain("axios");
    });

    it("warns when --force is on, since that is the flag that overwrites edits", () => {
        const ctx = ctxFor(add, { args: ["button"], flags: { force: true } });
        const messages = buildCommand(add, ctx, "npm").problems.map((problem) => problem.message);
        expect(messages.some((message) => message.includes("--force overwrites"))).toBe(true);
    });
});

describe("token annotations", () => {
    it("explains every token in the command, with nothing unlabelled", () => {
        const ctx = ctxFor(add, {
            args: ["forms/forms-contact"],
            flags: { stack: "action", "dry-run": true },
        });
        const { tokens, text } = buildCommand(add, ctx, "npm");

        expect(tokens.map((token) => token.text).join(" ")).toBe(text);
        expect(tokens.every((token) => token.note.length > 0)).toBe(true);
    });
});

describe("scoped surfaces", () => {
    // A builder page locks the arguments and passes none. The playground used
    // to fall through to the homepage's opening preset, so the table builder
    // printed `npx afnoui table init forms/forms-contact` — a command that
    // installs the wrong thing and reads as nonsense.
    it("never renders positional arguments for a command that takes none", () => {
        const tableInit = COMMANDS_BY_ID["table-init"];
        const leaked = ctxFor(tableInit, { args: ["forms/forms-contact"] });
        expect(buildCommand(tableInit, leaked, "npm").text).toBe("npx afnoui table init");
    });

    it("reports what an argument-less install command writes", () => {
        for (const id of ["init", "table-init", "kanban-init", "tree-init", "form-init"]) {
            const spec = COMMANDS_BY_ID[id];
            const built = buildCommand(spec, ctxFor(spec), "npm");
            expect(built.writes.length, `${id} claims to write nothing`).toBeGreaterThan(0);
        }
    });

    it("still reports nothing written for the read-only commands", () => {
        for (const id of ["doctor", "list", "help"]) {
            const spec = COMMANDS_BY_ID[id];
            expect(buildCommand(spec, ctxFor(spec), "npm").writes).toHaveLength(0);
        }
    });
});

describe("presets", () => {
    it("names a command that exists", () => {
        for (const preset of CLI_PRESETS) {
            expect(COMMANDS_BY_ID[preset.commandId], `preset "${preset.id}"`).toBeDefined();
        }
    });

    // The static command cards these presets replaced shipped two slugs that do
    // not exist in the registry (`charts/bar/charts-bar-grouped`, `button/variants`).
    // Both would have 404'd for anyone who copied them. This is the test that
    // stops that happening again.
    it("only offers slugs the registry can actually install", () => {
        const variants = new Set(VARIANT_ENTRIES.map((entry) => entry.slug));
        const primitives = new Set(BASE_ENTRIES.map((entry) => entry.slug));

        for (const preset of CLI_PRESETS) {
            const spec = COMMANDS_BY_ID[preset.commandId];
            if (spec.args.kind === "none" || spec.args.kind === "scope") continue;
            for (const arg of preset.args ?? []) {
                expect(
                    variants.has(arg) || primitives.has(arg),
                    `preset "${preset.id}" installs "${arg}", which is not in the registry index`,
                ).toBe(true);
            }
        }
    });

    it("produces a valid, complete command for every preset", () => {
        for (const preset of CLI_PRESETS) {
            const spec = COMMANDS_BY_ID[preset.commandId];
            const built = buildCommand(
                spec,
                ctxFor(spec, { args: preset.args ?? [], flags: preset.flags }),
                "npm",
            );
            expect(built.incomplete, `preset "${preset.id}" is incomplete`).toBe(false);
            expect(
                built.problems.filter((problem) => problem.level === "error"),
                `preset "${preset.id}" has errors`,
            ).toHaveLength(0);
            expect(built.text.startsWith("npx afnoui ")).toBe(true);
        }
    });
});

describe("spec integrity", () => {
    it("gives every enum flag a default that is one of its own options", () => {
        for (const spec of CLI_COMMANDS) {
            for (const flag of spec.flags) {
                if (flag.kind !== "enum") continue;
                expect(flag.options, `${spec.id}/${flag.id} has no options`).toBeDefined();
                expect(
                    flag.options?.map((option) => option.value),
                    `${spec.id}/${flag.id} default is not an option`,
                ).toContain(flag.defaultValue);
            }
        }
    });

    it("gives every command the copy the playground renders", () => {
        for (const spec of CLI_COMMANDS) {
            expect(spec.tagline.length, `${spec.id} tagline`).toBeGreaterThan(0);
            expect(spec.whenToUse.length, `${spec.id} whenToUse`).toBeGreaterThan(0);
            expect(spec.whatItDoes.length, `${spec.id} whatItDoes`).toBeGreaterThan(0);
        }
    });

    it("offers at least one real variant for every category `transport` accepts", () => {
        const filter = transport.args.categoryFilter;
        expect(filter).toBeDefined();
        const accepted = [...VARIANTS_BY_CATEGORY.keys()].filter((id) => filter?.(id));
        expect(accepted.length).toBeGreaterThan(0);
        for (const id of accepted) {
            expect(VARIANTS_BY_CATEGORY.get(id)?.length, `${id} is empty`).toBeGreaterThan(0);
            expect(getCategory(id).transportCapable).toBe(true);
        }
    });
});
