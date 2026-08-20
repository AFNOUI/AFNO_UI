import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

/**
 * One page, one `afnoui` command.
 *
 * This class of bug has now shipped three times, each time the same shape — two
 * components on one page each believing they own the install command:
 *
 *  1. the kanban gallery rendered its own `ComponentInstall` bar *and* a
 *     transport-driven command, which could disagree;
 *  2. the tables gallery printed a camelCase template key that 404'd, because
 *     the string was assembled at the call site;
 *  3. the forms gallery rendered `add forms/<slug>` in the switcher *and*
 *     `form init` inside `FormsCodePanel` — and the second one was the wrong
 *     command for a variant page entirely.
 *
 * Reviewing diffs did not catch any of them; a screenshot did, each time. So
 * this asserts it structurally instead.
 *
 * The check is static, not a render: it finds every component that renders an
 * `afnoui` command, then walks the tree of components each *renders* (not
 * merely imports) and counts how many surfaces a subject-specific surface can
 * reach. More than one is the bug.
 */

const APP_DIR = path.resolve(__dirname, "../../app");

/**
 * Components that put an `afnoui …` command on screen.
 *
 * `InstallCommand` is deliberately absent — it renders `npm install …`, which
 * is a different question ("what packages?") and legitimately appears next to a
 * CLI command.
 */
const SURFACES = ["CliPlayground", "BuilderInstallPanel", "CliInstallCommandBar", "ComponentInstall"];

/** Surfaces that mean "this file is about one specific install subject". */
const SUBJECT_SURFACES = ["CliPlayground", "BuilderInstallPanel"];

/**
 * Intentional exceptions, each with the reason. An entry here is a claim that
 * two surfaces on one page are genuinely two different questions — so it should
 * be rare, and adding one should feel like a decision.
 */
const ALLOWED: Record<string, string> = {
    "page.tsx::app/page.tsx":
        "The landing hero shows a fixed `afnoui init` quick-start; the playground below it answers " +
        "a different question (what do I install for my case?). They cannot disagree — the hero " +
        "command is constant.",
};

function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.name.endsWith(".tsx") ? [full] : [];
    });
}

const FILES = walk(APP_DIR);

/** Local imports, resolved to real paths. Bare package imports are ignored. */
function localImports(file: string, source: string): Map<string, string> {
    const resolved = new Map<string, string>();
    const pattern = /import\s+(?:type\s+)?\{?([^}]*?)\}?\s+from\s+["']([^"']+)["']/g;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
        const [, names, specifier] = match;
        if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;

        const base = specifier.startsWith("@/")
            ? path.join(APP_DIR, specifier.slice(2))
            : path.resolve(path.dirname(file), specifier);

        const target = [`${base}.tsx`, path.join(base, "index.tsx"), path.join(base, "index.ts")].find(
            (candidate) => fs.existsSync(candidate),
        );
        // An `index.ts` barrel re-exports; follow it by name below instead.
        if (!target) continue;

        for (const name of names.split(",").map((entry) => entry.trim().split(" as ").pop()?.trim())) {
            if (name) resolved.set(name, target);
        }
    }
    return resolved;
}

/** Components this file actually renders, as JSX. */
function rendered(source: string): Set<string> {
    const names = new Set<string>();
    const pattern = /<([A-Z][A-Za-z0-9_]*)[\s/>]/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) names.add(match[1]);
    return names;
}

/** Barrels re-export; resolve `X` to the file that defines it. */
function throughBarrel(target: string, name: string): string {
    if (!target.endsWith("index.ts") && !target.endsWith("index.tsx")) return target;
    const source = fs.readFileSync(target, "utf8");
    const match = new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}\\s+from\\s+["']([^"']+)["']`).exec(
        source,
    );
    if (!match) return target;
    const base = path.resolve(path.dirname(target), match[1]);
    return [`${base}.tsx`, `${base}.ts`].find((candidate) => fs.existsSync(candidate)) ?? target;
}

interface FileFacts {
    /** Surfaces rendered directly in this file, after suppression. */
    own: string[];
    /** Local components it renders, name → defining file. */
    children: Map<string, string>;
}

const FACTS = new Map<string, FileFacts>();

for (const file of FILES) {
    const source = fs.readFileSync(file, "utf8");
    const renders = rendered(source);
    const imports = localImports(file, source);

    const own: string[] = [];
    for (const surface of SURFACES) {
        if (!renders.has(surface)) continue;
        // A suppressed bar is not a surface.
        if (surface === "ComponentInstall") {
            const usages = source.split("<ComponentInstall").length - 1;
            const suppressed = source.split("hideInstallBar").length - 1;
            for (let i = 0; i < usages - suppressed; i += 1) own.push(surface);
            continue;
        }
        own.push(surface);
    }

    const children = new Map<string, string>();
    for (const name of renders) {
        // A surface component is terminal: it was already counted above, and
        // descending into it would re-count what it renders internally —
        // `BuilderInstallPanel` contains a `CliPlayground`, which is the same
        // one surface, not two.
        if (SURFACES.includes(name)) continue;
        const target = imports.get(name);
        if (target) children.set(name, throughBarrel(target, name));
    }

    FACTS.set(file, { own, children });
}

/** Every surface reachable from `file` through components it renders. */
function reachableSurfaces(file: string, seen = new Set<string>()): string[] {
    if (seen.has(file)) return [];
    seen.add(file);

    const facts = FACTS.get(file);
    if (!facts) return [];

    return [
        ...facts.own,
        ...[...facts.children.values()].flatMap((child) => reachableSurfaces(child, seen)),
    ];
}

function relative(file: string): string {
    return path.relative(path.resolve(APP_DIR, ".."), file);
}

describe("command surfaces", () => {
    it("finds the components under test (guards against a broken scan)", () => {
        const seeds = FILES.filter((file) =>
            SUBJECT_SURFACES.some((surface) => FACTS.get(file)?.own.includes(surface)),
        );
        // If the scan silently matches nothing, every assertion below passes
        // vacuously — which is how a structural test quietly stops working.
        expect(seeds.length).toBeGreaterThanOrEqual(5);
    });

    it("never renders two afnoui command surfaces for one subject", () => {
        const offenders: string[] = [];

        for (const file of FILES) {
            const facts = FACTS.get(file);
            if (!facts) continue;
            // Only files that own a subject-specific command are checked. Lab
            // pages render one `ComponentInstall` per component section, which
            // is many bars but one per subject — not this bug.
            if (!SUBJECT_SURFACES.some((surface) => facts.own.includes(surface))) continue;

            const key = `${path.basename(file)}::${relative(file)}`;
            if (key in ALLOWED) continue;

            const surfaces = reachableSurfaces(file);
            if (surfaces.length > 1) {
                offenders.push(`${relative(file)} renders ${surfaces.length}: ${surfaces.join(", ")}`);
            }
        }

        expect(
            offenders,
            "Each of these renders more than one `afnoui` command for the same subject — the two " +
                "can disagree. Either suppress one (`hideInstallBar`) or let the shared panel own " +
                "it. If the surfaces genuinely answer different questions, add an ALLOWED entry " +
                "with the reason.",
        ).toEqual([]);
    });

    it("keeps every ALLOWED exception real", () => {
        for (const key of Object.keys(ALLOWED)) {
            const file = path.resolve(APP_DIR, "..", key.split("::")[1]);
            expect(fs.existsSync(file), `${key} no longer exists — drop the exception`).toBe(true);
            expect(
                reachableSurfaces(file).length,
                `${key} is now down to one surface — drop the exception`,
            ).toBeGreaterThan(1);
        }
    });
});
