"use client";

/**
 * "Install & set up" — the one card that sits above the generated files in
 * every builder Export tab and every variant gallery.
 *
 * It exists because the same information had four different presentations:
 * `Export Your Form (React Hook Form)`, `Install Dependencies` (tables and
 * kanban, each with a different body), and `Required Dependencies & Files`
 * (trees). Only tables showed dev dependencies, though kanban and trees both
 * declare them — so two builders were quietly under-reporting what a project
 * needs.
 *
 * The panel owns the layout, the ordering and the headings; pages supply only
 * content. Same contract as `builder-header` and `builder-insights`.
 *
 * Order is deliberate and identical everywhere:
 *   1. the CLI command that installs the shared engine for you
 *   2. the packages, runtime and dev side by side
 *   3. anything else the family needs you to know
 */

import { Database, Package, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { InstallCommand } from "@/components/shared/CodeBlock";
import { TransportPicker } from "@/components/shared/TransportPicker";
import { CliPlayground, type CliPlaygroundScope } from "@/components/shared/cli-playground";
import type { TransportChoice } from "@/lib/codegen/transport";

import type { DependencyCommand } from "./types";

/** The transport axes, when the family has a data layer for them to affect. */
export interface TransportSlot {
    value: TransportChoice;
    onChange: (next: TransportChoice) => void;
    idPrefix: string;
    /** Set when this config emits no network layer, so the choice is inert. */
    inactiveReason?: string;
}

interface BuilderInstallPanelProps {
    /** Drives the scoped CLI command. Omit to hide the CLI step entirely. */
    cliScope?: CliPlaygroundScope;
    idPrefix: string;
    /** One line explaining what the CLI step saves you doing by hand. */
    cliHint?: string;
    /** Counts for the subtitle. Shared files are the ones the CLI can install. */
    generatedCount: number;
    sharedCount: number;
    /** `npm install …` for the packages the generated code imports. */
    runtimeCommand: string;
    /** `npm install -D …`. Omit when the family genuinely has none. */
    devCommand?: string;
    /** Extra commands a family needs (form-builder's Radix UI step). */
    extraCommands?: DependencyCommand[];
    notes?: string[];
    /** The noun used in the subtitle: "table", "form", "board", "tree". */
    subject: string;
    /** Rendered as the first step. Omit on families with no data layer. */
    transport?: TransportSlot;
}

export function BuilderInstallPanel({
    cliScope,
    idPrefix,
    cliHint,
    generatedCount,
    sharedCount,
    runtimeCommand,
    devCommand,
    extraCommands,
    notes,
    subject,
    transport,
}: BuilderInstallPanelProps) {
    // `add <category>/<variant>` installs the whole bundle — every file below
    // plus its npm dependencies. `<family> init` installs only the shared
    // engine, because the generated files come from the config on this page and
    // do not exist in the registry. That difference decides whether the CLI is
    // the recommended path or a convenience, so it drives the copy rather than
    // being papered over with one neutral wording.
    const cliInstallsEverything = cliScope?.commandId === "add";

    // Numbered from whichever steps this surface actually shows. Computed as a
    // list rather than a running counter — a variable reassigned during render
    // is rejected by the React Compiler.
    const steps = [
        ...(transport ? (["transport"] as const) : []),
        ...(cliScope ? (["cli"] as const) : []),
        "packages" as const,
    ];
    const stepNumber = (id: (typeof steps)[number]) => steps.indexOf(id) + 1;

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Install &amp; set up</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Everything this {subject} needs: {generatedCount} generated file
                    {generatedCount === 1 ? "" : "s"} to copy
                    {sharedCount > 0 && (
                        <>
                            {" "}
                            and {sharedCount} shared engine file{sharedCount === 1 ? "" : "s"} the CLI
                            can install for you
                        </>
                    )}
                    .
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                {transport && (
                    <Step
                        index={stepNumber("transport")}
                        icon={Database}
                        title="Choose how data is fetched"
                        hint={
                            cliInstallsEverything
                                ? // `add` carries the transport as flags, so the command below
                                  // visibly follows this choice.
                                  "Two independent choices. The default adds no dependency at all — the command below and the code both follow whatever you pick."
                                : // `<family> init` installs the same engine either way. Saying so
                                  // matters: otherwise changing this and watching the command stay
                                  // identical reads as a broken control.
                                  `Two independent choices. The default adds no dependency at all. This shapes the ${subject} files generated below — the install command is the same either way, because the transport lives in the files you copy.`
                        }
                    >
                        <TransportPicker bare {...transport} />
                    </Step>
                )}

                {cliScope && (
                    <Step
                        index={stepNumber("cli")}
                        icon={Terminal}
                        title={
                            cliInstallsEverything
                                ? "Install it with the CLI"
                                : "Install the shared files with the CLI"
                        }
                        hint={
                            cliHint ??
                            (cliInstallsEverything
                                ? "Installs every file below and its packages in one command. The steps after this are only for doing it by hand."
                                : `Writes the shared engine files for you. The files generated from this ${subject} are still yours to copy — they come from the config on this page, so the registry has nothing to install.`)
                        }
                        recommended={cliInstallsEverything}
                        optional={!cliInstallsEverything}
                    >
                        <CliPlayground idPrefix={idPrefix} scope={cliScope} />
                    </Step>
                )}

                <Step
                    index={stepNumber("packages")}
                    icon={Package}
                    title={cliInstallsEverything ? "Or install the packages yourself" : "Install the packages"}
                    hint={
                        cliInstallsEverything
                            ? "Only needed if you copied the files by hand instead of running the command above."
                            : "Run these at your project root."
                    }
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InstallCommand command={runtimeCommand} label="Runtime dependencies" />
                        {devCommand ? (
                            <InstallCommand command={devCommand} label="Dev dependencies" />
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-3">
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    Dev dependencies
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    None — nothing extra is needed at build time.
                                </p>
                            </div>
                        )}
                    </div>

                    {extraCommands && extraCommands.length > 0 && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {extraCommands.map((entry) => (
                                <InstallCommand
                                    key={entry.label}
                                    command={entry.command}
                                    label={entry.label}
                                />
                            ))}
                        </div>
                    )}
                </Step>

                {notes && notes.length > 0 && (
                    <ul className="space-y-1 border-t border-border pt-4">
                        {notes.map((note) => (
                            <li
                                key={note}
                                className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
                            >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                                <span>{note}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

function Step({
    index,
    icon: Icon,
    title,
    hint,
    optional,
    recommended,
    children,
}: {
    index: number;
    icon: typeof Package;
    title: string;
    hint?: string;
    optional?: boolean;
    recommended?: boolean;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-semibold text-primary">
                    {index}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                {recommended && (
                    <Badge className="border-0 bg-primary/10 text-[10px] text-primary">
                        recommended
                    </Badge>
                )}
                {optional && (
                    <Badge variant="outline" className="text-[10px]">
                        optional
                    </Badge>
                )}
            </div>
            {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
            {children}
        </section>
    );
}
